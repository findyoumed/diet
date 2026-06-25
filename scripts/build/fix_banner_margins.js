const fs = require('fs');
const path = require('path');

const files = ['index.html', 'community.html', 'post.html', 'record.html', 'write.html'];

console.log('=== Adjusting video_banner margin to match DietOn exactly (margin-top: 42px) ===');

for (let file of files) {
    const filePath = path.join('d:\\work\\diet', file);
    if (!fs.existsSync(filePath)) {
        console.log(`${file} not found.`);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Replace the style attribute of video_banner to include margin-top and display: block
    const targetPattern = /class="banner_gif video_banner"\s+target="_blank"\s+style="([^"]+)"/gi;
    content = content.replace(targetPattern, (match, styleContent) => {
        // Ensure we don't duplicate style properties
        let newStyle = styleContent;
        if (!newStyle.includes('margin-top')) {
            newStyle += '; margin-top: 42px; display: block;';
        }
        return `class="banner_gif video_banner" target="_blank" style="${newStyle}"`;
    });
    
    if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated banner styles in ${file}`);
    } else {
        console.log(`No matching banner found or already updated in ${file}`);
    }
}

console.log('Banner margin adjustment finished.');
