import { useCallback, useSyncExternalStore } from 'react';

export type ResolvedTheme = 'dark' | 'light';
export type ThemeChoice = 'dark' | 'light' | 'system';

export const THEME_KEY = 'devkitty-theme';

const listeners = new Set<() => void>();
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

let choice: ThemeChoice | undefined;

const readStored = (): ThemeChoice => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // storage blocked (private mode): fall through to system
  }

  return 'system';
};

export function getResolvedTheme(): ResolvedTheme {
  const c = getThemeChoice();
  if (c !== 'system') return c;

  return darkQuery().matches ? 'dark' : 'light';
}

export function getThemeChoice(): ThemeChoice {
  choice = choice ?? readStored();

  return choice;
}

const apply = () => {
  const resolved = getResolvedTheme();
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
};

const notify = () => {
  for (const l of listeners) l();
};

export function setThemeChoice(next: ThemeChoice): void {
  choice = next;

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // storage blocked: the choice still applies for this page view
  }

  apply();
  notify();
}

// One subscription for any change: choice, or the OS scheme while the choice is 'system'.
const subscribeAny = (cb: () => void) => {
  listeners.add(cb);
  const query = darkQuery();
  const onOs = () => {
    if (getThemeChoice() !== 'system') return;
    apply();
    notify();
  };
  query.addEventListener('change', onOs);

  return () => {
    listeners.delete(cb);
    query.removeEventListener('change', onOs);
  };
};

export function subscribeTheme(cb: (t: ResolvedTheme) => void): () => void {
  let last = getResolvedTheme();

  return subscribeAny(() => {
    const next = getResolvedTheme();
    if (next === last) return;
    last = next;
    cb(next);
  });
}

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribeAny, getResolvedTheme);
}

export function useThemeChoice(): [ThemeChoice, (c: ThemeChoice) => void] {
  const current = useSyncExternalStore(subscribeAny, getThemeChoice);
  const set = useCallback((c: ThemeChoice) => setThemeChoice(c), []);

  return [current, set];
}
