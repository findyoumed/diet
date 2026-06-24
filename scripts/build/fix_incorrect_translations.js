const fs = require('fs');
const path = require('path');

const targetFiles = [
    'index.html',
    'index_mobile.html',
    'community.html',
    'post.html',
    'record.html',
    'search.html',
    'write.html',
    'my.html'
];

const replacements = [
    // 1. 다이어트온 전용 매핑 (후기/게시글 어색한 문맥 리라이팅)
    { target: /이식 8개월차 밀도 확인/g, replacement: '식단/운동 8개월차 몸매 변화 확인' },
    { target: /모나라에서 5000모 이식 2주차/g, replacement: '다이어트온에서 체계적인 관리 2주차' },
    { target: /서울 신사동 '모바른의원'에서 이식받은 후기!!/g, replacement: '서울 신사동 \'다이어트온 클리닉\'에서 집중 케어받은 후기!!' },
    { target: /동전 크기의 원형다이어트가 생겼는데 위고비\/마운자로 해야하나요\?/g, replacement: '부분적인 요요 현상이 왔는데 비만 집중 관리를 받아야 하나요?' },
    { target: /원형다이어트는 일종의 ‘자가면역 질환’으로 보고되고 있습니다\./g, replacement: '급격한 요요 현상은 호르몬 균형 및 대사 저하로 보고되고 있습니다.' },
    { target: /면역세포에 이상이 생기면 체지방을 이 물질로 착각해서 공격하게 되고 공격당한 체지방의 체중이 빠지게 되어 원형다이어트가 발생합니다\./g, replacement: '호르몬 대사에 이상이 생기면 체지방 조절 능력을 상실하게 되고, 기초 대사량이 저하되어 요요 현상이 발생합니다.' },
    { target: /원형다이어트 부위에 체중이 자라지 않고 더 이상 확장되지 않는다면 위고비\/마운자로을 고려해볼 수 있습니다\./g, replacement: '요요 현상이 진정되고 대사량이 정상화된 후에 본격적인 비만 케어를 고려해볼 수 있습니다.' },
    { target: /위고비을 바르는 것인데, 사람마다 증상은 다르지만 머리카락이 자라는 경우가 종종 있습니다\./g, replacement: '다이어트 보조제를 섭취하는 것인데, 사람마다 체질은 다르지만 체중이 감량되는 경우가 종종 있습니다.' },
    { target: /위고비\/마운자로 11개월차 입니다 아마 이제 거의 다 올라올건 다 올라온거 같습니다/g, replacement: '다이어트 프로그램 11개월차 입니다 이제 목표 체중에 거의 도달한 거 같습니다' },
    { target: /3300kcal 식단 조절 견적받고/g, replacement: '하루 1500kcal 맞춤 식단 처방받고' },
    { target: /최초 계약조건이 1년후 추가 PT 관리 조건이 있는데/g, replacement: '최초 계약 조건이 목표 달성 후 요요 케어 조건이 있는데' },
    { target: /밀도가 아무래도 1020 부족해 보입니다 살짝 내리면 괜찮은데 앞머리가 부족해 보인다고/g, replacement: '체지방률이 생각보다 덜 빠진 것 같습니다. 전체적으로 라인은 잡혔는데 아랫배 쪽이 아쉽다고' },
    { target: /의사 슬릿&의사 의식후기/g, replacement: '전담 코칭 & 1:1 관리 후기' },
    { target: /의사 슬릿&의사 이식후기/g, replacement: '전담 코칭 & 1:1 관리 후기' },
    { target: /식모기& 의사 이식/g, replacement: '맞춤 기구 & 전문 트레이너' },
    { target: /수술종류\(위고비\/마운자로 or 눈바디 교정\)/g, replacement: '프로그램 종류(비만 관리 or 바디라인 교정)' },
    { target: /채취방법 : 운동 요법 위고비\/마운자로/g, replacement: '진행방법 : 운동 요법 프로그램' },
    { target: /채취방법 : 운동 요법/g, replacement: '진행방법 : 운동 요법' },
    { target: /채취 방법 : 운동 요법 미세 하이드컷/g, replacement: '진행 방법 : 운동 요법 맞춤형' },
    { target: /이식방법 및 의사\/간호사 이식 여부 : 의시 슬릿/g, replacement: '코칭방법 및 전문가 상주 여부 : 1:1 전담 마크' },
    { target: /이식 방법 및 의사\/간호사 이식 여부/g, replacement: '코칭 방법 및 전문가 상주 여부' },
    { target: /수술 다음 날/g, replacement: '관리 시작 다음 날' },
    { target: /모\(낭\)수 : 2084모/g, replacement: '목표 칼로리 : 2084kcal' },
    { target: /모\(낭\)수 : 954체지방/g, replacement: '목표 칼로리 : 950kcal' },
    { target: /위고비\/마운자로 비용 : 500만원대/g, replacement: '프로그램 비용 : 500만원대' },
    { target: /이마가 넓은게 예전부터 고민이라서/g, replacement: '복부 비만이 예전부터 고민이라서' },
    { target: /이마라인/g, replacement: '바디라인' },
    { target: /이식 후에 비니 씌워주시고/g, replacement: '관리 후에 전용 보호대 챙겨주시고' },
    { target: /배게 위에 덮을 천이랑 챙겨주셔서/g, replacement: '식단 관리 다이어리 챙겨주셔서' },
    { target: /이식 10개월 차/g, replacement: '관리 10개월 차' },
    { target: /4200모 식단 요법로 이식했고/g, replacement: '4200kcal 식단 조절과 운동 요법으로 관리했고' },
    { target: /최현용 원장님께서 직접 이식해주셨는데/g, replacement: '최현용 트레이너가 직접 지도해주셨는데' },
    { target: /받을때 통증이 엄청 심할거라고 생각했는데/g, replacement: '식단 조절이 엄청 힘들거라고 생각했는데' },
    { target: /자고 일어나니 끝나 있었어요/g, replacement: '적응하고 나니 한 달이 금방 지나갔어요' },
    { target: /머리가 자란걸 보면/g, replacement: '체중이 줄어든걸 보면' },
    { target: /체지방 감량률도 좋고/g, replacement: '체지방 감량 수치도 좋고' },
    { target: /식단 요법채취 2800모 앞이마 위고비\/마운자로 후기/g, replacement: '식단 요법 2800kcal 복부 비만 관리 후기' },
    { target: /모바른의원/g, replacement: '다이어트온 클리닉' },
    { target: /조정수 원장님/g, replacement: '조정수 센터장님' },
    { target: /식단 요법채취갯수 : 2800모/g, replacement: '식단 조절량 : 2800kcal' },
    { target: /위고비\/마운자로 비용 : 726만원/g, replacement: '프로그램 비용 : 726만원' },
    { target: /이마를 드러내고 못다니고/g, replacement: '타이트한 옷을 못 입고' },
    { target: /앞머리를 가리고 다니는 스타일링에 스프레이도 필수였는데/g, replacement: '박시한 옷으로 가리고 다니는 스타일에 보정 속옷도 필수였는데' },
    { target: /식단 요법방식이 듣던것보다 어제까지는 베게배기 힘들정도로 생각보다는 아팠는데/g, replacement: '식단 조절 방식이 생각보다 초기에는 배고픔을 견디기 힘들 정도로 타이트했는데' },
    { target: /실밥빼는것도 기대가 됩니다/g, replacement: '인바디 측정하는 것도 기대가 됩니다' },
    { target: /이식방향이나 라인/g, replacement: '감량 진행도나 바디 라인' },
    { target: /수술을 고민하시는분들은/g, replacement: '체중 감량을 고민하시는 분들은' },
    { target: /다이어트가 시작된건 20대부터였고/g, replacement: '과체중이 시작된 건 20대부터였고' },
    { target: /지금 머리 정도로 완전히털려버렸고/g, replacement: '지금 몸무게 정도로 완전히 살이 쪄버렸고' },
    { target: /머리는 포기하고머머리로 살아왔습니다/g, replacement: '몸매는 포기하고 비만으로 살아왔습니다' },
    { target: /위고비\/마운자로 하는 사람들이/g, replacement: '비만 관리를 하는 사람들이' },
    { target: /위고비\/마운자로 병원이/g, replacement: '다이어트 클리닉이' },
    { target: /서울에 잘하는 비만클리닉에서 수술하는게 좋겠다고/g, replacement: '서울에 잘하는 다이어트 센터에서 케어받는게 좋겠다고' },
    { target: /서울로 상경했습니다/g, replacement: '서울로 올라왔습니다' },
    { target: /모모성형외과/g, replacement: '모모 다이어트온 의원' },
    { target: /앞쪽부터 하체비만까지 털려버렸고/g, replacement: '복부부터 허벅지까지 살이 쪄버렸고' },
    { target: /연모화가 진행되어/g, replacement: '근손실이 진행되어' },
    { target: /멀쩡한 곳이라고는 옆머리랑 뒷머리 뿐이여서/g, replacement: '탄력 있는 곳이라고는 팔이랑 종아리 뿐이여서' },
    { target: /최대치로 이식견적을 4000모로 받았고/g, replacement: '최대 감량 목표를 20kg으로 잡았고' },
    { target: /추가 이식이 가능하다/g, replacement: '추가 감량이 가능하다' },
    { target: /하체비만 쪽은 전체적으로 가릴 수 있을 정도로/g, replacement: '허벅지 쪽은 전체적으로 라인을 잡을 수 있을 정도로' },
    { target: /뻐근하기도 하고 가끔씩 살짝 찌릿한 통증정도 있는데/g, replacement: '근육통도 있고 가끔씩 살짝 피로한 느낌도 있는데' },
    { target: /진통제 먹으면서 콘트롤 가능한 정도/g, replacement: '스트레칭 하면서 조절 가능한 정도' },
    { target: /실밥이 있어 조심하면서/g, replacement: '식단 조절 기간이라 신경 쓰면서' },
    { target: /머리감는게 좀 불편하긴한데/g, replacement: '외식하는게 좀 제한되긴 하지만' },
    { target: /머리 잘 자란다면 이정도는 거뜬히 참을 수 있습니다/g, replacement: '살만 빠진다면 이정도는 거뜬히 참을 수 있습니다' },
    { target: /약을 약 6개월 정도 복용한 적이/g, replacement: '보조제를 약 6개월 정도 복용한 적이' },
    { target: /이식 상담을 받아봤습니다/g, replacement: '체성분 분석을 받아봤습니다' },
    { target: /4,000모 정도 이식이 필요/g, replacement: '20kg 정도 감량이 필요' },
    { target: /복부 체중 상태와 향후 추가 이식 가능성/g, replacement: '복부 비만 상태와 향후 추가 감량 가능성' },
    { target: /1차로 눈바디 위주 약 2,000모 정도 이식/g, replacement: '1차로 식단 위주 약 10kg 정도 감량' },
    { target: /앞라인을 우선 이식 진행/g, replacement: '복부 비만을 우선 관리 진행' },
    { target: /추후 진행 상황과 복부 상태를 보면서 추가 이식을 고려/g, replacement: '추후 진행 상황과 눈바디 상태를 보면서 추가 감량을 고려' },
    { target: /추가 이식을 고려/g, replacement: '추가 감량을 고려' },
    { target: /2차 이식도 생각/g, replacement: '2차 감량도 생각' },
    { target: /주사치료도 6개월에서1년정도 같이 병행/g, replacement: 'PT 케어도 6개월에서 1년 정도 같이 병행' },
    { target: /이식하고 1년 최종/g, replacement: '관리받고 1년 최종' },
    { target: /머리 잘 자라는게 보여서/g, replacement: '살이 잘 빠지는 게 보여서' },
    { target: /체지방 주사 치료도/g, replacement: '지방 분해 주사 치료도' },
    { target: /삭센다도 좀 먹다가/g, replacement: '다이어트 보조제도 좀 먹다가' },
    { target: /울산비만클리닉은 딱히 없어/g, replacement: '울산 다이어트 전문점은 딱히 없어' },
    { target: /위고비\/마운자로 병원이 많고해서/g, replacement: '다이어트 클리닉이 많고 해서' },
    { target: /고상진 원장님 상담이/g, replacement: '고상진 코치님 상담이' },
    { target: /이식 받았습니다/g, replacement: '케어 받았습니다' },
    { target: /식단 요법로 받았는데 이식하고 하루/g, replacement: '식단 조절을 받았는데 하루 준비하고' },
    { target: /초기에 며칠 가려운거 있어서/g, replacement: '초기에 며칠 명현 현상이 있어서' },
    { target: /비닐장갑끼고 자야하나/g, replacement: '포기하고 야식을 먹어야 하나' },
    { target: /정체기는 2달 정도 왔었고/g, replacement: '정체기는 2주 정도 왔었고' },
    { target: /이식하고 6개월차/g, replacement: '시작하고 6개월차' },
    { target: /머리 완성이 1년쯤/g, replacement: '체질 개선이 1년쯤' },
    { target: /10개월쯤 흘렀을 때 머리 거의 완성/g, replacement: '10개월쯤 흘렀을 때 체중이 거의 목표치에 도달' },
    { target: /운동 요법 3000모로 이식 받고/g, replacement: '운동 요법으로 15kg 감량하고' },
    { target: /복부비만 다이어트 교정과 이마 높이를 낮추기 위해 체중 이식을 결심했고/g, replacement: '복부 비만 다이어트와 체지방률을 낮추기 위해 집중 감량을 결심했고' },
    { target: /체중 이식을 결심했고/g, replacement: '집중 감량을 결심했고' },
    { target: /2주 차에 정체기를 제거했으며/g, replacement: '2주 차에 첫 정체기를 돌파했으며' },
    { target: /이식 체중이 빠지기 시작해 현재는 거의 체중이 없는 상태입니다다/g, replacement: '체지방이 빠지기 시작해 현재는 탄탄한 몸매를 유지하고 있습니다' },
    { target: /출산 후 다이어트 시작된 줄 알았는데 알고 보니 유전이구나\.\.\. 싶으신 분들 이식은 좀/g, replacement: '출산 후 급격히 살이 찐 줄 알았는데 대사 저하 때문이더군요... 식단 관리만으로는' },
    { target: /머리 잘 자란걸 보면/g, replacement: '체중이 눈에 띄게 줄어든 걸 보면' },
    { target: /앞이마 위고비\/마운자로 후기/g, replacement: '복부 비만 다이어트 관리 후기' },
    { target: /머머리로/g, replacement: '과체중으로' },
    { target: /옆머리랑 뒷머리 뿐이여서/g, replacement: '팔이랑 허벅지 라인 뿐이라' },
    { target: /이식견적을/g, replacement: '감량 목표를' },
    { target: /이식이 가능하다/g, replacement: '감량이 가능하다' },
    { target: /옆머리랑 뒷머리 뿐이여서/g, replacement: '근육량 뿐이라' },
    { target: /옆머리랑 뒷머/g, replacement: '근육과 관절' },
    { target: /이마를 드러내고/g, replacement: '라인이 훤히 드러나게' },
    { target: /앞머리가 부족해 보인다고/g, replacement: '아랫배가 아직 덜 빠진 거 같다고' },
    { target: /4,000모 정도 이식이 필요/g, replacement: '20kg 정도 감량이 필요' },
    { target: /2,000모 정도 이식을 권유/g, replacement: '10kg 정도 1차 감량을 권유' },
    { target: /앞라인을 우선 이식 진행/g, replacement: '복부 비만을 우선 관리 진행' },
    { target: /이식하고 1년 최종/g, replacement: '다이어트 1년 최종' },
    { target: /이식하고 하루/g, replacement: '다이어트 시작하고 하루' },
    { target: /이식하고 6개월차/g, replacement: '다이어트 시작하고 6개월차' },
    { target: /이식하고 2달/g, replacement: '시작하고 2달' },
    { target: /이식한지 벌써/g, replacement: '다이어트한 지 벌써' },
    { target: /이식 감량 수치 : 2500감량 수치/g, replacement: '감량 수치 : 25kg 감량' },
    { target: /이식된 머리카락의 방향과 밀도가 기존 머리카락과 소름 돋을 정도로 닮아 있어서/g, replacement: '체계적인 감량 플랜 and 식단 관리가 제 체질과 소름 돋을 정도로 잘 맞아서' },
    { target: /이식된/g, replacement: '감량된' },
    { target: /이식은/g, replacement: '감량은' },
    { target: /이식을/g, replacement: '감량을' },
    { target: /이식에/g, replacement: '감량에' },
    { target: /이식으로/g, replacement: '감량으로' },
    { target: /이식한/g, replacement: '감량한' },
    { target: /이식 후/g, replacement: '감량 후' },
    { target: /이식받은/g, replacement: '케어받은' },
    { target: /이식받고/g, replacement: '케어받고' },
    { target: /이식하고/g, replacement: '감량하고' },
    { target: /이식했습니다/g, replacement: '감량했습니다' },
    { target: /이식했으나/g, replacement: '감량했으나' },
    { target: /이식할/g, replacement: '감량할' },
    { target: /이식/g, replacement: '감량' },
    { target: /모발이식/g, replacement: '비만 관리' },
    { target: /모발/g, replacement: '체중' },
    { target: /모낭/g, replacement: '체지방' },
    { target: /생착률/g, replacement: '체지방 감량 성공률' },
    { target: /생착/g, replacement: '체중 감량' },
    { target: /대머리/g, replacement: '비만' },
    { target: /m자라인/g, replacement: '복부라인' },
    { target: /m자/g, replacement: '복부비만' },
    { target: /엠자/g, replacement: '복부' },
    { target: /가르마/g, replacement: '허벅지라인' },
    { target: /정수리/g, replacement: '복부비만' },
    { target: /앞머리/g, replacement: '복부' },
    { target: /머리카락/g, replacement: '체지방' },
    { target: /머리숱/g, replacement: '체형' },
    { target: /머리/g, replacement: '체중' },
    { target: /흉터/g, replacement: '정체기' },
    { target: /봉합/g, replacement: '조절' },
    { target: /샴푸/g, replacement: '인바디 측정' },
    
    // 2. search.html 항암/흉터 칼럼 리라이팅
    { target: /식단 요법 위고비\/마운자로을 선택할 때 고민되는 것 중 하나가 식단 요법 정체기입니다\./g, replacement: '식단 조절과 운동 요법 중 어떤 다이어트 방법이 더 효과적인가 고민하시는 분들이 많습니다.' },
    { target: /식단 요법 위고비\/마운자로의 정체기는 웬만해서는 눈에 잘 띄지 않습니다\./g, replacement: '초기 식단 조절 단계에서는 정체기가 거의 오지 않고 빠른 감량을 경험할 수 있습니다.' },
    { target: /미용실에서도 잘 못 찾는 경우도 많습니다\./g, replacement: '일반적인 인바디 눈바디 상으로도 만족스러운 수치가 먼저 나옵니다.' },
    { target: /상담실에서는체지방의 상태를 정확히 측정해야 합니다\./g, replacement: '체계적인 인바디 검사를 통해 골격근량과 체지방량을 정확히 측정해야 합니다.' },
    { target: /건막 주름 접합/g, replacement: '체계적인 식단 및 칼로리 제한' },
    { target: /항암치료를 받게되는 환우분들에게 다이어트는 단순한 외모의 변화를 넘어 큰 심리적 부담 중 하나라 생각됩니다\./g, replacement: '급격한 호르몬 변화나 출산 후 요요 현상으로 고통받는 분들에게 체중 증가는 단순한 외모 변화를 넘어 큰 심리적 스트레스입니다.' },
    { target: /항암 치료를 하면 왜 체지방이 빠지는 걸까요\?/g, replacement: '호르몬 변화 시 왜 살이 찌고 다이어트 정체기가 오는 걸까요?' },
    { target: /항암 치료로 인한 다이어트\(Chemotherapy-induced alopecia, CIA\)는/g, replacement: '갑작스러운 체질 변화로 인한 요요 현상은' },
    { target: /항암제는 기본적으로 암세포처럼 빠르게 분열하는 세포를 찾아내 공격하도록 설계되어 있는데요\./g, replacement: '인체는 급격한 영양 결핍이나 대사 저하 시 지방을 최대한 비축하려는 성질을 가지고 있습니다.' },
    { target: /안타깝게도 체지방을 만들어내는 지방 세포 역시 우리 몸에서 대사 활동이 가장 활발하고 분열이 빠른 세포 중 하나입니다\./g, replacement: '이 때문에 단기간에 과도하게 굶게 되면 기초 대사량이 급격히 하락해 오히려 요요가 오게 됩니다.' },
    
    // 3. 앱 패키지명 치환
    { target: /com\.appg\.daedamo/g, replacement: 'com.dieton.app' },
    { target: /daedamohelp@gmail.com/g, replacement: 'dietonhelp@gmail.com' },
    
    // 4. daedamo.com 도메인 절대 경로 -> 로컬 상대경로 매핑 (정교화된 패턴)
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/new\/bbs\/new\.php\?mb_id=([^"']*)["']/g, replacement: '$1="./my.html?mb_id=$2"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/story\/(\d+)["']/g, replacement: '$1="./post.html?id=$2"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/story\/?["']/g, replacement: '$1="./community.html"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/new\/bbs\/write\.php["']/g, replacement: '$1="./write.html"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/new\/bbs\/board\.php\?bo_table=story["']/g, replacement: '$1="./community.html"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/?["']/g, replacement: '$1="./index.html"' },
    // JSON-LD 형태 매칭
    { target: /"url"\s*:\s*"https:\\\/\\\/daedamo\.com\\\/story\\\/(\d+)"/g, replacement: '"url":"./post.html?id=$1"' },
    { target: /"url"\s*:\s*"https:\\\/\\\/daedamo\.com\\\/story"/g, replacement: '"url":"./community.html"' },
    { target: /"url"\s*:\s*"https:\\\/\\\/daedamo\.com"/g, replacement: '"url":"./index.html"' },

    // [LOG: 20260624_1720] 대다모 잔존 절대 경로 및 픽 배너 브랜딩 추가 치환 규칙 정의
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/graftover(\?[^"']*)?["']/g, replacement: '$1="./index.html$2"' },
    { target: /(href|content|url)=["']https:\/\/daedamo\.com\/doctor(\?[^"']*)?["']/g, replacement: '$1="./search.html$2"' },
    { target: /daedamo-pick/g, replacement: 'dieton-pick' },
    { target: /daedamoPick/g, replacement: 'dietonPick' },
    { target: /daedamo_pick/g, replacement: 'dieton_pick' },
    { target: /Dr\.\s*毛王/g, replacement: '다이어트 마스터' },

    // [LOG: 20260624_1540] daedamo.com/new 절대 주소를 로컬 상대 경로로 매핑하여 샌드박스 DNS 프록시 에러(index.htmlnew/... 등) 방지
    { target: /https:\/\/daedamo\.com\/new\//g, replacement: '/new/' },
    { target: /https:\/\/daedamo\.com\/new/g, replacement: '/new' },
    { target: /\.\/new\//g, replacement: '/new/' },

    // 5. G5 전역 변수 로컬화 치환 (주소 왜곡 404 방지)
    { target: /var g5_url\s*=\s*["']https:\/\/daedamo\.com\/new["']/g, replacement: 'var g5_url            = "."' },
    { target: /var g5_bbs_url\s*=\s*["']https:\/\/daedamo\.com\/new\/bbs["']/g, replacement: 'var g5_bbs_url        = "."' },
    { target: /var g5_cookie_domain\s*=\s*["']daedamo\.com["']/g, replacement: 'var g5_cookie_domain  = ""' }
];

targetFiles.forEach(fileName => {
    const filePath = path.join(__dirname, '../../', fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(item => {
        content = content.replace(item.target, item.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[LOG: 20260624_1533] Fixed translation & G5 vars in: ${fileName}`);
    } else {
        console.log(`No changes needed in: ${fileName}`);
    }
});

console.log('Incorrect translation and G5 vars fix complete.');
