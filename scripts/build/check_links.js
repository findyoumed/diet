const fs = require('fs');
let c = fs.readFileSync('d:\\work\\다이어트\\index.html', 'utf8');
let hrefs = c.match(/href="[^"]+"/g) || [];
let srcs = c.match(/src="[^"]+"/g) || [];
console.log("Dieton in hrefs:", hrefs.filter(h => h.includes('dieton')).slice(0, 5));
console.log("Dieton in srcs:", srcs.filter(s => s.includes('dieton')).slice(0, 5));
console.log("Daedamo in hrefs:", hrefs.filter(h => h.includes('daedamo')).slice(0, 5));
