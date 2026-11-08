import { AnimatePresence, m } from 'motion/react';
import { type FC, type ReactNode, useCallback, useEffect, useId, useMemo, useRef } from 'react';

import { buildPaletteActions, type Category, type PaletteAction, type PaletteIcon } from '../../content/paletteActions';
import { useLatestRelease } from '../../lib/latestRelease';
import { SPRING_UI } from '../../lib/motion';
import { attachPaletteListeners, type PaletteRow, usePaletteOpen, usePaletteState } from './usePaletteState';

type PanelProps = {
  active: number;
  category: Category | null;
  interactive: boolean;
  listId: string;
  onChoose?: (row: PaletteRow) => void;
  onHover?: (i: number) => void;
  query: string;
  rows: PaletteRow[];
};

/** Line icons on a 24-unit grid, drawn with currentColor. */
const ICON_PATHS: Record<PaletteIcon, ReactNode> = {
  book: <path d='M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6' />,
  download: <path d='M12 4v11m0 0-4-4m4 4 4-4M5 20h14' />,
  extension: <path d='M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V6h4z' />,
  features: <path d='m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.5 6.6 19.4l1.2-6L3.4 9.3l6-.7z' />,
  globe: <path d='M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9S9.5 5.7 12 3z' />,
  hero: <path d='M4 5h16v11H4zM9 20h6M12 16v4' />,
  list: <path d='M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01' />,
  shield: <path d='M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6z' />,
  sun: <path d='M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5' />,
  terminal: <path d='m5 8 4 4-4 4M12 17h7M3 4h18v16H3z' />
};

const CATEGORY_ICONS: Record<Category, PaletteIcon> = { Extensions: 'extension', Hero: 'hero', Website: 'globe' };

const Icon: FC<{ name: PaletteIcon }> = ({ name }) => (
  <svg
    aria-hidden
    className='size-[18px] shrink-0 text-white/75'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='1.75'
    viewBox='0 0 24 24'
  >
    {ICON_PATHS[name]}
  </svg>
);

/** The panel always stays dark, like the native Devkitty palette, whatever the (light) site around it. */
export const PANEL_CLASS =
  'overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(160deg,#3a1020_0%,#24123a_100%)] text-white shadow-[0_30px_80px_rgba(10,4,24,0.55)]';

const Keycap: FC<{ children: ReactNode }> = ({ children }) => (
  <kbd className='rounded border border-white/20 bg-white/10 px-1.5 py-px font-mono text-[11px] text-white/80'>{children}</kbd>
);

const rowLabel = (row: PaletteRow) => (row.kind === 'category' ? row.category : row.action.title);

const rowIcon = (row: PaletteRow): PaletteIcon => (row.kind === 'category' ? CATEGORY_ICONS[row.category] : row.action.icon);

/** The panel body (label and rows), shared by the live overlay and the resting section demo. */
export const PaletteRows: FC<PanelProps> = ({ active, category, interactive, listId, onChoose, onHover, query, rows }) => (
  <div className='px-2 pb-2'>
    <p className='px-3 pb-1.5 pt-2.5 font-mono text-[11px] uppercase tracking-wider text-white/45'>
      {category ?? (query.trim() ? 'Results' : 'Categories')}
    </p>

    <div
      aria-label={category ?? 'Categories'}
      className='max-h-[min(340px,45dvh)] overflow-y-auto'
      id={listId}
      role='listbox'
    >
      {rows.length === 0 && <p className='px-3 py-6 text-center text-sm text-white/50'>No matching actions</p>}

      {rows.map((row, i) => {
        const selected = i === active;

        return (
          <div
            aria-selected={interactive && selected}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-[0.9375rem] ${
              selected ? 'border-[#9a8cf0]/50 bg-[#6a5ce0]/30' : 'border-transparent'
            }`}
            id={`${listId}-opt-${i}`}
            key={`${row.kind}-${rowLabel(row)}`}
            onClick={() => onChoose?.(row)}
            onMouseMove={() => onHover?.(i)}
            role='option'
          >
            <Icon name={rowIcon(row)} />
            <span className='flex-1 truncate'>{rowLabel(row)}</span>
            {row.kind === 'category' && <span className='font-mono text-xs text-white/50'>{row.count} ›</span>}

            {row.kind === 'action' && !category && (
              <span className='font-mono text-[11px] text-white/45'>{row.action.category}</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/** "↑↓ Navigate  ↵ Run  esc Back" on the left, the app version on the right. */
export const PaletteFooter: FC = () => {
  const { build, version } = useLatestRelease();

  return (
    <div className='flex items-center gap-4 border-t border-white/10 px-4 py-2.5 text-xs text-white/60'>
      <span className='flex items-center gap-1.5'>
        <Keycap>↑↓</Keycap> Navigate
      </span>

      <span className='flex items-center gap-1.5'>
        <Keycap>↵</Keycap> Run
      </span>

      <span className='flex items-center gap-1.5'>
        <Keycap>esc</Keycap> Back
      </span>

      <span className='ml-auto font-mono text-white/45'>
        {version} (build {build})
      </span>
    </div>
  );
};

export const SearchGlyph: FC = () => (
  <svg
    aria-hidden
    className='size-5 shrink-0 text-white/60'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeWidth='1.75'
    viewBox='0 0 24 24'
  >
    <path d='m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z' />
  </svg>
);

export const Palette: FC = () => {
  const [isOpen, setOpen] = usePaletteOpen();
  const { zipUrl } = useLatestRelease();
  const actions = useMemo(() => buildPaletteActions(zipUrl), [zipUrl]);
  const opener = useRef<HTMLElement | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => attachPaletteListeners(), []);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }, [setOpen]);

  const run = useCallback(
    (a: PaletteAction) => {
      close();
      a.run();
    },
    [close]
  );

  const state = usePaletteState({ actions, onRun: run });
  const { reset } = state;

  useEffect(() => {
    if (!isOpen) return;

    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.current?.focus();
    const root = document.documentElement;
    const prev = { gutter: root.style.scrollbarGutter, overflow: root.style.overflow };
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';

    return () => {
      root.style.scrollbarGutter = prev.gutter;
      root.style.overflow = prev.overflow;
    };
  }, [isOpen]);

  const activeId = state.rows.length ? `${listId}-opt-${state.active}` : undefined;

  return (
    <AnimatePresence onExitComplete={reset}>
      {isOpen && (
        <m.div
          animate={{ opacity: 1 }}
          className='fixed inset-0 z-[100] bg-black/20 backdrop-blur-[6px]'
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key='palette'
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          transition={{ duration: 0.16 }}
        >
          <m.div
            animate={{ opacity: 1, scale: 1 }}
            aria-label='Command palette'
            aria-modal='true'
            className={`mx-auto mt-[18vh] w-[min(640px,calc(100%-32px))] ${PANEL_CLASS}`}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
            initial={{ opacity: 0, scale: 0.96 }}
            onAnimationComplete={() => input.current?.focus()}
            role='dialog'
            transition={SPRING_UI}
          >
            <div className='flex items-center gap-3 px-4'>
              {state.category && (
                <button
                  aria-label='Back'
                  className='-ml-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-white/10 text-white/80 hover:bg-white/20'
                  onClick={() => {
                    state.goBack();
                    input.current?.focus();
                  }}
                  tabIndex={-1}
                  type='button'
                >
                  <svg
                    aria-hidden
                    className='size-4'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path d='m15 18-6-6 6-6' />
                  </svg>
                </button>
              )}

              <SearchGlyph />

              <input
                aria-activedescendant={activeId}
                aria-autocomplete='list'
                aria-controls={listId}
                aria-expanded
                aria-label={state.category ? `Search ${state.category}` : 'Search'}
                autoComplete='off'
                autoFocus
                className='h-14 min-w-0 flex-1 bg-transparent font-sans text-xl text-white outline-none placeholder:text-white/40'
                onChange={(e) => state.setQuery(e.target.value)}
                onKeyDown={(e) => state.onKeyDown(e, close)}
                placeholder={state.category ? `Search ${state.category}` : 'Search'}
                ref={input}
                role='combobox'
                spellCheck={false}
                style={{ outline: 'none' }}
                value={state.query}
              />

              <kbd className='font-mono text-xs text-white/45'>⌘K</kbd>
            </div>

            <PaletteRows
              active={state.active}
              category={state.category}
              interactive
              listId={listId}
              onChoose={state.choose}
              onHover={state.setActive}
              query={state.query}
              rows={state.rows}
            />

            <PaletteFooter />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
