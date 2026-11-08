// Prebuild step: bakes the latest release and the last release notes of
// egor-xyz/devkitty-releases into src/content/releases.generated.json so the
// page is current at every build and works without JS. On any failure the
// committed file is kept.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REPO = 'egor-xyz/devkitty-releases';
const OUT = fileURLToPath(new URL('../src/content/releases.generated.json', import.meta.url));
const TAG = /^v(\d+\.\d+\.\d+)-build(\d+)$/;
const DL = `https://github.com/${REPO}/releases/download`;

const stripMarkdown = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,;:!?])/g, '$1$2')
    .trim();

const noteOf = (r) => {
  const m = TAG.exec(r.tag_name ?? '');
  if (!m || r.draft || r.prerelease) return null;
  const items = String(r.body ?? '')
    .split(/\r?\n/)
    .filter((l) => /^- /.test(l))
    .map((l) => stripMarkdown(l.slice(2)))
    .filter(Boolean);
  return {
    build: Number(m[2]),
    date: String(r.published_at ?? r.created_at ?? ''),
    items,
    url: r.html_url,
    version: m[1]
  };
};

const latestOf = (r) => {
  const m = TAG.exec(r.tag_name ?? '');
  const zip = (r.assets ?? []).find((a) => /^DevKitty-.+\.zip$/.test(a.name));
  if (!m || !zip) return null;
  const sums = (r.assets ?? []).find((a) => a.name === 'SHA256SUMS.txt');
  return {
    build: Number(m[2]),
    checksumsUrl: sums ? `${DL}/${r.tag_name}/SHA256SUMS.txt` : null,
    tag: r.tag_name,
    version: m[1],
    zipUrl: `${DL}/${r.tag_name}/${zip.name}`
  };
};

try {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`, {
    headers,
    signal: AbortSignal.timeout(10_000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const list = await res.json();
  const notes = list.map(noteOf).filter(Boolean);
  const latest = list.filter((r) => !r.draft && !r.prerelease).map(latestOf).find(Boolean);
  if (!latest || notes.length === 0) throw new Error('no usable release in response');
  const next = `${JSON.stringify({ latest, notes }, null, 2)}\n`;
  let prev = '';
  try {
    prev = readFileSync(OUT, 'utf8');
  } catch {
    /* first run */
  }
  if (next !== prev) writeFileSync(OUT, next);
  console.log(`fetch-releases: build ${latest.build}, ${notes.length} notes`);
} catch (e) {
  console.warn(`fetch-releases: keeping committed file (${e instanceof Error ? e.message : e})`);
}
