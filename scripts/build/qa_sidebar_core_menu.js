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

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject, timer } = pending.get(message.id);
    clearTimeout(timer);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result || {});
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
        const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 10000);
        pending.set(id, { resolve, reject, timer });
      });
    },
    close() {
      ws.close();
    }
  };
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime exception');
  return result.result.value;
}

async function main() {
  const target = await createTarget(`${BASE_URL}/community.html`);
  const client = connect(target.webSocketDebuggerUrl);
  await client.ready;
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  await client.send('Page.navigate', { url: `${BASE_URL}/community.html` });
  await delay(2500);

  const result = await evaluate(client, `new Promise((resolve) => {
    const mapGroup = (group) => ({
      title: group.querySelector('.nav_main .subject')?.textContent.trim(),
      items: Array.from(group.querySelectorAll('.nav_sub a')).map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href')
      }))
    });
    const mapHeaderGroup = (group) => ({
      title: group.querySelector(':scope > a')?.textContent.trim(),
      href: group.querySelector(':scope > a')?.getAttribute('href'),
      items: Array.from(group.querySelectorAll('.sub a')).map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href')
      }))
    });
    const groups = Array.from(document.querySelectorAll('#mw5 .sidebar .sidebar_nav > div')).map(mapGroup);
    const headerGroups = Array.from(document.querySelectorAll('#gnbNavbar > .inner > ul > li')).map(mapHeaderGroup);
    const allMenuGroups = Array.from(document.querySelectorAll('#headerAllMenuPopup .all-menu-content > ul > li')).map(mapHeaderGroup);
    const first = document.querySelector('#mw5 .sidebar .sidebar_nav .nav1 .nav_main .i_arrow_bottom_black_20');
    first.click();
    setTimeout(() => {
      const sub = document.querySelector('#mw5 .sidebar .sidebar_nav .nav1 .nav_sub');
      resolve({
        groupCount: groups.length,
        groups,
        headerGroupCount: headerGroups.length,
        headerGroups,
        allMenuGroupCount: allMenuGroups.length,
        allMenuGroups,
        firstClickDisplay: getComputedStyle(sub).display,
        firstClickHeight: sub.getBoundingClientRect().height,
        consoleErrorCount: 0
      });
    }, 350);
  })`);

  console.log(JSON.stringify(result, null, 2));
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
