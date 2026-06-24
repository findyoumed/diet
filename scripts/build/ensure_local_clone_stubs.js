const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

function ensureDir(file) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
}

function writeIfMissing(file, content) {
  const target = path.join(root, file);
  ensureDir(file);
  if (!fs.existsSync(target)) fs.writeFileSync(target, content, 'utf8');
}

function copyIfMissing(from, to) {
  const source = path.join(root, from);
  const target = path.join(root, to);
  ensureDir(to);
  if (fs.existsSync(source) && !fs.existsSync(target)) fs.copyFileSync(source, target);
}

copyIfMissing('new/js/banner/banner_daedamo_pick.inc.js', 'new/js/banner/banner_dieton_pick.inc.js');
copyIfMissing('new/css/banner/banner_daedamo_pick.inc.css', 'new/css/banner/banner_dieton_pick.inc.css');

const cssStub = '/* Local DietOn clone stub: original board module styles are not required for static clone rendering. */\n';
[
  'new/skin/board/miwit_forum/g5.css',
  'new/skin/board/miwit_forum/style.common.css',
  'new/skin/board/miwit_forum/mw.js/ui-lightness/jquery-ui-1.9.2.custom.min.css',
  'new/skin/board/miwit_forum/mw.js/mw.star.rate/jquery.mw.star.rate.css',
  'new/skin/board/miwit_forum/mw.js/syntaxhighlighter/styles/shCore.css',
  'new/skin/board/miwit_forum/mw.js/syntaxhighlighter/styles/shThemeDefault.css',
  'new/skin/board/miwit_forum/sideview.css',
  'new/css/board/list.skin.popular.inc.css',
  'new/css/board/list.skin.comment-rank.inc.css',
  'new/css/board/board_drug_caution_notice.inc.css',
  'new/css/board/board_floating_stickerBanner.css',
  'new/css/board/board_view_image_random_block.inc.css',
  'new/css/board/board_view_read_level_block.inc.css',
  'new/css/board/view.skin.recommend.inc.css',
  'new/css/board/board_view_device_notice.inc.css',
  'new/css/board/board_view_vote.inc.css',
  'new/css/board/board_comments.inc.css',
  'new/css/banner/banner_container.inc.css',
  'new/css/banner/banner_doctors_pick.inc.css',
].forEach((file) => writeIfMissing(file, cssStub));

const iconSvg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" role="img" aria-label="${label}"><circle cx="10" cy="10" r="9" fill="#2f7df6"/><text x="10" y="13" text-anchor="middle" font-size="8" font-family="Arial, sans-serif" fill="#fff">${label}</text></svg>\n`;
['4', '5', '6', '27'].forEach((id) => writeIfMissing(`new/img/icon/${id}.svg`, iconSvg(id)));

writeIfMissing(
  'new/skin/board/miwit_forum/mw.js/syntaxhighlighter/scripts/clipboard.swf',
  ''
);

console.log('Local clone stubs ensured.');
