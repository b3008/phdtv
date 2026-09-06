// Audit pages at a narrow viewport over the Chrome DevTools protocol: horizontal overflow + full-page screenshots.
// usage: node audit.mjs <debug-port> <base-url> <width> <out-dir> <path>...
import { openSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const [port, base, widthArg, outDir, ...paths] = process.argv.slice(2);
const width = Number(widthArg);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = new URL('./chrome-profile', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function chromeUp() { try { await fetch(`http://127.0.0.1:${port}/json/version`); return true; } catch { return false; } }
// The script owns Chrome: a dead browser is relaunched before the next page, and its stderr goes to chrome.log.
async function ensureChrome() {
  if (await chromeUp()) return;
  const log = openSync(new URL('./chrome.log', import.meta.url).pathname, 'a');
  const child = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', log, log] });
  child.unref();
  for (let i = 0; i < 30 && !(await chromeUp()); i++) await sleep(500);
  if (!(await chromeUp())) throw new Error('chrome did not come up');
  await sleep(2500);
}

async function openTarget() {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  return res.json();
}
async function closeTarget(id) {
  await fetch(`http://127.0.0.1:${port}/json/close/${id}`);
}

function client(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let seq = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      for (const fn of listeners.get(msg.method)) fn(msg.params);
    }
  });
  ws.addEventListener("close", () => { for (const { reject } of pending.values()) reject(new Error("websocket closed")); pending.clear(); });
  const ready = new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  return {
    ready,
    send: (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }),
    on: (method, fn) => { if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(fn); },
    once: (method) => new Promise((resolve) => { const fn = (p) => { resolve(p); }; if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(fn); }),
    close: () => ws.close(),
  };
}

// Runs inside the page: wait for fonts and hydration, then report every element that sticks out of the viewport.
const AUDIT = `(async () => {
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 1200));
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const textOverflow = cs.display !== 'inline' && cs.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 1;
    if (r.right > vw + 0.5 || r.left < -0.5 || textOverflow) {
      offenders.push({ kind: textOverflow ? 'text' : 'box', tag: el.tagName.toLowerCase(), cls: el.className && typeof el.className === 'string' ? el.className : '', left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), text: (el.textContent || '').trim().slice(0, 40) });
    }
  }
  return JSON.stringify({ title: document.title, vw, docScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, height: document.documentElement.scrollHeight, offenders: offenders.slice(0, 25), offenderCount: offenders.length });
})()`;

const results = [];
async function auditPage(path) {
  await ensureChrome();
  const target = await openTarget();
  const c = client(target.webSocketDebuggerUrl);
  await c.ready;
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 2, mobile: true });
  const loaded = c.once('Page.loadEventFired');
  await c.send('Page.navigate', { url: base + path });
  await loaded;
  const { result } = await c.send('Runtime.evaluate', { expression: AUDIT, awaitPromise: true, returnByValue: true });
  const report = JSON.parse(result.value);
  const name = (path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home') + `-${width}`;
  const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(shot.data, 'base64'));
  c.close();
  await closeTarget(target.id);
  return { path, name, ...report };
}
for (const path of paths) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { results.push(await auditPage(path)); last = undefined; break; } catch (e) { last = e; console.error(`attempt ${attempt} failed for ${path}: ${e.message}`); await new Promise((r) => setTimeout(r, 1500)); }
  }
  if (last) throw last;
}
for (const r of results) {
  const flag = r.docScrollWidth > r.vw || r.bodyScrollWidth > r.vw || r.offenderCount > 0 ? 'OVERFLOW' : 'ok';
  console.log(`${flag}\t${r.path}\tvw=${r.vw} doc=${r.docScrollWidth} body=${r.bodyScrollWidth} h=${r.height} offenders=${r.offenderCount}\t${r.name}.png`);
  for (const o of r.offenders) console.log(`\t[${o.kind}] <${o.tag} class="${o.cls}"> left=${o.left} right=${o.right} w=${o.width} "${o.text}"`);
}
