// Run with the dev server up: node scripts/hero-power.check.mjs [url] [shotDir]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/hero-power';
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
let fail = 0;
const ok = (c, m) => {
  if (!c) fail++;
  console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
};

async function open(mode, night = false, at = '2026-11-08T23:00:00') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((m) => sessionStorage.setItem('devkitty-mode', m), mode);
  const page = await ctx.newPage();
  if (night) await page.clock.setFixedTime(new Date(at));
  const errs = [];
  // the GitHub releases API rate limit (403) and a StrictMode double-mount AudioContext close are not part of this check
  const noise = (t) => /status of 403|AudioContext is closed/.test(t);
  page.on('console', (m) => m.type() === 'error' && !noise(m.text()) && errs.push(m.text()));
  page.on('pageerror', (e) => !noise(String(e)) && errs.push(String(e)));
  await page.goto(URL);
  await page.waitForTimeout(17500); // intro
  return { ctx, page, errs };
}
const stage = (page) => page.locator('[data-hero-stage]');
const shot = (page, name) => stage(page).screenshot({ path: `${DIR}/${name}.png` });
const lamp = (page) =>
  page.evaluate(() => {
    document.querySelector('[data-h="la"] [data-i="lamp"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
const state = (page) =>
  page.evaluate(() => ({
    outage: document.querySelector('[data-hero-stage]').classList.contains('outage'),
    angry: !!document.querySelector('[data-h="la"] .dev.angry'),
    black: getComputedStyle(document.querySelector('[data-h="la"] .outBlack')).opacity,
    lampOn: document.querySelector('[data-h="la"] [data-i="lamp"]').classList.contains('on'),
    typed: document.querySelector('[data-h="la"] [data-typed]').textContent
  }));

// Devkitty mode: slow clicks, then the outage
{
  const { ctx, page, errs } = await open('devkitty');
  const a = await state(page);
  await lamp(page);
  await page.waitForTimeout(700);
  await lamp(page);
  await page.waitForTimeout(700);
  const b = await state(page);
  ok(!b.outage && b.lampOn === a.lampOn, '2 slow clicks only toggle the lamp (back to the start)');
  await page.waitForTimeout(2200);
  for (let k = 0; k < 5; k++) {
    await lamp(page);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1700); // the room flickers for about 1 s first
  const o = await state(page);
  ok(o.outage && o.angry && o.black === '1' && !o.lampOn, `outage: ${JSON.stringify(o)}`);
  await shot(page, 'outage');
  await page.waitForTimeout(3000); // ~3.6 s after the 5th click: flicker window
  await shot(page, 'flicker');
  await page.waitForTimeout(6000);
  const r = await state(page);
  ok(!r.outage && !r.angry && r.black === '0', `recovered: ${JSON.stringify(r)}`);
  await shot(page, 'recovered');
  const t1 = (await state(page)).typed;
  await page.waitForTimeout(2500);
  const t2 = (await state(page)).typed;
  ok(t1 !== t2, `auto-typing continues ("${t1}" -> "${t2}")`);
  // the login screen of a restore must be opaque, twice in a row (two outages)
  for (const round of [1, 2]) {
    for (let k = 0; k < 5; k++) {
      await lamp(page);
      await page.waitForTimeout(120);
    }
    await page.waitForFunction(() => document.querySelector('[data-hero-stage]').classList.contains('boot-login'), null, {
      timeout: 14000
    });
    await page.waitForTimeout(1100);
    const lg = await page.evaluate(() => {
      const g = (s) => document.querySelector(`[data-h="la"] ${s}`);
      const st = document.querySelector('[data-hero-stage]');
      return {
        boot: getComputedStyle(g('.boot')).opacity,
        bootBlack: getComputedStyle(g('.bootBlack')).opacity,
        wallpaper: getComputedStyle(g('.login rect')).fillOpacity,
        outBlack: getComputedStyle(g('.outBlack')).opacity,
        done: st.classList.contains('boot-done')
      };
    });
    ok(
      lg.boot === '1' && lg.bootBlack === '0' && lg.wallpaper === '1' && lg.outBlack === '0' && !lg.done,
      `outage ${round}: login screen opaque ${JSON.stringify(lg)}`
    );
    if (round === 1) await shot(page, 'login-opaque');
    await page.waitForTimeout(4000);
  }
  await page.evaluate(() =>
    document.querySelector('[data-h="la"] [data-i="cat"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  );
  await page.waitForTimeout(1900); // the cat walks past the mini
  await shot(page, 'cat-walks-past-mini');
  await page.waitForTimeout(9000);
  // the Mac mini: switched off, the dev complains, then presses the power button
  const mini = () =>
    page.evaluate(() => ({
      off: document.querySelector('[data-hero-stage]').classList.contains('shutdown'),
      hey: !!document.querySelector('[data-h="la"] .dev.hey'),
      black: getComputedStyle(document.querySelector('[data-h="la"] .outBlack')).opacity,
      led: getComputedStyle(document.querySelector('[data-h="la"] .led')).fill,
      typed: document.querySelector('[data-h="la"] [data-typed]').textContent
    }));
  const led0 = (await mini()).led;
  await page.evaluate(() =>
    document.querySelector('[data-h="la"] [data-i="mini"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  );
  await page.waitForTimeout(800);
  const m1 = await mini();
  ok(m1.off && m1.hey && m1.black === '1' && m1.led !== led0, `mini click shuts the Mac down: ${JSON.stringify(m1)}`);
  await shot(page, 'mini-off');
  await page.waitForTimeout(8500);
  const m2 = await mini();
  ok(!m2.off && !m2.hey && m2.black === '0' && m2.led === led0, `mini back on: ${JSON.stringify(m2)}`);
  await page.waitForTimeout(3000);
  ok((await mini()).typed !== m2.typed, 'auto-typing resumes after the mini restart');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('devkitty:lightning-test')));
  ok(!(await page.evaluate(() => document.querySelector('.hero').dataset.lightning)), 'no lightning in Devkitty mode');
  ok(errs.length === 0, 'no console errors (devkitty) ' + errs.join('|'));
  await ctx.close();
}

// b&w mode: lightning
{
  const { ctx, page, errs } = await open('bw');
  const n0 = await page.evaluate(() => Number(document.querySelector('.hero').dataset.lightning ?? 0));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('devkitty:lightning-test', { detail: { hold: 1500 } })));
  await page.waitForTimeout(60);
  await shot(page, 'lightning');
  const n1 = await page.evaluate(() => Number(document.querySelector('.hero').dataset.lightning ?? 0));
  ok(n1 === n0 + 1, 'lightning test hook strikes');
  await page.waitForFunction(
    (n) => Number(document.querySelector('.hero').dataset.lightning ?? 0) > n,
    n1,
    { timeout: 45000 }
  ).then(
    () => ok(true, 'natural lightning, up to 45 s'),
    () => ok(false, 'natural lightning, up to 45 s')
  );
  ok(errs.length === 0, 'no console errors (bw) ' + errs.join('|'));
  await ctx.close();
}

// night: the moon in both modes, and the rocket
for (const mode of ['bw', 'devkitty']) {
  const { ctx, page, errs } = await open(mode, true);
  const op = await page.evaluate(() => getComputedStyle(document.querySelector('[data-h="la"] .moon')).opacity);
  ok(Number(op) > 0.9, `${mode}: moon visible at night (${op})`);
  await shot(page, `moon-${mode}`);
  if (mode === 'devkitty') {
    await page.evaluate(() => {
      document.querySelector('[data-h="la"] [data-i="moon"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(450);
    await shot(page, 'moon-rocket');
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => document.querySelector('[data-h="la"] .moon').classList.contains('wince')), 'moon winces');
    await shot(page, 'moon-wince');
    await page.waitForTimeout(1300);
    ok(await page.evaluate(() => !document.querySelector('[data-h="la"] .moon').classList.contains('wince')), 'moon recovers');
  }
  ok(errs.length === 0, `no console errors (moon ${mode}) ` + errs.join('|'));
  await ctx.close();
}
// the moon rises behind the skyline in the evening and is gone by the morning
for (const [at, name] of [['2026-11-08T21:00:00', 'moon-rising'], ['2026-11-08T08:00:00', 'moon-day']]) {
  const { ctx, page } = await open('devkitty', true, at);
  const ty = await page.evaluate(() => document.querySelector('[data-h="la"] .moonrise').style.transform);
  console.log(name, ty);
  await shot(page, name);
  await ctx.close();
}
// opening straight into a zoom: the intro waits for the close
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL + '#features');
  await page.waitForTimeout(6000);
  const devX = () =>
    page.evaluate(() => document.querySelector('[data-h="la"] .dev').style.transform || document.querySelector('[data-h="lb"] .dev').style.transform);
  const before = await devX();
  ok(before.includes('640px'), `zoom open at load: dev still offstage after 6 s (${before})`);
  await page.evaluate(() => {
    window.__resumed = false;
    window.addEventListener('devkitty:hero-resume', () => (window.__resumed = true));
  });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__resumed, null, { timeout: 8000 });
  await page.waitForTimeout(1800);
  const after = await devX();
  ok(!after.includes('640px'), `after the close the dev walks in (${after})`);
  await ctx.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
