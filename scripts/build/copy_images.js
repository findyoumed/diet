const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\new01\\.gemini\\antigravity\\brain\\c328b493-fc0a-45cb-ab34-4bc657ad4d73';
const destDir = 'd:\\work\\다이어트\\images\\custom';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(path.join(srcDir, 'diet_banner_1_1782205255723.png'), path.join(destDir, 'banner.png'));
fs.copyFileSync(path.join(srcDir, 'diet_avatar_1_1782205265570.png'), path.join(destDir, 'avatar.png'));
fs.copyFileSync(path.join(srcDir, 'diet_product_1_1782205277045.png'), path.join(destDir, 'product.png'));

console.log('Images copied successfully.');
