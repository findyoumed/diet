const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the image inside .content_ad
    // <div class="content_ad">\s*<a[^>]*>\s*<img src="images/custom/banner.png"
    content = content.replace(/(<div class="content_ad">[\s\S]*?<img src=")[^"]*("[^>]*>)/g, '$1images/custom/side_banner_tall.png$2');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed content_ad image to side_banner_tall.png and busted cache.');
