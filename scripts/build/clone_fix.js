const fs = require('fs');

function replaceKeywords(content) {
    let text = content;
    // DO NOT REPLACE lowercase dieton to avoid breaking resource URLs!
    text = text.replace(/대다모/g, 'DietOn')
               .replace(/DietOn/g, 'DIETON');
               
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
               
    return text;
}

function fixInternalLinks(content) {
    let text = content;
    text = text.replace(/href="https:\/\/dieton\.com\/new"/g, 'href="index.html"');
    text = text.replace(/href="https:\/\/dieton\.com"/g, 'href="index.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/story"/g, 'href="community.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/forum"/g, 'href="community.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/story\/([0-9]+)"/g, 'href="post.html?id=$1"');
    text = text.replace(/href="https:\/\/dieton\.com\/new\/bbs\/login\.php"/g, 'href="my.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/new\/bbs\/register\.php"/g, 'href="my.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/new\/bbs\/write\.php\?bo_table=([a-zA-Z0-9_]+)"/g, 'href="write.html?bo_table=$1"');
    text = text.replace(/href="https:\/\/dieton\.com\/new\/bbs\/write\.php"/g, 'href="write.html"');
    text = text.replace(/href="https:\/\/dieton\.com\/search[^"]*"/g, 'href="search.html"');
    return text;
}

// 1. index.html
let indexContent = fs.readFileSync('d:\\work\\다이어트\\dieton.html', 'utf8');
indexContent = replaceKeywords(indexContent);
indexContent = fixInternalLinks(indexContent);
fs.writeFileSync('d:\\work\\다이어트\\index.html', indexContent);

// 2. community.html
let commContent = fs.readFileSync('d:\\work\\다이어트\\dieton_story.html', 'utf8');
commContent = replaceKeywords(commContent);
commContent = fixInternalLinks(commContent);
fs.writeFileSync('d:\\work\\다이어트\\community.html', commContent);

// 3. post.html
let postContent = fs.readFileSync('d:\\work\\다이어트\\dieton_post.html', 'utf8');
postContent = replaceKeywords(postContent);
postContent = fixInternalLinks(postContent);
fs.writeFileSync('d:\\work\\다이어트\\post.html', postContent);

// 4. my.html
let myContent = fs.readFileSync('d:\\work\\다이어트\\dieton_register.html', 'utf8');
myContent = replaceKeywords(myContent);
myContent = fixInternalLinks(myContent);
fs.writeFileSync('d:\\work\\다이어트\\my.html', myContent);

// 5. search.html
let searchContent = fs.readFileSync('d:\\work\\다이어트\\dieton_search.html', 'utf8');
searchContent = replaceKeywords(searchContent);
searchContent = fixInternalLinks(searchContent);
fs.writeFileSync('d:\\work\\다이어트\\search.html', searchContent);

// 6. write.html
let writeCommContent = fs.readFileSync('d:\\work\\다이어트\\dieton_story.html', 'utf8');
writeCommContent = replaceKeywords(writeCommContent);
let listStart = writeCommContent.indexOf('<!-- 게시판 목록 시작 -->');
let listEnd = writeCommContent.indexOf('<!-- 게시판 목록 끝 -->');
if(listEnd !== -1) listEnd += '<!-- 게시판 목록 끝 -->'.length;

let writeFormHtml = `
<!-- 게시판 목록 시작 -->
<div style="padding:20px; background:#fff; border-radius:10px; margin-bottom:20px; border:1px solid #e1e1e1;">
    <h2 style="font-size:20px; font-weight:bold; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;">글쓰기</h2>
    <form style="display:flex; flex-direction:column; gap:15px;">
        <select style="padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; outline:none;">
            <option>다이어트수다</option>
            <option>다이어트톡톡</option>
            <option>위고비/마운자로톡톡</option>
        </select>
        <input type="text" placeholder="제목을 입력해 주세요." style="padding:15px; border:1px solid #ddd; border-radius:4px; font-size:16px; outline:none;">
        
        <div style="border:1px solid #ddd; border-radius:4px;">
            <div style="background:#f9f9f9; padding:10px; border-bottom:1px solid #ddd; display:flex; gap:10px;">
                <button type="button" style="padding:5px 10px; border:1px solid #ccc; background:#fff; cursor:pointer;"><b>B</b></button>
                <button type="button" style="padding:5px 10px; border:1px solid #ccc; background:#fff; cursor:pointer;"><i>I</i></button>
                <button type="button" style="padding:5px 10px; border:1px solid #ccc; background:#fff; cursor:pointer;"><u>U</u></button>
                <button type="button" style="padding:5px 10px; border:1px solid #ccc; background:#fff; cursor:pointer;">사진첨부</button>
            </div>
            <textarea placeholder="내용을 입력해 주세요." style="width:100%; height:400px; padding:15px; border:none; resize:none; font-size:14px; outline:none; box-sizing:border-box;"></textarea>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <a href="community.html" style="padding:12px 30px; border:1px solid #ccc; background:#fff; color:#333; font-weight:bold; border-radius:4px; text-decoration:none;">취소</a>
            <button type="button" style="padding:12px 40px; background:#1e88e5; color:#fff; font-weight:bold; border:none; border-radius:4px; cursor:pointer;">작성완료</button>
        </div>
    </form>
</div>
<!-- 게시판 목록 끝 -->
`;
let writeContent = writeCommContent.substring(0, listStart) + writeFormHtml + writeCommContent.substring(listEnd);
let pageStart = writeContent.indexOf('<!-- 페이지 -->');
let pageEnd = writeContent.indexOf('</div>', pageStart);
if (pageStart !== -1 && pageEnd !== -1) writeContent = writeContent.substring(0, pageStart) + writeContent.substring(pageEnd + 6);
writeContent = fixInternalLinks(writeContent);
fs.writeFileSync('d:\\work\\다이어트\\write.html', writeContent);

// 7. record.html
let recordContent = writeCommContent;
let formHtml = `
<!-- 게시판 목록 시작 -->
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
<!-- 게시판 목록 끝 -->
`;
recordContent = recordContent.substring(0, listStart) + formHtml + recordContent.substring(listEnd);
let pStart = recordContent.indexOf('<!-- 페이지 -->');
let pEnd = recordContent.indexOf('</div>', pStart);
if (pStart !== -1 && pEnd !== -1) recordContent = recordContent.substring(0, pStart) + recordContent.substring(pEnd + 6);
recordContent = fixInternalLinks(recordContent);
fs.writeFileSync('d:\\work\\다이어트\\record.html', recordContent);

console.log("All files regenerated perfectly! CSS/Image paths restored.");
