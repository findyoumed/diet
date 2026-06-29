const DEBUG_URL = process.env.DEBUG_URL || 'http://127.0.0.1:9222';
const BASE_URL = 'http://127.0.0.1:8085';

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
  const events = [];

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    events.push(message);
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
        pending.set(id, { resolve, reject, timer });
      });
    },
    events,
    close() {
      ws.close();
    }
  };
}

async function openPage(path) {
  const target = await createTarget(`${BASE_URL}${path}`);
  const client = connect(target.webSocketDebuggerUrl);
  await client.ready;
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  await client.send('Page.navigate', { url: `${BASE_URL}${path}` });
  await delay(1500);
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime exception');
  }
  return result.result.value;
}

async function main() {
  const checks = {};
  const page = await openPage('/community.html');
  await delay(2500);
  checks.pageState = await evaluate(page, `(() => ({
    href: location.href,
    readyState: document.readyState,
    title: document.title,
    hasMw5: !!document.querySelector('#mw5'),
    hasSidebar: !!document.querySelector('#mw5 .sidebar .sidebar_nav'),
    navMainCount: document.querySelectorAll('#mw5 .sidebar .sidebar_nav .nav_main').length,
    bodyStart: document.body ? document.body.innerText.slice(0, 200) : ''
  }))()`);
  checks.sidebarBefore = await evaluate(page, `(() => {
    const main = document.querySelector('#mw5 .sidebar .sidebar_nav .nav1 .nav_main');
    const sub = main && main.nextElementSibling;
    return {
      exists: !!main,
      active: !!main?.classList.contains('active'),
      display: sub ? getComputedStyle(sub).display : null,
      height: sub ? sub.getBoundingClientRect().height : null
    };
  })()`);

  checks.sidebarAfterFirstClick = await evaluate(page, `new Promise((resolve) => {
    const main = document.querySelector('#mw5 .sidebar .sidebar_nav .nav1 .nav_main');
    const icon = main && main.querySelector('.i_arrow_bottom_black_20');
    if (!main || !icon) {
      resolve({ missing: true, hasMain: !!main, hasIcon: !!icon });
      return;
    }
    icon.click();
    setTimeout(() => {
      const sub = main.nextElementSibling;
      resolve({
        active: main.classList.contains('active'),
        display: getComputedStyle(sub).display,
        height: sub.getBoundingClientRect().height
      });
    }, 350);
  })`);

  checks.sidebarAfterSecondClick = await evaluate(page, `new Promise((resolve) => {
    const main = document.querySelector('#mw5 .sidebar .sidebar_nav .nav1 .nav_main');
    const icon = main && main.querySelector('.i_arrow_bottom_black_20');
    if (!main || !icon) {
      resolve({ missing: true, hasMain: !!main, hasIcon: !!icon });
      return;
    }
    icon.click();
    setTimeout(() => {
      const sub = main.nextElementSibling;
      resolve({
        active: main.classList.contains('active'),
        display: getComputedStyle(sub).display,
        height: sub.getBoundingClientRect().height
      });
    }, 350);
  })`);

  checks.footerLinks = await evaluate(page, `Array.from(document.querySelectorAll('.footer .info_nav a')).map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href')
  }))`);

  checks.consoleErrors = page.events
    .filter((event) => event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error')
    .map((event) => event.params.args.map((arg) => arg.value || arg.description).join(' '));
  page.close();

  checks.policyPages = {};
  for (const key of ['company', 'press', 'inquiry', 'manager-policy', 'privacy', 'terms', 'point-policy']) {
    const policy = await openPage(`/my.html?page=${key}`);
    checks.policyPages[key] = await evaluate(policy, `(() => {
      const h1 = document.querySelector('.my-content-head h1')?.textContent.trim();
      const body = document.querySelector('.my-info-page')?.textContent.trim();
      return { h1, hasBody: !!body && body.length > 80 };
    })()`);
    policy.close();
  }

  console.log(JSON.stringify(checks, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
