const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Fix the injected CSS
    content = content.replace(/img\[src\*\="images\/custom"\]\s*{\s*object-fit:\s*cover;\s*width:\s*100%;\s*height:\s*100%;\s*}/g, `
        img[src*="images/custom"] {
            object-fit: cover;
        }
        .thumb_box img {
            width: 100%;
            height: 100%;
        }
    `);

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Fixed image sizing CSS.');
