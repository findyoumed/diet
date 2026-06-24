const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');
const sIdx = c.indexOf('<style>');
const eIdx = c.indexOf('</style>');
console.log(c.substring(sIdx, eIdx + 8));
