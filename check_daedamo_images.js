const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');

const imgMatch = [...c.matchAll(/<img[^>]+src="([^"]*daedamo[^"]*)"/gi)];
const urlMatch = [...c.matchAll(/url\(['"]?([^'"\)]+daedamo[^'"\)]+)['"]?\)/gi)];

console.log('--- DAEDAMO IMG SRC ---');
imgMatch.forEach(m => console.log(m[1]));

console.log('--- DAEDAMO URL(...) ---');
urlMatch.forEach(m => console.log(m[1]));
