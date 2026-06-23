const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\gram01\\.gemini\\antigravity-ide\\brain\\d269bad8-7d4a-48f2-8013-610b9cce6dab';
const destDir = 'd:\\work\\diet\\images\\custom';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const mappings = {
    'dieton_logo_horizontal_1782209528878.png': 'logo.png',
    'dieton_banner_horizontal_1782209543979.png': 'banner.png',
    'dieton_product_square_1782209555951.png': 'product.png',
    'dieton_avatar_square_1782209570163.png': 'avatar.png',
    'dieton_icon_square_1782209581690.png': 'icon.png'
};

console.log('=== Copying generated images to images/custom/ ===');

for (let [srcName, destName] of Object.entries(mappings)) {
    const srcPath = path.join(srcDir, srcName);
    const destPath = path.join(destDir, destName);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcName} to ${destName}`);
    } else {
        console.log(`Error: Source file ${srcName} does not exist.`);
    }
}

console.log('Images copy process finished.');
