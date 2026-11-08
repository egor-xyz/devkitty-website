/** Content for the `devkitty features list` terminal. Claims mirror shipped behaviour (build 283). */

export type Feature = {
  /** Longer description printed under the `show` command. */
  details: string[];
  id: string;
  preview: FeaturePreview;
  /** One line shown in the list. */
  summary: string;
};

export type FeaturePreview =
  | { alt: string; height: number; kind: 'shot'; name: string; width: number }
  | { demo: 'tab-groups'; kind: 'demo' }
  | { kind: 'mock'; mock: 'browser' | 'rail' }
  | { kind: 'text'; lines: [label: string, value: string][] };

export const FEATURES: Feature[] = [
  {
    details: [
      'Group workspace tabs under a coloured, optionally titled chip.',
      'Collapse a group into its chip and open it again; drag tabs in and out.',
      'Cmd+1…9 counts only the tabs you can see.'
    ],
    id: 'tab-groups',
    preview: { demo: 'tab-groups', kind: 'demo' },
    summary: 'Group tabs, collapse them into a chip'
  },
  {
    details: ['The terminal runs on the Ghostty engine, embedded in the app.'],
    id: 'ghostty-engine',
    preview: {
      kind: 'text',
      lines: [
        ['engine', 'Ghostty, embedded (libghostty)'],
        ['runs in', 'the Devkitty window, one engine for every terminal tab']
      ]
    },
    summary: 'Ghostty terminal engine, embedded'
  },
  {
    details: [
      'Split a tab to the right or below.',
      'Terminals and the built-in browser sit side by side.',
      'The split commands are in ⌘P.'
    ],
    id: 'split-view',
    preview: {
      alt: 'Terminal on the left and the built-in browser on the right showing a checkout page.',
      height: 1864,
      kind: 'shot',
      name: 'feat-split',
      width: 2880
    },
    summary: 'Split panes: terminals and browser'
  },
  {
    details: [
      'A browser tab per page, with back, forward and bookmarks.',
      'Open http(s) links from the terminal in it.',
      'Translate a page, and use Web Inspector where supported.'
    ],
    id: 'built-in-browser',
    preview: { kind: 'mock', mock: 'browser' },
    summary: 'A built-in browser next to your terminal'
  },
  {
    details: [
      'Collapse the left sidebar to a compact rail of tab icons.',
      'Status dots and progress bars stay visible on the rail.'
    ],
    id: 'compact-sidebar',
    preview: { kind: 'mock', mock: 'rail' },
    summary: 'Light view: collapse the vertical tabs'
  },
  {
    details: [
      'Hidden terminals free their graphics memory and redraw when shown. In our test, memory dropped from about 409 MB to 55 MB (build 280).',
      'Split panes stop re-measuring layout on every frame: idle CPU went from about 21% to 17% in our test (build 279).',
      'Your numbers can differ.'
    ],
    id: 'performance',
    preview: {
      kind: 'text',
      lines: [
        ['hidden terminals', 'memory: about 409 MB before, 55 MB after (build 280)'],
        ['split panes', 'idle CPU: about 21% before, 17% after (build 279)'],
        ['note', 'our tests; your numbers can differ']
      ]
    },
    summary: 'Light on memory and CPU'
  },
  {
    details: [
      'Coding-agent sessions sit in tabs and the sidebar next to your shells.',
      'Switch between them without leaving the window.'
    ],
    id: 'agent-tabs',
    preview: {
      alt: 'A Devkitty window with an agent session open in a terminal tab, sidebar on the left.',
      height: 1864,
      kind: 'shot',
      name: 'feat-main',
      width: 2880
    },
    summary: 'Agent sessions as tabs, one window'
  },
  {
    details: [
      'Press Cmd+P for one palette with browsable categories and nested actions.',
      'Type to search every action, or the category you are in.'
    ],
    id: 'cmd-p',
    preview: {
      alt: 'The Devkitty command palette open over a terminal, showing search results.',
      height: 1864,
      kind: 'shot',
      name: 'feat-palette',
      width: 2880
    },
    summary: 'One palette for every action'
  },
  {
    details: [
      'Import Browser Sessions copies only sign-in cookies from Chrome-type browsers, Firefox or Safari.',
      'History and bookmarks are not copied.',
      'New in build 283, and not yet tested with real browser profiles.'
    ],
    id: 'session-import',
    preview: {
      kind: 'text',
      lines: [
        ['from', 'Chrome-type browsers, Firefox, Safari'],
        ['copies', 'sign-in cookies only'],
        ['skips', 'history, bookmarks'],
        ['macOS may ask', 'Keychain password, Full Disk Access (Safari)'],
        ['status', 'new, and not yet tested with real browser profiles']
      ]
    },
    summary: 'Bring your browser sign-ins over'
  }
];
