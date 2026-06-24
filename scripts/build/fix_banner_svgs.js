const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/images\/custom\/banner2\.png/g, 'images/custom/banner2.svg');
    content = content.replace(/images\/custom\/banner3\.png/g, 'images/custom/banner3.svg');
    content = content.replace(/images\/custom\/side_banner\.png/g, 'images/custom/side_banner.svg');
    content = content.replace(/images\/custom\/side_banner2\.png/g, 'images/custom/side_banner2.svg');
    content = content.replace(/images\/custom\/side_banner_tall\.png/g, 'images/custom/side_banner_tall.svg');
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed banner extensions to .svg and busted cache.');
