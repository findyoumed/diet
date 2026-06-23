const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Inject object-fit: cover for custom images
    const cssToInject = `
    <style>
        img[src*="images/custom"] {
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
        .index_category_box .flex_spbtw li img {
            width: 50px !important;
            height: 50px !important;
        }
    </style>
</head>`;

    if (!content.includes('img[src*="images/custom"]')) {
        content = content.replace('</head>', cssToInject);
        fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
    }
}
console.log('Injected image sizing CSS.');
