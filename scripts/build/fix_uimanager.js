const fs = require('fs');
let txt = fs.readFileSync('d:\\work\\다이어트\\js\\managers\\UIManager.js', 'utf8');

// The file has literal "\${" which breaks the UI by printing "${variable}" literally.
// It also has "\`" which breaks JS parsing in some engines when inside template literals.
txt = txt.replace(/\\\$\{/g, '${');
txt = txt.replace(/\\`/g, '`');

fs.writeFileSync('d:\\work\\다이어트\\js\\managers\\UIManager.js', txt);
console.log('UIManager fixed');
