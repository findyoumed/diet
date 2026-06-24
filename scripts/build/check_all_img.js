const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

let allImages = new Set();
for (let file of files) {
    let c = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');
    let m = c.match(/<img[^>]+src="([^"]+)"/gi) || [];
    for(let img of m) {
        let src = img.match(/src="([^"]+)"/i)[1];
        if (!src.includes('icon') && !src.includes('logo') && !src.includes('.svg') && !src.includes('badge')) {
            allImages.add(src);
        }
    }
}
console.log(Array.from(allImages).slice(0, 30).join('\n'));
