# 데이터베이스 및 로직 연동 계획 (Supabase)

현재 UI 레이아웃 100% 미러링이 완료되어 껍데기 작업은 종료되었습니다. 하지만 원본 소스코드 덮어쓰기 과정에서 기존 로컬 스크립트(`app.js` 등)의 연결이 해제되어 있으므로, 이를 다시 주입하고 실제 데이터베이스(Supabase)를 연결하여 화면이 살아 숨쉬게 만듭니다.

## 1. 스크립트 연결 복구
- 100% 클론된 `index.html`, `community.html`, `post.html`, `write.html`, `record.html` 등 모든 HTML 파일의 `</body>` 직전에 기존의 로컬 자바스크립트 파일들을 주입합니다.
  - `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
  - `<script src="js/managers/StorageManager.js"></script>`
  - `<script src="js/managers/UIManager.js"></script>`
  - `<script src="js/app.js"></script>`

## 2. Supabase 데이터베이스 연동
- **StorageManager.js 전면 개편**: 기존에 LocalStorage 기반으로 작성된 비동기(Async) CRUD 로직을 Supabase API로 완전히 교체합니다.
- **연결 대상**: `threads`, `comments`, `diet_records` (체중 및 식단 기록) 등 필요한 테이블을 Supabase에 생성하거나 연결합니다.

## 3. 화면 데이터 바인딩 (DOM 조작)
- **UIManager.js 개편**: 대다모 원본 HTML 클래스(`bbs_hotlist_box`, `list-item` 등)를 타겟팅하여 Supabase에서 가져온 실제 데이터를 끼워넣습니다.
- 원본 사이트의 더미 텍스트(예: "위고비 1주차 후기입니다" 등)를 지우고, DB에서 긁어온 글로 렌더링되도록 만듭니다.

이 3단계 작업이 끝나면 겉모습은 대다모지만 내부는 Supabase 기반의 완전한 다이어트 커뮤니티로 작동하게 됩니다.
