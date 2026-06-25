const DEBUG_URL = "http://127.0.0.1:9222";
const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:8080";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTarget(url) {
  const response = await fetch(`${DEBUG_URL}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create target: ${response.status}`);
  return response.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener("message", (event) => {
    let raw = event.data;
    if (raw instanceof ArrayBuffer) raw = Buffer.from(raw).toString("utf8");
    else if (ArrayBuffer.isView(raw)) raw = Buffer.from(raw.buffer).toString("utf8");
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
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
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
    }
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Runtime evaluate failed");
  }
  return result.result.value;
}

async function navigate(cdp, path) {
  await cdp.send("Page.navigate", { url: `${BASE_URL}${path}` });
  await delay(900);
}

async function clearCrudQaPosts(cdp) {
  await evaluate(cdp, `
(function () {
  var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
  posts = posts.filter(function (post) { return !String(post.title || '').startsWith('CRUD QA'); });
  localStorage.setItem('diet_on_posts', JSON.stringify(posts));
  return true;
})()
`);
}

async function main() {
  const target = await createTarget(`${BASE_URL}/community.html?crud_qa=${Date.now()}`);
  const cdp = connect(target.webSocketDebuggerUrl);
  const consoleErrors = [];
  await cdp.ready;
  cdp.on("Runtime.exceptionThrown", (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || "Runtime exception");
  });
  cdp.on("Log.entryAdded", (params) => {
    if (params.entry?.level === "error") consoleErrors.push(params.entry.text);
  });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  const stamp = Date.now();
  const title = `CRUD QA 게시글 ${stamp}`;
  const title2 = `${title} 수정`;
  const content = `CRUD QA 본문 ${stamp}`;
  const content2 = `${content} - 수정됨`;
  const comment = `CRUD QA 댓글 ${stamp}`;

  await navigate(cdp, `/write.html?crud_qa=${stamp}`);
  await clearCrudQaPosts(cdp);
  const createResult = await evaluate(cdp, `
(async function () {
  window.__DIETON_CRUD_QA_NO_REDIRECT = true;
  window.supabaseClient = null;
  window.alert = function () {};
  if (window.app && typeof window.app.renderWrite === 'function') window.app.renderWrite();
  await new Promise(function (resolve) { setTimeout(resolve, 300); });
  document.querySelector('#writeCategory').value = '다이어트수다';
  document.querySelector('#writeTitle').value = ${JSON.stringify(title)};
  document.querySelector('#writeContent').value = ${JSON.stringify(content)};
  document.querySelector('#writeSubmitBtn').click();
  await new Promise(function (resolve) { setTimeout(resolve, 1800); });
  var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
  var post = posts.find(function (item) { return item.title === ${JSON.stringify(title)}; });
  return {
    href: location.href,
    id: post && post.id,
    title: post && post.title,
    content: post && post.content,
    postCount: posts.length,
    appReady: !!window.app,
    storageReady: !!(window.app && window.app.storage),
    buttonText: document.querySelector('#writeSubmitBtn')?.textContent || '',
    bodyText: document.body.innerText.slice(0, 500)
  };
})()
`);
  if (!createResult.id) throw new Error(`Create failed: post was not stored. ${JSON.stringify({ createResult, consoleErrors })}`);

  await navigate(cdp, `/post.html?id=${encodeURIComponent(createResult.id)}&crud_qa=${stamp}`);
  await evaluate(cdp, `window.supabaseClient = null; window.app.renderPostDetail(); true`);
  await delay(500);
  const readResult = await evaluate(cdp, `
(function () {
  return {
    title: document.querySelector('#dieton-post-title')?.innerText || '',
    content: document.querySelector('#dieton-post-content')?.innerText || '',
    hasEdit: !!document.querySelector('.dieton-edit-btn'),
    hasDelete: !!document.querySelector('.dieton-delete-btn'),
    staticHidden: Array.from((document.querySelector('.wrapper .main') || document.body).children).filter(function (el) {
      return el.id !== 'dieton-post-detail-app' && getComputedStyle(el).display !== 'none';
    }).length === 0
  };
})()
`);
  if (!readResult.title.includes(title) || !readResult.content.includes(content) || !readResult.hasEdit || !readResult.hasDelete) {
    throw new Error(`Read failed: ${JSON.stringify(readResult)}`);
  }

  await navigate(cdp, `/write.html?id=${encodeURIComponent(createResult.id)}&crud_qa=${stamp}`);
  await evaluate(cdp, `window.supabaseClient = null; window.app.renderWrite(); true`);
  await delay(500);
  const updateResult = await evaluate(cdp, `
(async function () {
  window.__DIETON_CRUD_QA_NO_REDIRECT = true;
  window.supabaseClient = null;
  window.alert = function () {};
  document.querySelector('#writeTitle').value = ${JSON.stringify(title2)};
  document.querySelector('#writeContent').value = ${JSON.stringify(content2)};
  document.querySelector('#writeSubmitBtn').click();
  await new Promise(function (resolve) { setTimeout(resolve, 800); });
  var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
  var post = posts.find(function (item) { return item.id === ${JSON.stringify(createResult.id)}; });
  return { title: post && post.title, content: post && post.content };
})()
`);
  if (updateResult.title !== title2 || updateResult.content !== content2) {
    throw new Error(`Update failed: ${JSON.stringify(updateResult)}`);
  }

  await navigate(cdp, `/post.html?id=${encodeURIComponent(createResult.id)}&crud_qa=${stamp}`);
  await evaluate(cdp, `window.supabaseClient = null; window.app.renderPostDetail(); true`);
  await delay(500);
  const commentResult = await evaluate(cdp, `
(async function () {
  window.supabaseClient = null;
  window.alert = function () {};
  document.querySelector('#newCommentInput').value = ${JSON.stringify(comment)};
  document.querySelector('#dietonCommentForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(function (resolve) { setTimeout(resolve, 800); });
  var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
  var post = posts.find(function (item) { return item.id === ${JSON.stringify(createResult.id)}; });
  return {
    count: post && post.comments && post.comments.length,
    text: document.querySelector('#dieton-comments-list')?.innerText || ''
  };
})()
`);
  if (!commentResult.count || !commentResult.text.includes(comment)) {
    throw new Error(`Comment create failed: ${JSON.stringify(commentResult)}`);
  }

  const deleteResult = await evaluate(cdp, `
(async function () {
  window.__DIETON_CRUD_QA_NO_REDIRECT = true;
  window.supabaseClient = null;
  window.confirm = function () { return true; };
  window.alert = function () {};
  document.querySelector('.dieton-delete-btn').click();
  await new Promise(function (resolve) { setTimeout(resolve, 800); });
  var posts = JSON.parse(localStorage.getItem('diet_on_posts') || '[]');
  return {
    href: location.href,
    deletedId: window.__DIETON_LAST_DELETED_POST_ID || '',
    stillExists: posts.some(function (item) { return item.id === ${JSON.stringify(createResult.id)}; })
  };
})()
`);
  if (deleteResult.stillExists || deleteResult.deletedId !== createResult.id) {
    throw new Error(`Delete failed: ${JSON.stringify(deleteResult)}`);
  }

  await navigate(cdp, `/community.html?crud_qa=${stamp}`);
  await evaluate(cdp, `window.supabaseClient = null; window.app.renderCommunity(); true`);
  await delay(500);
  const listResult = await evaluate(cdp, `
(function () {
  return {
    hasDeletedTitle: document.body.innerText.includes(${JSON.stringify(title2)}),
    hasWriteLink: !!document.querySelector('.dieton-write-link')
  };
})()
`);
  if (listResult.hasDeletedTitle || !listResult.hasWriteLink) {
    throw new Error(`List after delete failed: ${JSON.stringify(listResult)}`);
  }
  await clearCrudQaPosts(cdp);

  cdp.close();
  const relevantErrors = consoleErrors.filter((text) => !/favicon|Supabase SDK is not available|Supabase .* failed/i.test(text));
  if (relevantErrors.length) throw new Error(`Console errors: ${JSON.stringify(relevantErrors.slice(0, 5))}`);

  console.log(JSON.stringify({
    create: true,
    read: true,
    update: true,
    commentCreate: true,
    delete: true,
    listAfterDelete: true
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
