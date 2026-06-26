const fs = require('fs');
const path = require('path');

const dirsToCreate = [
    'scripts/build',
    'archive/raw_html',
    'archive/legacy_css',
    'archive/misc',
    'docs/plans'
];

dirsToCreate.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const files = fs.readdirSync(__dirname);

files.forEach(file => {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) return;

    let dest = null;

    // 1. Scripts
    if (file.endsWith('.js') && file !== 'clean_project.js') {
        dest = 'scripts/build';
    } else if (file.endsWith('.ps1') || file.endsWith('.py') || file.endsWith('.bat') || file.endsWith('.sql')) {
        dest = 'scripts/build';
    }
    // 2. Archive raw html
    else if (file.startsWith('dieton') && file.endsWith('.html')) {
        dest = 'archive/raw_html';
    } else if (file.startsWith('_origin') && file.endsWith('.html')) {
        dest = 'archive/raw_html';
    }
    // 3. Archive legacy css
    else if (file.startsWith('_origin') && file.endsWith('.css')) {
        dest = 'archive/legacy_css';
    } else if (file.startsWith('dieton_head') && file.endsWith('.css')) {
        dest = 'archive/legacy_css';
    }
    // 4. Archive misc
    else if (['test.jpg', 'mobile_check.png', 'mobile_phase5_check.png', 'ad_dieton_animation5.mp4'].includes(file)) {
        dest = 'archive/misc';
    }
    // 5. Docs
    else if (file.endsWith('.md') && !['README.md', 'WORK_LOG.md'].includes(file)) {
        dest = 'docs/plans';
    }

    if (dest) {
        fs.renameSync(file, path.join(__dirname, dest, file));
        console.log(`Moved ${file} -> ${dest}/`);
    }
});

console.log('Project cleanup complete.');
