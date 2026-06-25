const fs = require('fs');
const path = require('path');
const ts = new Date().getTime();

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const icons = [
    { class: 'graft', name: 'cat_graft.svg', emoji: '💬', color1: '#ff9a9e', color2: '#fecfef' },
    { class: 'i_board_dr_novid', name: 'cat_dr.svg', emoji: '👨‍⚕️', color1: '#fccb90', color2: '#d57eeb' },
    { class: 'i_board_story', name: 'cat_story.svg', emoji: '🗣️', color1: '#e0c3fc', color2: '#8ec5fc' },
    { class: 'i_board_mobal', name: 'cat_mobal.svg', emoji: '💊', color1: '#4facfe', color2: '#00f2fe' },
    { class: 'i_board_review_pic', name: 'cat_review.svg', emoji: '📸', color1: '#43e97b', color2: '#38f9d7' },
    { class: 'i_board_woman', name: 'cat_woman.svg', emoji: '🏃‍♀️', color1: '#fa709a', color2: '#fee140' },
    { class: 'i_board_tattoo', name: 'cat_tattoo.svg', emoji: '📏', color1: '#30cfd0', color2: '#330867' },
    { class: 'i_board_care', name: 'cat_care.svg', emoji: '🏥', color1: '#a18cd1', color2: '#fbc2eb' },
    { class: 'i_board_shampoo', name: 'cat_shampoo.svg', emoji: '🥗', color1: '#ff0844', color2: '#ffb199' },
    { class: 'i_board_job', name: 'cat_job.svg', emoji: '⭐', color1: '#fddb92', color2: '#d1fdff' }
];

let cssRule = '';

for (let icon of icons) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
        <linearGradient id="bg_${icon.class}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${icon.color1}" />
            <stop offset="100%" stop-color="${icon.color2}" />
        </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#bg_${icon.class})"/>
    <text x="50" y="55" font-size="50" text-anchor="middle" dominant-baseline="middle">${icon.emoji}</text>
</svg>`.trim();
    
    fs.writeFileSync(path.join(imgDir, icon.name), svg);
    
    cssRule += `.index_category_box .icon${icon.class === 'graft' ? '.graft' : ' .' + icon.class} { background: url(images/custom/${icon.name}) no-repeat center center / contain !important; display: inline-block; width: 35px !important; height: 35px !important; }\n`;
}

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the old buggy rule that made them all the same
    content = content.replace(/\.index_category_box \.icon span, \.index_category_box \.icon\.graft \{[^\}]*\}/g, '');
    
    // Insert the new distinct rules
    if (!content.includes('cat_dr.svg')) {
        content = content.replace(/(\.thumb_box\{[^\}]*\})/, `$1\n${cssRule}`);
    } else {
        // If already inserted, replace old block
        content = content.replace(/\.index_category_box \.icon\.graft \{[^\}]*\}\n\.index_category_box \.i_board_dr_novid[^]*?\.index_category_box \.i_board_job \{[^\}]*\}/, cssRule.trim());
    }
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed category icons to 10 unique SVGs.');
