import { type CSSProperties, type FC, Fragment, type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLatestRelease } from '../../lib/latestRelease';
import { isHeroLit, setHeroMode } from '../Hero/heroMode';
import { getMonitorScreenRect } from '../Hero/monitorRect';
import { type ZoomProgram } from './programs';
import './features.css';

const ZOOM_MS = 900;
const OVERLAY_DELAY_MS = 450;
const OUT_MS = 320;
/** Time the hero's reveal gets to show before the zoom starts. */
const HERO_SWITCH_MS = 1100;

type Phase = 'in' | 'open' | 'out';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const stageEl = () => document.querySelector<HTMLElement>('[data-hero-stage]');

function unzoomStage(stage: HTMLElement) {
  stage.style.transition = `transform ${ZOOM_MS - 100}ms cubic-bezier(0.65, 0, 0.35, 1)`;
  stage.style.transform = '';
  window.setTimeout(() => {
    stage.style.transition = '';
    stage.style.transformOrigin = '';
    stage.style.willChange = '';
  }, ZOOM_MS);
}

/** Scale the hero stage toward the monitor screen (or the viewport centre when it is missing). */
function zoomStage(stage: HTMLElement, rect: DOMRect | null) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const box = stage.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width / 2 : vw / 2;
  const cy = rect ? rect.top + rect.height / 2 : vh / 2;
  const scale = rect ? Math.max(vw / rect.width, vh / rect.height) : 2.4;
  stage.style.transformOrigin = `${cx - box.left}px ${cy - box.top}px`;
  stage.style.transition = `transform ${ZOOM_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
  stage.style.willChange = 'transform';
  document.documentElement.dataset.zoomed = '';
  void stage.offsetWidth;
  stage.style.transform = `translate(${vw / 2 - cx}px, ${vh / 2 - cy}px) scale(${scale})`;
}

/** The hero's timed loops (poster cycle, auto-typing) idle while the zoom covers it. */
const heroEvent = (name: 'pause' | 'resume') => window.dispatchEvent(new Event(`devkitty:hero-${name}`));

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const SIDE_DOTS = { changelog: '#BF5AF2', download: '#FF6A3D', extensions: '#FFB020', features: '#FF6A3D', home: '#5AA9E6', privacy: '#28C840', terms: '#28C840' };


/** Green window button: full screen for the whole page where the browser allows it (not on iPhone). */
const toggleFullScreen = () => {
  const doc = document;
  if (doc.fullscreenElement) void doc.exitFullscreen().catch(() => {});
  else if (doc.documentElement.requestFullscreen) void doc.documentElement.requestFullscreen().catch(() => {});
};

/** `#extensions` or `#extensions/<id>`: the program that owns the hash, and the row to select (if any). */
const parseHash = (programs: ZoomProgram[], h: string) => {
  const [base, id] = h.split('/');
  const program = programs.find((p) => p.hash === base);

  return program ? { id: id ? decodeURIComponent(id) : null, program } : undefined;
};

export const MonitorZoom: FC<{ programs: ZoomProgram[] }> = ({ programs }) => {
  const [activeName, setActiveName] = useState(programs[0].name);
  const program = programs.find((p) => p.name === activeName) ?? programs[0];
  const { hash, listCommand: command, name, rows, showCommand } = program;
  const { zipUrl } = useLatestRelease();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('in');
  const [from, setFrom] = useState<DOMRect | null>(null);
  const [typed, setTyped] = useState('');
  const [stage, setStage] = useState<'enter' | 'printing' | 'ready' | 'typing'>('typing');
  const [printed, setPrinted] = useState(0);
  const [shown, setShown] = useState<null | string>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const busyRef = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const loadedWithHashRef = useRef(false);
  const stageDirtyRef = useRef(false);
  const resumeTimerRef = useRef<number>(0);
  /** Row a deep link or palette action asked for; used once when the list has printed, else the first row. */
  const wantedRef = useRef<null | string>(null);

  const finishClose = useCallback(() => {
    setMounted(false);
    openRef.current = false;
    busyRef.current = false;
    document.documentElement.style.overflow = '';
    delete document.documentElement.dataset.zoomed;
    document.getElementById('root')?.removeAttribute('inert');
    // Resume once the un-zoom has settled, so the hero's loops do not compete with it.
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => heroEvent('resume'), reducedMotion() ? 0 : ZOOM_MS);
    const opener = openerRef.current;
    // A fragment jump to an in-page section (`#extensions`) leaves focus on <body>; that is not a place to return to.
    const usable = opener && opener !== document.body && document.contains(opener);
    const target = usable ? opener : document.querySelector<HTMLElement>(`a[href="/${hash}"]`);
    target?.focus({ preventScroll: true });
  }, [hash]);

  const close = useCallback(
    async (fromHistory: boolean) => {
      if (!openRef.current || busyRef.current) return;
      busyRef.current = true;

      if (!fromHistory && parseHash(programs, window.location.hash)) {
        // Same-page entry we pushed (or the load entry): drop the hash without leaving a dead entry behind.
        if (loadedWithHashRef.current) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          loadedWithHashRef.current = false;
        } else {
          window.history.back();
        }
      }

      const el = stageEl();
      if (reducedMotion()) {
        if (el && stageDirtyRef.current) {
          el.style.transition = '';
          el.style.transform = '';
          el.style.transformOrigin = '';
        }
        stageDirtyRef.current = false;
        finishClose();

        return;
      }

      setPhase('out');
      if (el && stageDirtyRef.current) unzoomStage(el);
      stageDirtyRef.current = false;
      await sleep(OUT_MS);
      finishClose();
    },
    [finishClose, programs]
  );

  const open = useCallback(async () => {
    if (openRef.current) return;
    openRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
    heroEvent('pause');
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setTyped('');
    setPrinted(0);
    setShown(null);
    setStage('typing');
    setPhase('in');

    if (reducedMotion()) {
      setFrom(null);
      document.documentElement.style.overflow = 'hidden';
      document.getElementById('root')?.setAttribute('inert', '');
      setMounted(true);
      requestAnimationFrame(() => setPhase('open'));

      return;
    }

    window.scrollTo({ behavior: 'instant', top: 0 });

    // The zoom lands on the lit (Devkitty) monitor: switch the hero first, as the switch button does.
    if (!isHeroLit() && setHeroMode(true)) {
      await sleep(HERO_SWITCH_MS);
      if (!openRef.current) return;
    }

    const el = stageEl();
    if (el) {
      zoomStage(el, getMonitorScreenRect());
      stageDirtyRef.current = true;
    }

    await sleep(OVERLAY_DELAY_MS);
    if (!openRef.current) return;
    setFrom(getMonitorScreenRect());
    document.documentElement.style.overflow = 'hidden';
    document.getElementById('root')?.setAttribute('inert', '');
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
  }, []);

  /** Show another program in the open window: reset the terminal, keep the history entry. */
  const switchProgram = useCallback((next: ZoomProgram) => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search + next.hash);
    setTyped('');
    setPrinted(0);
    setShown(null);
    setStage('typing');
    setActiveName(next.name);
  }, []);

  // Triggers: hash (load + hashchange), the palette event, and browser Back.
  useEffect(() => {
    const byHash = () => parseHash(programs, window.location.hash);
    const initial = byHash();
    if (initial) {
      loadedWithHashRef.current = true;
      wantedRef.current = initial.id;
      setActiveName(initial.program.name);
      void open();
    }

    const onHash = () => {
      const target = byHash();
      if (!target) {
        void close(true);
      } else if (openRef.current) {
        wantedRef.current = target.id;
        setActiveName((cur) => {
          if (cur !== target.program.name) {
            setTyped('');
            setPrinted(0);
            setShown(null);
            setStage('typing');
          }

          return target.program.name;
        });
      } else {
        wantedRef.current = target.id;
        setActiveName(target.program.name);
        void open();
      }
    };
    const handlers = programs.map((p) => {
      const handler = (e: Event) => {
        if (openRef.current) return;
        const id = (e as CustomEvent<undefined | { id?: string }>).detail?.id ?? null;
        wantedRef.current = id;
        setActiveName(p.name);
        window.history.pushState(null, '', window.location.pathname + window.location.search + p.hash + (id ? `/${encodeURIComponent(id)}` : ''));
        void open();
      };
      window.addEventListener(p.openEvent, handler);

      return [p.openEvent, handler] as const;
    });

    window.addEventListener('hashchange', onHash);

    return () => {
      window.removeEventListener('hashchange', onHash);
      handlers.forEach(([event, handler]) => window.removeEventListener(event, handler));
    };
  }, [close, open, programs]);

  // Esc closes.
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void close(false);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [close, mounted]);

  // Focus the dialog on mount.
  useEffect(() => {
    if (mounted) dialogRef.current?.focus({ preventScroll: true });
  }, [mounted]);

  // The terminal script: type, press Enter, print the rows.
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    // An unknown id falls back to the first row.
    const pickRow = () => {
      const wanted = wantedRef.current;
      wantedRef.current = null;

      return rows.find((x) => x.id === wanted)?.id ?? rows[0].id;
    };

    const run = async () => {
      if (reducedMotion()) {
        setTyped(command);
        setPrinted(rows.length);
        setShown(pickRow());
        setStage('ready');

        return;
      }

      await sleep(260);
      for (let i = 1; i <= command.length && !cancelled; i += 1) {
        setTyped(command.slice(0, i));
        await sleep(command[i - 1] === ' ' ? 110 : 38 + ((i * 37) % 36));
      }
      if (cancelled) return;
      setStage('enter');
      await sleep(260);
      setStage('printing');
      for (let i = 1; i <= rows.length && !cancelled; i += 1) {
        setPrinted(i);
        await sleep(85);
      }
      if (cancelled) return;
      setStage('ready');
      setShown(pickRow());
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [command, mounted, rows]);

  const focusRow = (index: number) => {
    const rows = dialogRef.current?.querySelectorAll<HTMLButtonElement>('[data-zoom-row]');
    const row = rows?.[(index + rows.length) % rows.length];
    row?.focus();
    if (row?.dataset.zoomRow) setShown(row.dataset.zoomRow);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (nodes.length === 0) return;
      const [first] = nodes;
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }

      return;
    }

    if (stage !== 'ready' || (e.target instanceof HTMLElement && e.target.closest('.fz-side'))) return;
    const current = rows.findIndex((r) => r.id === shown);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusRow(current + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      focusRow(e.key === 'Home' ? 0 : rows.length - 1);
    }
  };

  if (!mounted) return null;

  const row = rows.find((r) => r.id === shown) ?? null;
  const style = from
    ? {
        '--fs': String(Math.max(from.width / window.innerWidth, from.height / window.innerHeight)),
        '--fx': `${from.left + from.width / 2 - window.innerWidth / 2}px`,
        '--fy': `${from.top + from.height / 2 - window.innerHeight / 2}px`
      }
    : { '--fs': '0.6', '--fx': '0px', '--fy': '0px' };

  return createPortal(
    <div
      aria-labelledby={`${name}-title`}
      aria-modal='true'
      className='fz'
      data-phase={phase}
      onKeyDown={onKeyDown}
      ref={dialogRef}
      role='dialog'
      style={style as CSSProperties}
      tabIndex={-1}
    >
      <div className='fz-bar'>
        {/* macOS window buttons: close and minimize go back home (like Back/Esc); zoom toggles full screen. */}
        <div className='fz-lights'>
          <button
            aria-label='Close'
            className='fz-light fz-light-close'
            onClick={() => void close(false)}
            type='button'
          >
            <span aria-hidden='true'>×</span>
          </button>

          <button
            aria-label='Minimize'
            className='fz-light fz-light-min'
            onClick={() => void close(false)}
            type='button'
          >
            <span aria-hidden='true'>−</span>
          </button>

          <button
            aria-label='Full screen'
            className='fz-light fz-light-zoom'
            onClick={toggleFullScreen}
            type='button'
          >
            <span aria-hidden='true'>⤢</span>
          </button>
        </div>

        <button
          className='fz-back'
          onClick={() => void close(false)}
          type='button'
        >
          <span aria-hidden='true'>←</span> Back
        </button>

        <div
          aria-hidden='true'
          className='fz-tabs'
        >
          <span className='fz-tab fz-tab-on'>&gt;_ {name}</span>
          <span className='fz-tab'>&gt;_ agent</span>
          <span className='fz-tab'>&gt;_ api</span>
        </div>

        <h2
          className='fz-title'
          id={`${name}-title`}
        >
          {program.title}
        </h2>
      </div>

      <div className='fz-body'>
        <nav
          aria-label='Site'
          className='fz-side'
        >
          <button
            className='fz-side-item'
            onClick={() => void close(false)}
            type='button'
          >
            <i style={{ background: SIDE_DOTS.home }} />
            <span>home</span>
          </button>

          {programs.map((p) => (
            <button
              aria-current={p.name === name ? 'page' : undefined}
              className='fz-side-item'
              key={p.name}
              onClick={() => p.name !== name && switchProgram(p)}
              type='button'
            >
              <i style={{ background: SIDE_DOTS[p.name as keyof typeof SIDE_DOTS] ?? SIDE_DOTS.features }} />
              <span>{p.name}</span>
            </button>
          ))}

          <a
            className='fz-side-item'
            href='/privacy/'
          >
            <i style={{ background: SIDE_DOTS.privacy }} />
            <span>privacy</span>
          </a>

          <a
            className='fz-side-item'
            href='/terms/'
          >
            <i style={{ background: SIDE_DOTS.terms }} />
            <span>terms</span>
          </a>

          <a
            className='fz-side-item'
            data-download-link
            href={zipUrl}
          >
            <i style={{ background: SIDE_DOTS.download }} />
            <span>download</span>
          </a>
        </nav>

        <section
          aria-label='Terminal'
          className='fz-term'
        >
          <div className='fz-scroll'>
            <p className='fz-cwd'>~/code/orbit-web on main</p>

            <p className='fz-line'>
              <span className='fz-prompt'>$ </span>
              {typed}
              {stage === 'typing' || stage === 'enter' ? <span className='fz-cursor'>▍</span> : null}
            </p>

            {printed > 0 ? (
              <div
                aria-label={name}
                className='fz-list'
                role='group'
              >
                {rows.slice(0, printed).map((f) => (
                  <button
                    aria-current={shown === f.id ? 'true' : undefined}
                    className='fz-row'
                    data-zoom-row={f.id}
                    disabled={stage !== 'ready'}
                    key={f.id}
                    onClick={() => setShown(f.id)}
                    tabIndex={stage === 'ready' && (shown === f.id || (shown === null && f === rows[0])) ? 0 : -1}
                    type='button'
                  >
                    <span
                      aria-hidden='true'
                      className='fz-caret'
                    >
                      ▸
                    </span>

                    <span className='fz-id'>{f.id}</span>
                    <span className='fz-sum'>{f.summary}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {stage === 'ready' ? <p className='fz-hint'>↑ ↓ to move · ↵ to run · esc to go back</p> : null}

            {row ? (
              <div
                aria-live='polite'
                className='fz-show'
              >
                <p className='fz-line'>
                  <span className='fz-prompt'>$ </span>{showCommand} {row.id}
                </p>

                {program.details?.(row.id).map((d) =>
                  typeof d === 'string' ? (
                    <p
                      className={d.startsWith('## ') ? 'fz-detail fz-detail-dim' : 'fz-detail'}
                      key={d}
                    >
                      {d}
                    </p>
                  ) : 'dim' in d ? (
                    <p
                      className='fz-detail fz-detail-dim'
                      key={d.dim}
                    >
                      {d.dim}
                    </p>
                  ) : (
                    <a
                      className='fz-detail-link'
                      href={d.href}
                      key={d.href}
                    >
                      {d.text}
                    </a>
                  )
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section
          aria-label='Preview'
          className='fz-preview'
        >
          <div className='fz-scroll'>
            {row ? (
              <Fragment key={row.id}>
                <p className='fz-line'>
                  <span className='fz-prompt'>$ </span>devkitty {name} preview {row.id}
                </p>

                {program.renderPreview(row.id)}
              </Fragment>
            ) : null}
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
};

