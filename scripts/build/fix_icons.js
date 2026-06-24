const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Aggressively replace the specific logo the user mentioned
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/logo\/logo_daedamo_i_black_ko\.png/gi, 'images/custom/logo.png');
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/logo\/logo_daedamo_i_white_ko\.png/gi, 'images/custom/logo.png');
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/logo_blue\.svg/gi, 'images/custom/logo.png');
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/logo_daedamo_img_text_black_ko\.png/gi, 'images/custom/logo.png');
    
    // Aggressively replace ALL i_nav SVGs
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/2023\/i_nav[a-zA-Z0-9_-]+\.svg/gi, 'images/custom/icon.png');
    
    // Replace any remaining daedamo icons that look like categories
    content = content.replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/2023\/i_[a-zA-Z0-9_-]+\.png/gi, 'images/custom/icon.png');
    
    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Fixed logos and icons aggressively.');
