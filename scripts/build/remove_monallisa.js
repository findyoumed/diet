const fs = require('fs');

const files = ['index.html', 'search.html', 'dieton.html', 'dieton_search.html', 'dieton_record.html'];

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // Remove the entire monallisa_content block
    const regex = /<div class="monallisa_content[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
    content = content.replace(regex, '');
    
    // Fallback if regex misses due to nesting
    // The block is relatively self contained, let's try a safer string replacement if needed
    fs.writeFileSync(path, content);
}
console.log('Removed monallisa_content ad blocks.');
