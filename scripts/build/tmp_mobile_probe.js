const fs = require('fs');

const DEBUG_URL = 'http://127.0.0.1:9222';
const PAGE_URL = `http://127.0.0.1:8080/index_mobile.html?probe=${Date.now()}`;

async function delay(ms) {
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
    else if (typeof raw !== 'string') raw = String(raw);
    const message = JSON.parse(raw);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
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
        }, 10000);
        pending.set(id, {
          resolve(value) {
            clearTimeout(timer);
            resolve(value);
          },
          reject(error) {
            clearTimeout(timer);
            reject(error);
          },
        });
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

async function main() {
  const target = await createTarget(PAGE_URL);
  const cdp = connect(target.webSocketDebuggerUrl);
  const runtimeErrors = [];
  const consoleErrors = [];

  await cdp.ready;
  cdp.on('Runtime.exceptionThrown', (params) => {
    runtimeErrors.push(params.exceptionDetails?.text || params.exceptionDetails?.exception?.description || 'Runtime exception');
  });
  cdp.on('Log.entryAdded', (params) => {
    if (params.entry?.level === 'error') consoleErrors.push(params.entry.text);
  });
  cdp.on('Console.messageAdded', (params) => {
    if (params.message?.level === 'error') consoleErrors.push(params.message.text);
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cdp.send('Page.navigate', { url: PAGE_URL });
  await delay(3600);

  const check = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
(async function () {
  function visible(el) {
    if (!el) return false;
    var style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }
  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  var menuButton = document.getElementById('mw_toggle_button');
  var quickButton = document.querySelector('.btnOpenQuickMenu');
  var tickerWrapper = document.querySelector('.headerNowListSwiper .swiper-wrapper');
  var tickerBefore = tickerWrapper ? tickerWrapper.style.transform : '';

  if (menuButton) menuButton.click();
  await wait(250);
  var sidePanel = document.getElementById('mw_side');
  var sideOpen = !!sidePanel && sidePanel.classList.contains('is-open') && sidePanel.getAttribute('aria-hidden') === 'false';
  var sideRight = sidePanel ? getComputedStyle(sidePanel).right : null;
  var sideLinks = document.querySelectorAll('#mw_side .dieton-side-menu a, #mw_side .mw_side_menu a').length;
  var backdropOpen = !!document.querySelector('#dietonMenuBackdrop.is-open');
  var closeButton = sidePanel && sidePanel.querySelector('#mw_side_close');
  if (closeButton) closeButton.click();
  await wait(380);
  var sideClosed = !!sidePanel && !sidePanel.classList.contains('is-open');

  if (quickButton) quickButton.click();
  await wait(200);
  var quickPopup = document.getElementById('navQuickMenuPopup');
  var quickOpen = !!quickPopup && quickPopup.classList.contains('is-open') && visible(quickPopup);
  var quickLinks = quickPopup ? quickPopup.querySelectorAll('a.menu').length : 0;
  var quickClose = document.querySelector('.btnCloseQuickMenu');
  if (quickClose) quickClose.click();
  await wait(300);
  var quickClosed = !!quickPopup && !quickPopup.classList.contains('is-open');
  var finalBackdrop = document.getElementById('dietonMenuBackdrop');
  var finalSideRect = sidePanel ? sidePanel.getBoundingClientRect() : null;
  var finalSideState = sidePanel ? {
    cls: sidePanel.className,
    inline: sidePanel.getAttribute('style') || '',
    right: getComputedStyle(sidePanel).right,
    left: finalSideRect.left,
    visible: visible(sidePanel)
  } : null;
  var finalBackdropState = finalBackdrop ? {
    cls: finalBackdrop.className,
    display: getComputedStyle(finalBackdrop).display,
    visible: visible(finalBackdrop)
  } : null;
  var finalQuickState = quickPopup ? {
    cls: quickPopup.className,
    display: getComputedStyle(quickPopup).display,
    visible: visible(quickPopup)
  } : null;

  await wait(2600);
  var tickerAfter = tickerWrapper ? tickerWrapper.style.transform : '';
  var realSwiperCount = Array.from(document.querySelectorAll('.swiper, .swiper-container, .quickMenuSwiper')).filter(function (el) { return !!el.swiper; }).length;
  var wrapperCount = document.querySelectorAll('.swiper-wrapper').length;
  var cacheBustCount = Array.from(document.querySelectorAll('link[href], img[src], script[src]')).filter(function (el) {
    return /\\?v=\\d+/.test(el.getAttribute('href') || el.getAttribute('src') || '');
  }).length;
  var localUnbustedAssets = Array.from(document.querySelectorAll('link[href], img[src], script[src]')).filter(function (el) {
    var url = el.getAttribute('href') || el.getAttribute('src') || '';
    return /^(?:_|images\\/custom|favicon).*\\.(?:css|js|png|jpe?g|gif|svg|webp|ico)$/i.test(url);
  }).map(function (el) { return el.getAttribute('href') || el.getAttribute('src'); });
  var overflowSamples = Array.from(document.body.querySelectorAll('*')).map(function (el) {
    var rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      cls: String(el.className || '').slice(0, 120),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60)
    };
  }).filter(function (item) {
    return item.right > window.innerWidth + 2 || item.left < -2;
  }).slice(0, 15);
  var bannerInner = document.querySelector('.graftover-notice-banner .banner-inner');
  var bannerStyle = bannerInner ? {
    inline: bannerInner.getAttribute('style') || '',
    computedWidth: getComputedStyle(bannerInner).width,
    cssWidth: getComputedStyle(bannerInner).getPropertyValue('width'),
    cssMaxWidth: getComputedStyle(bannerInner).getPropertyValue('max-width'),
    priorityWidth: bannerInner.style.getPropertyPriority('width'),
    parentOverflow: getComputedStyle(bannerInner.parentElement).overflow
  } : null;
  var overlaySamples = Array.from(document.body.querySelectorAll('*')).map(function (el) {
    var style = getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      cls: String(el.className || '').slice(0, 120),
      position: style.position,
      display: style.display,
      opacity: style.opacity,
      background: style.backgroundColor,
      zIndex: style.zIndex,
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  }).filter(function (item) {
    return item.display !== 'none' &&
      Number(item.opacity || 1) > 0 &&
      (item.position === 'fixed' || item.position === 'absolute') &&
      item.width >= window.innerWidth * 0.8 &&
      item.height >= window.innerHeight * 0.5;
  }).slice(0, 20);

  return {
    title: document.title,
    menuButton: !!menuButton,
    sideOpen: sideOpen,
    sideRight: sideRight,
    sideLinks: sideLinks,
    backdropOpen: backdropOpen,
    sideClosed: sideClosed,
    quickButton: !!quickButton,
    quickOpen: quickOpen,
    quickLinks: quickLinks,
    quickClosed: quickClosed,
    finalSideState: finalSideState,
    finalBackdropState: finalBackdropState,
    finalQuickState: finalQuickState,
    wrapperCount: wrapperCount,
    realSwiperCount: realSwiperCount,
    tickerMoved: tickerBefore !== tickerAfter,
    tickerBefore: tickerBefore,
    tickerAfter: tickerAfter,
    cacheBustCount: cacheBustCount,
    localUnbustedAssets: localUnbustedAssets.slice(0, 10),
    overflowSamples: overflowSamples,
    overlaySamples: overlaySamples,
    bodyClass: document.body.className,
    bannerStyle: bannerStyle,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth
  };
})()
`,
  });

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync('mobile_phase5_check.png', Buffer.from(screenshot.data, 'base64'));

  cdp.close();

  console.log(JSON.stringify({
    check: check.result.value,
    runtimeErrors,
    consoleErrors: consoleErrors.slice(0, 20),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
