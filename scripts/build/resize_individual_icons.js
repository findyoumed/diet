const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace width: 30px and height: 30px with width: 60px and height: 60px
    content = content.replace(/width: 30px !important; height: 30px !important;/g, 'width: 50px !important; height: 50px !important;');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed icon sizes to 50x50.');
