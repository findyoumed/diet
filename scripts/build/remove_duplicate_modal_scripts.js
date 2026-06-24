const fs = require('fs');

const files = ['community.html', 'post.html', 'record.html', 'write.html'];
const modalScript = '<script src="/new/js/modal/modal.js"></script>';

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  let seen = false;
  const next = html.replace(new RegExp(modalScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), () => {
    if (seen) return '';
    seen = true;
    return modalScript;
  });
  if (next !== html) fs.writeFileSync(file, next, 'utf8');
}

console.log('Duplicate modal scripts removed.');
