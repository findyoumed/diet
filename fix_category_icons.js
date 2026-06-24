const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

const cssRule = `
.index_category_box .icon span, .index_category_box .icon.graft {
    background: url(images/custom/category_icon.png) no-repeat center center / contain !important;
    display: inline-block;
    width: 30px !important;
    height: 30px !important;
}
`;

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Remove the old i_board_job rule if it exists
    content = content.replace(/\.index_category_box \.i_board_job\{[^\}]*\}/g, '');
    
    // Insert the new comprehensive rule right after .thumb_box or #mw5 .container .main
    if (!content.includes('images/custom/category_icon.png')) {
        content = content.replace(/(\.thumb_box\{[^\}]*\})/, `$1\n${cssRule}`);
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(path, content);
}
console.log('Fixed category icons CSS and busted cache.');
