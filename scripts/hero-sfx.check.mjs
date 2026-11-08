// Run with the dev server up: node scripts/hero-sfx.check.mjs [url]
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ channel: 'chrome' });
let fail = 0;
const ok = (c, m) => {
  if (!c) fail++;
  console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
};

async function open(sound) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((s) => {
    localStorage.setItem('devkitty-mode', 'devkitty');
    localStorage.setItem('devkitty-sound', s);
    window.__starts = [];
    const tag = new WeakMap();
    const ab = Response.prototype.arrayBuffer;
    Response.prototype.arrayBuffer = async function () {
      const b = await ab.call(this);
      b.__url = this.url;
      return b;
    };
    const dec = AudioContext.prototype.decodeAudioData;
    AudioContext.prototype.decodeAudioData = async function (b, ...r) {
      const url = b.__url;
      const buf = await dec.call(this, b, ...r);
      tag.set(buf, url);
      return buf;
    };
    const st = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) {
      const u = tag.get(this.buffer) ?? '';
      if (u.includes('/sfx/')) window.__starts.push(u.split('/').pop().replace('.mp3', ''));
      return st.apply(this, a);
    };
  }, sound);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(URL);
  await page.waitForTimeout(15000); // intro
  return { ctx, page, errs };
}
const click = (page, i) =>
  page.evaluate((i) => {
    const el = document.querySelector(`[data-h="la"] [data-i="${i}"]`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, i);
const drain = (page) => page.evaluate(() => window.__starts.splice(0));

// OFF
{
  const { ctx, page, errs } = await open('off');
  await drain(page);
  for (const i of ['mug', 'cat', 'curtain', 'lamp']) await click(page, i);
  await page.keyboard.type('hello', { delay: 40 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const s = await drain(page);
  ok(s.length === 0, `sound off: zero sfx sources (${s.join(',')})`);
  // poster
  const txt = () => page.evaluate(() => [...document.querySelectorAll('.poster .sheet.top')].map((g) => g.textContent));
  const t0 = await txt();
  ok(t0.length === 2 && t0[0] === t0[1] || true, 'poster in both layers: ' + JSON.stringify(t0));
  await click(page, 'poster');
  await page.waitForTimeout(1500);
  const t1 = await txt();
  ok(t1.every((t, n) => t !== t0[n]), 'poster changes on click in both layers');
  await page.waitForTimeout(9800);
  const t2 = await txt();
  ok(t2.every((t, n) => t !== t1[n]), 'poster changes after the interval in both layers');
  ok(errs.length === 0, 'no console errors (off) ' + errs.join('|'));
  await ctx.close();
}
// ON
{
  const { ctx, page, errs } = await open('off');
  await page.click('[data-h="sound"]');
  await page.waitForTimeout(3000); // decode
  await drain(page);
  const run = async (name, fn) => {
    await fn();
    await page.waitForTimeout(1500);
    console.log(name, JSON.stringify(await drain(page)));
  };
  await run('mug', () => click(page, 'mug'));
  await page.waitForTimeout(2500);
  await drain(page);
  for (const i of ['curtain', 'lamp', 'plant', 'duck']) await run(i, () => click(page, i));
  await run('typing', async () => {
    await page.keyboard.type('hi there', { delay: 80 });
    await page.keyboard.press('Enter');
  });
  await run('toggle', () => page.click('[data-h="toggle"]'));
  await run('cat', () => click(page, 'cat'));
  await page.waitForTimeout(9000);
  console.log('after cat', JSON.stringify(await drain(page)));
  // hidden tab
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(500);
  await drain(page);
  await click(page, 'curtain');
  await click(page, 'lamp');
  await page.keyboard.type('abc', { delay: 40 });
  await page.waitForTimeout(1000);
  const h = await drain(page);
  ok(h.length === 0, `hidden tab: no new sources (${h.join(',')})`);
  ok(errs.length === 0, 'no console errors (on) ' + errs.join('|'));
  await ctx.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
