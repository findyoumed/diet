const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');
let matches = c.match(/<img[^>]+src="([^"]+)"[^>]*>/g) || [];
console.log(matches.filter(m => !m.includes('icon') && !m.includes('logo') && !m.includes('svg')).slice(0, 30).join('\n'));
