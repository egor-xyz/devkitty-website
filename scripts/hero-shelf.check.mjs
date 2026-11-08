// Run with the dev server up: node scripts/hero-shelf.check.mjs [url] [shotDir]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/hero-shelf';
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
const BTN = '[data-h="shelf"]';
const expanded = (page) => page.getAttribute(BTN, 'aria-expanded');
const doorOpen = (page) => page.locator('[data-h="la"] .shelf.open').count();

{
  const { ctx, page, errs } = await open('devkitty', DAY);
  ok((await expanded(page)) === 'false' && (await doorOpen(page)) === 0, 'starts closed');
  await shot(page, 'closed');
  await page.click(BTN);
  await page.waitForTimeout(1200);
  ok((await expanded(page)) === 'true' && (await doorOpen(page)) === 1, 'click opens: aria-expanded true');
  const items = await page.evaluate(() => {
    const door = document.querySelector('[data-h="la"] .shelf .door').getBoundingClientRect();
    const shelf = document.querySelector('[data-h="la"] .shelf rect').getBoundingClientRect();
    return {
      doorW: door.width,
      shelfW: shelf.width,
      n: [...document.querySelectorAll('[data-h="la"] .shelf .item')].filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && getComputedStyle(n).opacity !== '0';
      }).length
    };
  });
  ok(items.n === 3, `3 items visible`);
  ok(items.doorW < items.shelfW * 0.3, `door swung open (${items.doorW.toFixed(0)} of ${items.shelfW.toFixed(0)}px)`);
  await shot(page, 'open');
  await page.click(BTN);
  await page.waitForTimeout(600);
  ok((await expanded(page)) === 'false' && (await doorOpen(page)) === 0, 'second click closes');
  await page.focus(BTN);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok((await expanded(page)) === 'true', 'keyboard Enter opens');
  const cable = await page.evaluate(() => {
    const p = [...document.querySelectorAll('[data-h="la"] svg > path')].filter((n) => n.getAttribute('pointer-events') === 'none' && n.getAttribute('stroke-width') === '5.4');
    return p.length;
  });
  ok(cable === 1, 'printer cable drawn, no pointer events');
  ok(errs.length === 0, 'no console errors ' + errs.join('|'));
  await ctx.close();
}

{
  const { ctx, page } = await open('devkitty', NIGHT);
  await page.click(BTN);
  await page.waitForTimeout(1200);
  await shot(page, 'night-open');
  await ctx.close();
}

{
  const { ctx, page } = await open('bw', NIGHT);
  ok(await page.isDisabled(BTN), 'grey mode: shelf button disabled');
  await shot(page, 'bw');
  await ctx.close();
}

{
  const { ctx, page } = await open('devkitty', DAY, { width: 390, height: 844 });
  const box = await page.locator(BTN).boundingBox();
  ok(box.width >= 24 && box.height >= 24, `mobile: button ${box.width.toFixed(0)}x${box.height.toFixed(0)}`);
  await page.click(BTN);
  await page.waitForTimeout(1200);
  ok((await expanded(page)) === 'true', 'mobile: click opens');
  await shot(page, 'mobile-open');
  await ctx.close();
}

await browser.close();
console.log(fail ? `${fail} FAILED` : 'ALL PASS');
process.exit(fail ? 1 : 0);
