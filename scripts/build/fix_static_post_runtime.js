const fs = require('fs');
const path = require('path');

const postFile = 'post.html';
let post = fs.readFileSync(postFile, 'utf8');

const syntaxBlock = `<script>
window.SyntaxHighlighter = window.SyntaxHighlighter || { config: {}, all: function () {} };
window.AutoSourcing = window.AutoSourcing || {
  setTemplate: function () {},
  setString: function () {},
  init: function () {}
};
</script>

<link type="text/css" rel="stylesheet" href="/new/skin/board/miwit_forum/mw.js/syntaxhighlighter/styles/shCore.css"/>`;
post = post.replace(
  '<link type="text/css" rel="stylesheet" href="/new/skin/board/miwit_forum/mw.js/syntaxhighlighter/styles/shCore.css"/>',
  syntaxBlock
);

post = post.replace(/url:\s*["']\/api\/board\/recommend\.ajax\.php["']/g, 'url: "#"');
fs.writeFileSync(postFile, post, 'utf8');

const fontAwesomeFiles = [
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.css',
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.min.css',
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.css.asset',
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.min.css.asset',
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.css_',
  'images/remote/image.dieton.com/public/css/font-awesome-4.4.0/css/font-awesome.min.css_',
];

for (const file of fontAwesomeFiles) {
  if (!fs.existsSync(file)) continue;
  const css = fs.readFileSync(file, 'utf8').replace(/@font-face\s*\{[^}]*fontawesome-webfont[^}]*\}/gi, '');
  fs.writeFileSync(file, css, 'utf8');
}

console.log('Static post runtime stubs applied.');
