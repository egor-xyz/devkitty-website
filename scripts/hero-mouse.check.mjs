// Run with the dev server up: node scripts/hero-mouse.check.mjs [url] [shotDir]
// The printer sometimes prints a mouse; it runs, the cat pounces, carries it up and drops it on the desk.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/hero-mouse';
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
let fail = 0;
const ok = (c, m) => {
  if (!c) fail++;
  console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
};

async function open(mode, at, { width = 1440, height = 900, reducedMotion = 'no-preference' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion });
  await ctx.addInitScript((m) => sessionStorage.setItem('devkitty-mode', m), mode);
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(at));
  const errs = [];
  // the GitHub releases API rate limit (403) and a StrictMode double-mount AudioContext close are not part of this check
  const noise = (t) => /status of 403|AudioContext is closed/.test(t);
  page.on('console', (m) => m.type() === 'error' && !noise(m.text()) && errs.push(m.text()));
  page.on('pageerror', (e) => !noise(String(e)) && errs.push(String(e)));
  await page.goto(URL);
  await page.waitForTimeout(17500); // intro
  return { ctx, page, errs };
}
const NIGHT = '2026-11-08T23:00:00';
const DAY = '2026-11-08T12:00:00';
const stage = (page) => page.locator('[data-hero-stage]');
const shot = (page, name) => stage(page).screenshot({ path: `${DIR}/${name}.png` });
const BTN = '[data-h="printer"]';
const CYCLE = ['cat', 'dino', 'duck', 'mug', 'robot'];
const MOUSE_ROWS = 6;
const rows = (page) => page.locator('[data-h="la"] .printer .row.on').count();
const printing = (page) => page.locator('[data-h="la"] .printer.printing').count();
const model = (page) => page.getAttribute('[data-h="la"] .printer', 'data-model');
const has = (page, sel) => page.locator(`[data-h="la"] ${sel}`).count();
const hook = (page, detail) =>
  page.evaluate((d) => dispatchEvent(new CustomEvent('devkitty:mouse-test', { detail: d })), detail);
const clickCat = (page) =>
  page.evaluate(() =>
    document.querySelector('[data-h="la"] [data-i="cat"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  );
const until = async (fn, ms) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 60));
  }
  return false;
};
const rect = (page, sel) =>
  page.evaluate((s) => {
    const r = document.querySelector(`[data-h="la"] ${s}`).getBoundingClientRect();
    return { bottom: r.bottom, left: r.left, right: r.right, top: r.top };
  }, sel);
const overlap = (a, b, pad = 0) =>
  a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
const catAnims = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.cat .wmove')].reduce((n, m) => n + m.getAnimations().length, 0)
  );

// the mouse's box in scene units (viewBox 1200x760) of the lit layer
const sceneBox = (page, sel) =>
  page.evaluate((q) => {
    const svg = document.querySelector('[data-h="la"] svg') ?? document.querySelector('[data-h="la"]');
    const s = svg.getBoundingClientRect();
    const r = document.querySelector(`[data-h="la"] ${q}`).getBoundingClientRect();
    const k = 1200 / s.width;
    return { bottom: (r.bottom - s.top) * k, left: (r.left - s.left) * k, right: (r.right - s.left) * k, top: (r.top - s.top) * k };
  }, sel);

// One full hunt: print, run, pounce, carry up, drop on the desk. Screenshots are prefixed with `tag`.
async function hunt(page, tag) {
  const label = `${tag} hunt`;
  await hook(page, { odds: 1 });
  await page.click(BTN);
  await page.waitForTimeout(400);
  ok((await model(page)) === 'mouse', `${label}: the printer prints a mouse`);
  ok((await has(page, '.cat.awake')) === 1 && (await printing(page)) === 1, `${label}: the cat wakes and the print runs`);
  ok(await until(async () => (await printing(page)) === 0, 4000), `${label}: print finished`);
  ok((await rows(page)) === MOUSE_ROWS, `${label}: the mouse has ${MOUSE_ROWS} rows`);
  ok(
    await until(async () => (await has(page, '.printer .dino.alive')) === 1 && (await has(page, '.cat.walking')) === 1, 3000),
    `${label}: the mouse comes alive and the cat stands up`
  );
  await until(async () => (await has(page, '.cat.crouch')) === 1, 1000);
  await page.waitForTimeout(1000);
  await shot(page, `${tag}-mouse-run`);
  // the tail swishes in place: its pixels stay within a few px of the body (scene units)
  const tail = await page.evaluate(async () => {
    const svg = document.querySelector('[data-h="la"] svg');
    const k = 1200 / svg.getBoundingClientRect().width;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < 12; i++) {
      const body = document.querySelector('[data-h="la"] .printer .dino .row:not(:has(.mtail)) rect').getBoundingClientRect();
      for (const t of document.querySelectorAll('[data-h="la"] .printer .dino .mtail')) {
        const x = (t.getBoundingClientRect().left - body.left) * k; // same sample: the mouse itself is running
        min = Math.min(min, x);
        max = Math.max(max, x);
      }
      await new Promise((r) => setTimeout(r, 40));
    }
    return { max, min };
  });
  console.log(`tail x relative to a body pixel, scene units: ${tail.min.toFixed(1)}..${tail.max.toFixed(1)}`);
  ok(tail.max - tail.min < 12, `${label}: the tail swishes in place (spread ${(tail.max - tail.min).toFixed(1)})`);
  // clicks during the hunt change nothing
  await clickCat(page);
  await page.click(BTN, { force: true });
  let busyUse = 0;
  let pounce = null;
  let carried = false;
  let shotPounce = false;
  let sawCaught = false;
  const done = await until(async () => {
    if ((await has(page, '.cat.go')) + (await has(page, '.cat.typing')) > 0) busyUse++;
    if (!shotPounce && (await has(page, '.cat.pounce')) === 1) {
      shotPounce = true;
      pounce = { cat: await rect(page, '.cat .wmove'), catScene: await sceneBox(page, '.cat .wmove'), dino: await rect(page, '.printer .dino') };
      await shot(page, `${tag}-pounce`);
    }
    if ((await has(page, '.printer .dino.caught')) === 1) sawCaught = true;
    if (shotPounce && !carried && (await has(page, '.cat.air')) === 1) {
      carried = true;
      await page.waitForTimeout(200);
      await shot(page, `${tag}-carry`);
    }
    return shotPounce && (await has(page, '.cat.walking')) === 0;
  }, 14000);
  ok(busyUse === 0, `${label}: clicking the cat during the hunt does not start a takeover`);
  ok((await model(page)) === 'mouse' && (await printing(page)) === 0, `${label}: clicking the printer during the hunt prints nothing`);
  ok(shotPounce && pounce !== null, `${label}: the cat pounces`);
  if (pounce) {
    ok(pounce.catScene.right < 580, `${label}: the cat stays left of the chair back, scene x 580 (cat right edge ${pounce.catScene.right.toFixed(0)})`);
    ok(overlap(pounce.cat, pounce.dino), `${label}: the cat landed on the mouse`);
  }
  ok(sawCaught && carried, `${label}: the mouse is caught and carried`);
  ok(done, `${label}: hunt over, the cat is curled up again`);
  ok((await has(page, '.cat.awake')) === 0, `${label}: cat not awake`);
  ok((await catAnims(page)) === 0, `${label}: no leftover animations on the cat`);
  ok(
    (await has(page, '.cat.crouch, .cat.air, .cat.pounce, .cat.back, .cat.go')) === 0,
    `${label}: no leftover cat classes`
  );
  ok((await has(page, '.printer .dino.alive')) === 0, `${label}: the mouse no longer twitches`);
  // the mouse lies on the desk top, between the plant and the sleeping cat, and stays there
  await page.waitForTimeout(600);
  const m1 = await sceneBox(page, '.printer .dino');
  ok(
    m1.bottom > 520 && m1.bottom < 570 && m1.left > 140 && m1.right < 235,
    `${label}: the mouse lies on the desk top (scene x ${m1.left.toFixed(0)}-${m1.right.toFixed(0)}, y ${m1.top.toFixed(0)}-${m1.bottom.toFixed(0)})`
  );
  ok((await rows(page)) === MOUSE_ROWS, `${label}: the mouse is still fully drawn`);
  // the grey layer is in the same state as the lit one
  const layer = (l) =>
    page.evaluate((l) => {
      const q = (s) => document.querySelector(`[data-h="${l}"] ${s}`);
      const r = q('.printer .dino').getBoundingClientRect();
      return { cat: q('.cat').getAttribute('class'), dino: [r.left, r.top, r.width, r.height].map((v) => Math.round(v)) };
    }, l);
  const [la, lb] = [await layer('la'), await layer('lb')];
  ok(la.cat === lb.cat && la.dino.join() === lb.dino.join(), `${label}: grey layer matches (${lb.cat} / ${lb.dino})`);
  await shot(page, `${tag}-mouse-on-desk`);
  await page.waitForTimeout(2500);
  const m2 = await sceneBox(page, '.printer .dino');
  ok(Math.abs(m2.left - m1.left) < 1 && Math.abs(m2.bottom - m1.bottom) < 1 && (await has(page, '.printer .dino.alive')) === 0, `${label}: and it stays there`);
  // the next print clears it; both guards are free again
  await hook(page, { odds: 0 });
  await page.click(BTN);
  await page.waitForTimeout(300);
  ok((await rows(page)) < MOUSE_ROWS && (await model(page)) !== 'mouse', `${label}: the next click clears the desk mouse`);
  ok(
    (await page.evaluate(() => document.querySelector('[data-h="la"] .printer .dino').getAnimations().length)) === 0,
    `${label}: no leftover animations on the mouse group`
  );
  await page.waitForTimeout(5500);
  const b = await sceneBox(page, '.printer .dino');
  ok(CYCLE.includes(await model(page)) && (await rows(page)) > 0 && b.top > 600, `${label}: the printer is free again (${await model(page)})`);
  ok((await catAnims(page)) === 0, `${label}: still no animations on the cat`);
}

// day
{
  const { ctx, page, errs } = await open('devkitty', DAY);
  await hunt(page, 'day');
  // the cat is free again: a click makes it walk to the keyboard
  await clickCat(page);
  ok(await until(async () => (await has(page, '.cat.go')) === 1, 2000), 'day: the cat can be taken over after the hunt');
  ok(errs.length === 0, 'no console errors (day) ' + errs.join('|'));
  await ctx.close();
}

// the cat is busy with the keyboard: no mouse
{
  const { ctx, page } = await open('devkitty', DAY);
  await hook(page, { odds: 1 });
  await clickCat(page);
  await page.waitForTimeout(500);
  await page.click(BTN);
  await page.waitForTimeout(300);
  ok((await model(page)) !== 'mouse', 'cat busy: prints a normal model');
  await ctx.close();
}

// reduced motion: no mouse at all
{
  const { ctx, page } = await open('devkitty', DAY, { reducedMotion: 'reduce' });
  await hook(page, { odds: 1 });
  await page.click(BTN);
  await page.waitForTimeout(150);
  ok((await model(page)) !== 'mouse' && (await rows(page)) > 0, 'reduced motion: a normal model, printed at once');
  await ctx.close();
}

// night
{
  const { ctx, page, errs } = await open('devkitty', NIGHT);
  await hunt(page, 'night');
  ok(errs.length === 0, 'no console errors (night) ' + errs.join('|'));
  await ctx.close();
}

await browser.close();
console.log(fail ? `${fail} FAILED` : 'ALL PASS');
process.exit(fail ? 1 : 0);
