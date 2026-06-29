const fs = require('fs');
const path = require('path');

const DEBUG_URL = 'http://127.0.0.1:9222';
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:8085';
const pages = [
  { name: 'pc-index', path: '/index.html', width: 1440, height: 1100, mobile: false, expectedFinalPath: '/index.html' },
  { name: 'pc-community', path: '/community.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-search', path: '/search.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-post', path: '/post.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-write', path: '/write.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-my', path: '/my.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-record', path: '/record.html', width: 1440, height: 1100, mobile: false },
  { name: 'mobile-index', path: '/index_mobile.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-community', path: '/community.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-search', path: '/search.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-post', path: '/post.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-write', path: '/write.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-my', path: '/my.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-record', path: '/record.html', width: 390, height: 844, mobile: true },
  { name: 'mobile-index-redirect', path: '/index.html', width: 390, height: 844, mobile: true, expectedFinalPath: '/index_mobile.html', skipScreenshot: true },
  { name: 'mobile-index-pc-exception', path: '/index.html?view=pc', width: 390, height: 844, mobile: true, expectedFinalPath: '/index.html', skipScreenshot: true },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTarget(url) {
  const response = await fetch(`${DEBUG_URL}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Could not create target: ${response.status}`);
  return response.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener('message', (event) => {
    let raw = event.data;
    if (raw instanceof ArrayBuffer) raw = Buffer.from(raw).toString('utf8');
    else if (ArrayBuffer.isView(raw)) raw = Buffer.from(raw.buffer).toString('utf8');
    const message = JSON.parse(String(raw));
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result || {});
      return;
    }
    if (message.method && listeners.has(message.method)) {
      for (const listener of listeners.get(message.method)) listener(message.params || {});
    }
  });

  return {
    ready: new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    }),
    send(method, params = {}) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }, 15000);
        pending.set(id, { resolve, reject, timer });
      });
    },
    on(method, listener) {
      if (!listeners.has(method)) listeners.set(method, []);
      listeners.get(method).push(listener);
    },
    close() {
      ws.close();
    },
  };
}

async function inspectPage(page) {
  const separator = page.path.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${page.path}${separator}qa=${Date.now()}`;
  const target = await createTarget(url);
  const cdp = connect(target.webSocketDebuggerUrl);
  const consoleErrors = [];
  const requestFailures = [];
  const failedResponses = [];
  const originalDomainRequests = [];

  await cdp.ready;
  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Runtime exception');
  });
  cdp.on('Log.entryAdded', (params) => {
    if (params.entry?.level === 'error' && !/^Failed to load resource:/i.test(params.entry.text || '')) {
      consoleErrors.push(params.entry.text);
    }
  });
  cdp.on('Network.loadingFailed', (params) => {
    requestFailures.push(params.errorText || params.blockedReason || params.requestId);
  });
  cdp.on('Network.requestWillBeSent', (params) => {
    const requestUrl = params.request?.url || '';
    try {
      const host = new URL(requestUrl).hostname.toLowerCase();
      if (host === 'dieton.kr' || host.endsWith('.dieton.kr') || host === 'dieton.com' || host === 'image.dieton.com') {
        originalDomainRequests.push(requestUrl);
      }
    } catch (error) {
      // Ignore non-URL devtools events.
    }
  });
  cdp.on('Network.responseReceived', (params) => {
    const status = params.response?.status || 0;
    const responseUrl = params.response?.url || '';
    if (status >= 400 && responseUrl.startsWith(BASE_URL)) {
      failedResponses.push({ status, url: responseUrl.replace(BASE_URL, '') });
    }
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: page.width,
    height: page.height,
    deviceScaleFactor: page.mobile ? 2 : 1,
    mobile: page.mobile,
  });
  if (page.mobile) await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cdp.send('Page.navigate', { url });
  await delay(300);
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
(function () {
  try {
    var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
    posts = posts.filter(function (post) { return !String(post.title || '').startsWith('CRUD QA'); });
    localStorage.setItem('diet_on_posts', JSON.stringify(posts));
    if (location.pathname.indexOf('community.html') >= 0 && window.app) {
      window.supabaseClient = null;
      window.app.renderCommunity();
    }
  } catch (error) {}
  return true;
})()
`,
  });
  await delay(4500);

  const result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
(function () {
  function isExternalAsset(value) {
    if (!/^(https?:)?\\/\\//.test(value)) return false;
    try {
      return new URL(value, location.href).origin !== location.origin;
    } catch (error) {
      return false;
    }
  }
  var brokenImages = Array.from(document.images).filter(function (img) {
    return img.currentSrc && (!img.complete || img.naturalWidth === 0);
  }).map(function (img) {
    return { src: img.getAttribute('src') || img.currentSrc, alt: img.alt || '', cls: String(img.className || '') };
  });
  var externalImages = Array.from(document.images).map(function (img) {
    return img.getAttribute('src') || img.currentSrc || '';
  }).filter(function (src) {
    return isExternalAsset(src);
  });
  var bgExternalImages = Array.from(document.querySelectorAll('*')).map(function (el) {
    return getComputedStyle(el).backgroundImage || '';
  }).filter(function (value) {
    return isExternalAsset(value.replace(/^url\\(["']?/, '').replace(/["']?\\)$/, ''));
  });
  var bodyText = document.body ? document.body.innerText : '';
  var hasDietonBrand = /DietOn|\\uB2E4\\uC774\\uC5B4\\uD2B8\\uC628|\\uB2E4\\uC774\\uC5B4\\uD2B8/.test(bodyText);
  var originalTermPattern = /(dieton|\\uB300\\uB2E4\\uBAA8|\\uD0C8\\uBAA8|\\uBAA8\\uBC1C\\uC774\\uC2DD|\\uBAA8\\uBC1C|\\uB450\\uD53C|\\uAC00\\uBC1C|\\uC99D\\uBAA8)/gi;
  var originalTermMatches = [];
  var match;
  while ((match = originalTermPattern.exec(bodyText)) && originalTermMatches.length < 20) {
    originalTermMatches.push(bodyText.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30));
  }
  var attributeOriginalTermMatches = [];
  Array.from(document.querySelectorAll('[alt], [title], [placeholder], [aria-label], meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"]')).forEach(function (el) {
    ['alt', 'title', 'placeholder', 'aria-label', 'content'].forEach(function (attr) {
      var value = el.getAttribute(attr);
      if (!value) return;
      originalTermPattern.lastIndex = 0;
      if (originalTermPattern.test(value) && attributeOriginalTermMatches.length < 20) {
        attributeOriginalTermMatches.push({ tag: el.tagName.toLowerCase(), attr: attr, value: value.slice(0, 160) });
      }
    });
  });
  return {
    title: document.title,
    finalPath: location.pathname,
    finalSearch: location.search,
    imageCount: document.images.length,
    brokenImages: brokenImages.slice(0, 20),
    externalImages: externalImages.slice(0, 20),
    bgExternalImages: bgExternalImages.slice(0, 20),
    hasDietonBrand: hasDietonBrand,
    hasOriginalTerms: originalTermMatches.length > 0,
    originalTermMatches: originalTermMatches,
    hasAttributeOriginalTerms: attributeOriginalTermMatches.length > 0,
    attributeOriginalTermMatches: attributeOriginalTermMatches,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    layoutOverflowX: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    textLength: bodyText.length
  };
})()
`, 
  });

  const screenshotDir = path.join(process.cwd(), 'archive', 'misc');
  fs.mkdirSync(screenshotDir, { recursive: true });
  if (!page.skipScreenshot) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDir, `${page.name}_qa.png`), Buffer.from(screenshot.data, 'base64'));
  }

  let mobileMenu = null;
  if (page.name === 'mobile-index') {
    const menuResult = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `
(async function () {
  var button = document.querySelector('#mw_toggle_button, .all-menu');
  if (!button) return { checked: true, hasButton: false, opens: false, closes: false, linkCount: 0 };
  button.click();
  await new Promise(function (resolve) { setTimeout(resolve, 350); });
  var panel = document.querySelector('.dieton-mobile-side');
  var opens = document.body.classList.contains('dieton-menu-open') && !!panel;
  var linkCount = panel ? panel.querySelectorAll('a').length : 0;
  var groupCount = panel ? panel.querySelectorAll('.dieton-side-group, .group').length : 0;
  var subCount = panel ? panel.querySelectorAll('.dieton-side-sub, .board').length : 0;
  var close = document.querySelector('#mw_side_close, .dieton-mobile-backdrop');
  if (close) close.click();
  await new Promise(function (resolve) { setTimeout(resolve, 200); });
  var closes = !document.body.classList.contains('dieton-menu-open');
  return { checked: true, hasButton: true, opens: opens, closes: closes, linkCount: linkCount, groupCount: groupCount, subCount: subCount };
})()
`,
    });
    mobileMenu = menuResult.result.value;
  }

  let submenu = null;
  const submenuResult = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
(async function () {
  var pcAllMenu = null;
  var allMenuButton = document.querySelector('#btnHeaderAllMenu');
  var allMenuPopup = document.querySelector('#headerAllMenuPopup');
  if (allMenuButton && allMenuPopup) {
    allMenuButton.click();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    pcAllMenu = {
      hasButton: true,
      visible: getComputedStyle(allMenuPopup).display !== 'none',
      topItems: allMenuPopup.querySelectorAll(':scope > .all-menu-content > ul > li').length,
      subItems: allMenuPopup.querySelectorAll('.sub li').length
    };
    document.querySelector('#btnCloseAllMenu')?.click();
  }

  var sidebar = document.querySelector('.sidebar_nav');
  var pcSidebar = null;
  if (sidebar) {
    pcSidebar = {
      groups: sidebar.querySelectorAll('.nav_main').length,
      subPanels: sidebar.querySelectorAll('.nav_sub').length,
      subLinks: sidebar.querySelectorAll('.nav_sub a').length,
      selected: sidebar.querySelectorAll('.nav_sub .selected, .nav_sub .sub_list.selected').length
    };
  }

  var mobileQuickMenu = null;
  var quickButton = document.querySelector('.btnOpenQuickMenu');
  var quickPopup = document.querySelector('#navQuickMenuPopup');
  if (quickButton && quickPopup) {
    quickButton.click();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    mobileQuickMenu = {
      hasButton: true,
      open: quickPopup.classList.contains('is-open') || quickPopup.classList.contains('open') || getComputedStyle(quickPopup).display !== 'none',
      links: quickPopup.querySelectorAll('a.menu, a').length
    };
    document.querySelector('.btnCloseQuickMenu')?.click();
  }

  return { pcAllMenu: pcAllMenu, pcSidebar: pcSidebar, mobileQuickMenu: mobileQuickMenu };
})()
`,
  });
  submenu = submenuResult.result.value || {};

  let searchPopup = null;
  if (!page.mobile) {
    const searchPopupResult = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `
(async function () {
  var wrap = document.querySelector('#search_popup_wrap');
  var searchContents = document.querySelector('#search_popup_wrap > .search_popup > .search_contents');
  if (!wrap || !searchContents) return null;
  var previousDisplay = wrap.style.display;
  wrap.style.display = 'block';
  await new Promise(function (resolve) { setTimeout(resolve, 120); });
  function rect(selector) {
    var el = document.querySelector(selector);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
  }
  var data = {
    visible: getComputedStyle(wrap).display !== 'none',
    searchContents: rect('#search_popup_wrap > .search_popup > .search_contents'),
    form: rect('#search_popup_wrap .form_search form'),
    contents: rect('#search_popup_wrap .search_contents > .contents'),
    sectionNow: rect('#search_popup_wrap .section_now'),
    todayPick: rect('#search_popup_wrap .today_pick'),
    popularList: rect('#search_popup_wrap .popular_list'),
    ad: rect('#search_popup_wrap .search_contents > .ad'),
    adImage: document.querySelector('#search_popup_wrap .search_contents > .ad img')?.getAttribute('src') || '',
    popularCount: document.querySelectorAll('#search_popup_wrap .popular_list li').length,
    logoAlt: document.querySelector('#search_popup_wrap .section_now img')?.getAttribute('alt') || ''
  };
  wrap.style.display = previousDisplay;
  return data;
})()
`,
    });
    searchPopup = searchPopupResult.result.value;
  }

  cdp.close();
  const finalPath = result.result.value.finalPath;
  return {
    page: page.name,
    path: page.path,
    expectedFinalPath: page.expectedFinalPath || null,
    routeOk: page.expectedFinalPath ? finalPath === page.expectedFinalPath : true,
    mobileMenu,
    submenu,
    searchPopup,
    consoleErrors: [...new Set(consoleErrors)].slice(0, 20),
    requestFailures: [...new Set(requestFailures)].slice(0, 20),
    failedResponses: failedResponses.slice(0, 20),
    originalDomainRequests: [...new Set(originalDomainRequests)].slice(0, 20),
    ...result.result.value,
  };
}

async function main() {
  const report = [];
  for (const page of pages) report.push(await inspectPage(page));
  const out = path.join(process.cwd(), 'scripts', 'build', 'clone_qa_report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  const summary = report.map((item) => ({
    page: item.page,
    brokenImages: item.brokenImages.length,
    externalImages: item.externalImages.length + item.bgExternalImages.length,
    local4xx: item.failedResponses.length,
    consoleErrors: item.consoleErrors.length,
    layoutOverflowX: item.layoutOverflowX || 0,
    originalDomainRequests: item.originalDomainRequests.length,
    hasOriginalTerms: item.hasOriginalTerms,
    hasAttributeOriginalTerms: item.hasAttributeOriginalTerms,
    routeOk: item.routeOk,
    mobileMenuOk: item.mobileMenu ? (item.mobileMenu.hasButton && item.mobileMenu.opens && item.mobileMenu.closes && item.mobileMenu.linkCount > 0 && item.mobileMenu.groupCount > 0 && item.mobileMenu.subCount > 0) : true,
    pcAllMenuOk: item.submenu?.pcAllMenu ? (item.submenu.pcAllMenu.hasButton && item.submenu.pcAllMenu.visible && item.submenu.pcAllMenu.topItems >= 9 && item.submenu.pcAllMenu.subItems >= 60) : true,
    pcSidebarOk: item.submenu?.pcSidebar ? (item.submenu.pcSidebar.groups >= 10 && item.submenu.pcSidebar.subPanels >= 10 && item.submenu.pcSidebar.subLinks >= 60) : true,
    mobileQuickMenuOk: item.submenu?.mobileQuickMenu ? (item.submenu.mobileQuickMenu.hasButton && item.submenu.mobileQuickMenu.open && item.submenu.mobileQuickMenu.links >= 10) : true,
    searchPopupOk: item.searchPopup ? (
      item.searchPopup.visible &&
      item.searchPopup.searchContents?.width >= 1000 &&
      item.searchPopup.contents?.width >= 600 &&
      item.searchPopup.form?.width >= 600 &&
      item.searchPopup.ad?.width >= 240 &&
      item.searchPopup.ad?.height >= 300 &&
      item.searchPopup.adImage.endsWith('diet_search_ad.png') &&
      item.searchPopup.popularCount >= 10 &&
      /DietOn NOW/i.test(item.searchPopup.logoAlt)
    ) : true,
  }));
  console.table(summary);
  const failed = summary.filter((item) => (
    item.brokenImages > 0 ||
    item.externalImages > 0 ||
    item.local4xx > 0 ||
    item.consoleErrors > 0 ||
    item.layoutOverflowX > 4 ||
    item.originalDomainRequests > 0 ||
    item.hasOriginalTerms ||
    item.hasAttributeOriginalTerms ||
    !item.routeOk ||
    !item.mobileMenuOk ||
    !item.pcAllMenuOk ||
    !item.pcSidebarOk ||
    !item.mobileQuickMenuOk ||
    !item.searchPopupOk
  ));
  if (failed.length) {
    throw new Error(`Clone QA failed: ${failed.map((item) => item.page).join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
