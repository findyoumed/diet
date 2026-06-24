const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 241 100" width="241" height="100">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff7eb3" />
            <stop offset="100%" stop-color="#ff758c" />
        </linearGradient>
    </defs>
    <rect width="241" height="100" rx="15" fill="url(#bg)"/>
    <text x="120" y="55" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        실시간 비대면 견적
    </text>
    <text x="120" y="80" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
        바로가기 &gt;
    </text>
    <circle cx="120" cy="22" r="12" fill="#ffffff" opacity="0.2"/>
    <text x="120" y="24" font-size="16" text-anchor="middle" dominant-baseline="middle">📋</text>
</svg>
`;

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
fs.writeFileSync(path.join(imgDir, 'right_small_banner.svg'), svgContent.trim());

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // In daedamo, btn_graftover had an img tag inside it.
    // It currently might be <img src="images/custom/side_banner2.png" alt="실시간 비대면 견적받기">
    // Let's regex replace the img tag inside a.btn_graftover
    
    content = content.replace(/(<a href="[^"]*" class="btn_graftover">[\s\S]*?)<img src="[^"]*" alt="[^"]*"/g, '$1<img src="images/custom/right_small_banner.svg" alt="실시간 비대면 견적받기"');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed btn_graftover image to right_small_banner.svg (241x100) and busted cache.');
