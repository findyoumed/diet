const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

const newCssBlock = `
<style>
/* Prevent text wrapping in GNB Mega Menu (PC Only) */
@media (min-width: 1025px) {
    #gnbNavbar > .inner > ul > li > a { white-space: nowrap !important; }
    #gnbNavbar .sub ul li a { white-space: nowrap !important; }
    #gnbNavbar .sub { width: auto !important; min-width: 100%; }
    #gnbNavbar .sub ul li { display: block; width: auto !important; }
}
/* Specifically constrain large custom banners on mobile to prevent overflow */
@media (max-width: 1024px) {
    .index_content_box img, 
    .index_content_rightbox img,
    .content_ad img,
    .middle_banner_container img,
    img[src*="wide_banner"],
    img[src*="middle_banner"],
    img[src*="banner2"] {
        max-width: 100%;
        height: auto;
    }
}
</style>
`.trim();

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the old style block
    const oldRegex = /<style>\s*\/\* Responsive Mobile Fixes[^]*?<\/style>/;
    if (oldRegex.test(content)) {
        content = content.replace(oldRegex, newCssBlock);
    } else {
        // Fallback if not found
        content = content.replace('</head>', `${newCssBlock}\n</head>`);
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Reverted dangerous global img rule and applied targeted mobile fixes.');
