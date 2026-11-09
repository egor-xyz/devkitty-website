// Run with the dev server up: node scripts/hero-mouse.check.mjs [url] [shotDir]
// The printer sometimes prints a mouse. It pops into a drawn mouse and runs; the cat crouches, wiggles, pounces and
// pins it, carries it up to the desk by the scruff and curls up next to it; the dazed mouse comes round and runs off.
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
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width, height }, reducedMotion });
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
// a plain page screenshot clipped to the stage: much quicker than a locator shot, so fast phases (the pounce) are caught
const shot = async (page, name) =>
  page.screenshot({ clip: await stage(page).boundingBox(), path: `${DIR}/${name}.png` });
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
const overlap = (a, b, pad = 0) =>
  a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
const catAnims = (page) =>
  page.evaluate(() => [...document.querySelectorAll('.cat .wmove')].reduce((n, m) => n + m.getAnimations().length, 0));

// One snapshot of the hunt in a layer: classes, and boxes in scene units (viewBox 1200x760); null = not rendered.
const snap = (page, l = 'la') =>
  page.evaluate((l) => {
    const q = (s) => document.querySelector(`[data-h="${l}"] ${s}`);
    const s = q('svg').getBoundingClientRect();
    const k = 1200 / s.width;
    const box = (n) => {
      const r = n?.getBoundingClientRect();
      if (!r || r.width === 0) return null;
      return {
        bottom: (r.bottom - s.top) * k,
        left: (r.left - s.left) * k,
        right: (r.right - s.left) * k,
        top: (r.top - s.top) * k
      };
    };
    return {
      cat: q('.cat').getAttribute('class'),
      catBox: box(q('.cat.walking .wmove')),
      head: box(q('.cat.walking .wbody ellipse')),
      mouse: q('.cat .mouse').getAttribute('class'),
      mouseArt: box(q('.cat .mouse.on .mart')),
      paw: box(q('.cat.walking .legA.legF')),
      pixels: q('.printer .dino').querySelectorAll('rect').length,
      slot: box(q('.cat.carry .mslot .mart')),
      tail: box(q('.cat .curl .tail'))
    };
  }, l);
const near = (a, b, d = 1) => ['bottom', 'left', 'right', 'top'].every((k) => Math.abs(a[k] - b[k]) <= d);
const fmt = (b) =>
  b ? `x ${b.left.toFixed(0)}-${b.right.toFixed(0)}, y ${b.top.toFixed(0)}-${b.bottom.toFixed(0)}` : 'none';
// a 2x crop of the drawn mouse (the free one or the one in the cat's mouth)
const crop = async (page, name, b, pad = 26) => {
  const s = await page.evaluate(() => {
    const r = document.querySelector('[data-h="la"] svg').getBoundingClientRect();
    return { k: r.width / 1200, x: r.left, y: r.top };
  });
  const clip = {
    height: (b.bottom - b.top + 2 * pad) * s.k,
    width: (b.right - b.left + 2 * pad) * s.k,
    x: s.x + (b.left - pad) * s.k,
    y: s.y + (b.top - pad) * s.k
  };
  await page.screenshot({ clip, path: `${DIR}/${name}.png` });
};

// One full hunt: print, pop, run, crouch+wiggle, pounce, pin, carry, drop, rest, escape. Shots are prefixed with `tag`.
async function hunt(page, tag) {
  const label = `${tag} hunt`;
  const tail0 = { la: (await snap(page)).tail, lb: (await snap(page, 'lb')).tail };
  await hook(page, { odds: 1 });
  await page.click(BTN);
  await page.waitForTimeout(400);
  ok((await model(page)) === 'mouse', `${label}: the printer prints a mouse`);
  ok(
    (await has(page, '.cat.awake')) === 1 && (await printing(page)) === 1,
    `${label}: the cat wakes and the print runs`
  );
  // the pixel model only while printing
  const seen = {};
  const once = async (key, fn) => {
    if (seen[key]) return;
    seen[key] = true;
    await fn();
  };
  let full = false; // the last row goes on as the print ends and pops at once, so count the rows while printing
  let drawnWhilePrinting = false;
  ok(
    await until(async () => {
      const r = await rows(page);
      if (r === MOUSE_ROWS - 1 && (await page.locator('[data-h="la"] .printer .row').count()) === MOUSE_ROWS)
        full = true;
      if ((await printing(page)) === 1 && (await has(page, '.cat .mouse.on')) > 0) drawnWhilePrinting = true;
      if (r >= 3) await once('printing', () => shot(page, `${tag}-1-printing`)); // the pixel model, half printed
      return (await printing(page)) === 0;
    }, 4000),
    `${label}: print finished`
  );
  ok(
    full && !drawnWhilePrinting,
    `${label}: the pixel mouse prints its ${MOUSE_ROWS} rows, no drawn mouse while printing`
  );
  ok(
    await until(async () => (await has(page, '.cat .mouse.on')) === 1, 300),
    `${label}: the print pops into the drawn mouse at once`
  );
  const popped = await snap(page);
  ok(
    popped.pixels === 0 && popped.mouseArt !== null,
    `${label}: the pixel model is gone, the drawn mouse shows (${fmt(popped.mouseArt)})`
  );
  await shot(page, `${tag}-2-pop`);
  await crop(page, `${tag}-mouse-pop-2x`, popped.mouseArt);
  // clicks during the hunt change nothing
  await clickCat(page);
  await page.click(BTN, { force: true });
  let busyUse = 0;
  let pin = null;
  let carry = [];
  let rest = null;
  let layers = null;
  const done = await until(async () => {
    const s = await snap(page);
    const cat = s.cat.split(' ');
    const mouse = s.mouse.split(' ');
    if (cat.includes('go') || cat.includes('typing')) busyUse++;
    if (mouse.includes('run') && !mouse.includes('left') && s.mouseArt?.bottom > 740)
      await once('run', async () => {
        await shot(page, `${tag}-3-run`);
        await crop(page, `${tag}-mouse-run-2x`, (await snap(page)).mouseArt ?? s.mouseArt, 50);
      });
    if (cat.includes('crouch') && cat.includes('wiggle'))
      await once('wiggle', () => shot(page, `${tag}-4-crouch-wiggle`));
    if (cat.includes('air') && !cat.includes('carry')) await once('pounce', () => shot(page, `${tag}-5-pounce`));
    if (cat.includes('pin') && mouse.includes('pin') && !pin) {
      pin = s;
      await shot(page, `${tag}-6-pin`);
      await crop(page, `${tag}-mouse-pinned-2x`, s.mouseArt);
    }
    if (cat.includes('carry') && s.slot) {
      carry.push(s);
      if (cat.includes('air'))
        await once('carry', async () => {
          await crop(page, `${tag}-mouse-carried-2x`, (await snap(page)).slot ?? s.slot, 50); // it moves fast: a fresh box, more room
          await shot(page, `${tag}-7-carry`);
        });
    }
    if (mouse.includes('out') && mouse.includes('dizzy') && !cat.includes('walking') && !rest) {
      rest = s;
      layers = await snap(page, 'lb');
      await shot(page, `${tag}-8-rest-dazed`);
      await crop(page, `${tag}-mouse-dazed-2x`, s.mouseArt);
    }
    if (mouse.includes('out') && !mouse.includes('dizzy')) await once('rest2', () => shot(page, `${tag}-9-rest`));
    if (mouse.includes('run') && mouse.includes('left') && s.mouseArt?.left > 60)
      await once('escape', async () => {
        await shot(page, `${tag}-10-escape`);
        await crop(page, `${tag}-mouse-escape-2x`, (await snap(page)).mouseArt ?? s.mouseArt, 50);
      });
    return seen.escape && !mouse.includes('on');
  }, 16000);
  ok(busyUse === 0, `${label}: clicking the cat during the hunt does not start a takeover`);
  ok(seen.run && seen.wiggle, `${label}: the mouse runs while the cat crouches and wiggles`);
  ok(seen.pounce, `${label}: the cat pounces`);
  ok(pin !== null, `${label}: the cat pins the mouse`);
  if (pin) {
    ok(
      pin.catBox.right < 580,
      `${label}: the cat stays left of the chair back, scene x 580 (cat right edge ${pin.catBox.right.toFixed(0)})`
    );
    ok(
      overlap(pin.paw, pin.mouseArt),
      `${label}: a front paw is on the mouse (paw ${fmt(pin.paw)}, mouse ${fmt(pin.mouseArt)})`
    );
  }
  // carried: the mouse hangs at the cat's head and moves with it, the free mouse is hidden
  const up = carry.filter((c) => c.cat.split(' ').includes('back')); // head up, turned round: the leap home
  const c0 = up[0];
  const c1 = up.at(-1);
  ok(
    carry.length > 2 && carry.every((c) => c.mouseArt === null),
    `${label}: the mouse is carried (${carry.length} samples), the free mouse hidden`
  );
  if (c0 && c1) {
    ok(
      carry.every((c) => overlap(c.slot, c.head, 4)),
      `${label}: the carried mouse is at the cat's mouth`
    );
    const dCat = c1.catBox.top - c0.catBox.top;
    const dMouse = c1.slot.top - c0.slot.top;
    ok(
      Math.abs(dCat) > 50 && Math.abs(dCat - dMouse) < 25,
      `${label}: the mouse goes up to the desk with the cat (cat ${dCat.toFixed(0)}, mouse ${dMouse.toFixed(0)})`
    );
  }
  ok(rest !== null, `${label}: the mouse rests on the desk, dazed, next to the sleeping cat`);
  if (rest) {
    const m = rest.mouseArt;
    ok(
      m && m.bottom > 552 && m.bottom < 572 && m.left > 140 && m.right < 290,
      `${label}: the drawn mouse lies on the desk top, visible (${fmt(m)})`
    );
    ok(
      layers.mouse === rest.mouse && layers.cat === rest.cat && layers.mouseArt && near(layers.mouseArt, m),
      `${label}: grey layer matches (${layers.mouse} / ${fmt(layers.mouseArt)})`
    );
  }
  ok(seen.rest2 && seen.escape && done, `${label}: the mouse comes round and runs off the desk, out of the scene`);
  ok(done && (await has(page, '.cat .mouse.on')) === 0, `${label}: the desk is empty`);
  ok(
    (await page.evaluate(() =>
      [...document.querySelectorAll('.cat .mouse')].reduce((n, m) => n + m.getAnimations({ subtree: true }).length, 0)
    )) === 0,
    `${label}: no leftover animations on the mouse`
  );
  ok(
    await page.evaluate(() =>
      [...document.querySelectorAll('.cat .mouse')].every((m) => m.getAttribute('class') === 'mouse')
    ),
    `${label}: no leftover mouse classes, both layers`
  );
  ok(
    done && (await has(page, '.cat.walking')) === 0 && (await has(page, '.cat.awake')) === 0,
    `${label}: the cat is curled up asleep`
  );
  ok((await catAnims(page)) === 0, `${label}: no leftover animations on the cat`);
  ok(
    (await has(
      page,
      '.cat.crouch, .cat.wiggle, .cat.air, .cat.pin, .cat.bite, .cat.carry, .cat.back, .cat.go, .cat.twitch'
    )) === 0,
    `${label}: no leftover cat classes`
  );
  const tail1 = { la: (await snap(page)).tail, lb: (await snap(page, 'lb')).tail };
  ok(
    near(tail0.la, tail1.la) && near(tail0.lb, tail1.lb),
    `${label}: the sleeping cat's tail is unchanged (${fmt(tail0.la)} / ${fmt(tail1.la)})`
  );
  // the printer is free again: a normal print
  await hook(page, { odds: 0 });
  await page.click(BTN);
  await page.waitForTimeout(5800);
  const p = await snap(page);
  ok(
    CYCLE.includes(await model(page)) && (await rows(page)) > 0 && p.mouseArt === null,
    `${label}: the printer is free again (${await model(page)})`
  );
}

// day
{
  const { ctx, page, errs } = await open('devkitty', DAY);
  await hunt(page, 'day');
  // the cat is free again: a click makes it walk to the keyboard
  await clickCat(page);
  ok(
    await until(async () => (await has(page, '.cat.go')) === 1, 2000),
    'day: the cat can be taken over after the hunt'
  );
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
