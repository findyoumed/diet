const fs = require('fs');
const ts = new Date().getTime();

const files = ['index.html', 'search.html', 'daedamo_search.html', 'daedamo_record.html', 'daedamo.html', 'community.html', 'record.html', 'daedamo_story.html', 'post.html', 'write.html'];

const cssRule = `
<style>
/* Prevent text wrapping in GNB Mega Menu */
#gnbNavbar > .inner > ul > li > a {
    white-space: nowrap !important;
}
#gnbNavbar .sub ul li a {
    white-space: nowrap !important;
}
/* Ensure the sub menu containers can expand if needed */
#gnbNavbar .sub {
    width: auto !important;
    min-width: 100%;
}
#gnbNavbar .sub ul li {
    display: block;
    width: auto !important;
}
</style>
`;

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Insert before </head>
    if (!content.includes('Prevent text wrapping in GNB')) {
        content = content.replace('</head>', `${cssRule}\n</head>`);
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(path, content);
}
console.log('Injected CSS to prevent line wrapping in dropdown menu.');
