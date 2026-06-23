const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');

const imgMatch = [...c.matchAll(/<img[^>]+src="([^"]*)"/gi)];
const urlMatch = [...c.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/gi)];

console.log('--- IMG SRC ---');
imgMatch.forEach(m => {
    if (!m[1].includes('images/custom') && !m[1].includes('daedamo')) {
        console.log(m[1]);
    }
    if (m[1] === '') console.log('EMPTY IMG SRC!');
});

console.log('--- URL(...) ---');
urlMatch.forEach(m => {
    if (!m[1].includes('images/custom') && !m[1].includes('daedamo')) {
        console.log(m[1]);
    }
    if (m[1] === '') console.log('EMPTY URL!');
});
