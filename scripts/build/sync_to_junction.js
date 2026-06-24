const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../new');
const destDir = path.join(__dirname, '../../index.htmlnew');

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    if (fs.lstatSync(source).isDirectory()) {
        const files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            const curTarget = path.join(target, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget);
            } else {
                fs.copyFileSync(curSource, curTarget);
            }
        });
    }
}

try {
    console.log(`Syncing directories: ${srcDir} -> ${destDir}`);
    if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
    }
    copyFolderRecursiveSync(srcDir, destDir);
    console.log('[LOG: 20260624_1629] Directory sync successfully completed.');
} catch (err) {
    console.error('Error syncing directories:', err.message);
}
