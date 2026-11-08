export type Extension = {
  defaultOn: boolean;
  group: ExtensionGroup;
  icon: string;
  id: string;
  minBuild: null | number;
  name: string;
  order: number;
  screenshots: ExtensionShot[];
  sections: ExtensionSectionContent[];
  settingsPath?: string;
  status: ExtensionStatus;
  tagline: string;
};
export type ExtensionGroup = 'Development' | 'Image Tools' | 'Terminal' | 'Toolbar' | 'Widgets';
export type ExtensionSectionContent = { body: string; bullets?: string[]; heading: string; shot?: number };
export type ExtensionShot = { alt: string; height: number; src: string; theme?: 'dark' | 'light'; width: number };

// Pure validator: no DOM, no Node APIs, so vite.config can import it too.
export type ExtensionStatus = 'beta' | 'coming-soon' | 'new' | 'stable';

export const EXTENSION_GROUPS: readonly ExtensionGroup[] = ['Terminal', 'Image Tools', 'Widgets', 'Toolbar', 'Development'];
export const EXTENSION_STATUSES: readonly ExtensionStatus[] = ['new', 'beta', 'stable', 'coming-soon'];

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0;

export function parseExtension(raw: unknown, file: string): Extension {
  const fail = (field: string, problem: string): never => {
    throw new Error(`${file}: ${field} ${problem}`);
  };

  if (!isRecord(raw)) return fail('root', 'must be an object');

  const text = (field: string): string => {
    const v = raw[field];

    return isText(v) ? v : fail(field, 'must be a non-empty string');
  };

  const id = text('id');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('id', 'must be kebab-case');

  const name = text('name');
  const tagline = text('tagline');
  if (tagline.length > 90) fail('tagline', 'must be at most 90 characters');

  const icon = text('icon');
  if (icon !== `/extensions/${id}/icon.svg`) fail('icon', `must be /extensions/${id}/icon.svg`);

  const group = raw.group as ExtensionGroup;
  if (!EXTENSION_GROUPS.includes(group)) fail('group', `must be one of ${EXTENSION_GROUPS.join(', ')}`);

  const status = raw.status as ExtensionStatus;
  if (!EXTENSION_STATUSES.includes(status)) fail('status', `must be one of ${EXTENSION_STATUSES.join(', ')}`);

  const {minBuild} = raw;
  if (minBuild !== null && !isPositiveInt(minBuild)) fail('minBuild', 'must be a positive integer or null');
  if (status === 'coming-soon' && minBuild !== null) fail('minBuild', 'must be null while status is coming-soon');

  if (typeof raw.defaultOn !== 'boolean') fail('defaultOn', 'must be a boolean');
  if (typeof raw.order !== 'number' || !Number.isFinite(raw.order)) fail('order', 'must be a number');

  if (raw.settingsPath !== undefined && !isText(raw.settingsPath)) fail('settingsPath', 'must be a non-empty string');

  if (!Array.isArray(raw.screenshots)) fail('screenshots', 'must be an array');
  const screenshots = (raw.screenshots as unknown[]).map((s, i): ExtensionShot => {
    const at = `screenshots[${i}]`;
    if (!isRecord(s)) return fail(at, 'must be an object');
    if (!isText(s.src) || !s.src.startsWith('/')) fail(`${at}.src`, 'must be an absolute path');
    if (!isText(s.alt)) fail(`${at}.alt`, 'must be a non-empty string');
    if (!isPositiveInt(s.width)) fail(`${at}.width`, 'must be a positive integer');
    if (!isPositiveInt(s.height)) fail(`${at}.height`, 'must be a positive integer');
    if (s.theme !== undefined && s.theme !== 'light' && s.theme !== 'dark') fail(`${at}.theme`, "must be 'light' or 'dark'");

    return s as ExtensionShot;
  });

  if (!Array.isArray(raw.sections)) fail('sections', 'must be an array');
  const sections = (raw.sections as unknown[]).map((s, i): ExtensionSectionContent => {
    const at = `sections[${i}]`;
    if (!isRecord(s)) return fail(at, 'must be an object');
    if (!isText(s.heading)) fail(`${at}.heading`, 'must be a non-empty string');
    if (!isText(s.body)) fail(`${at}.body`, 'must be a non-empty string');
    if (s.bullets !== undefined && !(Array.isArray(s.bullets) && s.bullets.every(isText))) {
      fail(`${at}.bullets`, 'must be an array of non-empty strings');
    }
    if (s.shot !== undefined && !(Number.isInteger(s.shot) && (s.shot as number) >= 0 && (s.shot as number) < screenshots.length)) {
      fail(`${at}.shot`, 'must be an index into screenshots');
    }

    return s as ExtensionSectionContent;
  });

  return {
    defaultOn: raw.defaultOn as boolean,
    group,
    icon,
    id,
    minBuild: minBuild as null | number,
    name,
    order: raw.order as number,
    screenshots,
    sections,
    settingsPath: raw.settingsPath as string | undefined,
    status,
    tagline
  };
}
