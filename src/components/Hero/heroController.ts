import { HERO_MODE_EVENT } from './heroMode';
import { type Poster, POSTERS } from './posters';
import sceneSvg from './scene.svg?raw';

export type HeroShared = {
  fallback: HTMLElement;
  /** Redraws the shader canvases; replaced by heroShaders once it is running. */
  kick: () => void;
  /** Time of day as a float 0..4: 0 morning, 1 day, 2 evening, 3 night, 4 = next morning. */
  phase: number;
  reduce: boolean;
  ring: HTMLCanvasElement;
  sky: HTMLCanvasElement;
  stage: HTMLElement;
  state: RevealState;
};

/** Reveal state shared with the shader pass (heroShaders.ts), which is the only file that imports three. */
export type RevealState = { anim: number; cx: number; cy: number; on: boolean; r: number; ringA: number };


const BASE = import.meta.env.BASE_URL;
const WORD = ['morning', 'afternoon', 'evening', 'night'];

const TASKS: [string, string, string, string][] = [
  ['claude', 'do all my tasks for today', '● 4 worktrees, 9 tabs. Which one is "today"?', '✓ 3 agents · 3 worktrees · 1 window'],
  ['codex', 'fix the flaky test', '✗ uncommitted changes. stash first?', '✓ fixed on its own worktree'],
  ['agent', 'ship it before standup', '✗ CONFLICT in checkout.tsx', '✓ PR #412 ready · CI green'],
  ['claude', 'review PR #412', '● which tab had the PR open?', '✓ 2 comments · 0 blockers'],
  ['codex', 'why is CI red', 'X build failed 2m14s (again)', '✓ re-ran 1 job · all green'],
  ['agent', 'write the release notes', '● where was the changelog…', '✓ notes for build 284 ready'],
  ['claude', 'refactor without breaking prod', '✗ 12 tests failed', '✓ 29 tests pass · nothing broke'],
  ['codex', 'find the bug I made yesterday', '● 37 tabs open. good luck', '✓ found it: off-by-one in cart.ts'],
  ['agent', 'rebase on main, gently', '✗ detached HEAD at 4f2c1e', '✓ rebased · no conflicts'],
  ['claude', 'make me a coffee', 'zsh: command not found: coffee', "☕ can't. but the cat can try."]
];

const START: Record<string, [string, string]> = {
  agent: ['agent: lost the tab with the agent', '✓ agent tab grouped: Release 2.4'],
  claude: ['✻ Claude Code · which folder was it?', '✓ claude ready in its own tab'],
  codex: ['codex: another agent is in this folder', '✓ codex on its own worktree']
};

const CAT_TYPES = [
  "I'm hungry, give me some food meow!",
  'hug me pleeeease meow',
  'play with me, not with the keyboard!',
  'pet me now, code later meow',
  'throw the ball! throw the ball!',
  "can I sleep on your laptop? it's warm",
  "brush me, I'm so fluffy today",
  'love you human, now give me treats'
];

const LEFT = new Set('qwertasdfgzxcvb12345`~'.split(''));

const hm = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function mountHero(root: HTMLElement): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // remember the last mode on this device; applied first, before any layout read, so there is no transition at load
  let saved: null | string = null;
  try {
    saved = sessionStorage.getItem('devkitty-mode');
  } catch {
    /* storage unavailable */
  }
  if (saved === 'devkitty') root.classList.add('lit');
  // the page background follows the same mode (html[data-mode]); the inline head script sets it first, this keeps it in sync
  document.documentElement.dataset.mode = saved === 'devkitty' ? 'lit' : 'bw';

  const ac = new AbortController();
  const { signal } = ac;
  let disposed = false;
  // The full-screen zoom (Features) covers the hero: its timed loops idle until it closes.
  // Opening on a zoom hash counts as paused from the start, so the first-load intro waits for the zoom to close.
  let zoomPaused = /^#(features|extensions|changelog)(\/|$)/.test(window.location.hash);
  const zoomWaiters: (() => void)[] = [];
  const setZoomPaused = (v: boolean) => () => {
    zoomPaused = v;
    if (!v) zoomWaiters.splice(0).forEach((r) => r());
  };
  const zoomReady = async () => {
    while (zoomPaused && !disposed) await new Promise<void>((r) => zoomWaiters.push(r));
  };
  /** A wait for the intro timeline: it also holds while a zoom covers the hero. */
  const iwait = async (ms: number) => {
    await wait(ms);
    await zoomReady();
  };
  window.addEventListener('devkitty:hero-pause', setZoomPaused(true), { signal });
  window.addEventListener('devkitty:hero-resume', setZoomPaused(false), { signal });

  // ---------- cleanup bookkeeping ----------
  const timers = new Set<number>();
  const intervals = new Set<number>();
  const rafs = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);

    return id;
  };
  const cancelLater = (id: number | undefined) => {
    if (id === undefined) return;
    clearTimeout(id);
    timers.delete(id);
  };
  const every = (fn: () => void, ms: number) => {
    intervals.add(window.setInterval(fn, ms));
  };
  const frame = (cb: (t: number) => void) => {
    const id = requestAnimationFrame((t) => {
      rafs.delete(id);
      cb(t);
    });
    rafs.add(id);

    return id;
  };
  const wait = (ms: number) => new Promise<void>((r) => later(r, ms));

  // ---------- elements ----------
  const need = <T extends Element>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`Hero: missing ${sel}`);

    return el;
  };
  const h = <T extends Element = HTMLElement>(name: string) => need<T>(`[data-h="${name}"]`);
  const stage = need<HTMLElement>('[data-hero-stage]');
  const lb = h('lb');
  const la = h('la');
  const night = h('night');
  const btn = h<HTMLButtonElement>('toggle');
  const sb = h<HTMLButtonElement>('sound');
  const all = (sel: string) => Array.from(root.querySelectorAll<HTMLElement | SVGElement>(sel));
  const byI = (i: string) => all(`[data-i="${i}"]`);

  const shared: HeroShared = {
    fallback: h('fallback'),
    kick: () => {},
    phase: 2,
    reduce,
    ring: h<HTMLCanvasElement>('ring'),
    sky: h<HTMLCanvasElement>('sky'),
    stage,
    state: { anim: 0, cx: 0, cy: 0, on: false, r: 0, ringA: 0 }
  };
  const {state} = shared;

  // ---------- scene: two copies, the second with its own ids ----------
  const html = sceneSvg.split('__LOGO__').join(`${BASE}hero/logo.png`);
  lb.innerHTML = html;
  la.innerHTML = html.replace(/id="(\w+)"/g, 'id="$1A"').replace(/url\(#(\w+)\)/g, 'url(#$1A)');

  for (const g of all('.keys')) {
    let s = '';
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 15; c++) {
        const x = 596 + c * 17.4 - r * 3.5;
        const y = 531 + r * 9;
        s += `<rect class="key" data-k="${r * 15 + c}" x="${x + r * 6}" y="${y}" width="14" height="6.5" rx="1.5" fill="#4A3A46"/>`;
      }
    g.innerHTML = s;
  }

  // ---------- time of day ----------
  let sim: null | number = null;
  let wasNight = false;
  const now = () => (sim === null ? new Date() : new Date(sim));

  // Local browser time only: morning from 5, afternoon from 12, evening from 17, night from 22.
  const anchors = (): number[] => [5, 12, 17, 22];

  const phaseAt = (d: Date): number => {
    const A = anchors();
    const hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    const pts = [...A, (A[0] ?? 5) + 24];
    const x = hour < (A[0] ?? 5) ? hour + 24 : hour;
    for (let i = 0; i < 4; i++) {
      const a = pts[i] ?? 0;
      const b = pts[i + 1] ?? 0;
      if (x < b) {
        const f = (x - a) / (b - a);
        const k = f < 0.55 ? 0 : (f - 0.55) / 0.45; // hold the look, then blend slowly into the next one

        return i + k * k * (3 - 2 * k);
      }
    }

    return 0;
  };

  let moonUp = false;
  // closing the curtain makes the room as dark as night (same overlay and lamp glow); the lamp it turned on itself goes out again when it opens
  let curtainDark = false;
  let lampByCurtain = false;
  let nightW = 0;
  const shade = () => night.style.setProperty('opacity', (Math.max(nightW, curtainDark ? 1 : 0) * 0.62).toFixed(3));
  const nightMask = () => {
    const lamp = la.querySelector('[data-i="lamp"]');
    night.classList.toggle('lampoff', !lamp?.classList.contains('on'));
  };

  const apply = () => {
    const d = now();
    const pf = phaseAt(d);
    const p = Math.floor(pf) % 4;
    const word = WORD[p] ?? 'evening';
    shared.phase = pf;
    h('phw').textContent = word;
    h('pha').textContent = word;
    h('when').textContent = `${hm(d)} ${word.toUpperCase()}`;
    root.dataset.phase = word;
    const w = pf >= 2 ? Math.max(0, 1 - Math.abs(pf - 3)) : 0;
    nightW = w;
    shade();
    // the moon rises from behind the skyline in the evening and sets behind it toward morning (a plain fade for reduced motion)
    const mk = Math.min(1, w * 1.25);
    const rise = mk * mk * (3 - 2 * mk);
    moonUp = rise > 0.6;
    all('.moon').forEach((n) => (n.style.opacity = reduce ? Math.min(1, w * 1.6).toFixed(3) : '1'));
    if (!reduce) all('.moonrise').forEach((n) => (n.style.transform = `translateY(${((1 - rise) * 240).toFixed(1)}px)`));
    const isNight = w > 0.5;
    if (isNight !== wasNight) {
      wasNight = isNight;
      lampByCurtain = false;
      byI('lamp').forEach((n) => n.classList.toggle('on', isNight));
    }
    nightMask();
    shared.kick();
  };

  // ---------- clock ----------
  const tick = () => {
    const d = now();
    const s = d.getSeconds();
    const m = d.getMinutes() + s / 60;
    const hr = (d.getHours() % 12) + m / 60;
    all('.sh').forEach((n) => (n.style.transform = `rotate(${s * 6}deg)`));
    all('.mh').forEach((n) => (n.style.transform = `rotate(${m * 6}deg)`));
    all('.hh').forEach((n) => (n.style.transform = `rotate(${hr * 30}deg)`));
  };
  const menuTick = () => {
    const t = now().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    all('.menuTime').forEach((n) => (n.textContent = t));
  };
  const tickClock = () => {
    tick();
    menuTick();
  };
  all('.calDay').forEach((n) => (n.textContent = String(new Date().getDate())));

  // Click the wall clock: one whole day passes in 24 seconds.
  const timelapse = () => {
    if (sim !== null || reduce) return;
    sfx('clock-whoosh');
    const start = Date.now();
    const t0 = performance.now();
    const dur = 10000;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      sim = start + k * 864e5;
      apply();
      tickClock();
      if (k < 1) frame(step);
      else {
        sim = null;
        apply();
        tickClock();
      }
    };
    frame(step);
  };

  // ---------- sound effects (the bus lives in the music block below; these are no-ops while sound is off) ----------
  const sfx = (name: string, o?: { rate?: number; volume?: number }) => music.sfx(name, o);
  let keyAt = 0;
  const keySfx = (enter = false, quiet = false) => {
    const t = performance.now();
    if (!enter && t - keyAt < 45) return; // very fast typing must not stack
    keyAt = t;
    if (enter) sfx('key-enter', { volume: quiet ? 0.15 : 0.4 });
    else sfx(`key-${1 + Math.floor(Math.random() * 3)}`, { volume: quiet ? 0.12 : 0.35 });
  };
  // ---------- hint under the stage: typed in, only in Devkitty mode ----------
  const hintLive = h('hint-live');
  const hintSr = h('hint-sr');
  const hintText = hintSr.textContent ?? '';
  let hintRun = 0;
  const showHint = (on: boolean) => {
    const run = ++hintRun;
    hintSr.hidden = !on;
    hintLive.classList.remove('typing');
    hintLive.textContent = '';
    if (!on) return;
    if (reduce) {
      hintLive.textContent = hintText;

      return;
    }
    hintLive.classList.add('typing');
    let n = 0;
    const go = () => {
      if (disposed || run !== hintRun) return;
      n++;
      hintLive.textContent = hintText.slice(0, n);
      if (n < hintText.length) later(go, 25 + Math.random() * 10);
      else hintLive.classList.remove('typing');
    };
    later(go, 25);
  };

  // ---------- wall poster: a tear-off pad, the next sheet is already underneath ----------
  let posterAt = Math.floor(Math.random() * POSTERS.length);
  let posterLast = performance.now();
  let tearing = false;
  const paint = (sheet: Element, p: Poster) => {
    const texts = Array.from(sheet.querySelectorAll(':scope > text'));
    const pic = Boolean(p.art);
    texts.forEach((t, n) => {
      const b = t.querySelector('.before-only');
      const a = t.querySelector('.after-only');
      if (b) b.textContent = p.bw[n] ?? '';
      if (a) a.textContent = p.lit[n] ?? '';
      t.setAttribute('y', String(pic ? [296, 314, 0][n] : [246, 272, 298][n]));
      t.setAttribute('font-size', pic ? '16' : '20');
      t.setAttribute('fill', pic ? (n === 1 ? '#B83A16' : '#1A1220') : n === 2 ? '#B83A16' : '#1A1220');
    });
    const art = sheet.querySelector('.art');
    if (art) art.innerHTML = p.art ?? '';
  };
  const showPoster = () => {
    const cur = POSTERS[posterAt] as Poster;
    const nxt = POSTERS[(posterAt + 1) % POSTERS.length] as Poster;
    all('.poster').forEach((g) => {
      paint(g.querySelector('.sheet.top') as Element, cur);
      paint(g.querySelector('.sheet.under') as Element, nxt);
    });
  };
  const nextPoster = () => {
    if (tearing) return;
    tearing = true;
    posterLast = performance.now();
    sfx('note', { volume: 0.25 });
    const tops = all('.poster .sheet.top');
    const dir = Math.random() < 0.5 ? -1 : 1;
    const ang = 25 + Math.random() * 15;
    const anims = tops.map((t) =>
      reduce
        ? t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease-in' })
        : t.animate(
            [
              { offset: 0, opacity: 1, transform: 'none' },
              { offset: 0.12, transform: `rotate(${-dir * 3}deg)` },
              { offset: 0.24, transform: `rotate(${dir * 3}deg)` },
              { offset: 0.34, opacity: 1, transform: `rotate(${-dir * 2}deg)` },
              {
                offset: 1,
                opacity: 0,
                transform: `translate(${dir * 90}px, 380px) rotate(${dir * ang}deg)`
              }
            ],
            { duration: 1100, easing: 'ease-in' }
          )
    );
    void Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {
      tearing = false;
      if (disposed) return;
      posterAt = (posterAt + 1) % POSTERS.length;
      showPoster();
      anims.forEach((a) => a.cancel());
    });
  };
  showPoster();
  every(() => {
    if (!document.hidden && !zoomPaused && performance.now() - posterLast >= 9000) nextPoster();
  }, 1000);

  // ---------- toys: every one reacts to a click (or tap), never to hover ----------
  const playing: Record<string, boolean> = {};
  const drainTimers: Record<string, number | undefined> = {};

  function bubble(i: string, ms = 1400) {
    byI(i).forEach((n) => n.classList.add('show'));
    cancelLater(drainTimers[i]);
    drainTimers[i] = later(() => byI(i).forEach((n) => n.classList.remove('show')), ms);
  }
  function enter(i: string) {
    if (i === 'mug') {
      all('.mug').forEach((m) => m.classList.add('h', 'empty'));
      cancelLater(drainTimers.m);
      cancelLater(drainTimers.m2);
      all('.spill').forEach((s) => {
        s.classList.remove('drain');
        s.classList.add('spilled', 'pouring');
      });
    } else if (['cat', 'catpic', 'duck', 'plant'].includes(i)) {
      byI(i).forEach((n) => {
        n.classList.remove('h');
        n.classList.add('h');
      });
      if (i === 'duck') bubble(i);
    }
  }
  function leave(i: string) {
    if (i === 'mug') {
      all('.mug').forEach((m) => m.classList.remove('h'));
      all('.spill').forEach((s) => s.classList.remove('pouring'));
      // when the cup stands up, the spill clears and the cup refills
      drainTimers.m = later(() => all('.spill').forEach((s) => s.classList.add('drain')), 300);
      drainTimers.m2 = later(() => {
        all('.spill.drain').forEach((s) => s.classList.remove('spilled', 'drain'));
        all('.mug').forEach((m) => m.classList.remove('empty'));
      }, 1500);
    } else byI(i).forEach((n) => n.classList.remove('h'));
  }
  function play(i: string, ms: number) {
    if (playing[i]) return;
    playing[i] = true;
    const sound = { catpic: 'meow', duck: 'duck', plant: 'plant' }[i];
    if (sound) sfx(sound);
    enter(i);
    later(() => {
      leave(i);
      playing[i] = false;
    }, ms);
  }

  // ---------- typing into the cartoon terminal ----------
  let typed = '';
  let prompt = '$ ';
  let userUntil = 0;
  let outage = false; // the power is out: no typing, no clicks except the dock switch
  let catBusy = false;
  const setTyped = () => {
    all('[data-typed]').forEach((n) => (n.textContent = typed));
    all('[data-prompt]').forEach((n) => (n.textContent = prompt));
  };
  const setReply = (t: string) => {
    all('[data-reply]').forEach((n) => (n.textContent = t));
    all('.replyChip').forEach((n) => n.classList.toggle('on', Boolean(t)));
  };
  const hands = { L: () => all('.armL'), R: () => all('.armR') };
  function tap(n: Element) {
    n.classList.add('tap');
    later(() => n.classList.remove('tap'), 90);
  }
  function flash(k: number) {
    all(`.key[data-k="${k}"]`).forEach((n) => {
      n.classList.add('down');
      later(() => n.classList.remove('down'), 120);
    });
  }
  function pressKey(ch?: string, auto = false) {
    keySfx(ch === 'Enter', auto);
    const left = ch ? LEFT.has(ch.toLowerCase()) : Math.random() < 0.5;
    if (ch === ' ') {
      [36, 37, 38, 39].forEach((k) => flash(k));
      hands.L().forEach(tap);

      return;
    }
    const row = Math.floor(Math.random() * 3);
    const col = left ? 2 + Math.floor(Math.random() * 4) : 7 + Math.floor(Math.random() * 4);
    flash(row * 15 + col);
    (left ? hands.L() : hands.R()).forEach(tap);
  }

  addEventListener(
    'keydown',
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || outage) return;
      if (e.target instanceof Element && e.target.closest('input,textarea,button,a')) return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.key.length === 1 && /[\w\-./ ~?!,']/.test(e.key)) {
        typed = (typed + e.key).slice(-40);
      } else if (e.key === 'Backspace') typed = typed.slice(0, -1);
      else if (e.key === 'Enter') typed = '';
      else return;
      userUntil = performance.now() + 5000;
      setReply('');
      pressKey(e.key);
      setTyped();
    },
    { signal }
  );

  const isLit = () => root.classList.contains('lit');

  // random phrases, never the same one twice in a row
  const lastPick: Record<string, string> = {};
  const pickNew = (list: string[], key: string): string => {
    let v: string;
    do v = list[Math.floor(Math.random() * list.length)] as string;
    while (list.length > 1 && v === lastPick[key]);
    lastPick[key] = v;

    return v;
  };

  // the script: an agent command, then a request; grey goes wrong, Devkitty goes right
  async function typeLine(p: string, line: string, lit: boolean) {
    prompt = p;
    typed = '';
    setTyped();
    for (const ch of line) {
      if (performance.now() < userUntil || outage) return false;
      typed += ch;
      setTyped();
      pressKey(ch, true);
      await wait((lit ? 50 : 105) + Math.random() * (lit ? 60 : 140));
    }
    await wait(380);
    flash(28);
    keySfx(true, true);
    hands.R().forEach(tap); // Enter

    return true;
  }
  async function autoType() {
    let i = 0;
    for (;;) {
      if (document.hidden || zoomPaused || outage || performance.now() < userUntil) {
        await wait(500);
        continue;
      }
      const [cmd, ask, bad, good] = TASKS[i % TASKS.length] as [string, string, string, string];
      let lit = isLit();
      if (!(await typeLine('$ ', cmd, lit))) continue;
      const st = START[cmd] as [string, string];
      setReply(st[lit ? 1 : 0]);
      typed = '';
      setTyped();
      await wait(lit ? 1000 : 1500);
      setReply('');
      lit = isLit();
      if (!(await typeLine('> ', ask, lit))) continue;
      setReply(lit ? good : bad);
      typed = '';
      setTyped();
      await wait(lit ? 1900 : 2400);
      setReply('');
      i++;
    }
  }

  // the cat walks over and takes the keyboard
  async function catTakeover() {
    if (catBusy) return;
    catBusy = true;
    const cats = byI('cat');
    const moves = all('.cat .wmove');
    const T = reduce ? 0 : 2600;
    sfx('meow', { volume: 0.8 });
    music.purr(false);
    userUntil = performance.now() + 60000;
    setReply('');
    prompt = '> ';
    typed = '';
    setTyped();
    // stand up, walk right to the keyboard
    cats.forEach((c) => c.classList.add('awake', 'walking'));
    await wait(reduce ? 0 : 350);
    cats.forEach((c) => c.classList.add('go'));
    moves.forEach((m) => (m.style.transform = 'translate(329px, -20px)')); // scene units / 1.35 scale
    await wait(T);
    // knead the keys
    cats.forEach((c) => {
      c.classList.remove('go');
      c.classList.add('typing');
    });
    const mash = pickNew(CAT_TYPES, 'type');
    for (const ch of mash) {
      typed = (typed + ch).slice(-40);
      setTyped();
      flash(15 * Math.floor(Math.random() * 3) + 9 + Math.floor(Math.random() * 4));
      keySfx();
      await wait(70 + Math.random() * 90);
    }
    cats.forEach((c) => c.classList.remove('typing'));
    setReply('🐾 the cat has taken over this terminal');
    await wait(1800);
    // turn around and walk back
    cats.forEach((c) => c.classList.add('back'));
    await wait(reduce ? 0 : 300);
    cats.forEach((c) => c.classList.add('go'));
    moves.forEach((m) => (m.style.transform = ''));
    await wait(T);
    cats.forEach((c) => c.classList.remove('go', 'back'));
    await wait(reduce ? 0 : 250);
    cats.forEach((c) => c.classList.remove('walking', 'awake'));
    music.purr(true);
    setReply('');
    typed = '';
    setTyped();
    userUntil = 0;
    catBusy = false;
  }

  // first load: the developer walks in, opens the curtain, turns on the lamp if it is dark,
  // wakes the Mac and logs in; then the cat walks in and goes to sleep
  function noAnim(nodes: (HTMLElement | SVGElement)[], fn: () => void) {
    nodes.forEach((n) => (n.style.transition = 'none'));
    fn();
    nodes.forEach((n) => n.getBoundingClientRect());
    nodes.forEach((n) => (n.style.transition = ''));
  }
  function devTo(x: number, ms: number) {
    const devs = byI('dev');
    devs.forEach((d) => {
      d.classList.add('walkin');
      d.style.transition = `transform ${ms}ms ease-in-out`;
      d.style.transform = x ? `translate(${x}px, 0)` : '';
    });

    return iwait(ms).then(() => devs.forEach((d) => d.classList.remove('walkin')));
  }
  async function catWalkIn() {
    catBusy = true;
    const cats = byI('cat');
    const moves = all('.cat .wmove');
    cats.forEach((c) => c.classList.add('awake', 'walking'));
    noAnim(moves, () => moves.forEach((m) => (m.style.transform = 'translate(-330px, 0)')));
    await wait(80);
    cats.forEach((c) => c.classList.add('go'));
    moves.forEach((m) => (m.style.transform = ''));
    await wait(2600);
    cats.forEach((c) => c.classList.remove('go'));
    await wait(400);
    cats.forEach((c) => c.classList.remove('walking', 'awake')); // curls up, zz
    music.purr(true);
    catBusy = false;
  }
  async function intro() {
    const devs = byI('dev');
    const drapes = all('.curtain .drape');
    const lamps = byI('lamp');
    const dark = lamps[0]?.classList.contains('on') ?? false;
    stage.classList.add('intro');
    devs.forEach((d) => d.classList.add('standing'));
    noAnim(devs, () => devs.forEach((d) => (d.style.transform = 'translate(640px, 0)')));
    noAnim(drapes, () => byI('curtain').forEach((c) => c.classList.add('closed')));
    lamps.forEach((l) => l.classList.remove('on'));
    nightMask();
    all('.cat').forEach((c) => c.classList.add('walking')); // keep the sleeping cat hidden until it walks in
    noAnim(all('.cat .wmove'), () => all('.cat .wmove').forEach((m) => (m.style.transform = 'translate(-330px, 0)')));
    prompt = '';
    typed = '';
    setTyped();
    await zoomReady();
    await iwait(500);
    await devTo(-380, 2600); // walk to the window
    await iwait(250);
    byI('curtain').forEach((c) => c.classList.remove('closed'));
    sfx('curtain');
    await iwait(1500);
    await devTo(0, 1500); // back to the desk
    devs.forEach((d) => d.classList.remove('standing')); // sit down
    sfx('sit', { volume: 0.7 });
    await iwait(700);
    devs.forEach((d) => (d.style.transition = ''));
    if (dark) {
      await iwait(300);
      lamps.forEach((l) => l.classList.add('on'));
      sfx('lamp');
      nightMask();
    }
    await iwait(500);
    flash(28); // wake the Mac
    sfx('boot', { volume: 0.7 });
    hands.R().forEach(tap);
    stage.classList.add('boot-login');
    await iwait(1000);
    const pass = all('[data-login-pass]');
    const hint = all('[data-login-hint]');
    await iwait(300);
    hint.forEach((n) => (n.textContent = ''));
    for (let k = 0; k < 8; k++) {
      pass.forEach((n) => (n.textContent += '•'));
      pressKey('x');
      await iwait(90 + Math.random() * 80);
    }
    await iwait(300);
    flash(28); // Enter
    sfx('login');
    hands.R().forEach(tap);
    await iwait(400);
    stage.classList.add('boot-done');
    await iwait(800);
    stage.classList.remove('intro', 'boot-login', 'boot-done');
    prompt = '$ ';
    setTyped();
    void catWalkIn();
  }

  // ---------- music: sad loop in grey, chill loop after the switch ----------
  const music = (() => {
    let ctx: AudioContext | null = null;
    let loading: Promise<unknown> = Promise.resolve();
    let enabled = false;
    let bus: GainNode | null = null;
    const bufs: Record<string, AudioBuffer> = {};
    const purrState: { gain: GainNode | null; src: AudioBufferSourceNode | null; want: boolean } = {
      gain: null,
      src: null,
      want: false
    };
    const gains: Record<string, GainNode> = {};
    const sources: AudioBufferSourceNode[] = [];
    const files: Record<string, string> = { chill: `${BASE}music/chill.mp3`, sad: `${BASE}music/sad.mp3` };
    const level: Record<string, number> = { chill: 0.65, sad: 0.8 };
    const SFX = [
      'meow', 'purr', 'key-1', 'key-2', 'key-3', 'key-enter',
      'mug-tip', 'splash', 'zap', 'curtain', 'lamp', 'clock-whoosh', 'clock-tick', 'plant', 'duck', 'note', 'switch',
      'boot', 'login', 'sit', 'outage'
    ];
    // Sound effects play only with sound on, a running context and a visible, focused tab.
    const canPlay = () =>
      enabled && ctx?.state === 'running' && !document.hidden && document.hasFocus();
    const sfx = (name: string, o: { rate?: number; volume?: number } = {}) => {
      const buf = bufs[name];
      if (!ctx || !bus || !buf || !canPlay()) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = (o.rate ?? 1) * (0.96 + Math.random() * 0.08);
      if (o.volume !== undefined && o.volume !== 1) {
        const g = ctx.createGain();
        g.gain.value = o.volume;
        src.connect(g);
        g.connect(bus);
      } else src.connect(bus);
      src.start();
    };
    const syncPurr = () => {
      if (!ctx || !bus) return;
      const p = purrState;
      if (p.want && canPlay() && !p.src && bufs.purr) {
        const g = ctx.createGain();
        g.gain.value = 0;
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.8);
        g.connect(bus);
        const src = ctx.createBufferSource();
        src.buffer = bufs.purr;
        src.loop = true;
        src.connect(g);
        src.start();
        p.src = src;
        p.gain = g;
      } else if ((!p.want || !enabled) && p.src && p.gain) {
        const { gain, src } = p;
        p.src = null;
        p.gain = null;
        const t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);
        try {
          src.stop(t + 0.45);
        } catch {
          /* already stopped */
        }
      }
    };
    const loadSfx = (c: AudioContext) =>
      Promise.all(
        SFX.map(async (k) => {
          try {
            const buf = await c.decodeAudioData(await (await fetch(`${BASE}sfx/${k}.mp3`)).arrayBuffer());
            if (!disposed) bufs[k] = buf;
          } catch {
            /* no audio: stay silent */
          }
        })
      ).then(syncPurr);
    const label = () => {
      sb.setAttribute('aria-pressed', String(enabled));
      sb.setAttribute('aria-label', enabled ? 'Sound on' : 'Sound off');
    };
    const init = () => {
      if (ctx) return loading;
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return Promise.resolve();
      const c = new AC();
      ctx = c;
      const master = c.createGain();
      master.gain.value = 0.7;
      master.connect(c.destination);
      bus = c.createGain();
      bus.gain.value = 0.6; // separate from the music gains, so crossfades do not touch it
      bus.connect(master);
      c.addEventListener('statechange', syncPurr, { signal });
      void loadSfx(c);
      loading = Promise.all(
        Object.keys(files).map(async (k) => {
          const g = c.createGain();
          g.gain.value = 0;
          g.connect(master);
          gains[k] = g;
          try {
            const buf = await c.decodeAudioData(await (await fetch(files[k] as string)).arrayBuffer());
            if (disposed) return;
            const src = c.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            src.connect(g);
            src.start();
            sources.push(src);
          } catch {
            /* no audio: stay silent */
          }
        })
      );

      return loading;
    };
    const mix = (on: boolean) => {
      if (!ctx) return;
      const t = ctx.currentTime;
      // Mode switch: fade the playing loop out, wait 1 s in silence, then fade the new loop in.
      // Sound just turned on (nothing audible yet): fade in at once.
      const playing = Object.values(gains).some((x) => x.gain.value > 0.01);
      const gap = playing ? 1.8 : 0; // 0.8 s fade out + 1 s silence
      for (const k in gains) {
        const want = enabled && (k === 'chill') === on ? (level[k] ?? 0) : 0;
        const g = (gains[k] as GainNode).gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(g.value, t);
        if (want === 0) g.linearRampToValueAtTime(0, t + 0.8);
        else if (g.value > 0.01) g.linearRampToValueAtTime(want, t + 0.8); // same loop: just adjust
        else {
          g.setValueAtTime(0, t + gap);
          g.linearRampToValueAtTime(want, t + gap + 1.5);
        }
      }
    };
    const set = (v: boolean, on: boolean) => {
      enabled = v;
      try {
        sessionStorage.setItem('devkitty-sound', v ? 'on' : 'off');
      } catch {
        /* storage unavailable */
      }
      if (v) {
        const p = init();
        if (ctx && ctx.state === 'suspended') void ctx.resume();
        void p.then(() => mix(on));
      }
      mix(on);
      syncPurr();
      label();
    };
    sb.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        if (enabled && ctx?.state === 'suspended') {
          void ctx.resume();

          return;
        }
        set(!enabled, state.on);
      },
      { signal }
    );
    // Pause when the tab is hidden or the window loses focus; resume when it is active again.
    const syncFocus = () => {
      if (!ctx) return;
      if (document.hidden || !document.hasFocus()) void ctx.suspend();
      else if (enabled) void ctx.resume();
    };
    document.addEventListener('visibilitychange', syncFocus, { signal });
    window.addEventListener('blur', syncFocus, { signal });
    window.addEventListener('focus', syncFocus, { signal });
    const dispose = () => {
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      if (purrState.src) {
        try {
          purrState.src.stop();
        } catch {
          /* already stopped */
        }
        purrState.src = null;
      }
      if (ctx) void ctx.close().catch(() => {});
      ctx = null;
    };

    return {
      dispose,
      duck: (on: boolean) => {
        if (!ctx) return;
        if (!on) return mix(state.on);
        const t = ctx.currentTime;
        for (const k in gains) {
          const g = (gains[k] as GainNode).gain;
          g.cancelScheduledValues(t);
          g.setValueAtTime(g.value, t);
          g.linearRampToValueAtTime(0, t + 0.3);
        }
      },
      get enabled() {
        return enabled;
      },
      mix,
      purr: (on: boolean) => {
        purrState.want = on;
        syncPurr();
      },
      set,
      sfx
    };
  })();

  // ---------- reveal ----------
  const applyClip = () => {
    la.style.clipPath = `circle(${state.r}px at ${state.cx}px ${state.cy}px)`;
    const m =
      state.r > 0
        ? `radial-gradient(circle ${state.r}px at ${state.cx}px ${state.cy}px, transparent 99%, #000 100%)`
        : 'none';
    lb.style.webkitMaskImage = m;
    lb.style.maskImage = m;
    lb.classList.toggle('gone', state.r >= 1e5);
  };
  const maxR = () => {
    const w = stage.clientWidth;
    const hh = stage.clientHeight;

    return Math.hypot(Math.max(state.cx, w - state.cx), Math.max(state.cy, hh - state.cy)) + 40;
  };
  let lastT = 0;
  function toggle(px?: number, py?: number) {
    if (performance.now() - lastT < 400) return;
    lastT = performance.now();
    const sr = stage.getBoundingClientRect();
    if (px === undefined || py === undefined) {
      const icon = la.querySelector('[data-i="switch"]');
      const ic = (icon ?? stage).getBoundingClientRect();
      px = ic.left + ic.width / 2;
      py = ic.top + ic.height / 2;
    }
    state.cx = px - sr.left;
    state.cy = py - sr.top;
    state.on = !state.on;
    showHint(state.on);
    sfx('switch');
    root.classList.toggle('lit', state.on);
    document.documentElement.dataset.mode = state.on ? 'lit' : 'bw';
    try {
      sessionStorage.setItem('devkitty-mode', state.on ? 'devkitty' : 'bw');
    } catch {
      /* storage unavailable */
    }

    btn.setAttribute('aria-pressed', String(state.on));
    btn.setAttribute('aria-label', state.on ? 'Switch to Terminal' : 'Switch to Devkitty');
    if (state.on && !music.enabled) music.set(true, true);
    else music.mix(state.on);
    const from = state.on ? 0 : maxR();
    const to = state.on ? maxR() : 0;
    if (reduce) {
      state.r = to;
      applyClip();
      shared.kick();

      return;
    }
    const t0 = performance.now();
    const dur = state.on ? 1500 : 900;
    cancelAnimationFrame(state.anim);
    rafs.delete(state.anim);
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      state.r = from + (to - from) * e;
      state.ringA = state.on ? Math.sin(p * Math.PI) : 0;
      applyClip();
      shared.kick();
      if (p < 1) state.anim = frame(step);
      else {
        state.ringA = 0;
        if (state.on) {
          state.r = 1e5;
          applyClip();
        }
      }
    };
    state.anim = frame(step);
  }

  // ---------- shutdown: the power cut (frantic lamp clicking) and the Mac mini switched off share one pair ----------
  // 'power': the room dims, the lamp goes out, the dev swears "#@!%". 'mini': only the Mac goes off, the dev complains.
  let lampClicks: number[] = [];
  const offState = { kind: 'power' as 'mini' | 'power', lampWas: false };
  async function shutdown(kind: 'mini' | 'power') {
    if (outage || stage.classList.contains('intro')) return;
    outage = true;
    offState.kind = kind;
    const lamps = byI('lamp');
    offState.lampWas = lamps[0]?.classList.contains('on') ?? false;
    setReply('');
    typed = '';
    setTyped();
    sfx(kind === 'power' ? 'outage' : 'switch');
    if (kind === 'power') {
      music.duck(true); // the music stops with the power; the Mac mini keeps it playing
      if (!reduce) {
        // the whole room flickers (lamp, screen, room overlay) at modest contrast, never faster than 8 per second
        for (const [on, off] of [[90, 150], [60, 200], [80, 120], [70, 180]] as const) {
          stage.classList.add('flick');
          lamps.forEach((l) => l.classList.remove('on'));
          nightMask();
          await wait(on);
          stage.classList.remove('flick');
          lamps.forEach((l) => l.classList.toggle('on', offState.lampWas));
          nightMask();
          await wait(off);
        }
      }
      lamps.forEach((l) => l.classList.remove('on'));
      nightMask();
    }
    stage.classList.add(kind === 'power' ? 'outage' : 'shutdown');
    byI('dev').forEach((d) => {
      d.classList.add('panic', 'angry');
      d.classList.toggle('hey', kind === 'mini');
    });
    await wait(kind === 'power' ? 3500 : 3000);
    await restore();
  }
  async function restore() {
    const { kind, lampWas } = offState;
    const cls = kind === 'power' ? 'outage' : 'shutdown';
    const pass = all('[data-login-pass]');
    const hint = all('[data-login-hint]');
    const hintText = hint[0]?.textContent || 'Enter Password';
    byI('dev').forEach((d) => d.classList.remove('panic', 'angry', 'hey'));
    if (kind === 'power' && !reduce) {
      // the power flickers back (slow and soft: the same modest contrast)
      for (const [ms, dark] of [[80, false], [90, true], [70, false], [110, true]] as const) {
        stage.classList.toggle(cls, dark);
        await wait(ms);
      }
    }
    if (kind === 'mini') {
      hands.R().forEach(tap); // the dev reaches over and presses the power button
      await wait(reduce ? 0 : 350);
    }
    // the screen stays black while the login layer fades in underneath, so the two never show through each other
    stage.classList.add('rebooting');
    byI('lamp').forEach((l) => l.classList.toggle('on', lampWas));
    nightMask();
    sfx('boot', { volume: 0.7 });
    if (reduce) {
      stage.classList.remove(cls, 'rebooting');
    } else {
      pass.forEach((n) => (n.textContent = ''));
      hint.forEach((n) => (n.textContent = hintText));
      stage.classList.add('intro'); // .boot fades to opaque (its black cover is still on) under the black overlay
      await wait(800);
      stage.classList.remove(cls);
      await wait(150);
      stage.classList.add('boot-login'); // the black fades out to the opaque login screen
      await wait(1000);
      hint.forEach((n) => (n.textContent = ''));
      for (let k = 0; k < 8; k++) {
        pass.forEach((n) => (n.textContent += '•'));
        await wait(45);
      }
      await wait(150);
      sfx('login');
      stage.classList.add('boot-done');
      await wait(900);
      stage.classList.remove('intro', 'boot-login', 'boot-done', 'rebooting');
      pass.forEach((n) => (n.textContent = ''));
      hint.forEach((n) => (n.textContent = hintText));
    }
    if (kind === 'power') later(() => music.duck(false), 1000); // the music fades back in about 1 s after the desktop returns
    outage = false;
  }

  // ---------- easter egg: click the moon, a tiny rocket lands in its eye ----------
  async function moonRocket() {
    if (playing.moon || !moonUp) return;
    playing.moon = true;
    const moons = all('.moon');
    const rockets = all('.moon .rocket');
    if (!reduce) {
      const fly = rockets.map((r) =>
        r.animate(
          [
            { opacity: 1, transform: 'translate(-170px, 120px) rotate(-35deg) scale(2.4)' },
            { opacity: 1, transform: 'translate(16px, -3px) rotate(-35deg) scale(1.3)' }
          ],
          { duration: 900, easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'forwards' }
        )
      );
      await Promise.all(fly.map((a) => a.finished.catch(() => {})));
    }
    if (disposed) return;
    sfx('zap', { volume: 0.25 });
    moons.forEach((m) => m.classList.add('wince'));
    await wait(1000);
    moons.forEach((m) => m.classList.remove('wince'));
    rockets.forEach((r) => r.getAnimations().forEach((a) => a.cancel()));
    playing.moon = false;
  }

  // ---------- lightning outside the window, grey mode only ----------
  let lightningCount = 0;
  const bolt = () => {
    // a jagged path from the top of the window down to the "ground"
    let x = 130 + Math.random() * 260;
    let d = `M${x.toFixed(0)} 60`;
    for (let y = 60; y < 330; y += 28 + Math.random() * 24) {
      x = Math.min(410, Math.max(110, x + (Math.random() - 0.5) * 70));
      d += ` L${x.toFixed(0)} ${(y + 30).toFixed(0)}`;
    }
    all('.boltGlow, .boltCore').forEach((p) => p.setAttribute('d', d));
  };
  const flashOnce = (hold: number) => {
    bolt();
    all('.bolt').forEach((b) => {
      b.setAttribute('opacity', '1');
      later(() => b.setAttribute('opacity', '0'), hold);
    });
    all('.skyflash').forEach((n) => n.animate([{ opacity: 0.7 }, { opacity: 0 }], { duration: 250, easing: 'ease-out' }));
    all('.roomflash').forEach((n) => n.animate([{ opacity: 0.08 }, { opacity: 0 }], { duration: 250, easing: 'ease-out' }));
  };
  const strike = (hold = 120) => {
    if (reduce || isLit()) return;
    lightningCount++;
    root.dataset.lightning = String(lightningCount);
    flashOnce(hold);
    if (Math.random() < 0.4) later(() => !isLit() && flashOnce(hold), hold + 400); // double flash, 3 per second at most
    const cats = byI('cat');
    if (!catBusy) {
      cats.forEach((c) => c.classList.add('h'));
      later(() => cats.forEach((c) => c.classList.remove('h')), 600);
    }
  };
  const nextStrike = () => {
    later(() => {
      if (!document.hidden && !zoomPaused && !outage && !isLit()) strike();
      nextStrike();
    }, 8000 + Math.random() * 12000);
  };
  if (!reduce) nextStrike();
  addEventListener('devkitty:lightning-test', (e) => strike((e as CustomEvent<{ hold?: number }>).detail?.hold), { signal });

  stage.addEventListener(
    'click',
    (e) => {
      if (!(e.target instanceof Element)) return;
      const t = e.target.closest<HTMLElement | SVGElement>('[data-i]');
      if (!t) return;
      const i = t.dataset.i ?? '';
      if (i !== 'switch' && !isLit()) return; // b&w mode: only the switch works
      if (outage && i !== 'switch') return;
      if (i === 'poster') return nextPoster();
      if (i === 'lamp') {
        const t0 = performance.now();
        lampClicks = lampClicks.filter((x) => t0 - x < 2000);
        lampClicks.push(t0);
        if (lampClicks.length >= 5) {
          lampClicks = [];
          void shutdown('power');

          return;
        }
        sfx('lamp');
        lampByCurtain = false;
        byI('lamp').forEach((n) => n.classList.toggle('on'));
        nightMask();
      }
      if (i === 'cat') void catTakeover(); // one click: walk to the keyboard and type
      if (i === 'dev') bubble('dev', 1800);
      if (i === 'mug' && !playing.mug && !la.querySelector('.mug.empty')) {
        play('mug', 2600);
        sfx('mug-tip');
        later(() => sfx('splash'), 300);
        later(() => sfx('zap', { volume: 0.7 }), 1100);
        later(() => byI('dev').forEach((n) => n.classList.add('panic')), 650);
        later(() => byI('dev').forEach((n) => n.classList.remove('panic')), 2700);
      }
      if (i === 'plant') play('plant', 2800);
      if (i === 'mini') void shutdown('mini');
      if (i === 'duck' || i === 'catpic') play(i, 900);
      if (i === 'curtain') {
        sfx('curtain');
        byI('curtain').forEach((n) => n.classList.toggle('closed'));
        curtainDark = Boolean(la.querySelector('.curtain.closed'));
        shade();
        const lamps = byI('lamp');
        const lampOn = lamps[0]?.classList.contains('on') ?? false;
        if (curtainDark && !lampOn) {
          lampByCurtain = true;
          lamps.forEach((n) => n.classList.add('on'));
          sfx('lamp');
        } else if (!curtainDark && lampByCurtain && lampOn && !wasNight) {
          lamps.forEach((n) => n.classList.remove('on'));
        }
        if (!curtainDark) lampByCurtain = false;
        nightMask();
      }
      if (i === 'clock') timelapse();
      if (i === 'moon') void moonRocket();
      if (i === 'switch') {
        const r = t.getBoundingClientRect();
        toggle(r.left + r.width / 2, r.top + r.height / 2);
      }
    },
    { signal }
  );
  btn.addEventListener(
    'click',
    () => toggle(),
    { signal }
  );
  // External switch (palette, monitor zoom): same toggle as the button, only when the mode differs.
  addEventListener(
    HERO_MODE_EVENT,
    (e) => {
      if ((e as CustomEvent<{ lit: boolean }>).detail.lit !== state.on) toggle();
    },
    { signal }
  );
  addEventListener(
    'resize',
    () => {
      if (state.on) {
        state.r = 1e5;
        applyClip();
      }
    },
    { signal }
  );

  // ---------- start ----------
  if (saved === 'devkitty') {
    state.on = true;
    state.r = 1e5;
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Switch to Terminal');
    music.mix(true);
    showHint(true);
  }
  // Sound was on last time. Browsers block autoplay, so start at the first click or key press.
  let soundSaved: null | string = null;
  try {
    soundSaved = sessionStorage.getItem('devkitty-sound');
  } catch {
    /* storage unavailable */
  }
  // Devkitty mode always plays music (the switch turns it on), unless the visitor turned sound off.
  if (soundSaved === 'on' || (saved === 'devkitty' && soundSaved !== 'off')) {
    music.set(true, state.on); // plays now if the browser allows autoplay
    const kinds = ['pointerdown', 'keydown'] as const;
    const startSound = (e: Event) => {
      kinds.forEach((k) => window.removeEventListener(k, startSound, true));
      if (e.target instanceof Element && sb.contains(e.target)) return; // the sound button handles its own click
      if (music.enabled) music.set(true, state.on); // resumes a blocked AudioContext inside the gesture
    };
    kinds.forEach((k) => window.addEventListener(k, startSound, { capture: true, signal }));
  }
  apply();
  every(() => {
    if (sim === null) apply();
  }, 60000);
  tickClock();
  every(() => {
    tickClock();
    if (sim !== null) sfx('clock-tick', { volume: 0.12 });
  }, 1000);
  nightMask();
  applyClip();
  if (!reduce) void intro().then(autoType);
  else {
    music.purr(true); // no intro: the cat is already asleep
    prompt = '> ';
    typed = TASKS[0]?.[1] ?? '';
    setTyped();
  }

  // three.js loads after window `load`, in its own chunk
  let stopShaders: (() => void) | undefined;
  const loadShaders = () => {
    if (disposed) return;
    void import('./heroShaders')
      .then((m) => {
        if (disposed) return;
        stopShaders = m.mountShaders(shared);
      })
      .catch(() => {
        shared.fallback.hidden = false;
        shared.sky.hidden = true;
        shared.ring.hidden = true;
      });
  };
  if (document.readyState === 'complete') later(loadShaders, 0);
  else addEventListener('load', loadShaders, { once: true, signal });

  return () => {
    disposed = true;
    ac.abort();
    timers.forEach((id) => clearTimeout(id));
    intervals.forEach((id) => clearInterval(id));
    rafs.forEach((id) => cancelAnimationFrame(id));
    timers.clear();
    intervals.clear();
    rafs.clear();
    stopShaders?.();
    music.dispose();
    lb.innerHTML = '';
    la.innerHTML = '';
    lb.style.cssText = '';
    la.style.cssText = '';
    root.classList.remove('lit');
    shared.kick = () => {};
  };
}
