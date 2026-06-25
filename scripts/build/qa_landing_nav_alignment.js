const DEBUG_URL = process.env.DEBUG_URL || 'http://127.0.0.1:9222';
const BASE_URL = 'http://127.0.0.1:8080';

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
    const pendingCall = pending.get(message.id);
    clearTimeout(pendingCall.timer);
    pending.delete(message.id);
    if (message.error) pendingCall.reject(new Error(message.error.message));
    else pendingCall.resolve(message.result || {});
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
  const target = await createTarget(`${BASE_URL}/index.html?view=pc`);
  const client = connect(target.webSocketDebuggerUrl);
  await client.ready;
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  await client.send('Page.navigate', { url: `${BASE_URL}/index.html?view=pc` });
  await delay(2500);

  const result = await evaluate(client, `(() => {
    const header = Array.from(document.querySelectorAll('#gnbNavbar > .inner > ul > li > a')).map((a) => a.textContent.trim());
    const landing = Array.from(document.querySelectorAll('#mw5 .index_category_box .nav_title')).map((el) => el.textContent.trim());
    return {
      href: location.href,
      headerCount: header.length,
      landingCount: landing.length,
      header,
      landing,
      aligned: JSON.stringify(header) === JSON.stringify(landing)
    };
  })()`);

  console.log(JSON.stringify(result, null, 2));
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
