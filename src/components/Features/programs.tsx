import { type ReactNode } from 'react';

import baked from '../../content/releases.generated.json';
import { getExtensions } from '../../lib/extensions';
import { type ReleaseNote } from '../../lib/releases';
import { EXTENSION_DEMOS } from './ExtensionDemos';
import { ChangelogPreview, FeaturePreview, IconPreview, ShotPreview } from './FeaturePreview';
import { FEATURES } from './features';

export const FEATURES_OPEN_EVENT = 'devkitty:features-open';
export const EXTENSIONS_OPEN_EVENT = 'devkitty:extensions-open';
export const CHANGELOG_OPEN_EVENT = 'devkitty:changelog-open';

/** A line under the `show` command: plain text, or a terminal-style link. */
export type ZoomDetail = string | { dim: string } | { href: string; text: string };

/** What the monitor zoom shows: the hash and event that open it, the terminal command, the rows and their preview. */
export type ZoomProgram = {
  /** Extra lines printed under the `show` command. */
  details?: (id: string) => ZoomDetail[];
  hash: string;
  /** The `list` command that is typed and run. */
  listCommand: string;
  /** Short name used for the terminal tab, sidebar and labels. */
  name: string;
  openEvent: string;
  renderPreview: (id: string) => ReactNode;
  rows: ZoomRow[];
  /** Echoed before the row id when a row is picked. */
  showCommand: string;
  title: string;
};

export type ZoomRow = { id: string; summary: string };

export const featuresProgram: ZoomProgram = {
  details: (id) => FEATURES.find((f) => f.id === id)?.details ?? [],
  hash: '#features',
  listCommand: 'devkitty features list',
  name: 'features',
  openEvent: FEATURES_OPEN_EVENT,
  renderPreview: (id) => {
    const feature = FEATURES.find((f) => f.id === id);

    return feature ? <FeaturePreview feature={feature} /> : null;
  },
  rows: FEATURES.map((f) => ({ id: f.id, summary: f.summary })),
  showCommand: 'devkitty features show',
  title: 'Devkitty features'
};

const TAGS: Partial<Record<string, string>> = { beta: 'beta', new: 'new' };

const extensionDetails = (id: string): ZoomDetail[] => {
  const e = getExtensions().find((x) => x.id === id);
  if (!e) return [];
  const tag = TAGS[e.status] ? ` · ${TAGS[e.status]}` : '';

  return [
    e.tagline,
    `${e.group} · ${e.defaultOn ? 'On by default' : 'Off by default'}${tag}`,
    ...e.sections.flatMap((s) => [`## ${s.heading}`, s.body, ...(s.bullets ?? []).map((b) => `- ${b}`)]),
    { href: `/extensions/${e.id}/`, text: `open https://devkitty.app/extensions/${e.id}/` }
  ];
};

export const extensionsProgram: ZoomProgram = {
  details: extensionDetails,
  hash: '#extensions',
  listCommand: 'devkitty extensions list',
  name: 'extensions',
  openEvent: EXTENSIONS_OPEN_EVENT,
  renderPreview: (id) => {
    const extension = getExtensions().find((e) => e.id === id);

    if (!extension) return null;
    const [shot] = extension.screenshots;
    const Demo = EXTENSION_DEMOS[extension.id];

    if (Demo) return <Demo />;

    return shot ? (
      <ShotPreview
        alt={shot.alt}
        height={shot.height}
        src={shot.src}
        width={shot.width}
      />
    ) : (
      <IconPreview
        icon={extension.icon}
        id={extension.id}
        name={extension.name}
        tagline={extension.tagline}
      />
    );
  },
  rows: getExtensions().map((e) => ({ id: e.id, summary: TAGS[e.status] ? `${e.name} · ${TAGS[e.status]}` : e.name })),
  showCommand: 'devkitty extensions show',
  title: 'Devkitty extensions'
};

/** Latest 10 releases, baked in at build time by scripts/fetch-releases.mjs. */
const NOTES: ReleaseNote[] = baked.notes.slice(0, 10);
const noteId = (n: ReleaseNote) => `build ${n.build}`;

const changelogDetails = (id: string): ZoomDetail[] => {
  const n = NOTES.find((x) => noteId(x) === id);
  if (!n) return [];

  return [{ dim: `${n.version} · ${n.date.slice(0, 10)} · ${n.items.length} ${n.items.length === 1 ? 'change' : 'changes'}` }, { href: n.url, text: `open ${n.url}` }];
};

export const changelogProgram: ZoomProgram = {
  details: changelogDetails,
  hash: '#changelog',
  listCommand: 'devkitty changelog',
  name: 'changelog',
  openEvent: CHANGELOG_OPEN_EVENT,
  renderPreview: (id) => {
    const n = NOTES.find((x) => noteId(x) === id);

    return n ? <ChangelogPreview note={n} /> : null;
  },
  rows: NOTES.map((n) => ({ id: noteId(n), summary: `${n.version} · ${n.date.slice(0, 10)}` })),
  showCommand: 'devkitty changelog show',
  title: 'Devkitty changelog'
};
