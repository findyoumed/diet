const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

const localAvatar = 'images/custom/avatar.png';
const localBanner = 'images/custom/banner.png';
const localProduct = 'images/custom/product.png';

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Replace all Unsplash images with local generated images based on their previous grouping
    // But since we just want to replace all Unsplash images, we can do a simple distribution
    content = content.replace(/src="https:\/\/images\.unsplash\.com\/photo-[^"]+"/gi, (match) => {
        // Simple heuristic based on the unsplash URL used previously
        if (match.includes('w=40')) return `src="${localAvatar}"`;
        if (match.includes('w=1200')) return `src="${localBanner}"`;
        return `src="${localProduct}"`;
    });

    // Replace CSS url() unsplash links
    content = content.replace(/url\(['"]?(https:\/\/images\.unsplash\.com\/photo-[^'"\)]+)['"]?\)/gi, (match) => {
        if (match.includes('w=1200')) return `url(${localBanner})`;
        return `url(${localProduct})`;
    });

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Replaced Unsplash with custom local images.');
