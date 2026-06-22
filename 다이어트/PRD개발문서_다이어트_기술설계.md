# PRD개발문서_다이어트_기술설계
## 🛠️ 다이어트온 (DietOn) MVP 기술 설계서 (TDD v2.3)

**작성일**: 2026-06-11  
**버전**: v2.3 (바닐라 JS 환경 및 다이어트 커뮤니티 전용 개정본)  
**시스템 아키텍처**: HTML5/CSS3 + Vanilla JS (ES6+) + LocalStorage + Supabase JS Client (CDN 로드)

---

## 1. 파일 구조 및 모듈화 가이드라인

"파일당 250줄 이하"라는 규칙을 엄격하게 지키기 위해, 기능마다 독립된 매니저 객체로 역할을 쪼개어 소스 코드를 구성합니다.

```
/d/work/diet/
├── index.html            # 홈 화면 (기록 요약 및 게시판 요약)
├── record.html           # 건강/복약 기록 및 식단 칼로리 다이어리 화면
├── community.html        # 게시판 글 목록 화면 (태그 필터 포함)
├── post.html             # 게시글 및 댓글 상세 보기 화면
├── my.html               # 마이페이지 (프로필 수정 및 포인트 내역)
├── css/
│   └── style.css         # 글로벌 & 컴포넌트 CSS (네온 민트/바이올렛 다크 테마)
└── js/
    ├── app.js            # 서비스 초기화 및 전체 흐름 제어 (MainManager)
    └── managers/
        ├── StorageManager.js  # 로컬 데이터 입출력 및 서버 백업 동기화 담당
        ├── UIManager.js       # 화면 DOM 조작, 차트 렌더링, 토글 전환 이벤트 제어
        └── PointManager.js    # 보상 규칙에 따른 포인트 적립 및 검증 처리
```

---

## 2. 데이터베이스 테이블 및 보안 설정 (Supabase 연동용)

사용자 정보, 게시글 데이터, 누적 포인트를 서버에 안전하게 보관하기 위해 Supabase PostgreSQL에 정의할 테이블과 행 단위 보안 정책(RLS)입니다.

```sql
-- [LOG: 20260611_2225] 다이어트 커뮤니티용 테이블 구조 정의

-- 1. 사용자 프로필 테이블
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nickname TEXT NOT NULL,
    height_cm INT CHECK (height_cm > 100 AND height_cm < 250),
    points INT DEFAULT 0 CHECK (points >= 0),
    active_medicine TEXT CHECK (active_medicine IN ('wegovy', 'saxenda', 'mounjaro', 'supplement', 'none')) DEFAULT 'none',
    medicine_cycle TEXT CHECK (medicine_cycle IN ('daily', 'weekly', 'none')) DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 건강 및 복약 기록 테이블
CREATE TABLE public.health_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    record_date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight_kg DECIMAL(4,1) CHECK (weight_kg > 20.0 AND weight_kg < 300.0) NOT NULL,
    medicine_taken BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_daily_record UNIQUE (user_id, record_date)
);

-- 3. 식단 기록 테이블
CREATE TABLE public.meal_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    record_date DATE DEFAULT CURRENT_DATE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    food_name TEXT NOT NULL,
    amount_g INT CHECK (amount_g > 0) NOT NULL,
    calories DECIMAL(6,1) NOT NULL,
    carbs_g DECIMAL(5,1) DEFAULT 0.0,
    protein_g DECIMAL(5,1) DEFAULT 0.0,
    fat_g DECIMAL(5,1) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 게시글 테이블
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (char_length(title) >= 2),
    content TEXT NOT NULL CHECK (char_length(content) >= 5),
    images TEXT[] DEFAULT '{}',
    category_tag TEXT DEFAULT 'general' CHECK (category_tag IN ('general', 'diet_log', 'treatment', 'side_effect')),
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 댓글 테이블
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 포인트 거래 내역 테이블
CREATE TABLE public.point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    points INT NOT NULL,
    description TEXT NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2.1 보안 정책 (RLS) 규칙
* 개인정보 보호와 데이터 임의 수정을 막기 위해, 모든 테이블의 행 단위 보안 정책(RLS)을 켭니다. 본인의 데이터만 추가하고 수정할 수 있도록 엄격히 제한합니다.
* 게시글과 댓글 데이터는 모든 유저가 자유롭게 조회할 수 있습니다. 단, 글을 새로 작성하거나 지우는 등의 쓰기 권한은 데이터를 소유한 당사자에게만 열어줍니다.

---

## 3. 로컬 저장 공간 (LocalStorage) 관리

인터넷 연결이 불안정할 때도 앱이 멈추지 않고 즉각적으로 반응하도록 모든 건강 기록과 포인트를 먼저 기기 내 `LocalStorage`에 저장합니다. 그 뒤 온라인 상태로 전환될 때 서버로 안전하게 데이터를 보냅니다.

```json
// diet_health_records 키에 저장되는 데이터 형식
{
  "2026-06-11": {
    "weight_kg": 72.4,
    "medicine_taken": true
  }
}
```

---

## 4. UI 렌더링 및 차트 표현 (`UIManager.js`)

* **시각화 그래프**: CDN 방식으로 배포된 Chart.js 엔진을 로드해 활용합니다. 몸무게 변화를 그리는 꺾은선 차트와 오늘 식단의 영양소(탄/단/지) 균형을 시각적으로 전해주는 도넛형 차트를 canvas 엘리먼트 상에 표현합니다.
* **디자인 토큰**: 
  * 화면 배경색: Slate 950 (`#020617`)
  * 포인트 강조색: 네온 민트 (`#22d3ee`) 및 소프트 바이올렛 (`#8b5cf6`)
  * 레이아웃: 반투명한 유리 질감의 테두리(Glassmorphism)를 적용해 세련되고 미래지향적인 감성을 연출합니다.

---

*기술설계서 끝*
