const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Create a nice transparent/white background DietOn logo in SVG
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 84" width="220" height="84">
    <rect width="220" height="84" fill="#ffffff"/>
    <text x="110" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#ff7eb3" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">
        Diet<tspan fill="#4facfe">On</tspan>
    </text>
    <text x="110" y="68" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#666666" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
        다이어트의 모든 것
    </text>
</svg>
`;

fs.writeFileSync(path.join(imgDir, 'logo.svg'), logoSvg.trim());

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace logo.png with logo.svg
    content = content.replace(/images\/custom\/logo\.png/g, 'images/custom/logo.svg');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Restored logo to a clean white background design (logo.svg) and updated HTML.');
