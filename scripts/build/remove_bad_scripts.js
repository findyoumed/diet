const fs = require('fs');
const path = require('path');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

console.log('=== Removing bad script tags pointing to images ===');

for (let file of files) {
    const filePath = path.join('d:\\work\\diet', file);
    if (!fs.existsSync(filePath)) {
        console.log(`${file} not found.`);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Remove script tags pointing to png/jpg/jpeg images
    content = content.replace(/<script[^>]+src="images\/custom\/[^"]+\.png"[^>]*><\/script>/gi, '');
    content = content.replace(/<script[^>]+src="images\/custom\/[^"]+\.png"\s*\/?>/gi, '');
    
    if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned bad scripts in ${file}`);
    } else {
        console.log(`No bad scripts found in ${file}`);
    }
}

console.log('Cleanup finished.');
