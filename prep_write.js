const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\write.html', 'utf8');

c = c.replace('<select style="padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; outline:none;">', '<select id="writeCategory" style="padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; outline:none;">');

c = c.replace('<input type="text" placeholder="제목을 입력해 주세요."', '<input id="writeTitle" type="text" placeholder="제목을 입력해 주세요."');

c = c.replace('<textarea placeholder="내용을 입력해 주세요."', '<textarea id="writeContent" placeholder="내용을 입력해 주세요."');

c = c.replace('<button type="button" style="padding:12px 40px; background:#1e88e5; color:#fff; font-weight:bold; border:none; border-radius:4px; cursor:pointer;">작성완료</button>', '<button id="writeSubmitBtn" type="button" style="padding:12px 40px; background:#1e88e5; color:#fff; font-weight:bold; border:none; border-radius:4px; cursor:pointer;">작성완료</button>');

fs.writeFileSync('d:\\work\\다이어트\\write.html', c);
console.log('write.html IDs added');
