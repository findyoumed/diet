const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

const dietAvatars = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=40&q=80'
];

const dietProducts = [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
];

const dietBanners = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&h=300&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=300&q=80'
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

for (let file of files) {
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // YouTube avatars
    content = content.replace(/src="https:\/\/yt3\.ggpht\.com\/[^"]+"/g, () => `src="${getRandom(dietAvatars)}"`);
    
    // Clinic logos (hlist)
    content = content.replace(/src="https:\/\/image\.daedamo\.com\/resize\?url=%2Fnew%2Fdata%2Ffile%2Fhlist[^"]+"/g, () => `src="${getRandom(dietAvatars)}"`);
    
    // Products (ingre)
    content = content.replace(/src="https:\/\/image\.daedamo\.com\/resize\?url=%2Fnew%2Fdata%2Ffile%2Fingre[^"]+"/g, () => `src="${getRandom(dietProducts)}"`);
    
    // Banners
    content = content.replace(/src="https:\/\/image\.daedamo\.com\/images\/staticBanner\/[^"]+"/g, () => `src="${getRandom(dietBanners)}"`);

    // In community list there are board thumbnails: /new/data/file/story/ etc.
    content = content.replace(/src="https:\/\/image\.daedamo\.com\/resize\?url=%2Fnew%2Fdata%2Ffile%2F(story|forum)[^"]+"/g, () => `src="${getRandom(dietProducts)}"`);

    // Also replace background images inline if any
    content = content.replace(/background-image:\s*url\([^)]*staticBanner[^)]*\)/g, () => `background-image: url(${getRandom(dietBanners)})`);
    content = content.replace(/background-image:\s*url\([^)]*hlist[^)]*\)/g, () => `background-image: url(${getRandom(dietAvatars)})`);

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}

console.log('Image replacement complete!');
