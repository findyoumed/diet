const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');

const imgMatch = [...c.matchAll(/<img[^>]+src="([^"]*dieton[^"]*)"/gi)];
const urlMatch = [...c.matchAll(/url\(['"]?([^'"\)]+dieton[^'"\)]+)['"]?\)/gi)];

console.log('--- DietOn IMG SRC ---');
imgMatch.forEach(m => console.log(m[1]));

console.log('--- DietOn URL(...) ---');
urlMatch.forEach(m => console.log(m[1]));
