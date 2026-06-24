const fs = require('fs');

const files = ['index.html', 'search.html', 'community.html', 'post.html', 'record.html', 'write.html'];
const ts = new Date().getTime();

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace script tags to bust cache
    content = content.replace(/src="js\/managers\/UIManager\.js[^"]*"/g, `src="js/managers/UIManager.js?v=${ts}"`);
    content = content.replace(/src="js\/app\.js[^"]*"/g, `src="js/app.js?v=${ts}"`);
                              
    fs.writeFileSync(path, content);
}
console.log('Cache busting applied to HTML files.');
