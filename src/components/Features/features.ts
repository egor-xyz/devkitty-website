/** Content for the `devkitty features list` terminal. Claims mirror shipped behaviour (build 338). */

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
    details: [
      'Press Cmd+J, or the sparkles button in the toolbar, to ask Claude Code, Codex or Cursor about what you are working on.',
      'It runs the command-line tool you already use, with your own sign-in.',
      'Attach the terminal, browser page, folder or branch (Cursor: folder and branch). Each workspace keeps its own chat; History keeps the rest.'
    ],
    id: 'quick-ai',
    preview: {
      kind: 'text',
      lines: [
        ['open', 'Cmd+J or the sparkles button'],
        ['asks', 'Claude Code, Codex or Cursor, with your own sign-in'],
        ['context', 'terminal, browser page, folder, branch'],
        ['chats', 'one per workspace, plus a shared Chat tab']
      ]
    },
    summary: 'Quick AI: ask your own coding agent'
  },
  {
    details: [
      'The terminal runs on the Ghostty engine, embedded in the app.',
      'Cmd+F searches the focused pane, with a match count and next and previous.',
      'Sessions keep running when you quit Devkitty and reconnect when you open it. A Mac restart still ends them.'
    ],
    id: 'ghostty-engine',
    preview: {
      kind: 'text',
      lines: [
        ['engine', 'Ghostty, embedded (libghostty)'],
        ['runs in', 'the Devkitty window, one engine for every terminal tab'],
        ['search', 'Cmd+F in the focused pane'],
        ['sessions', 'keep running when you quit Devkitty']
      ]
    },
    summary: 'Ghostty terminal engine, embedded'
  },
  {
    details: [
      'Split a tab to the right or below.',
      'Terminals and the built-in browser sit side by side.',
      'The split commands are in ⌘P.',
      'Cmd-Option-Up and Down move focus between panes; Control-Command-arrows resize them.'
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
      'A browser tab per page, with back, forward, bookmark folders and history.',
      'Open http(s) links from the terminal in it. Pages load over HTTPS unless you allow a host in Settings.',
      'Mute a tab from its menu, Cmd+P or its speaker icon; it stays muted after a restart.',
      'Picture in Picture, find in page, translate and Inspect Element. Sites ask before they get your location.',
      'A Google Meet call floats in a small window when you switch away, with Return to Tab.'
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
      'Switch between them without leaving the window.',
      'After a Force Quit, each tab resumes its own Claude conversation.'
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
      'Type to search every action, or the category you are in.',
      'Type a web address to open it in the browser; the Browser category opens pages from your history.',
      'On/off settings have a switch right in the list; Return toggles it.'
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
      'Pick sign-in cookies, bookmarks and history for each browser: Chrome-type browsers, Firefox and Safari.',
      'Bookmarks keep their folders under "Imported from <browser>"; history keeps the newest 500 pages.',
      'Sign-in cookies start unchecked, so nothing sensitive is copied unless you choose it.'
    ],
    id: 'browser-import',
    preview: {
      kind: 'text',
      lines: [
        ['from', 'Chrome-type browsers, Firefox, Safari'],
        ['choose', 'sign-in cookies, bookmarks, history, per browser'],
        ['bookmarks', 'folders kept, under "Imported from <browser>"'],
        ['history', 'newest 500 pages'],
        ['macOS may ask', 'Keychain password, Full Disk Access (Safari)']
      ]
    },
    summary: 'Import from your other browsers'
  }
];
