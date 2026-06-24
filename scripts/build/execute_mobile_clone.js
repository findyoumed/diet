const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const inFile = path.join(rootDir, 'archive/raw_html/daedamo_mobile_raw.html');
const outFile = path.join(rootDir, 'index_mobile.html');

if (!fs.existsSync(inFile)) {
  console.error(`Missing source file: ${inFile}`);
  process.exit(1);
}

let content = fs.readFileSync(inFile, 'utf8');

if (!/^<!DOCTYPE html/i.test(content)) {
  content = `<!DOCTYPE html>\n${content}`;
}

function replaceTextPairs(source, pairs) {
  return pairs.reduce((html, [from, to]) => html.split(from).join(to), source);
}

function stripSourceSiteNoise(html) {
  return html
    .replace(/<script[^>]*src=["']https:\/\/www\.googletagmanager\.com[^>]*>\s*<\/script>/gi, '')
    .replace(/<script[^>]*src=["'](?:https?:)?\/\/cdn\.taboola\.com[^>]*>\s*<\/script>/gi, '')
    .replace(/<script[^>]*src=["']https:\/\/ssl\.pstatic\.net[^>]*>\s*<\/script>/gi, '')
    .replace(/<script[^>]*src=["']?(?:https?:)?\/\/wcs\.naver\.net\/wcslog\.js["']?[^>]*>\s*<\/script>/gi, '')
    .replace(/<script[^>]*kakao\.min\.js[^>]*>\s*<\/script>/gi, '')
    .replace(/<script>\s*Kakao\.init[^<]*<\/script>/gi, '')
    .replace(/<!-- Google Tag Manager[^]*?End Google Tag Manager -->/gi, '')
    .replace(/<!-- Taboola Pixel Code[^]*?End of Taboola Pixel Code -->/gi, '')
    .replace(/<noscript>\s*<iframe[^>]*googletagmanager[^]*?<\/iframe>\s*<\/noscript>/gi, '')
    .replace(/<script type=["']text\/javascript["']>\s*if\s*\(!?wcs_add\)[^]*?wcs_do\([^]*?<\/script>/gi, '')
    .replace(/<script type=["']application\/ld\+json["'][^>]*>[^]*?<\/script>\s*/gi, '')
    .replace(/<meta name=["']fb:appId["'][^>]*>\s*/gi, '')
    .replace(/<meta property=["']al:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<div id=["']preact-border-shadow-host["'][^]*?<\/div>/gi, '')
    .replace(/<div class=["']glasp-extension-toaster["'][^]*?<\/div>/gi, '')
    .replace(/<div class=["']glasp-extension["'][^]*?<\/div><\/div>/gi, '')
    .replace(/<a id=["']bottomBar["'][^]*?<\/a>/gi, '')
    .replace(/<style id=["']antigravity-scroll-lock-style["'][^]*?<\/style>/gi, '')
    .replace(/<style>\s*body::-webkit-scrollbar[^]*?html::-webkit-scrollbar[^]*?<\/style>/gi, '')
    .replace(/\s*antigravity-scroll-lock/g, '');
}

function normalizeHeadAndAssets(html) {
  return html
    .replace(/https:\/\/daedamo\.com\/new\/data\/seo\/sns_image_2025_ko\.png/gi, 'images/custom/wide_banner.png')
    .replace(/https:\/\/daedamo\.com\/new\/data\/seo\/favicon\.ico/gi, 'favicon.ico')
    .replace(/https:\/\/daedamo\.com\/\?device=mobile/gi, 'index_mobile.html')
    .replace(/<link rel=["']alternate["'][^>]*>\s*/gi, '')
    .replace(/href=["']https:\/\/daedamo\.com\/new\/theme\/miwit\/mobile\/style\.css\?[^"']*["']/gi, 'href="_origin_style_mobile.css"')
    .replace(/href=["']https:\/\/daedamo\.com\/new\/theme\/miwit\/mobile\/main\.css\?[^"']*["']/gi, 'href="_origin_main_mobile.css"')
    .replace(/href=["']https:\/\/daedamo\.com\/new\/css\/mainSlideBanner\/jwDucray\.css\?[^"']*["']/gi, 'href="_origin_ducray.css"')
    .replace(/href=["']https:\/\/daedamo\.com\/new\/css\/banner\/banner_daedamo_pick\.inc\.css\?[^"']*["']/gi, 'href="_origin_pick.css"')
    .replace(/href=["']https:\/\/daedamo\.com\/new\/js\/toast\/jquery-toast\.css["']/gi, 'href="_origin_style_mobile.css"')
    .replace(/var g5_url\s*=\s*["']https:\/\/daedamo\.com\/new["'];/g, 'var g5_url            = ".";')
    .replace(/var g5_bbs_url\s*=\s*["']https:\/\/daedamo\.com\/new\/bbs["'];/g, 'var g5_bbs_url        = ".";')
    .replace(/var g5_cookie_domain\s*=\s*["']daedamo\.com["'];/g, 'var g5_cookie_domain  = "";')
    // [LOG: 20260624_1550] Convert remaining absolute paths to relative paths to fix 404 proxy issues.
    .replace(/https:\/\/daedamo\.com\/new\//gi, '/new/')
    .replace(/https:\/\/daedamo\.com\/new/gi, '/new')
    .replace(/\.\/new\//gi, '/new/');
}

function localHrefFromDaedamo(rawPath) {
  let pathname = '/';
  try {
    pathname = new URL(`https://daedamo.com${rawPath}`).pathname;
  } catch {
    pathname = rawPath.split('?')[0];
  }

  if (pathname.includes('/new/bbs/login')) return 'my.html';
  if (pathname.includes('/search')) return 'search.html';
  if (pathname.includes('/write')) return 'write.html';
  if (pathname.includes('/notice') || pathname.includes('/story') || pathname.includes('/forum') || pathname.includes('/freestory')) return 'community.html';
  if (pathname.includes('/photo2') || pathname.includes('/woman') || pathname.includes('/talmo_care')) return 'community.html';
  if (pathname.includes('/new/hospitalmap')) return 'index_mobile.html#dieton-planet';
  if (pathname === '/' || pathname === '') return 'index_mobile.html';
  return 'index_mobile.html';
}

function normalizeLinks(html) {
  return html
    .replace(/<a\b([^>]*?)href=["']https:\/\/daedamo\.com([^"']*)["']/gi, (match, beforeHref, rawPath) => {
      return `<a${beforeHref}href="${localHrefFromDaedamo(rawPath)}"`;
    })
    .replace(/href=["']https:\/\/www\.ddmdandy\.com\/?["']/gi, 'href="#"')
    .replace(/href=["']https:\/\/mkt\.shopping\.naver\.com\/[^"']*["']/gi, 'href="index_mobile.html"')
    .replace(/href=["']https:\/\/youtu\.be\/[^"']*["']/gi, 'href="index_mobile.html"')
    .replace(/href=["']https:\/\/blog\.naver\.com\/daedamo_official["']/gi, 'href="#"')
    .replace(/href=["']https:\/\/cafe\.naver\.com\/daedamo["']/gi, 'href="#"')
    .replace(/href=["']https:\/\/www\.youtube\.com\/@(?:Daedamo|DietOn)TV["']/gi, 'href="#"')
    .replace(/mailto:daedamohelp@gmail\.com/gi, 'mailto:help@dieton.kr')
    .replace(/daedamohelp@gmail\.com/gi, 'help@dieton.kr')
    .replace(/Daedamo Corp\. All rights reserved\./g, 'DietOn Corp. All rights reserved.');
}

function addCacheBusting(html, version) {
  const assetPattern = /\.(?:css|js|png|jpe?g|gif|svg|webp|ico)$/i;

  function isLocalAsset(url) {
    if (/^(?:https?:)?\/\//i.test(url)) return false;
    if (/^(?:data|mailto|tel):/i.test(url)) return false;
    return assetPattern.test(url.split('?')[0].split('#')[0]);
  }

  html = html.replace(/\b(src|href)=["']([^"']+)["']/gi, (match, attr, url) => {
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (!isLocalAsset(url)) return match;
    return `${attr}="${cleanUrl}?v=${version}"`;
  });

  return html.replace(/url\((['"]?)([^'")]+)\1\)/gi, (match, quote, url) => {
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (!isLocalAsset(url)) return match;
    return `url(${quote}${cleanUrl}?v=${version}${quote})`;
  });
}

const textPairs = [
  ['대다모', '다이어트온'],
  ['DAEDAMO', 'DIETON'],
  ['Daedamo', 'DietOn'],
  ['탈모치료', '다이어트 관리'],
  ['탈모', '다이어트'],
  ['모발이식', '비만클리닉'],
  ['모발 이식', '비만클리닉'],
  ['모발', '체형'],
  ['정수리', '복부비만'],
  ['헤어라인', '바디라인'],
  ['두피문신', '바디프로필'],
  ['두피', '식단'],
  ['가발', '다이어트보조제'],
  ['샴푸', '보조제'],
  ['미녹시딜', '식단관리'],
  ['프로페시아', '운동처방'],
  ['아보다트', '영양관리'],
  ['발모제', '다이어트약'],
  ['득모', '감량'],
  ['대머리', '비만'],
  ['M자', '복부'],
  ['m자', '복부'],
];

let productIndex = 1;
let contentImageIndex = 1;

function getReplacement(url) {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }

  if (/logo/i.test(decoded)) {
    return /white/i.test(decoded) ? 'images/custom/logo_footer.svg' : 'images/custom/logo.svg';
  }

  if (/i_search|search_now/i.test(decoded)) return 'images/custom/icon_search.svg';
  if (/i_go_icon|i_go_hairbnb|i_nav22/i.test(decoded)) return 'images/custom/icon_body.svg';
  if (/i_balloon_help|talmo_help_icon/i.test(decoded)) return 'images/custom/dieton_help_icon.svg';
  if (/i_daedamo_pick_balloon/i.test(decoded)) return 'images/custom/dieton_pick_balloon.svg';
  if (/i_ytb/i.test(decoded)) return 'images/custom/icon_video.svg';
  if (/beta_icon/i.test(decoded)) return 'images/custom/icon_quote.svg';
  if (/favicon|arrow|prev|next|close|bottom|up_|down_/i.test(decoded)) return url;

  if (/banner|Banner|ad_|content_map_banner|mainSlide/i.test(decoded)) {
    if (/jwDucray|bg_2026_mobile/i.test(decoded)) return 'images/custom/banner_ducray.png';
    if (/content_map_banner/i.test(decoded)) return 'images/custom/content_map_banner.svg';
    if (/mainSlide/i.test(decoded)) return 'images/custom/middle_banner.png';
    return 'images/custom/wide_banner.png';
  }

  if (/\/ingre\/|\/column\/|\/graft_failcase\/|product/i.test(decoded)) {
    const n = (productIndex++ % 6) + 1;
    return `images/custom/product${n === 1 ? '' : n}.png`;
  }

  if (/\/file\/|resize|youtube\.com|hqdefault|yt3\.ggpht\.com|hospitalphoto|photo2|woman|story|talmo_care/i.test(decoded)) {
    return `images/custom/product_bguniq_${(contentImageIndex++ % 106) + 201}.svg`;
  }

  return `images/custom/avatar_uniq_${(contentImageIndex++ % 100) + 1}.svg`;
}

function normalizeImages(html) {
  let out = html.replace(/src=["']([^"']+)["']/gi, (match, url) => {
    if (!/daedamo\.com|youtube\.com|yt3\.ggpht\.com/i.test(url)) return match;
    if (/\.(js|css)(\?|$)/i.test(url)) return match;
    const replacement = getReplacement(url);
    return replacement === url ? match : `src="${replacement}"`;
  });

  out = out.replace(/background(?:-image)?:\s*url\((['"]?)([^'")]+)\1\)/gi, (match, quote, url) => {
    if (!/daedamo\.com|youtube\.com|yt3\.ggpht\.com/i.test(url)) return match;
    const replacement = getReplacement(url);
    return replacement === url ? match : `background: url('${replacement}')`;
  });

  return out
    .replace(/https:\/\/image\.daedamo\.com\/images\/img\/renew\/icon\/i_daedamo_pick_balloon\.svg/gi, 'images/custom/dieton_pick_balloon.svg')
    .replace(/https:\/\/image\.daedamo\.com\/images\/staticBanner\/etc\/talmo_help_icon_ko_2026\.svg/gi, 'images/custom/dieton_help_icon.svg');
}

const safeRuntime = `
<script>
(function () {
  if (!window.jQuery) {
    function Api(nodes) { this.nodes = nodes || []; }
    Api.prototype.size = function () { return this.nodes.length; };
    Api.prototype.each = function (callback) {
      this.nodes.forEach(function (node, index) { callback.call(node, index, node); });
      return this;
    };
    Api.prototype.on = function (eventName, handler) {
      return this.each(function () { this.addEventListener(eventName, handler); });
    };
    Api.prototype.click = function (handler) {
      if (handler) return this.on('click', handler);
      return this.each(function () { this.click(); });
    };
    Api.prototype.ready = function (handler) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handler);
      else handler();
      return this;
    };
    Api.prototype.css = function (prop, value) {
      return this.each(function () {
        if (typeof prop === 'string') this.style[prop] = value;
        else Object.assign(this.style, prop || {});
      });
    };
    Api.prototype.show = function () { return this.css('display', ''); };
    Api.prototype.hide = function () { return this.css('display', 'none'); };
    Api.prototype.addClass = function (name) { return this.each(function () { this.classList.add(name); }); };
    Api.prototype.removeClass = function (name) { return this.each(function () { this.classList.remove(name); }); };
    Api.prototype.toggleClass = function (name) { return this.each(function () { this.classList.toggle(name); }); };
    Api.prototype.niceSelect = function () { return this; };
    Api.prototype.lazyload = function () { return this; };
    Api.prototype.attr = function (name) { return this.nodes[0] ? (this.nodes[0].getAttribute(name) || '') : ''; };
    Api.prototype.find = function (selector) {
      return new Api(this.nodes.flatMap(function (node) { return Array.from(node.querySelectorAll(selector)); }));
    };
    Api.prototype.eq = function (index) { return new Api(this.nodes[index] ? [this.nodes[index]] : []); };
    function $(selector) {
      if (typeof selector === 'function') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', selector);
        else selector();
        return new Api([]);
      }
      if (typeof selector === 'string') return new Api(Array.from(document.querySelectorAll(selector)));
      if (selector === document || selector === window) return new Api([selector]);
      return new Api(selector ? [selector] : []);
    }
    $.fn = Api.prototype;
    $.fn.toast = function () { return this; };
    $.i18n = function () { return { load: function () { return Promise.resolve(); } }; };
    window.$ = window.jQuery = $;
  } else if (!window.jQuery.i18n) {
    window.jQuery.i18n = function () { return { load: function () { return Promise.resolve(); } }; };
  }
  if (window.jQuery && !window.jQuery.fn.toast) {
    window.jQuery.fn.toast = function () { return this; };
  }
  window.set_cookie = window.set_cookie || function () {};
  window.Swiper = window.Swiper || function () { return { on: function () {}, update: function () {} }; };
})();
</script>
`;

const mobileRuntime = `
<script>
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function ensureBackdrop() {
    var backdrop = document.getElementById('dietonMenuBackdrop');
    if (backdrop) return backdrop;
    backdrop = document.createElement('button');
    backdrop.id = 'dietonMenuBackdrop';
    backdrop.className = 'dieton-mobile-backdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close menu');
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function buildMenuPanel() {
    var panel = document.getElementById('mw_side');
    var created = false;
    if (!panel) {
      created = true;
      panel = document.createElement('aside');
      panel.id = 'mw_side';
      panel.className = 'notranslate dieton-mobile-side';
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML =
        '<div class="dieton-side-head">' +
          '<strong>DietOn</strong>' +
          '<button type="button" id="mw_side_close" aria-label="Close menu"></button>' +
        '</div>' +
        '<div class="dieton-side-actions">' +
          '<a href="search.html">Search</a>' +
          '<a href="my.html">Login</a>' +
          '<a href="write.html">Write</a>' +
        '</div>' +
        '<nav class="dieton-side-menu" aria-label="Menu"></nav>';
      document.body.appendChild(panel);
    }

    if (created || !panel.querySelector('.dieton-side-menu a')) {
      var menu = panel.querySelector('.dieton-side-menu') || panel;
      var sourceLinks = queryAll('#navQuickMenuPopup a.menu, #mainNavMenuWrap a.menu');
      var seen = new Set();
      sourceLinks.forEach(function (link) {
        var text = (link.textContent || '').replace(/\\s+/g, ' ').trim();
        if (!text || seen.has(text)) return;
        seen.add(text);
        var clone = link.cloneNode(true);
        clone.classList.add('dieton-side-link');
        menu.appendChild(clone);
      });
    }

    return panel;
  }

  function setPanelOpen(panel, open) {
    var toggle = document.getElementById('mw_toggle_button');
    var backdrop = ensureBackdrop();
    var originMask = document.getElementById('mw_modal_mask');
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.style.right = open ? '0px' : '-100vw';
    panel.style.transform = open ? 'translateX(0)' : 'translateX(100%)';
    document.body.classList.toggle('dieton-menu-open', open);
    backdrop.classList.toggle('is-open', open);
    if (originMask) {
      originMask.style.display = 'none';
      originMask.style.opacity = '0';
      originMask.style.pointerEvents = 'none';
    }
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function bindAllMenu() {
    var toggle = document.getElementById('mw_toggle_button');
    if (!toggle) return;
    var panel = buildMenuPanel();
    var backdrop = ensureBackdrop();
    var closeButton = panel.querySelector('#mw_side_close');

    toggle.setAttribute('aria-controls', 'mw_side');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      setPanelOpen(panel, !panel.classList.contains('is-open'));
    });
    if (closeButton) closeButton.addEventListener('click', function () { setPanelOpen(panel, false); });
    backdrop.addEventListener('click', function () { setPanelOpen(panel, false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setPanelOpen(panel, false);
    });

    queryAll('#mw_side .group').forEach(function (group) {
      group.addEventListener('click', function () {
        var board = group.nextElementSibling;
        if (board) board.classList.toggle('is-open');
      });
    });
  }

  function bindQuickMenu() {
    var popup = document.getElementById('navQuickMenuPopup');
    if (!popup) return;
    var openButtons = queryAll('.btnOpenQuickMenu');
    var closeButtons = queryAll('.btnCloseQuickMenu');

    function setOpen(open) {
      popup.classList.toggle('is-open', open);
      popup.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('dieton-quick-open', open);
    }

    popup.setAttribute('aria-hidden', 'true');
    openButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        setOpen(true);
      });
    });
    closeButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        setOpen(false);
      });
    });
  }

  function hasRealSwiper() {
    return typeof window.Swiper === 'function' && !/return \\{ on: function/.test(String(window.Swiper));
  }

  function initSwiper(selector, options) {
    if (!hasRealSwiper()) return;
    queryAll(selector).forEach(function (element) {
      if (element.swiper) {
        if (typeof element.swiper.update === 'function') element.swiper.update();
        return;
      }
      try {
        new window.Swiper(element, options);
      } catch (error) {
        element.classList.add('swiper-fallback');
      }
    });
  }

  function enableFallbackTicker() {
    queryAll('.headerNowListSwiper').forEach(function (container) {
      var wrapper = container.querySelector('.swiper-wrapper');
      var slides = queryAll('.swiper-slide', wrapper);
      if (!wrapper || slides.length < 2) return;
      var index = 0;
      container.classList.add('dieton-ticker-ready');
      setInterval(function () {
        index = (index + 1) % slides.length;
        wrapper.style.transform = 'translate3d(0,' + (-38 * index) + 'px,0)';
      }, 2200);
    });
  }

  function initSliders() {
    initSwiper('.headerNowListSwiper', {
      direction: 'vertical',
      slidesPerView: 1,
      loop: true,
      autoplay: { delay: 2200, disableOnInteraction: false },
      height: 38
    });
    initSwiper('.quickMenuSwiper', {
      slidesPerView: 'auto',
      slidesOffsetBefore: 3,
      slidesOffsetAfter: 32,
      freeMode: true
    });
    initSwiper('.daedamoPickBannerSwiper', {
      slidesPerView: 1,
      spaceBetween: 5,
      navigation: { nextEl: '.daedamo-pick-next', prevEl: '.daedamo-pick-prev' }
    });
    initSwiper('.swiper-container, .swiper-container2, .swiper-container3, .swiper-container_female, .index_popular_list_swipe, .index_column_slide', {
      slidesPerView: 'auto',
      freeMode: true,
      autoHeight: true,
      spaceBetween: 8
    });
    if (!hasRealSwiper()) enableFallbackTicker();
  }

  ready(function () {
    bindAllMenu();
    bindQuickMenu();
    initSliders();
    setTimeout(initSliders, 600);
  });
})();
</script>
`;

const customCSS = `
<style>
:root {
  --dieton-primary: #13a37b;
  --dieton-accent: #ff7eb3;
  --dieton-ink: #1c2430;
}

body.mobile {
  background: #f6faf8 !important;
  color: var(--dieton-ink) !important;
  overflow-x: hidden !important;
}

html,
body,
#mw_mobile,
#mw_mobile_tail {
  max-width: 100% !important;
  overflow-x: hidden !important;
}

img[src*="wide_banner"], img[src*="middle_banner"] {
  width: 100% !important;
  height: 100px !important;
  object-fit: cover !important;
}

.new_top_banner,
.new_top_banner .flex_origin,
.new_top_banner .btn_banner_link {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  overflow: hidden !important;
}

#topBanner {
  display: block !important;
  position: relative !important;
  height: 48px !important;
}

#topBanner .flex_origin,
#topBanner .btn_banner_link {
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
}

.new_top_banner .top_banner_close {
  display: none !important;
}

.new_top_banner img[src*="wide_banner"] {
  display: block !important;
  width: 100vw !important;
  max-width: none !important;
  height: 48px !important;
  margin: 0 !important;
  object-fit: cover !important;
  object-position: center center !important;
}

.graftover-notice-banner,
.graftover-notice-banner .banner-inner-wrap,
.graftover-notice-banner .right,
.graftover-notice-banner .banner-inner {
  max-width: 100vw !important;
  overflow: hidden !important;
}

.graftover-notice-banner .banner-inner-wrap {
  min-width: 0 !important;
}

.graftover-notice-banner .right {
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.graftover-notice-banner .banner-inner {
  display: block !important;
  width: 100% !important;
}

.graftover-notice-banner .banner-inner p {
  display: inline-block !important;
  width: max-content !important;
  max-width: none !important;
}

.thumb, .thumb_box, .thumb_box2 {
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  aspect-ratio: 16 / 9 !important;
  max-height: 200px !important;
  width: 100% !important;
}

.daedamopick-img {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1 / 1 !important;
  object-fit: contain !important;
  border-radius: 8px !important;
  max-height: 180px !important;
  background-color: #f8f9fa !important;
}

.drpic {
  width: 80px !important;
  height: 80px !important;
  object-fit: cover !important;
  border-radius: 50% !important;
}

.monallisa_content {
  background-size: 100% 100% !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}

img[src*="avatar_uniq"] {
  max-width: 40px !important;
  max-height: 40px !important;
  object-fit: contain !important;
}

.hos_name img, .nick img, .column_nickname img {
  width: 20px !important;
  height: 20px !important;
  object-fit: cover !important;
  border-radius: 50% !important;
}

.index_content_box .index_content_leftbox .i_go_icon img {
  object-fit: contain;
  width: 20px !important;
  height: 20px !important;
}

.swiper-slide {
  height: auto !important;
}

.swiper-wrapper {
  display: flex;
  box-sizing: content-box;
  transition-property: transform;
}

.swiper-slide {
  flex-shrink: 0;
}

.headerNowListSwiper,
.headerNowListSwiper .swiper-slide {
  height: 38px !important;
  overflow: hidden;
}

.headerNowListSwiper .swiper-wrapper {
  display: block;
  transition: transform 0.35s ease;
}

.swiper-container,
.swiper-container2,
.swiper-container3,
.quickMenuSwiper,
.daedamoPickBannerSwiper,
.index_popular_list_swipe,
.index_column_slide {
  overflow: hidden;
}

.menu_list_wrap,
.menu_list_wrap .menu_list_container {
  max-width: 100vw !important;
  overflow: hidden !important;
}

.menu_list_wrap .menu_list_container {
  min-width: 0 !important;
}

.menu_list_wrap .quickMenuSwiper {
  min-width: 0 !important;
  max-width: calc(100vw - 72px) !important;
}

.dieton-mobile-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 9998;
  border: 0;
  background: rgba(16, 24, 32, 0.45);
}

.dieton-mobile-backdrop.is-open {
  display: block;
}

#mw_modal_mask {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

body.dieton-menu-open,
body.dieton-quick-open {
  overflow: hidden !important;
}

#mw_side {
  top: 0 !important;
  right: -100vw;
  height: 100vh !important;
  transform: translateX(100%);
  transition: transform 0.28s ease, right 0.28s ease;
}

#mw_side.is-open {
  right: 0 !important;
  transform: translateX(0) !important;
}

.dieton-side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 18px;
  border-bottom: 1px solid #edf1f4;
  color: #18212b;
}

#mw_side_close {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  position: relative;
}

#mw_side_close::before,
#mw_side_close::after {
  content: "";
  position: absolute;
  top: 17px;
  left: 8px;
  width: 20px;
  height: 2px;
  background: #18212b;
}

#mw_side_close::before { transform: rotate(45deg); }
#mw_side_close::after { transform: rotate(-45deg); }

.dieton-side-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #edf1f4;
}

.dieton-side-actions a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid #d9e2e8;
  border-radius: 6px;
  color: #18212b !important;
  font-size: 13px;
  text-decoration: none !important;
}

.dieton-side-menu {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 6px;
  padding: 18px 14px 32px;
}

.dieton-side-menu .menu {
  min-width: 0;
  text-align: center;
  color: #18212b !important;
  text-decoration: none !important;
}

.dieton-side-menu .icon {
  display: flex;
  justify-content: center;
  min-height: 42px;
}

#mw_side .board {
  display: none;
}

#mw_side .board.is-open {
  display: block;
}

#navQuickMenuPopup {
  display: none !important;
}

#navQuickMenuPopup.is-open {
  display: block !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 10000 !important;
  overflow-y: auto !important;
  background: #fff !important;
  padding: 18px 12px 64px !important;
}

#navQuickMenuPopup .btnCloseQuickMenu {
  position: fixed !important;
  right: 14px !important;
  bottom: 14px !important;
  z-index: 10001 !important;
}

.index_nav_menu .i_main_nav1,
.index_nav_menu .i_main_nav2,
.index_nav_menu .i_main_nav3,
.index_nav_menu .i_main_nav4,
.index_nav_menu .i_main_nav5,
.index_nav_menu .i_main_nav6,
.index_nav_menu .i_main_nav7,
.index_nav_menu .i_main_nav22,
.index_nav_menu .i_board_care,
.index_nav_menu .i_board_dr_novid,
.index_nav_menu .i_main_ai {
  width: 38px !important;
  height: 38px !important;
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-size: contain !important;
}

.index_nav_menu .i_main_nav1 { background-image: url('images/custom/icon_quote.svg') !important; }
.index_nav_menu .i_board_dr_novid { background-image: url('images/custom/icon_treatment.svg') !important; }
.index_nav_menu .i_main_nav2 { background-image: url('images/custom/cat_graft.svg') !important; }
.index_nav_menu .i_main_nav3 { background-image: url('images/custom/cat_woman.svg') !important; }
.index_nav_menu .i_main_nav4 { background-image: url('images/custom/icon_medicine.svg') !important; }
.index_nav_menu .i_main_nav5 { background-image: url('images/custom/cat_shampoo.svg') !important; }
.index_nav_menu .i_main_nav6 { background-image: url('images/custom/cat_story.svg') !important; }
.index_nav_menu .i_main_nav7 { background-image: url('images/custom/icon_doctor.svg') !important; }
.index_nav_menu .i_board_care { background-image: url('images/custom/cat_care.svg') !important; }
.index_nav_menu .i_main_nav22 { background-image: url('images/custom/cat_job.svg') !important; }
.index_nav_menu .i_main_ai { background-image: url('images/custom/icon_body.svg') !important; }

.header-search-box-wrap .img-wrap img,
.us_submit img {
  width: 22px !important;
  height: 22px !important;
  object-fit: contain !important;
}

.index_daedamo_tv .toggle_ytb,
.index_daedamo_tv .toggle_ytb.on {
  background: url('images/custom/icon_video.svg') no-repeat center center / contain !important;
}
</style>
`;

content = stripSourceSiteNoise(content);
content = normalizeHeadAndAssets(content);
content = replaceTextPairs(content, textPairs);
content = normalizeImages(content);
content = normalizeLinks(content);

content = content.replace(/(<script>\s*\/\*\s*i18n:)/, `${safeRuntime}\n$1`);
if (!content.includes('window.set_cookie = window.set_cookie')) {
  content = content.replace('</head>', `${safeRuntime}\n</head>`);
}

content = content.replace('</body>', `${mobileRuntime}\n${customCSS}\n</body>`);
content = addCacheBusting(content, Date.now());

fs.writeFileSync(outFile, content);
console.log(`Mobile clone updated: ${path.relative(rootDir, outFile)}`);
