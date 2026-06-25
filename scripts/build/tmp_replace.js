const fs = require('fs');
let story = fs.readFileSync('d:\\work\\다이어트\\dieton_story.html', 'utf8');
let start = story.indexOf('<div class="container">');
let end = story.indexOf('</div><!--container-->') + '</div><!--container-->'.length;
let content = story.substring(start, end);
content = content.replace(/탈모/g, '다이어트').replace(/모발이식/g, '비만치료').replace(/헤어라인\/두피문신/g, '식단/운동').replace(/가발/g, '바디프로필').replace(/대다모/g, 'DietOn');

let comm = fs.readFileSync('d:\\work\\다이어트\\community.html', 'utf8');
let commStart = comm.indexOf('<main class="page-shell">');
let commEnd = comm.indexOf('</main>') + '</main>'.length;
console.log(commStart, commEnd);
let newComm = comm.substring(0, commStart) + content + comm.substring(commEnd);
fs.writeFileSync('d:\\work\\다이어트\\community.html', newComm);
