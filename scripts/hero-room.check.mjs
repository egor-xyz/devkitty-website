// Run with the dev server up: node scripts/hero-room.check.mjs [url] [shotDir]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/hero-room';
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
const BTN = '[data-h="light"]';
const op = (page, sel) => page.evaluate((s) => Number(getComputedStyle(document.querySelector(s)).opacity), sel);
const pressed = (page) => page.getAttribute(BTN, 'aria-pressed');
const near = (a, b, e) => Math.abs(a - b) <= e;
// mean luma of the stage screenshot, decoded on a canvas in the page
const luma = async (page) => {
  const b64 = (await stage(page).screenshot()).toString('base64');
  return page.evaluate(async (d) => {
    const img = new Image();
    img.src = `data:image/png;base64,${d}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const px = g.getImageData(0, 0, c.width, c.height).data;
    let s = 0;
    for (let i = 0; i < px.length; i += 4) s += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    return s / (px.length / 4);
  }, b64);
};

// night, Devkitty mode
{
  const { ctx, page, errs } = await open('devkitty', NIGHT);
  await page.waitForTimeout(1000);
  const o0 = await op(page, '.nightshade');
  ok(near(o0, 0.62, 0.02), `night: shade opacity ~0.62 (${o0})`);
  const L0 = await luma(page);
  await shot(page, 'night-off');
  await page.click(BTN);
  await page.waitForTimeout(900);
  const o1 = await op(page, '.nightshade');
  const g1 = await op(page, '.roomglow');
  const L1 = await luma(page);
  ok(near(o1, 0.2, 0.01), `light on: shade opacity 0.2 (${o1})`);
  ok(g1 === 1, `light on: glow opacity 1 (${g1})`);
  ok((await pressed(page)) === 'true', 'light on: aria-pressed true');
  ok((await page.locator('[data-h="la"] .lightsw.on').count()) === 1, 'light on: switch nub flipped (after-layer)');
  ok(L1 > L0 * 1.3, `light on: brighter (${L0.toFixed(1)} -> ${L1.toFixed(1)})`);
  await shot(page, 'night-on');
  await page.click(BTN);
  await page.waitForTimeout(900);
  const o2 = await op(page, '.nightshade');
  ok(near(o2, 0.62, 0.02) && (await pressed(page)) === 'false', `click again: dark again (${o2})`);
  // keyboard
  await page.focus(BTN);
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  ok((await pressed(page)) === 'true', 'keyboard Space toggles the light');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  ok((await pressed(page)) === 'false', 'keyboard Enter toggles the light');
  // button over the art
  const inside = await page.evaluate((s) => {
    const b = document.querySelector(s).getBoundingClientRect();
    const a = document.querySelector('[data-h="la"] .lightsw').getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    return x >= a.left && x <= a.right && y >= a.top && y <= a.bottom;
  }, BTN);
  ok(inside, 'button centre lies inside the drawn switch');
  ok(errs.length === 0, 'no console errors (night) ' + errs.join('|'));
  await ctx.close();
}

// day
{
  const { ctx, page } = await open('devkitty', DAY);
  const a = await op(page, '.nightshade');
  await page.click(BTN);
  await page.waitForTimeout(900);
  const b = await op(page, '.nightshade');
  ok(a === 0 && b === 0 && (await pressed(page)) === 'true', `day: no shade change, switch toggled (${a} -> ${b})`);
  await shot(page, 'day-on');
  await ctx.close();
}

// fast switch clicks blow the power, like the lamp; the light returns to its pre-outage state
{
  const { ctx, page } = await open('devkitty', NIGHT);
  await page.click(BTN); // light on
  await page.waitForTimeout(2200); // out of the 2 s click window
  for (let k = 0; k < 4; k++) {
    await page.click(BTN);
    await page.waitForTimeout(100);
  }
  const before = await pressed(page); // the state when the 5th toggle blows the power
  await page.keyboard.press('Enter'); // keyboard counts too (5th toggle)
  await page.waitForTimeout(1700);
  ok(await page.evaluate(() => document.querySelector('[data-hero-stage]').classList.contains('outage')), 'fast switch clicks: outage');
  await page.click(BTN, { force: true });
  ok(await page.evaluate(() => document.querySelector('[data-hero-stage]').classList.contains('outage')), 'switch does nothing during the outage');
  await page.waitForFunction(() => !document.querySelector('[data-hero-stage]').classList.contains('outage'), null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  ok((await pressed(page)) === before, `after the outage the light is back (${before})`);
  await ctx.close();
}

// grey mode
{
  const { ctx, page } = await open('bw', NIGHT);
  ok(await page.isDisabled(BTN), 'grey mode: light button disabled');
  await shot(page, 'bw-night');
  await ctx.close();
}

// mobile
{
  const { ctx, page } = await open('devkitty', NIGHT, { width: 390, height: 844 });
  const box = await page.locator(BTN).boundingBox();
  ok(box.width >= 24 && box.height >= 24, `mobile: button ${box.width.toFixed(0)}x${box.height.toFixed(0)} >= 24x24`);
  await page.click(BTN);
  await page.waitForTimeout(900);
  ok((await pressed(page)) === 'true' && near(await op(page, '.nightshade'), 0.2, 0.01), 'mobile: click works');
  await shot(page, 'mobile-night-on');
  await ctx.close();
}

await browser.close();
console.log(fail ? `${fail} FAILED` : 'ALL PASS');
process.exit(fail ? 1 : 0);
