const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const root = path.resolve(__dirname, '..', '..');
const scanDirs = ['.', 'css', 'js', 'new', 'index.htmlnew', 'api'];
const scanExt = new Set(['.html', '.css', '.js', '.json']);
const assetRoot = path.join(root, 'images', 'remote');
const fallbackImages = [
  'images/custom/product.png',
  'images/custom/product2.png',
  'images/custom/product3.png',
  'images/custom/banner.png',
  'images/custom/avatar.png',
  'images/custom/icon.png',
];

const allowedAssetHosts = new Set([
  'image.dieton.com',
  'image.dieton.com',
  'images.unsplash.com',
  'img.youtube.com',
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.chrome-local' || entry.name === '.chrome-origin' || entry.name === '.chrome-test') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (scanExt.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function normalizeUrl(raw) {
  return raw
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/[\\'")>,;]+$/g, '');
}

function sourceUrl(raw) {
  const normalized = normalizeUrl(raw);
  try {
    const url = new URL(normalized);
    if (url.hostname === 'image.dieton.com') url.hostname = 'image.dieton.com';
    return url;
  } catch {
    return null;
  }
}

function localPathFor(url) {
  const cleanPath = decodeURIComponent(url.pathname)
    .replace(/^\/+/, '')
    .replace(/[<>:"|?*]/g, '_');
  const parsedExt = path.extname(cleanPath);
  const ext = parsedExt || (url.hostname === 'images.unsplash.com' ? '.jpg' : '.asset');
  const base = path.join(assetRoot, url.hostname, cleanPath || `index${ext}`);
  return parsedExt ? base : `${base}${ext}`;
}

function toPosixRelative(fromFile, targetFile) {
  return path.relative(path.dirname(fromFile), targetFile).replace(/\\/g, '/');
}

function download(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error(`Too many redirects: ${url.href}`));
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const client = url.protocol === 'http:' ? http : https;
    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 DietOn asset localizer' } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        const next = new URL(response.headers.location, url);
        download(next, dest, redirectCount + 1).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}: ${url.href}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Timeout: ${url.href}`));
    });
  });
}

async function main() {
  const files = scanDirs.flatMap((dir) => walk(path.join(root, dir)));
  const urlPattern = /https?:\\?\/\\?\/[^\s"'<>)]*/g;
  const matches = new Map();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(urlPattern)) {
      const raw = match[0];
      const url = sourceUrl(raw);
      if (!url || !allowedAssetHosts.has(new URL(normalizeUrl(raw)).hostname)) continue;
      const key = normalizeUrl(raw);
      if (!matches.has(key)) matches.set(key, { raw: key, url, files: new Set() });
      matches.get(key).files.add(file);
    }
  }

  const failures = [];
  for (const item of matches.values()) {
    const dest = localPathFor(item.url);
    if (!fs.existsSync(dest)) {
      try {
        await download(item.url, dest);
      } catch (error) {
        failures.push({ raw: item.raw, source: item.url.href, error: error.message });
      }
    }
  }

  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;
    let fallbackIndex = 0;
    for (const item of matches.values()) {
      const dest = localPathFor(item.url);
      const replacement = fs.existsSync(dest)
        ? toPosixRelative(file, dest)
        : toPosixRelative(file, path.join(root, fallbackImages[fallbackIndex++ % fallbackImages.length]));
      const escapedRaw = item.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedJson = item.raw.replace(/\//g, '\\/');
      const escapedJsonPattern = escapedJson.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(escapedRaw, 'g'), replacement);
      text = text.replace(new RegExp(escapedJsonPattern, 'g'), replacement.replace(/\//g, '\\/'));
      changed = true;
    }
    if (changed) fs.writeFileSync(file, text, 'utf8');
  }

  const report = {
    localized: matches.size,
    failures,
  };
  fs.writeFileSync(path.join(root, 'scripts', 'build', 'remote_asset_report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Localized remote image.dieton/dieton assets: ${matches.size}`);
  console.log(`Download failures replaced with local fallbacks: ${failures.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
