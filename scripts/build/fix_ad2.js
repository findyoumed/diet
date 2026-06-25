const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html'];

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace the specific banner inside .ad2
    content = content.replace(/<div class="ad2">\s*<a href="[^"]*">\s*<img src="images\/custom\/banner\.png"[^>]*>/g, 
        '<div class="ad2">\n            <a href="https://dieton.com/graftover">\n            <img src="images/custom/side_banner2.png" alt="비대면 견적받기"/>');
        
    // Also bust cache again to ensure it refreshes immediately!
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(path, content);
}
console.log('Fixed ad2 banner size and busted cache.');
