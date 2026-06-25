const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// 1. DietOn Help Icon
const helpSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40" width="150" height="40">
    <rect width="150" height="40" rx="20" fill="#ff758c"/>
    <text x="75" y="22" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        다이어트선배 헬프
    </text>
</svg>
`;
fs.writeFileSync(path.join(imgDir, 'dieton_help_icon.svg'), helpSvg.trim());

// 2. DietOn Pick Balloon
const pickSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
    <path d="M10,10 Q10,0 20,0 L100,0 Q110,0 110,10 L110,25 Q110,35 100,35 L65,35 L55,40 L45,35 L20,35 Q10,35 10,25 Z" fill="#4facfe"/>
    <text x="60" y="19" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        DietOn PICK
    </text>
</svg>
`;
fs.writeFileSync(path.join(imgDir, 'dieton_pick_balloon.svg'), pickSvg.trim());

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace talmo_help_icon_ko.svg
    content = content.replace(/https:\/\/image\.dieton\.com\/images\/staticBanner\/etc\/talmo_help_icon_ko\.svg/g, 'images/custom/dieton_help_icon.svg');
    
    // Replace i_dieton_pick_balloon.svg
    content = content.replace(/https:\/\/image\.dieton\.com\/images\/img\/renew\/icon\/i_dieton_pick_balloon\.svg/g, 'images/custom/dieton_pick_balloon.svg');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Replaced specific dieton svg tags with DietOn custom SVGs and busted cache.');
