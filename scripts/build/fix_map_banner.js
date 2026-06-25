const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Create a nice map banner (241x100)
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 241 100" width="241" height="100">
    <defs>
        <linearGradient id="bg_map" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4facfe" />
            <stop offset="100%" stop-color="#00f2fe" />
        </linearGradient>
    </defs>
    <rect width="241" height="100" rx="10" fill="url(#bg_map)"/>
    <text x="120" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        🏥 내 주변 클리닉
    </text>
    <text x="120" y="75" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        지도에서 찾기 &gt;
    </text>
</svg>
`.trim();

fs.writeFileSync(path.join(imgDir, 'content_map_banner.svg'), svg);

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // In index.html, content_map uses banner2.svg. Replace it specifically.
    content = content.replace(/<div class="content_map">\s*<a[^>]*>\s*<img src="[^"]*" alt="지도보기">/g, `<div class="content_map">\n            <a href="https://dieton.com/new/hospitalmap.php" class="link">\n                <img src="images/custom/content_map_banner.svg" alt="지도보기" style="width:100%; height:auto; display:block;">`);
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Created map banner (241x100) and replaced in HTML.');
