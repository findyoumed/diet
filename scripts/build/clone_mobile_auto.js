const fs = require('fs');

const inFile = 'd:\\work\\다이어트\\daedamo_mobile_raw.html';
const outFile = 'd:\\work\\다이어트\\index_mobile.html';

if (!fs.existsSync(inFile)) {
    console.error('daedamo_mobile_raw.html not found!');
    process.exit(1);
}

let content = fs.readFileSync(inFile, 'utf8');

// 1. Basic Text Replacements
content = content.replace(/대다모/g, '다이어트온');
content = content.replace(/탈모/g, '다이어트');
content = content.replace(/모발이식/g, '비만클리닉');
content = content.replace(/daedamo\.com/g, 'localhost:8080'); // Optional, but usually we just replace the text
content = content.replace(/정수리/g, '복부비만');
content = content.replace(/헤어라인/g, '바디프로필');
content = content.replace(/가발/g, '다이어트보조제');

// 2. Logo Replacements
content = content.replace(/https:\/\/image\.daedamo\.com\/images\/logo\/logo_daedamo_i_black_ko\.png/g, 'images/custom/logo.svg');
content = content.replace(/https:\/\/image\.daedamo\.com\/images\/logo\/daedamo_now_mobile_ko\.svg/g, 'images/custom/dieton_now.svg'); // Just a fake generated one

// 3. Common Image Replacements (matching our previous changes)
content = content.replace(/https:\/\/image\.daedamo\.com\/images\/staticBanner\/etc\/talmo_help_icon_ko_2026\.svg/g, 'images/custom/dieton_help_icon.svg');
content = content.replace(/https:\/\/image\.daedamo\.com\/images\/staticBanner\/ad_search_pop_banner_mo_ko\.jpg/g, 'images/custom/right_small_banner.svg');

// 4. Any `img` tag with `.jpg` or `.png` inside .index_woman_list, etc., we can replace with our avatars.
let avatarIdx = 1;
content = content.replace(/src="[^"]*\.jpg"/g, (match) => {
    // If it's a banner, we can use banner. Otherwise avatar.
    if(match.includes('banner')) return 'src="images/custom/wide_banner.png"';
    return `src="images/custom/avatar_uniq_${(avatarIdx++ % 100) + 1}.svg"`;
});

content = content.replace(/src="[^"]*\.png"/g, (match) => {
    if(match.includes('logo')) return match; // Keep logos if already replaced
    if(match.includes('icon')) return match; // Keep icons
    return `src="images/custom/avatar_uniq_${(avatarIdx++ % 100) + 1}.svg"`;
});

// Write to index_mobile.html
fs.writeFileSync(outFile, content);
console.log('Successfully created index_mobile.html');
