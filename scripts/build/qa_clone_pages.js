const fs = require('fs');
const path = require('path');

const DEBUG_URL = 'http://127.0.0.1:9222';
const BASE_URL = 'http://127.0.0.1:8080';
const pages = [
  { name: 'pc-index', path: '/index.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-community', path: '/community.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-search', path: '/search.html', width: 1440, height: 1100, mobile: false },
  { name: 'pc-post', path: '/post.html', width: 1440, height: 1100, mobile: false },
  { name: 'mobile-index', path: '/index_mobile.html', width: 390, height: 844, mobile: true },
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
  const url = `${BASE_URL}${page.path}?qa=${Date.now()}`;
  const target = await createTarget(url);
  const cdp = connect(target.webSocketDebuggerUrl);
  const consoleErrors = [];
  const requestFailures = [];
  const failedResponses = [];

  await cdp.ready;
  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Runtime exception');
  });
  cdp.on('Log.entryAdded', (params) => {
    if (params.entry?.level === 'error') consoleErrors.push(params.entry.text);
  });
  cdp.on('Network.loadingFailed', (params) => {
    requestFailures.push(params.errorText || params.blockedReason || params.requestId);
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
  await delay(4500);

  const result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
(function () {
  var externalImageHosts = /^(https?:)?\\/\\/(image\\.dieton\\.com|image\\.daedamo\\.com|images\\.unsplash\\.com|img\\.youtube\\.com)/;
  var brokenImages = Array.from(document.images).filter(function (img) {
    return img.currentSrc && (!img.complete || img.naturalWidth === 0);
  }).map(function (img) {
    return { src: img.getAttribute('src') || img.currentSrc, alt: img.alt || '', cls: String(img.className || '') };
  });
  var externalImages = Array.from(document.images).map(function (img) {
    return img.getAttribute('src') || img.currentSrc || '';
  }).filter(function (src) {
    return externalImageHosts.test(src);
  });
  var bgExternalImages = Array.from(document.querySelectorAll('*')).map(function (el) {
    return getComputedStyle(el).backgroundImage || '';
  }).filter(function (value) {
    return externalImageHosts.test(value.replace(/^url\\(["']?/, ''));
  });
  var bodyText = document.body ? document.body.innerText : '';
  var hasDietonBrand = /DietOn|다이어트/.test(bodyText);
  var hairTermPattern = /(탈모|모발이식|두피|가발|증모)/g;
  var hairTermMatches = [];
  var match;
  while ((match = hairTermPattern.exec(bodyText)) && hairTermMatches.length < 20) {
    hairTermMatches.push(bodyText.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30));
  }
  var hasHairTerms = hairTermMatches.length > 0;
  return {
    title: document.title,
    imageCount: document.images.length,
    brokenImages: brokenImages.slice(0, 20),
    externalImages: externalImages.slice(0, 20),
    bgExternalImages: bgExternalImages.slice(0, 20),
    hasDietonBrand: hasDietonBrand,
    hasHairTerms: hasHairTerms,
    hairTermMatches: hairTermMatches,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    textLength: bodyText.length
  };
})()
`,
  });

  const screenshotDir = path.join(process.cwd(), 'archive', 'misc');
  fs.mkdirSync(screenshotDir, { recursive: true });
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(screenshotDir, `${page.name}_qa.png`), Buffer.from(screenshot.data, 'base64'));

  cdp.close();
  return {
    page: page.name,
    path: page.path,
    consoleErrors: [...new Set(consoleErrors)].slice(0, 20),
    requestFailures: [...new Set(requestFailures)].slice(0, 20),
    failedResponses: failedResponses.slice(0, 20),
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
    hasHairTerms: item.hasHairTerms,
  }));
  console.table(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
