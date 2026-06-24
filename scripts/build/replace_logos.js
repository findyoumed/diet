const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\new01\\.gemini\\antigravity\\brain\\c328b493-fc0a-45cb-ab34-4bc657ad4d73';
const destDir = 'd:\\work\\다이어트\\images\\custom';

fs.copyFileSync(path.join(srcDir, 'dieton_logo_1782205478944.png'), path.join(destDir, 'logo.png'));
fs.copyFileSync(path.join(srcDir, 'dieton_icon_1782205512863.png'), path.join(destDir, 'icon.png'));

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Replace Daedamo logos
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/logo\/logo_daedamo_i_[a-z]+_ko\.png/gi, 'images/custom/logo.png');
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/logo_blue\.svg/gi, 'images/custom/logo.png');
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/logo_daedamo_img_text_black_ko\.png/gi, 'images/custom/logo.png');

    // Replace category icons in index.html specifically and everywhere else
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/2023\/i_nav[0-9]+\.svg/gi, 'images/custom/icon.png');
    
    // Also catch some other generic icons from Daedamo that might be missing
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/2023\/i_[^"'\)]+\.png/gi, 'images/custom/icon.png');

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}

console.log('Logos and icons replaced successfully.');
