# 모바일 UI 클론 코딩 완벽 구현 계획 (Mobile Clone Plan)

DietOn 모바일 버전(`?device=mobile`)을 다이어트온 전용으로 완벽하게 클론하기 위한 5단계 작업 계획입니다.

## Phase 1: 기반 환경 구축 및 안정화 (Base Setup)
- [x] 내부 서브에이전트를 통해 모바일 전용 Raw HTML(`dieton_mobile_raw.html`) 획득 완료.
- [x] 구글 애널리틱스, 타불라(Taboola) 등 불필요한 트래킹 스크립트 제거하여 로딩 속도 최적화.
- [x] 핵심 모바일 CSS를 로컬 백업 파일로 연결하고, 남은 외부 CSS/JS는 원본 URL로 유지하여 깨진 `dieton.com` URL 생성을 방지.
- [x] 파일명을 `index_mobile.html`로 확정하고 재생성 스크립트(`execute_mobile_clone.js`)와 연동.

## Phase 2: 핵심 브랜딩 및 텍스트 전환 (Text & Logos)
- [x] `DietOn` → `다이어트온`, `탈모` → `다이어트`, `모발이식` → `비만클리닉` 등 전역 텍스트 변환.
- [x] 모바일 상단 헤더 로고 및 하단 푸터 로고를 다이어트온 전용 SVG 로고(`logo.svg`, `logo_footer.svg`)로 교체.
- [x] 모바일 전용 검색창 팝업 및 타이틀 문구를 다이어트 테마에 맞게 재작성.

## Phase 3: 모바일 배너 및 레이아웃 최적화 (Banners & Ads)
- [x] 상단 스와이프 배너 및 모바일 띠배너를 다이어트온 커스텀 SVG/PNG 배너로 1:1 매핑.
- [x] 대형 배너들이 모바일 화면을 뚫고 나가지 않도록 `max-width: 100%; height: auto;` 계열 보정 CSS 적용.
- [x] `content_map` (지도보기) 배너를 모바일 가로폭에 최적화된 SVG로 교체.

## Phase 4: 컴포넌트 및 아바타 정밀 매핑 (Components & Avatars)
- [x] 모바일 그리드(Grid) 형태의 퀵 메뉴 아이콘들을 다이어트온 카테고리 아이콘으로 정밀 매핑.
- [x] 게시글 목록(다이어트톡톡, 비만클리닉 후기 등)의 작은 썸네일 이미지들을 기존 생성 SVG/PNG 자산으로 교체.
- [x] 각 이미지 요소들이 찌그러지지 않고 비율을 유지하도록 CSS 점검.

## Phase 5: 기능 동작 및 스와이프 검증 (Functional Verification)
- [x] 모바일 전용 햄버거 메뉴(전체 메뉴) 팝업 버튼 정상 동작 확인.
- [x] Swiper.js (스와이프 슬라이더) 터치 동작 및 자동 롤링 정상 작동 확인.
- [x] 캐시 버스팅(`?v=Time`)을 일괄 적용하여 브라우저에서 즉시 반영되도록 최종 마무리.
