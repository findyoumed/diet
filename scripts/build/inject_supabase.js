const fs = require('fs');
const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];
for(let file of files) {
    let c = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');
    if(!c.includes('supabaseClient.js')) {
        c = c.replace('<script src="js/managers/PointManager.js"></script>', '<script src="js/supabaseClient.js"></script>\n<script src="js/managers/PointManager.js"></script>');
        fs.writeFileSync('d:\\work\\다이어트\\' + file, c);
        console.log('Injected supabaseClient into ' + file);
    }
}
