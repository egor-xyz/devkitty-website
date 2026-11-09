// Run with the dev server up: node scripts/hero-printer.check.mjs [url] [shotDir]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/hero-printer';
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
  await page.evaluate(() => dispatchEvent(new CustomEvent('devkitty:mouse-test', { detail: { odds: 0 } }))); // no random mouse
  return { ctx, page, errs };
}
const NIGHT = '2026-11-08T23:00:00';
const DAY = '2026-11-08T12:00:00';
const stage = (page) => page.locator('[data-hero-stage]');
const shot = (page, name) => stage(page).screenshot({ path: `${DIR}/${name}.png` });
const BTN = '[data-h="printer"]';
const rows = (page) => page.locator('[data-h="la"] .printer .row.on').count();
const printing = (page) => page.locator('[data-h="la"] .printer.printing').count();
const COUNTS = { cat: 10, dino: 13, duck: 12, mug: 10, robot: 13 };
const model = (page) => page.getAttribute('[data-h="la"] .printer', 'data-model');
const rowsOk = async (page) => (await rows(page)) === COUNTS[await model(page)];
const fxCount = (page) =>
  page.evaluate(() => document.querySelector('[data-h="la"] .printer .dino').getAnimations({ subtree: true }).length);
const typed = (page) => page.evaluate(() => document.querySelector('[data-h="la"] [data-typed]').textContent);

// day, Devkitty mode: print, reprint, keyboard, geometry
{
  const { ctx, page, errs } = await open('devkitty', DAY);
  await page.click(BTN);
  await page.waitForTimeout(1500);
  const mid = await rows(page);
  ok((await printing(page)) === 1 && mid >= 1 && mid <= 12, `printing, ${mid} rows so far`);
  await shot(page, 'printing');
  await page.waitForTimeout(4000);
  const m1 = await model(page);
  ok((await rowsOk(page)) && (await printing(page)) === 0, `done: ${m1} has ${COUNTS[m1]} rows, not printing`);
  const box = await page.locator('[data-h="la"] .printer .dino').evaluate((n) => {
    const r = n.getBoundingClientRect();
    return { h: r.height, w: r.width, v: getComputedStyle(n.querySelector('.row.on')).visibility };
  });
  ok(box.w > 0 && box.h > 0 && box.v === 'visible', `model visible ${box.w.toFixed(0)}x${box.h.toFixed(0)}`);
  ok((await page.locator('[data-h="lb"] .printer .row.on').count()) === COUNTS[m1], 'grey layer printed too');
  await shot(page, 'printed-day');
  await page.click(BTN);
  await page.waitForTimeout(200);
  ok((await rows(page)) === 0, 'second click clears the model');
  await page.waitForTimeout(5500);
  const m2 = await model(page);
  ok(m2 !== m1 && (await rowsOk(page)), `and prints a different model (${m1} then ${m2})`);
  // the finished figure plays a short animation, then rests
  await page.click(BTN);
  const t0 = Date.now();
  let seen = 0;
  while (Date.now() - t0 < 9000 && !seen) {
    await page.waitForTimeout(250);
    if ((await printing(page)) === 0 && (await rows(page)) > 0) seen = await fxCount(page);
  }
  ok(seen > 0, `figure animates after the print (${await model(page)})`);
  await page.waitForTimeout(2600);
  ok((await fxCount(page)) === 0, 'and rests afterwards');
  // keyboard
  await page.focus(BTN);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  ok((await printing(page)) === 1, 'keyboard Enter starts a print');
  await page.waitForTimeout(5000);
  const inside = await page.evaluate((s) => {
    const b = document.querySelector(s).getBoundingClientRect();
    const a = document.querySelector('[data-h="la"] .printer').getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    return x >= a.left && x <= a.right && y >= a.top && y <= a.bottom;
  }, BTN);
  ok(inside, 'button centre lies inside the drawn printer');
  ok(typeof (await typed(page)) === 'string', 'terminal still readable');
  ok(errs.length === 0, 'no console errors (day) ' + errs.join('|'));
  await ctx.close();
}

// night
{
  const { ctx, page } = await open('devkitty', NIGHT);
  await page.click(BTN);
  await page.waitForTimeout(5800);
  ok(await rowsOk(page), 'night: printed');
  await shot(page, 'printed-night');
  await ctx.close();
}

// reduced motion
{
  const { ctx, page } = await open('devkitty', DAY, { reducedMotion: 'reduce' });
  await page.click(BTN);
  await page.waitForTimeout(150);
  ok(await rowsOk(page), 'reduced motion: finished model at once');
  await page.waitForTimeout(300);
  ok((await fxCount(page)) === 0, 'reduced motion: no figure animation');
  await ctx.close();
}

// grey mode
{
  const { ctx, page } = await open('bw', NIGHT);
  ok(await page.isDisabled(BTN), 'grey mode: printer button disabled');
  await shot(page, 'bw-night-printer');
  await ctx.close();
}

// mobile
{
  const { ctx, page } = await open('devkitty', DAY, { width: 390, height: 844 });
  const box = await page.locator(BTN).boundingBox();
  ok(box.width >= 24 && box.height >= 24, `mobile: button ${box.width.toFixed(0)}x${box.height.toFixed(0)}`);
  await page.click(BTN);
  await page.waitForTimeout(5800);
  ok(await rowsOk(page), 'mobile: printed');
  await shot(page, 'mobile-printed');
  await ctx.close();
}

await browser.close();
console.log(fail ? `${fail} FAILED` : 'ALL PASS');
process.exit(fail ? 1 : 0);
