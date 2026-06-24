const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';

// Create a map banner with exact dimensions 239x240
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 239 240" width="239" height="240">
    <defs>
        <linearGradient id="bg_map" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4facfe" />
            <stop offset="100%" stop-color="#00f2fe" />
        </linearGradient>
    </defs>
    <rect width="239" height="240" rx="10" fill="url(#bg_map)"/>
    <text x="119.5" y="90" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        🏥
    </text>
    <text x="119.5" y="140" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        내 주변 클리닉
    </text>
    <text x="119.5" y="180" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        지도에서 찾기 &gt;
    </text>
</svg>
`.trim();

fs.writeFileSync(path.join(imgDir, 'content_map_banner.svg'), svg);

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Re-generated content_map_banner.svg to exactly 239x240.');
