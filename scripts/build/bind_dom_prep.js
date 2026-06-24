const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\community.html', 'utf8');

const listStartMarker = '<!-- 게시판 목록 시작 -->';
const listEndMarker = '<!-- 게시판 목록 끝 -->';

if (c.includes(listStartMarker) && c.includes(listEndMarker)) {
    const startIdx = c.indexOf(listStartMarker) + listStartMarker.length;
    const endIdx = c.indexOf(listEndMarker);
    const wrapperHTML = '\n<div id="dieton-post-list" style="min-height: 500px;"></div>\n';
    c = c.substring(0, startIdx) + wrapperHTML + c.substring(endIdx);
    fs.writeFileSync('d:\\work\\다이어트\\community.html', c);
    console.log('community.html board list emptied successfully.');
} else {
    console.log('Could not find board list markers.');
}
