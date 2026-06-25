const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\dieton.html', 'utf8');
const scripts = c.match(/<script[^>]*src="[^"]+"[^>]*><\/script>/gi);
if (scripts) console.log(scripts.join('\n'));
