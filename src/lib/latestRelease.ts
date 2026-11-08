import { useEffect, useState } from 'react';

import baked from '../content/releases.generated.json';

export type LatestRelease = {
  build: number;
  checksumsUrl: null | string;
  tag: string;
  version: string;
  zipUrl: string;
};

export const RELEASES_PAGE = 'https://github.com/egor-xyz/devkitty-releases/releases/latest';
export const TAG_PATTERN = /^v(\d+\.\d+\.\d+)-build(\d+)$/;

const API = 'https://api.github.com/repos/egor-xyz/devkitty-releases';
const TIMEOUT_MS = 4000;

// Read from the JSON baked at build time by scripts/fetch-releases.mjs.
export const FALLBACK_RELEASE: LatestRelease = baked.latest;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** GET a GitHub API path with a 4 s timeout; resolves null on any error. */
export async function fetchGithubJson(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    });

    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function parseRelease(json: unknown): LatestRelease | null {
  if (!isRecord(json) || typeof json.tag_name !== 'string' || !Array.isArray(json.assets)) return null;

  const match = TAG_PATTERN.exec(json.tag_name);
  if (!match) return null;

  const names = json.assets.flatMap((a) => (isRecord(a) && typeof a.name === 'string' ? [a.name] : []));
  const zip = names.find((n) => /^DevKitty-.+\.zip$/.test(n));
  if (!zip) return null;

  const base = `https://github.com/egor-xyz/devkitty-releases/releases/download/${json.tag_name}`;

  return {
    build: Number(match[2]),
    checksumsUrl: names.includes('SHA256SUMS.txt') ? `${base}/SHA256SUMS.txt` : null,
    tag: json.tag_name,
    version: match[1],
    zipUrl: `${base}/${zip}`
  };
}

let pending: Promise<LatestRelease | null> | undefined;

const loadLatest = () => {
  pending = pending ?? fetchGithubJson('/releases/latest').then(parseRelease);

  return pending;
};

export function useLatestRelease(): LatestRelease {
  const [release, setRelease] = useState(FALLBACK_RELEASE);

  useEffect(() => {
    let live = true;

    void loadLatest().then((r) => {
      if (live && r) setRelease(r);
    });

    return () => {
      live = false;
    };
  }, []);

  return release;
}
