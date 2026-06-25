const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

const dietAvatars = [
    '../../images/remote/images.unsplash.com/photo-1544005313-94ddf0286df2.jpg',
    '../../images/remote/images.unsplash.com/photo-1506794778202-cad84cf45f1d.jpg',
    '../../images/remote/images.unsplash.com/photo-1534528741775-53994a69daeb.jpg',
    '../../images/remote/images.unsplash.com/photo-1521119989659-a83eee488004.jpg'
];

const dietProducts = [
    '../../images/remote/images.unsplash.com/photo-1512621776951-a57141f2eefd.jpg',
    '../../images/remote/images.unsplash.com/photo-1490645935967-10de6ba17061.jpg',
    '../../images/remote/images.unsplash.com/photo-1546069901-ba9599a7e63c.jpg',
    '../../images/remote/images.unsplash.com/photo-1584308666744-24d5c474f2ae.jpg'
];

const dietBanners = [
    '../../images/remote/images.unsplash.com/photo-1571019614242-c5c5dee9f50b.jpg',
    '../../images/remote/images.unsplash.com/photo-1534438327276-14e5300c3a48.jpg'
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

for (let file of files) {
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Find all image tags
    content = content.replace(/src="([^"]+)"/gi, (match, src) => {
        if (!src.includes('dieton.com')) return match;
        if (src.includes('icon') || src.includes('logo') || src.includes('.svg') || src.includes('badge') || src.includes('i_balloon') || src.includes('admin.gif') || src.includes('favicon')) {
            return match;
        }
        
        // If it's a person/doctor/avatar
        if (src.includes('drlist') || src.includes('yt3.ggpht')) {
            return `src="${getRandom(dietAvatars)}"`;
        }
        
        // If it's a banner
        if (src.includes('banner') || src.includes('Banner') || src.includes('ad_')) {
            return `src="${getRandom(dietBanners)}"`;
        }
        
        // Everything else (photo2, editor, ingre, etc)
        return `src="${getRandom(dietProducts)}"`;
    });

    // Also background images for dieton
    content = content.replace(/url\(['"]?(https?:\/\/[^'"]+dieton\.com[^'"]+)['"]?\)/gi, (match, url) => {
        if (url.includes('icon') || url.includes('logo') || url.includes('.svg') || url.includes('badge') || url.includes('i_balloon')) {
            return match;
        }
        if (url.includes('banner') || url.includes('Banner')) return `url(${getRandom(dietBanners)})`;
        return `url(${getRandom(dietProducts)})`;
    });

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Aggressive image replacement done.');
