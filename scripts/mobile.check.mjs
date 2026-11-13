// Run with the dev server up: node scripts/mobile.check.mjs [url] [shotDir]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const URL = process.argv[2] ?? 'http://127.0.0.1:5173/';
const DIR = process.argv[3] ?? '/tmp/mobile-check';
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
let fail = 0;
const ok = (c, m) => {
  if (!c) fail++;
  console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
};

// .site-header height at 1280x800 on main, before the phone fixes (desktop must not change)
const MAIN_HEADER_H = 65;

const base = URL.replace(/#.*$/, '').replace(/\/$/, '');
// the GitHub releases API rate limit (403) is not part of this check
const noise = (t) => /status of 403/.test(t);

async function open(path, { w, h, mode = 'devkitty', touch = true, wait = 1500, motion = false }) {
  // one context per load: a same-page goto to a new hash is a hashchange, so deep links would be ignored
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: touch,
    hasTouch: touch,
    reducedMotion: motion ? 'no-preference' : 'reduce'
  });
  await ctx.addInitScript((m) => sessionStorage.setItem('devkitty-mode', m), mode);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && !noise(m.text()) && errs.push(m.text()));
  page.on('pageerror', (e) => !noise(String(e)) && errs.push(String(e)));
  await page.goto(base + path);
  await page.waitForTimeout(wait);
  const close = ctx.close.bind(ctx);
  ctx.close = async () => {
    ok(errs.length === 0, `${mode} ${w} ${path}: no console or page errors ${JSON.stringify(errs.slice(0, 2))}`);
    await close();
  };
  return { ctx, page, errs };
}

const sizes = [
  [360, 780],
  [390, 844]
];

for (const mode of ['bw', 'devkitty']) {
  for (const [w, h] of sizes) {
    const tag = `${mode} ${w}`;

    // 1. zoom lists: every option is a 44px chip, visible without scrolling, description right under the chips
    for (const [name, hash] of [
      ['features', '/#features'],
      ['extensions', '/#extensions'],
      ['changelog', '/#changelog']
    ]) {
      const { ctx, page } = await open(hash, { w, h, mode });
      const m = await page.evaluate(() => {
        const els = [...document.querySelectorAll('.fz-row')];
        const rows = els.map((r) => r.getBoundingClientRect());
        const list = document.querySelector('.fz-list')?.getBoundingClientRect();
        const show = document.querySelector('.fz-show')?.getBoundingClientRect();
        // a row is visible when it is inside the screen and inside its own inner scroll box (if any)
        const clip = els.map((e) => e.closest('.fz-scroll')?.getBoundingClientRect().bottom ?? Infinity);
        return {
          n: rows.length,
          minH: rows.length ? Math.min(...rows.map((r) => r.height)) : 0,
          hidden: rows.filter((r, i) => r.bottom > Math.min(innerHeight, clip[i]) + 1).length,
          gap: list && show ? show.top - list.bottom : null
        };
      });
      console.log(`${tag} ${name}: ${m.n} rows`);
      ok(m.n > 0 && m.minH >= 44, `${tag} ${name}: every .fz-row >= 44px (min ${m.minH})`);
      ok(m.n > 0 && m.hidden === 0, `${tag} ${name}: all rows visible without scrolling (${m.hidden} cut off)`);
      ok(m.gap !== null && m.gap <= 40, `${tag} ${name}: .fz-show within 40px of the list (gap ${m.gap})`);
      await page.screenshot({ path: `${DIR}/${mode}-${w}-${name}.png` });
      await ctx.close();
    }

    // 2. tab groups wrap instead of being cut off
    {
      const { ctx, page } = await open('/#features/tab-groups', { w, h, mode });
      const cut = await page.evaluate(
        () => [...document.querySelectorAll('.fz-gtabs')].filter((g) => g.scrollWidth > g.clientWidth + 1).length
      );
      ok(cut === 0, `${tag} tab-groups: no .fz-gtabs cut off (${cut})`);
      await ctx.close();
    }

    // 2b. real motion at 360: collapsing a group closes it fully, and a tapped chip keeps the orange fill
    if (w === 360) {
      const { ctx, page } = await open('/#features/tab-groups', { w, h, mode, motion: true });
      const chip = page.locator('.fz-chip').first();
      const chipH = (await chip.boundingBox()).height;
      await chip.tap();
      await page.waitForTimeout(600);
      const gh = await page.evaluate(
        () => document.querySelector('.fz-group[data-collapsed="true"]')?.getBoundingClientRect().height ?? null
      );
      ok(gh !== null && gh <= chipH + 8, `${tag} tab-groups: collapsed group <= chip height + 8 (${gh} vs ${chipH})`);
      const row = page.locator('.fz-row').nth(1);
      await row.tap();
      await page.waitForTimeout(400);
      const bg = await row.evaluate((e) => getComputedStyle(e).backgroundColor);
      ok(/^rgba\(255, 106, 61/.test(bg), `${tag} tab-groups: tapped chip keeps the orange fill while hovered (${bg})`);
      await ctx.close();
    }

    // 3. the URL field ends inside the window
    {
      const { ctx, page } = await open('/#features/built-in-browser', { w, h, mode });
      const r = await page.evaluate(() => {
        const f = document.querySelector('.fz-url-field')?.getBoundingClientRect();
        const win = document.querySelector('.fz-win')?.getBoundingClientRect();
        return f && win ? { f: f.right, win: win.right } : null;
      });
      ok(r && r.f <= r.win + 0.5, `${tag} built-in-browser: .fz-url-field inside .fz-win (${JSON.stringify(r)})`);
      await ctx.close();
    }

    // 4. preview buttons are tappable (the quick-terminal close is deferred)
    for (const hash of ['/#features/tab-groups', '/#extensions/quick-terminal', '/#extensions/quick-ai']) {
      const { ctx, page } = await open(hash, { w, h, mode });
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('.fz-preview button')]
          .filter((b) => !b.matches('.fz-qt-close') && b.offsetParent !== null)
          .map((b) => ({
            c: b.className || b.textContent.trim().slice(0, 20),
            h: Math.round(b.getBoundingClientRect().height)
          }))
          .filter((b) => b.h < 44)
      );
      ok(small.length === 0, `${tag} ${hash}: preview buttons >= 44px ${JSON.stringify(small)}`);
      await ctx.close();
    }

    // 5. the shell: no sideways scroll, compact header, tappable links
    for (const path of ['/', '/extensions/', '/extensions/quick-terminal/', '/privacy/', '/terms/']) {
      const { ctx, page } = await open(path, { w, h, mode, wait: 800 });
      const m = await page.evaluate(() => {
        const rect = (s) => document.querySelector(s)?.getBoundingClientRect();
        const hd = rect('.site-header');
        const dl = rect('.hdr-download');
        const brand = rect('.site-header a');
        const mid = (r) => r.top + r.height / 2;
        const small = [...document.querySelectorAll('main a, main button, .site-footer a, .site-footer button')]
          // links inside running text (legal prose) are exempt from the 44px target size, as WCAG 2.5.8 allows
          .filter(
            (e) => !e.closest('[data-hero-stage]') && !e.closest('.legal p, .legal li') && e.offsetParent !== null
          )
          .map((e) => ({
            t: (e.textContent || e.className).trim().slice(0, 24),
            h: Math.round(e.getBoundingClientRect().height)
          }))
          .filter((e) => e.h < 44);
        return {
          sw: document.documentElement.scrollWidth,
          hdrH: hd ? Math.round(hd.height) : null,
          rowDelta: dl && brand ? Math.abs(mid(dl) - mid(brand)) : null,
          small
        };
      });
      // against the device width, not innerWidth: a mobile viewport widens innerWidth to fit overflowing content
      ok(m.sw <= w, `${tag} ${path}: no horizontal overflow (${m.sw} vs ${w})`);
      if (m.hdrH !== null) ok(m.hdrH <= 100, `${tag} ${path}: header <= 100px (${m.hdrH})`);
      if (m.rowDelta !== null) {
        ok(m.rowDelta < 8, `${tag} ${path}: Download level with the brand (delta ${Math.round(m.rowDelta)})`);
      }
      ok(m.small.length === 0, `${tag} ${path}: links and buttons >= 44px ${JSON.stringify(m.small)}`);
      if (path === '/privacy/' || path === '/terms/') {
        await page.evaluate(() => scrollTo(0, 400));
        await page.waitForTimeout(300);
        const top = await page.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().top);
        ok(Math.abs(top) < 1, `${tag} ${path}: header stays at top after scrolling (top ${top})`);
      }
      if (path === '/') await page.screenshot({ path: `${DIR}/${mode}-${w}-home.png` });
      await ctx.close();
    }
  }
}

// 6. desktop guard: the phone fixes must not change 1280x800
{
  const { ctx, page } = await open('/#features', { w: 1280, h: 800, touch: false });
  const m = await page.evaluate(() => ({
    // rows with a wrapping summary are taller; the shortest one is the baseline
    row: Math.min(...[...document.querySelectorAll('.fz-row')].map((r) => r.getBoundingClientRect().height)),
    top: document.querySelector('.fz-preview')?.getBoundingClientRect().top
  }));
  ok(Math.abs(m.row - 29) <= 1, `desktop: shortest .fz-row height 29 (${m.row})`);
  ok(Math.abs(m.top - 40) <= 1, `desktop: .fz-preview top 40 (${m.top})`);
  await ctx.close();
  const home = await open('/', { w: 1280, h: 800, touch: false, wait: 800 });
  const hh = await home.page.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().height);
  console.log(`desktop header height ${hh}`);
  ok(Math.abs(hh - MAIN_HEADER_H) <= 1, `desktop: .site-header height unchanged (${hh} vs ${MAIN_HEADER_H})`);
  await home.ctx.close();
}

await browser.close();
process.exit(fail ? 1 : 0);
