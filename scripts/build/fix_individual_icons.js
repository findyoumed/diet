const fs = require('fs');
const path = require('path');

const icons = [
    { name: 'icon_quote', emoji: '📱', class: '.index_category_box .icon.graft' },
    { name: 'icon_doctor', emoji: '👨‍⚕️', class: '.index_category_box .i_board_dr_novid' },
    { name: 'icon_talk', emoji: '💬', class: '.index_category_box .i_board_story' },
    { name: 'icon_medicine', emoji: '💉', class: '.index_category_box .i_board_mobal' },
    { name: 'icon_camera', emoji: '📸', class: '.index_category_box .i_board_review_pic' },
    { name: 'icon_postpartum', emoji: '👶', class: '.index_category_box .i_board_woman' },
    { name: 'icon_body', emoji: '👗', class: '.index_category_box .i_board_tattoo' },
    { name: 'icon_treatment', emoji: '🏥', class: '.index_category_box .i_board_care' },
    { name: 'icon_salad', emoji: '🥗', class: '.index_category_box .i_board_shampoo' },
    { name: 'icon_review', emoji: '📝', class: '.index_category_box .i_board_job' }
];

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

let cssRules = [];

for (let icon of icons) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="80" dominant-baseline="middle" text-anchor="middle" x="50">${icon.emoji}</text></svg>`;
    fs.writeFileSync(path.join(imgDir, `${icon.name}.svg`), svgContent);
    
    cssRules.push(`${icon.class} { background: url(images/custom/${icon.name}.svg) no-repeat center center / contain !important; display: inline-block; width: 30px !important; height: 30px !important; }`);
}

const files = ['index.html', 'search.html', 'dieton_search.html', 'dieton_record.html', 'dieton.html', 'community.html', 'record.html', 'dieton_story.html', 'post.html', 'write.html'];
const ts = new Date().getTime();

for (let file of files) {
    let filePath = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the old comprehensive rule
    content = content.replace(/\.index_category_box \.icon span, \.index_category_box \.icon\.graft \{[^\}]*\}/g, '');
    
    // Remove any previous individual rules if any
    for (let icon of icons) {
        let regex = new RegExp(icon.class.replace(/\./g, '\\.') + '\\s*\\{[^\\}]*\\}', 'g');
        content = content.replace(regex, '');
    }
    
    // Insert new rules
    const newStyle = cssRules.join('\n');
    content = content.replace(/(\.thumb_box\{[^\}]*\})/, `$1\n${newStyle}`);
    
    // Also bust cache
    content = content.replace(/UIManager\.js\?v=\d+/g, `UIManager.js?v=${ts}`);
    content = content.replace(/app\.js\?v=\d+/g, `app.js?v=${ts}`);

    fs.writeFileSync(filePath, content);
}
console.log('Fixed individual category icons with SVG emojis and busted cache.');
