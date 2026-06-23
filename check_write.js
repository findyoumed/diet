const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\write.html', 'utf8');

const sIdx = c.indexOf('<form name="fwrite"');
if (sIdx > -1) {
    console.log(c.substring(sIdx, sIdx + 1000));
} else {
    console.log('form name=fwrite not found. Let us try to find something else.');
    console.log(c.substring(c.indexOf('<div class="board_wrap">'), c.indexOf('<div class="board_wrap">') + 500));
}
