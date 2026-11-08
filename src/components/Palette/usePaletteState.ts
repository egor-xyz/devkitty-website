import { type KeyboardEvent, useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import { CATEGORIES, type Category, type PaletteAction, searchActions } from '../../content/paletteActions';
import { OPEN_PALETTE_EVENT } from '../../lib/palette';

export type PaletteRow =
  | { action: PaletteAction; kind: 'action' }
  | { category: Category; count: number; kind: 'category' };

// Module-level open store so the section, header and shortcut all drive one panel.
let open = false;
const listeners = new Set<() => void>();

const setOpen = (next: boolean) => {
  if (open === next) return;
  open = next;
  for (const l of listeners) l();
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);

  return () => {
    listeners.delete(cb);
  };
};

const isEditable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName));

type Options = { actions: PaletteAction[]; onRun?: (a: PaletteAction) => void };

export function attachPaletteListeners(): () => void {
  const onKey = (e: globalThis.KeyboardEvent) => {
    if (e.key.toLowerCase() !== 'k' || e.altKey || e.shiftKey) return;
    if (!(e.metaKey || e.ctrlKey)) return;
    if (isEditable(e.target) && !open) return;

    e.preventDefault();
    setOpen(!open);
  };
  const onEvent = () => setOpen(true);

  window.addEventListener('keydown', onKey);
  window.addEventListener(OPEN_PALETTE_EVENT, onEvent);

  return () => {
    window.removeEventListener('keydown', onKey);
    window.removeEventListener(OPEN_PALETTE_EVENT, onEvent);
  };
}

/** Global open state plus the Cmd-K / Ctrl-K (the common web shortcut) and open-event listeners. */
export function usePaletteOpen() {
  const isOpen = useSyncExternalStore(subscribe, () => open, () => false);

  const toggle = useCallback((next: boolean) => setOpen(next), []);

  return [isOpen, toggle] as const;
}

/** Query, category drill-down, rows and keyboard handling for one palette panel. */
export function usePaletteState({ actions, onRun }: Options) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [active, setActive] = useState(0);

  const rows = useMemo<PaletteRow[]>(() => {
    const scope = category ? actions.filter((a) => a.category === category) : actions;

    if (!query.trim() && !category) {
      return CATEGORIES.flatMap((c) => {
        const count = actions.filter((a) => a.category === c).length;

        return count ? [{ category: c, count, kind: 'category' as const }] : [];
      });
    }

    return searchActions(scope, query).map((action) => ({ action, kind: 'action' as const }));
  }, [actions, category, query]);

  const safeActive = Math.min(active, Math.max(rows.length - 1, 0));

  const reset = useCallback(() => {
    setQuery('');
    setCategory(null);
    setActive(0);
  }, []);

  const goBack = () => {
    setCategory(null);
    setQuery('');
    setActive(0);
  };

  const choose = (row: PaletteRow | undefined) => {
    if (!row) return;
    if (row.kind === 'category') {
      setCategory(row.category);
      setQuery('');
      setActive(0);

      return;
    }

    onRun?.(row.action);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>, close: () => void) => {
    if (e.nativeEvent.isComposing) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((safeActive + 1) % Math.max(rows.length, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((safeActive - 1 + rows.length) % Math.max(rows.length, 1));
        break;
      case 'Backspace':
        if (!query && category) {
          e.preventDefault();
          goBack();
        }

        break;
      case 'Enter':
        e.preventDefault();
        choose(rows[safeActive]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        if (category) goBack();
        else close();

        break;
      case 'Tab':
        e.preventDefault(); // focus trap: the input is the one tab stop
        break;
    }
  };

  return {
    active: safeActive,
    category,
    choose,
    goBack,
    onKeyDown,
    query,
    reset,
    rows,
    setActive,
    setQuery: (q: string) => {
      setQuery(q);
      setActive(0);
    }
  };
}
