const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

let bgProductCount = 200; // start high to avoid collision with the <img> ones generated earlier
let bgAvatarCount = 200;

function getPastelColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace background:url(...) for products
    content = content.replace(/url\(['"]?images\/custom\/product[0-9]*\.png['"]?\)/g, (match) => {
        bgProductCount++;
        const newName = `product_bguniq_${bgProductCount}.svg`;
        
        let c1 = getPastelColor();
        let c2 = getPastelColor();
        
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
    <defs>
        <linearGradient id="bg_p${bgProductCount}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
    </defs>
    <rect width="800" height="400" rx="20" fill="url(#bg_p${bgProductCount})"/>
    <circle cx="400" cy="150" r="60" fill="#ffffff" opacity="0.3"/>
    <text x="400" y="165" font-size="70" text-anchor="middle" dominant-baseline="middle">🥗</text>
    <text x="400" y="280" font-family="sans-serif" font-weight="bold" font-size="40" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Diet Post</text>
</svg>`.trim();
        fs.writeFileSync(path.join(imgDir, newName), svg);
        
        return `url(images/custom/${newName})`;
    });

    // Replace background:url(...) for avatars
    content = content.replace(/url\(['"]?images\/custom\/avatar[0-9]*\.png['"]?\)/g, (match) => {
        bgAvatarCount++;
        const newName = `avatar_bguniq_${bgAvatarCount}.svg`;
        
        let c1 = getPastelColor();
        let c2 = getPastelColor();
        
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
        <linearGradient id="bg_a${bgAvatarCount}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#bg_a${bgAvatarCount})"/>
    <text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Dr.</text>
</svg>`.trim();
        fs.writeFileSync(path.join(imgDir, newName), svg);
        
        return `url(images/custom/${newName})`;
    });

    // Also bust cache
    const ts = new Date().getTime();
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log(`Generated and replaced ${bgProductCount - 200} background products and ${bgAvatarCount - 200} background avatars.`);
