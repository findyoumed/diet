const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\my.html', 'utf8');
const sIdx = c.indexOf('<div class="main">');
if (sIdx > -1) {
    console.log(c.substring(sIdx, sIdx + 1500));
} else {
    console.log('Not found');
    console.log(c.substring(0, 1000));
}
