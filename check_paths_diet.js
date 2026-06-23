const fs = require('fs');
const path = require('path');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

console.log('=== Checking images in d:\\work\\diet ===');

for (let file of files) {
    const filePath = path.join('d:\\work\\diet', file);
    if (!fs.existsSync(filePath)) {
        console.log(`${file} does not exist.`);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find img src
    const imgMatches = [...content.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)];
    // Find url() in CSS
    const urlMatches = [...content.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/gi)];
    
    if (imgMatches.length > 0 || urlMatches.length > 0) {
        console.log(`\nFile: ${file}`);
        if (imgMatches.length > 0) {
            console.log('  <img src="...">:');
            imgMatches.forEach(m => {
                console.log(`    - ${m[1]}`);
            });
        }
        if (urlMatches.length > 0) {
            console.log('  url(...):');
            urlMatches.forEach(m => {
                console.log(`    - ${m[1]}`);
            });
        }
    }
}
