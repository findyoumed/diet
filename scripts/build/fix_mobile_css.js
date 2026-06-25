const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

const newCssBlock = `
<style>
/* Responsive Mobile Fixes & Prevent text wrapping in GNB Mega Menu (PC Only) */
@media (min-width: 1025px) {
    #gnbNavbar > .inner > ul > li > a { white-space: nowrap !important; }
    #gnbNavbar .sub ul li a { white-space: nowrap !important; }
    #gnbNavbar .sub { width: auto !important; min-width: 100%; }
    #gnbNavbar .sub ul li { display: block; width: auto !important; }
}
@media (max-width: 1024px) {
    /* Prevent SVG images from breaking mobile layout width */
    img { max-width: 100% !important; height: auto !important; }
    svg { max-width: 100% !important; height: auto !important; }
}
</style>
`.trim();

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the old style block
    const oldRegex = /<style>\s*\/\* Prevent text wrapping in GNB Mega Menu \*\/(?:.|\n)*?<\/style>/;
    if (oldRegex.test(content)) {
        content = content.replace(oldRegex, newCssBlock);
    } else {
        content = content.replace('</head>', `${newCssBlock}\n</head>`);
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Applied mobile-friendly CSS fixes to HTML files.');
