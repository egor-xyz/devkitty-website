/* eslint-disable react-refresh/only-export-components -- demos are looked up by id, not rendered as route components */
import { type CSSProperties, type FC, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

import { getExtension } from '../../lib/extensions';
import { SingleTab, WindowFrame } from './FeaturePreview';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs `fn` every `ms` until unmount. Does nothing with reduced motion, so the demo stays in its static state. */
const useTick = (ms: number, fn: () => void) => {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => ref.current(), ms);

    return () => window.clearInterval(id);
  }, [ms]);
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ───────── quick-terminal ───────── */

const QUICK_TABS = ['quick', 'notes'];

const QuickTerminalDemo: FC = () => {
  const [open, setOpen] = useState(() => reducedMotion());
  const [tab, setTab] = useState('quick');
  const touched = useRef(false);

  useTick(2600, () => {
    if (!touched.current) setOpen((o) => !o);
  });

  return (
    <WindowFrame strip={<SingleTab name='agent' />}>
      <p className='fz-win-dim'>sample data · press the shortcut</p>

      <div
        className='fz-qt'
        data-open={open ? 'true' : 'false'}
      >
        <div className='fz-qt-work'>
          <p>$ agent</p>
          <p>&gt; reading the diff</p>

          <button
            aria-pressed={open}
            className='fz-kbd'
            onClick={() => {
              touched.current = true;
              setOpen((o) => !o);
            }}
            type='button'
          >
            Control-Option-`
          </button>
        </div>

        <div
          aria-hidden='true'
          className='fz-qt-dim'
          onClick={() => {
            touched.current = true;
            setOpen(false);
          }}
        />

        <div
          className='fz-qt-panel'
          inert={!open}
        >
          <div className='fz-qt-tabs'>
            {QUICK_TABS.map((t) => (
              <button
                aria-pressed={tab === t}
                className={`fz-gtab${tab === t ? ' fz-gtab-on' : ''}`}
                key={t}
                onClick={() => setTab(t)}
                type='button'
              >
                &gt;_ {t}
              </button>
            ))}

            <button
              aria-label='Close quick terminal'
              className='fz-qt-close'
              onClick={() => {
                touched.current = true;
                setOpen(false);
              }}
              type='button'
            >
              ×
            </button>
          </div>

          <p>{tab === 'quick' ? '$ git status' : '$ cat todo.txt'}</p>
          <p>{tab === 'quick' ? 'On branch main' : 'sample notes'}</p>
        </div>
      </div>
    </WindowFrame>
  );
};

/* ───────── image-cropper ───────── */

type Crop = { h: number; w: number; x: number; y: number };
const SAMPLE_W = 2880;
const SAMPLE_H = 1800;
const MIN = 15;

const CORNERS = [
  { l: true, t: true },
  { l: false, t: true },
  { l: true, t: false },
  { l: false, t: false }
] as const;

const ImageCropperDemo: FC = () => {
  const [crop, setCrop] = useState<Crop>({ h: 60, w: 64, x: 18, y: 16 });
  const frameRef = useRef<HTMLDivElement>(null);

  const drag = (corner: (typeof CORNERS)[number]) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const px = clamp(((ev.clientX - r.left) / r.width) * 100, 0, 100);
      const py = clamp(((ev.clientY - r.top) / r.height) * 100, 0, 100);
      setCrop((c) => {
        const right = c.x + c.w;
        const bottom = c.y + c.h;
        const x = corner.l ? Math.min(px, right - MIN) : c.x;
        const y = corner.t ? Math.min(py, bottom - MIN) : c.y;
        const nr = corner.l ? right : Math.max(px, c.x + MIN);
        const nb = corner.t ? bottom : Math.max(py, c.y + MIN);

        return { h: nb - y, w: nr - x, x, y };
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const w = Math.round((crop.w / 100) * SAMPLE_W);
  const h = Math.round((crop.h / 100) * SAMPLE_H);

  return (
    <WindowFrame strip={<SingleTab name='agent' />}>
      <p className='fz-win-dim'>sample data · drag the handles</p>

      <div
        className='fz-crop'
        ref={frameRef}
      >
        <div
          aria-hidden='true'
          className='fz-crop-art'
        >
          <i />
          <i />
          <i />
        </div>

        <div
          className='fz-crop-box'
          data-crop={`${w}x${h}`}
          style={{ height: `${crop.h}%`, left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%` }}
        >
          {CORNERS.map((c) => (
            <button
              aria-label={`Crop handle ${c.t ? 'top' : 'bottom'} ${c.l ? 'left' : 'right'}`}
              className='fz-crop-h'
              key={`${c.t}${c.l}`}
              onPointerDown={drag(c)}
              style={{ [c.l ? 'left' : 'right']: -6, [c.t ? 'top' : 'bottom']: -6 } as CSSProperties}
              type='button'
            />
          ))}
        </div>
      </div>

      <p className='fz-crop-read'>
        Resized before paste (sample): {SAMPLE_W}×{SAMPLE_H} → <b>{`${w}×${h}`}</b>
      </p>

      <p className='fz-win-note'>The original file is left untouched.</p>
    </WindowFrame>
  );
};

/* ───────── real renders of the app's own views (sample data) ───────── */

type RealShot = { alt: string; height: number; id: string; src: string; width: number };

/** Real renders stacked in one cell and crossfaded. Natural CSS size (pixels / 2), capped to the pane, never upscaled. */
const RealStack: FC<{ active: string; shots: RealShot[] }> = ({ active, shots }) => (
  <div className='fz-real'>
    {shots.map((s) => (
      <img
        alt={s.alt}
        aria-hidden={s.id !== active}
        data-on={s.id === active}
        decoding='async'
        height={s.height / 2}
        key={s.id}
        src={s.src}
        style={{ maxWidth: `min(100%, ${s.width / 2}px)` }}
        width={s.width / 2}
      />
    ))}
  </div>
);

const toRealShots = (id: string, ids: string[]): RealShot[] => {
  const e = getExtension(id);

  return ids.flatMap((shotId, i) => {
    const s = e?.screenshots[i];

    return s ? [{ alt: s.alt, height: s.height, id: shotId, src: s.src, width: s.width }] : [];
  });
};

/* system-health */

const MODES = ['Simple', 'Sport', 'Ultra'] as const;
type Mode = (typeof MODES)[number];

const SystemHealthDemo: FC = () => {
  const [mode, setMode] = useState<Mode>('Ultra');
  // JSON order is Ultra, Sport, Simple (the extension page leads with Ultra).
  const shots = toRealShots('system-health', ['Ultra', 'Sport', 'Simple']);

  return (
    <WindowFrame strip={<SingleTab name='agent' />}>
      <p className='fz-win-dim'>sample data · pick a mode</p>

      <div
        aria-label='Presentation'
        className='fz-seg'
        role='group'
      >
        {MODES.map((x) => (
          <button
            aria-pressed={mode === x}
            key={x}
            onClick={() => setMode(x)}
            type='button'
          >
            {x}
          </button>
        ))}
      </div>

      <RealStack
        active={mode}
        shots={shots}
      />
    </WindowFrame>
  );
};

/* agents-widget */

const AgentsWidgetDemo: FC = () => {
  const [shot] = toRealShots('agents-widget', ['agents']);

  return (
    <WindowFrame strip={<SingleTab name='agent' />}>
      <div className='fz-term-dim'>
        <p>$ claude</p>
        <p>&gt; reading the diff</p>
        <p>&gt; running the tests</p>
        <p>&gt; 42 passed</p>
      </div>

      <div className='fz-float'>
        <RealStack
          active='agents'
          shots={[shot]}
        />
      </div>
    </WindowFrame>
  );
};

/* pull-requests */

const PR_VIEWS = [
  { id: '128', label: '#128 ready' },
  { id: '131', label: '#131 draft' }
];

const PullRequestsDemo: FC = () => {
  const [pr, setPr] = useState('128');
  const shots = toRealShots('pull-requests', PR_VIEWS.map((v) => v.id));

  return (
    <WindowFrame strip={<SingleTab name='agent' />}>
      <div className='fz-pr-bar'>
        <span className='fz-tool'>⑂ Pull Requests</span>

        <div
          aria-label='Pull request'
          className='fz-seg'
          role='group'
        >
          {PR_VIEWS.map((v) => (
            <button
              aria-pressed={pr === v.id}
              key={v.id}
              onClick={() => setPr(v.id)}
              type='button'
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <RealStack
        active={pr}
        shots={shots}
      />
    </WindowFrame>
  );
};

export const EXTENSION_DEMOS: Partial<Record<string, FC>> = {
  'agents-widget': AgentsWidgetDemo,
  'image-cropper': ImageCropperDemo,
  'pull-requests': PullRequestsDemo,
  'quick-terminal': QuickTerminalDemo,
  'system-health': SystemHealthDemo
};
