const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\post.html', 'utf8');

const sIdx = c.indexOf('mw_basic_view_subject');
if (sIdx > -1) console.log(c.substring(sIdx - 50, sIdx + 150));

const cIdx = c.indexOf('mw_basic_view_content');
if (cIdx > -1) console.log(c.substring(cIdx - 50, cIdx + 150));
