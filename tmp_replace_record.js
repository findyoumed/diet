const fs = require('fs');

// 1. Read daedamo_story.html
let story = fs.readFileSync('d:\\work\\다이어트\\daedamo_story.html', 'utf8');
let start = story.indexOf('<div class="container">');
let end = story.indexOf('</div><!--container-->') + '</div><!--container-->'.length;
let content = story.substring(start, end);

// 2. Replace keywords
content = content.replace(/탈모/g, '다이어트').replace(/모발이식/g, '비만치료').replace(/헤어라인\/두피문신/g, '식단/운동').replace(/가발/g, '바디프로필').replace(/대다모/g, 'DietOn');

// 3. Read record.html
let record = fs.readFileSync('d:\\work\\다이어트\\record.html', 'utf8');
let recStart = record.indexOf('<!-- [LOG: 20260623_1630]');
let recEnd = record.indexOf('</section>\r\n      <aside class="side-column" id="sidebar"></aside>');
if (recEnd === -1) {
    recEnd = record.indexOf('</section>\n      <aside class="side-column" id="sidebar"></aside>');
}

let recordInner = record.substring(recStart, recEnd);

// 4. In content, replace from <!-- 게시판 목록 시작 --> to <!-- 게시판 목록 끝 --> with recordInner
let listStart = content.indexOf('<!-- 게시판 목록 시작 -->');
let listEnd = content.indexOf('<!-- 게시판 목록 끝 -->') + '<!-- 게시판 목록 끝 -->'.length;

// Also remove search-modal and pagination from content
let pageStart = content.indexOf('<!-- 페이지 -->');
let pageEnd = content.indexOf('</div>', pageStart) + 6; // roughly
// Let's just do a simpler replacement
let newContent = content.substring(0, listStart) + '\n<div style="padding: 20px;">\n' + recordInner + '\n</div>\n' + content.substring(listEnd);

// Replace the main shell of record.html
let commStart = record.indexOf('<main class="page-shell">');
let commEnd = record.indexOf('</main>') + '</main>'.length;
let newRecord = record.substring(0, commStart) + newContent + record.substring(commEnd);

fs.writeFileSync('d:\\work\\다이어트\\record.html', newRecord);
console.log('Done!');
