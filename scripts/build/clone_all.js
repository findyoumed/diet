const fs = require('fs');

function replaceKeywords(content) {
    let text = content;
    
    // 기본 명칭 변경
    text = text.replace(/DietOn/g, 'DietOn')
               .replace(/dieton/g, 'dieton')
               .replace(/DietOn/g, 'DIETON');

    // 카테고리 및 메뉴 변경 (DietOn GNB 메뉴 기반)
    text = text.replace(/탈모톡톡/g, '다이어트톡톡')
               .replace(/탈모수다/g, '다이어트수다')
               .replace(/모발이식/g, '위고비/마운자로')
               .replace(/여성헤어라인/g, '여성다이어트')
               .replace(/탈모치료톡/g, '비만치료톡')
               .replace(/두피문신\/색소요법/g, '지방흡입/시술')
               .replace(/두피문신/g, '지방흡입')
               .replace(/탈모의약품/g, '비만치료제')
               .replace(/샴푸\&영양제/g, '식단&보조제')
               .replace(/맞춤가발/g, '바디프로필')
               .replace(/지루\&원형탈모/g, '고도비만&요요')
               .replace(/여성탈모/g, '산후다이어트')
               .replace(/익명수다/g, '익명수다')
               .replace(/19\-23세 탈모/g, '2030 다이어트')
               .replace(/먹는 탈모약/g, '다이어트약 (위고비/삭센다)')
               .replace(/헤어\&두피케어/g, '식단&운동케어')
               .replace(/탈모 후기/g, '다이어트 후기')
               .replace(/전문가상담/g, '전문의상담')
               .replace(/탈모병원/g, '비만클리닉')
               .replace(/탈모콘텐츠/g, '다이어트칼럼')
               .replace(/닥터노비드/g, '닥터다이어트')
               .replace(/득모/g, '감량')
               .replace(/모발/g, '체중')
               .replace(/두피/g, '체지방');

    // 자주 쓰이는 탈모 용어를 위고비/마운자로 용어로 변경
    text = text.replace(/탈모/g, '다이어트')
               .replace(/미녹시딜/g, '위고비')
               .replace(/프로페시아/g, '마운자로')
               .replace(/프페/g, '마운자로')
               .replace(/아보다트/g, '삭센다')
               .replace(/쉐딩현상/g, '정체기현상')
               .replace(/쉐딩/g, '정체기')
               .replace(/헤어라인/g, '눈바디')
               .replace(/M자/g, '복부비만')
               .replace(/정수리/g, '하체비만');
               
    // URL이 dieton.com 으로 바뀌어 이미지가 깨지는 것 방지
    text = text.replace(/dieton\.com/g, 'dieton.com');

    return text;
}

// 1. index.html = dieton.html
let indexContent = fs.readFileSync('d:\\work\\다이어트\\dieton.html', 'utf8');
indexContent = replaceKeywords(indexContent);
fs.writeFileSync('d:\\work\\다이어트\\index.html', indexContent);

// 2. community.html = dieton_story.html
let commContent = fs.readFileSync('d:\\work\\다이어트\\dieton_story.html', 'utf8');
commContent = replaceKeywords(commContent);
fs.writeFileSync('d:\\work\\다이어트\\community.html', commContent);

// 3. post.html = dieton_post.html
let postContent = fs.readFileSync('d:\\work\\다이어트\\dieton_post.html', 'utf8');
postContent = replaceKeywords(postContent);
fs.writeFileSync('d:\\work\\다이어트\\post.html', postContent);

// 4. my.html = dieton_register.html
let myContent = fs.readFileSync('d:\\work\\다이어트\\dieton_register.html', 'utf8');
myContent = replaceKeywords(myContent);
fs.writeFileSync('d:\\work\\다이어트\\my.html', myContent);

// 5. record.html = dieton_story.html with form inside
let listStart = commContent.indexOf('<!-- 게시판 목록 시작 -->');
let listEnd = commContent.indexOf('<!-- 게시판 목록 끝 -->');
if(listEnd !== -1) {
    listEnd += '<!-- 게시판 목록 끝 -->'.length;
}

let formHtml = `
<div style="padding:20px; background:#fff; border-radius:10px; margin-bottom:20px;">
    <h2 style="font-size:24px; font-weight:bold; margin-bottom:20px; color:#333;">다이어트 기록 <span style="font-size:14px; color:#888; font-weight:normal;">위고비/마운자로 투약 및 체중 변화를 기록하세요.</span></h2>
    <div style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:bold; margin-bottom:10px;">오늘의 체중 및 투약 기록</h3>
        <input type="text" placeholder="현재 체중 입력 (kg)" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; margin-bottom:10px;">
        <label style="margin-right:15px;"><input type="checkbox"> 위고비 투여 완료</label>
        <label><input type="checkbox"> 마운자로 투여 완료</label>
        <button style="width:100%; padding:15px; background:#1e88e5; color:white; font-weight:bold; border:none; border-radius:5px; margin-top:15px; cursor:pointer;">기록 저장</button>
    </div>
</div>
`;

let recordContent = commContent.substring(0, listStart) + formHtml + commContent.substring(listEnd);
let pageStart = recordContent.indexOf('<!-- 페이지 -->');
let pageEnd = recordContent.indexOf('</div>', pageStart);
if (pageStart !== -1 && pageEnd !== -1) {
    recordContent = recordContent.substring(0, pageStart) + recordContent.substring(pageEnd + 6);
}
fs.writeFileSync('d:\\work\\다이어트\\record.html', recordContent);

console.log("Diet keyword replacement (Wegovy/Mounjaro) complete!");
