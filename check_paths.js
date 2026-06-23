const fs = require('fs');
let index = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');
let hrefMatches = index.match(/href="\/([^"]+)"/g);
let srcMatches = index.match(/src="\/([^"]+)"/g);
console.log("href matches:", hrefMatches ? hrefMatches.slice(0, 5) : 'no matches');
console.log("src matches:", srcMatches ? srcMatches.slice(0, 5) : 'no matches');
