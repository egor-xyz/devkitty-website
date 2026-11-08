import { type CSSProperties, type FC, type ReactNode, useEffect, useRef, useState } from 'react';

import { type ReleaseNote } from '../../lib/releases';
import { ExtensionIcon } from '../Extensions/ExtensionIcon';
import { type Feature } from './features';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A full Devkitty window: title bar with traffic lights, a tab strip and a terminal body. */
export const WindowFrame: FC<{ children: ReactNode; strip: ReactNode }> = ({ children, strip }) => (
  <div className='fz-win'>
    <div
      aria-hidden='true'
      className='fz-win-bar'
    >
      <span className='fz-lights'>
        <i style={{ background: '#FF5F57' }} />
        <i style={{ background: '#FEBC2E' }} />
        <i style={{ background: '#28C840' }} />
      </span>

      <span>Devkitty</span>
    </div>

    <div className='fz-win-strip'>{strip}</div>
    <div className='fz-win-body'>{children}</div>
  </div>
);

export const SingleTab: FC<{ name: string }> = ({ name }) => (
  <>
    <span className='fz-gtab fz-gtab-on'>&gt;_ {name}</span>
    <span className='fz-gtab'>&gt;_ shell</span>
  </>
);

export const FeaturePreview: FC<{ feature: Feature }> = ({ feature }) => {
  const p = feature.preview;

  if (p.kind === 'shot') {
    return (
      <ShotPreview
        alt={p.alt}
        height={p.height}
        src={`/shots/${p.name}-dark.webp`}
        width={p.width}
      />
    );
  }

  if (p.kind === 'text') {
    return (
      <WindowFrame strip={<SingleTab name={feature.id} />}>
        <p className='fz-win-dim'>sample output</p>

        <dl>
          {p.lines.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </WindowFrame>
    );
  }

  if (p.kind === 'mock') return p.mock === 'browser' ? <BrowserMock /> : <RailMock />;

  return <TabGroupsDemo />;
};

/** A browser tab in the window: URL bar and a plain sample page. */
const BrowserMock: FC = () => (
  <WindowFrame
    strip={
      <>
        <span className='fz-gtab fz-gtab-on'>◌ localhost</span>
        <span className='fz-gtab'>&gt;_ shell</span>
      </>
    }
  >
    <div className='fz-url'>
      <span>‹</span>
      <span>›</span>
      <span className='fz-url-field'>http://localhost:3000/checkout</span>
      <span>☆</span>
    </div>

    <p className='fz-win-dim'>sample page</p>
    <p className='fz-win-name'>Checkout</p>
    <p>Your cart · 2 items</p>
    <p className='fz-win-btn'>Pay now</p>
  </WindowFrame>
);

const RAIL_TABS = [
  { dot: '#28C840', label: 'agent', on: true },
  { dot: '#FEBC2E', label: 'api', progress: 62 },
  { dot: '#5AA9E6', label: 'dev' },
  { dot: '#8A7A86', label: 'zsh' }
];

/** The compact sidebar: a narrow rail of tab icons, status dots and progress, next to a terminal. */
const RailMock: FC = () => (
  <WindowFrame strip={<SingleTab name='agent' />}>
    <div className='fz-rail-wrap'>
      <div
        aria-hidden='true'
        className='fz-rail'
      >
        {RAIL_TABS.map((t) => (
          <div
            className={`fz-rail-tab${t.on ? ' fz-rail-on' : ''}`}
            key={t.label}
          >
            <span>&gt;_</span>
            <i style={{ background: t.dot }} />
            {t.progress ? <b style={{ width: `${t.progress}%` }} /> : null}
          </div>
        ))}
      </div>

      <div>
        <p className='fz-win-dim'>sample output</p>
        <p>$ agent</p>
        <p>&gt; reading the diff</p>
      </div>
    </div>
  </WindowFrame>
);

/** Right pane of an extension that has no screenshot: the same window frame, with its icon, name and tagline. */
export const IconPreview: FC<{ icon: string; id: string; name: string; tagline: string }> = ({ icon, id, name, tagline }) => (
  <WindowFrame strip={<SingleTab name={id} />}>
    <div className='fz-win-icon'>
      <ExtensionIcon
        size={88}
        src={icon}
      />

      <p className='fz-win-name'>{name}</p>
      <p>{tagline}</p>
    </div>
  </WindowFrame>
);

/** Right pane of a changelog row: a full window with that release's items and date. Release data only. */
export const ChangelogPreview: FC<{ note: ReleaseNote }> = ({ note }) => (
  <WindowFrame strip={<SingleTab name='changelog' />}>
    <p className='fz-win-dim'>{`${note.date.slice(0, 10)} · version ${note.version}`}</p>
    <p className='fz-win-name'>{`What's new · build ${note.build}`}</p>

    <ul className='fz-win-list'>
      {note.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </WindowFrame>
);

export const ShotPreview: FC<{ alt: string; height: number; src: string; width: number }> = ({ alt, height, src, width }) => (
  <img
    alt={alt}
    className='fz-shot'
    decoding='async'
    height={height}
    src={src}
    width={width}
  />
);

const GROUPS = [
  { color: '#5AA9E6', ink: '#0B2540', name: 'Release 2.4', tabs: ['agent', 'go test'] },
  { color: '#BF5AF2', ink: '#2A0B3A', name: 'Mobile', tabs: ['api', 'sync'] }
];

const LOOSE_TAB = 'zsh';

/** Placeholder terminal text per tab, labelled as sample output. */
const TAB_LINES: Record<string, string[]> = {
  agent: ['$ agent', '> reading the diff'],
  api: ['$ pnpm dev', 'ready on localhost:3000'],
  'go test': ['$ go test ./...', 'ok  orbit/api  0.42s'],
  [LOOSE_TAB]: ['$ '],
  sync: ['$ pnpm sync', 'watching for changes']
};

/** Live demo of tab groups in a full window: click a chip to collapse or open its group, click a tab to switch. */
const TabGroupsDemo: FC = () => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState('agent');
  const touched = useRef(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      setCollapsed((c) => ({ ...c, 'Release 2.4': !c['Release 2.4'] }));
    }, 2200);

    return () => window.clearInterval(id);
  }, []);

  // A collapsed group hides its tabs, so the active tab falls back to the loose one.
  const hidden = GROUPS.some((g) => collapsed[g.name] && g.tabs.includes(active));
  const shown = hidden ? LOOSE_TAB : active;

  return (
    <WindowFrame
      strip={
        <>
          {GROUPS.map((g) => (
            <div
              className='fz-group'
              data-collapsed={collapsed[g.name] ? 'true' : 'false'}
              key={g.name}
              style={{ '--g': g.color } as CSSProperties}
            >
              <button
                aria-expanded={!collapsed[g.name]}
                className='fz-chip'
                onClick={() => {
                  touched.current = true;
                  setCollapsed((c) => ({ ...c, [g.name]: !c[g.name] }));
                }}
                style={{ background: g.color, color: g.ink }}
                type='button'
              >
                {g.name}
              </button>

              <div className='fz-gtabs'>
                {g.tabs.map((t) => (
                  <button
                    aria-pressed={shown === t}
                    className={`fz-gtab${shown === t ? ' fz-gtab-on' : ''}`}
                    key={t}
                    onClick={() => {
                      touched.current = true;
                      setActive(t);
                    }}
                    tabIndex={collapsed[g.name] ? -1 : 0}
                    type='button'
                  >
                    &gt;_ {t}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            aria-pressed={shown === LOOSE_TAB}
            className={`fz-gtab${shown === LOOSE_TAB ? ' fz-gtab-on' : ''}`}
            onClick={() => {
              touched.current = true;
              setActive(LOOSE_TAB);
            }}
            type='button'
          >
            &gt;_ {LOOSE_TAB}
          </button>
        </>
      }
    >
      <p className='fz-win-dim'>sample output · click a chip or a tab</p>

      {TAB_LINES[shown].map((l) => (
        <p key={l}>{l}</p>
      ))}
    </WindowFrame>
  );
};
