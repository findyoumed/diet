const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');
const imgs = c.match(/<img[^>]*src="images\/custom\/[^"]+"[^>]*>/gi);
if (imgs) console.log(imgs.slice(0, 10).join('\n'));
