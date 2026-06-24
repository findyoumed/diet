const fs = require('fs');
const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

const scriptsToInject = `
<!-- DietOn Application Scripts -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/managers/PointManager.js"></script>
<script src="js/managers/StorageManager.js"></script>
<script src="js/managers/UIManager.js"></script>
<script src="js/app.js"></script>
`;

for (let file of files) {
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');
    if (!content.includes('js/app.js')) {
        content = content.replace('</body>', scriptsToInject + '\n</body>');
        fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
        console.log('Injected scripts into ' + file);
    } else {
        console.log('Scripts already injected in ' + file);
    }
}
