const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Create a nice black background DietOn logo for the footer in SVG
const logoFooterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 84" width="220" height="84">
    <rect width="220" height="84" fill="#111111"/>
    <text x="110" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">
        Diet<tspan fill="#ff7eb3">On</tspan>
    </text>
    <text x="110" y="68" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#aaaaaa" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
        다이어트의 모든 것
    </text>
</svg>
`;

fs.writeFileSync(path.join(imgDir, 'logo_footer.svg'), logoFooterSvg.trim());

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to replace the SECOND/LAST logo.svg with logo_footer.svg.
    // The easiest way is to split by "logo.svg" and if there are 3 parts (meaning 2 occurrences), 
    // replace the last one. Alternatively, footer logo usually comes after </main> or </footer>
    // Let's just reverse find the last occurrence of "images/custom/logo.svg"
    
    const lastIndex = content.lastIndexOf('images/custom/logo.svg');
    if (lastIndex !== -1 && lastIndex > content.length / 2) { // ensure it's in the bottom half of the file
        content = content.substring(0, lastIndex) + 'images/custom/logo_footer.svg' + content.substring(lastIndex + 'images/custom/logo.svg'.length);
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Restored footer logo to a black background design (logo_footer.svg) and updated HTML.');
