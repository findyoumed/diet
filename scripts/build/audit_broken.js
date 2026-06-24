const fs = require('fs');
const files = ['index.html', 'index_mobile.html', 'community.html', 'post.html', 'record.html', 'search.html', 'write.html', 'my.html'];
let broken = [];

function assetPathFromUrl(url) {
    return url.split('#')[0].split('?')[0];
}

files.forEach(f => {
    try {
        const c = fs.readFileSync(f, 'utf8');
        const srcs = [...c.matchAll(/src=["']([^"']+)["']/gi)];
        const urls = [...c.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/gi)];
        [...srcs, ...urls].forEach(m => {
            const url = m[1];
            if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return;
            const assetPath = assetPathFromUrl(url);
            if (assetPath.startsWith('images/')) {
                if (!fs.existsSync(assetPath)) broken.push({file: f, url: url, path: assetPath});
            }
        });
    } catch(e) {}
});
console.log('Broken assets found: ' + broken.length);
if (broken.length > 0) {
    const uniqueBroken = [...new Set(broken.map(b => b.url))];
    console.log(uniqueBroken.slice(0, 10));
}
