import { setHeroMode } from '../components/Hero/heroMode';
import { getExtensions } from '../lib/extensions';

/** Website-only palette: categories in display order. */
export const CATEGORIES = ['Website', 'Hero', 'Extensions'] as const;

export type Category = (typeof CATEGORIES)[number];

export type PaletteAction = {
  category: Category;
  icon: PaletteIcon;
  id: string;
  keywords?: string[];
  run: () => void;
  shortcut?: string;
  title: string;
};

export type PaletteIcon =
  | 'book'
  | 'download'
  | 'extension'
  | 'features'
  | 'globe'
  | 'hero'
  | 'list'
  | 'shield'
  | 'sun'
  | 'terminal';

export const FEATURES_OPEN_EVENT = 'devkitty:features-open';
export const EXTENSIONS_OPEN_EVENT = 'devkitty:extensions-open';
export const CHANGELOG_OPEN_EVENT = 'devkitty:changelog-open';

export function buildPaletteActions(zipUrl: string): PaletteAction[] {
  const extensions: PaletteAction[] = getExtensions().map((e) => ({
    category: 'Extensions',
    icon: 'extension',
    id: `extension-${e.id}`,
    keywords: ['extension', 'plugin', e.id],
    run: () => {
      // Only the home page hosts the monitor zoom; elsewhere, load home with the deep link.
      if (document.querySelector('[data-hero-stage]')) window.dispatchEvent(new CustomEvent(EXTENSIONS_OPEN_EVENT, { detail: { id: e.id } }));
      else window.location.assign(`/#extensions/${e.id}`);
    },
    title: `Open extension: ${e.name}`
  }));

  return [
    {
      category: 'Website',
      icon: 'features',
      id: 'open-features',
      keywords: ['zoom', 'monitor', 'terminal'],
      run: () => window.dispatchEvent(new CustomEvent(FEATURES_OPEN_EVENT)),
      title: 'Open Features'
    },
    {
      category: 'Website',
      icon: 'extension',
      id: 'open-extensions',
      keywords: ['zoom', 'monitor', 'terminal', 'plugin'],
      run: () => window.dispatchEvent(new CustomEvent(EXTENSIONS_OPEN_EVENT)),
      title: 'Open Extensions'
    },
    {
      category: 'Website',
      icon: 'list',
      id: 'open-changelog',
      keywords: ['releases', 'news', 'zoom', 'monitor', 'terminal'],
      run: () => window.dispatchEvent(new CustomEvent(CHANGELOG_OPEN_EVENT)),
      title: 'Open Changelog'
    },
    { category: 'Website', icon: 'shield', id: 'privacy', keywords: ['legal', 'telemetry'], run: () => window.location.assign('/privacy/'), title: 'Read the Privacy Policy' },
    { category: 'Website', icon: 'book', id: 'terms', keywords: ['legal', 'license'], run: () => window.location.assign('/terms/'), title: 'Read the Terms' },
    {
      category: 'Website',
      icon: 'download',
      id: 'download',
      keywords: ['mac', 'zip', 'install', 'get'],
      run: () => window.location.assign(zipUrl),
      title: 'Download Devkitty'
    },
    { category: 'Hero', icon: 'sun', id: 'switch-devkitty', keywords: ['hero', 'sunset', 'switch'], run: () => void setHeroMode(true), title: 'Switch to Devkitty' },
    { category: 'Hero', icon: 'terminal', id: 'switch-terminal', keywords: ['hero', 'grey', 'switch'], run: () => void setHeroMode(false), title: 'Switch to Terminal' },
    ...extensions
  ];
}

/** Case-insensitive substring over title and keywords; prefix matches first. */
export function searchActions(actions: PaletteAction[], query: string): PaletteAction[] {
  const q = query.trim().toLowerCase();
  if (!q) return actions;

  const scored: [number, PaletteAction][] = [];

  for (const a of actions) {
    const title = a.title.toLowerCase();
    let rank = -1;

    if (title.startsWith(q)) rank = 0;
    else if (title.split(/\s+/).some((w) => w.startsWith(q))) rank = 1;
    else if (title.includes(q)) rank = 2;
    else if (a.keywords?.some((k) => k.toLowerCase().includes(q))) rank = 3;

    if (rank >= 0) scored.push([rank, a]);
  }

  return scored.sort((a, b) => a[0] - b[0]).map(([, a]) => a);
}
