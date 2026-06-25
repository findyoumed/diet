const fs = require('fs');
let story = fs.readFileSync('d:\\work\\다이어트\\dieton_story.html', 'utf8');
console.log(story.indexOf('<!-- 게시판 목록 시작 -->'));
console.log(story.indexOf('<!-- 게시판 목록 끝 -->'));
