import { useEffect, useState } from 'react';

import baked from '../content/releases.generated.json';
import { fetchGithubJson, TAG_PATTERN } from './latestRelease';

export type ReleaseNote = {
  build: number;
  date: string;
  items: string[]; // top-level "- " bullets of the release body, markdown stripped
  url: string;
  version: string;
};

const stripMarkdown = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,;:!?])/g, '$1$2')
    .trim();

export function parseReleaseNotes(json: unknown): ReleaseNote[] {
  if (!Array.isArray(json)) return [];

  return json.flatMap((r: unknown): ReleaseNote[] => {
    if (typeof r !== 'object' || r === null) return [];

    const rel = r as Record<string, unknown>;
    const match = typeof rel.tag_name === 'string' ? TAG_PATTERN.exec(rel.tag_name) : null;
    if (!match || rel.draft === true || rel.prerelease === true) return [];

    const items = String(rel.body ?? '')
      .split(/\r?\n/)
      .filter((l) => l.startsWith('- '))
      .map((l) => stripMarkdown(l.slice(2)))
      .filter(Boolean);

    return [
      {
        build: Number(match[2]),
        date: String(rel.published_at ?? rel.created_at ?? ''),
        items,
        url: String(rel.html_url ?? ''),
        version: match[1]
      }
    ];
  });
}

let pending: Promise<ReleaseNote[]> | undefined;

const loadNotes = () => {
  pending = pending ?? fetchGithubJson('/releases?per_page=10').then(parseReleaseNotes);

  return pending;
};

export function useReleaseNotes(limit = 10): ReleaseNote[] {
  const [notes, setNotes] = useState<ReleaseNote[]>(baked.notes);

  useEffect(() => {
    let live = true;

    void loadNotes().then((n) => {
      if (live && n.length > 0) setNotes(n);
    });

    return () => {
      live = false;
    };
  }, []);

  return notes.slice(0, limit);
}
