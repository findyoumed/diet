const fs = require('fs');

const originalScripts = `
<script src="https://daedamo.com/new/js/html5.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery-1.12.0/jquery.min.js"></script>
<script src="https://daedamo.com/new/js/jquery.menu.js"></script>
<script src="https://daedamo.com/new/js/jquery.modal.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.lazyload.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.nice-select.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.loadingoverlay.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/swiper.min.new.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/photoswipe.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/photoswipe-ui-default.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/underscore-min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/moment-with-locales.min.js"></script>
<script src="https://daedamo.com/new/js/common.js"></script>
<script src="https://daedamo.com/new/js/wrest.js"></script>
<script src="https://daedamo.com/new/js/common/layout.js"></script>
<script src="https://daedamo.com/new/js/common/button/usermenu.js"></script>
<script src="https://daedamo.com/new/js/common/button/share.js"></script>
<script src="https://daedamo.com/new/js/common/button/board.js"></script>
<script src="https://daedamo.com/new/js/common/form/form.js"></script>
<script src="https://daedamo.com/new/js/modal/modal.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.messagestore.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.fallbacks.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.parser.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.emitter.min.js"></script>
<script src="../../images/remote/image.daedamo.com/public/js/jquery.i18n.language.min.js"></script>
<script src="https://daedamo.com/new/js/common/banner.js"></script>
<script src="https://daedamo.com/new/js/banner/banner_graftover_notice.inc.js"></script>
<script src="https://daedamo.com/new/js/banner/banner_daedamo_pick.inc.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
`.trim();

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Replace the block of broken script tags with original
    const pattern = /(?:<script src="images\/custom\/product\.png"\s*><\/script>\s*){5,}/g;
    content = content.replace(pattern, originalScripts + '\n');

    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Fixed broken script tags.');
