const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html'];

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace the specific banner inside .index_content_leftbox
    // It currently might be <img src="images/custom/side_banner.png" alt="다이어트의사 찾기"/>
    content = content.replace(/<div class="index_content_leftbox">[\s\S]*?<a href="[^"]*" class="banner_container">\s*<img src="images\/custom\/(?:side_banner|banner[0-9]*)\.png"[^>]*>\s*<\/a>/g, 
        (match) => {
            return match.replace(/<img src="images\/custom\/(?:side_banner|banner[0-9]*)\.png"/, '<img src="images/custom/middle_banner.png"');
        }
    );
        
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(path, content);
}
console.log('Fixed leftbox middle banner size and busted cache.');
