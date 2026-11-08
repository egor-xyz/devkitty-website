import { type FC, useEffect, useState } from 'react';

import { EXTENSION_STATUSES, type ExtensionStatus, getExtensions } from '../../lib/extensions';
import { ExtensionGroups } from './ExtensionGroups';

type Filter = 'all' | ExtensionStatus;

const LABEL: Record<Filter, string> = { all: 'All', beta: 'Beta', 'coming-soon': 'Coming soon', new: 'New', stable: 'Stable' };

const readHash = (): Filter => {
  const h = window.location.hash.slice(1);

  return (EXTENSION_STATUSES as readonly string[]).includes(h) ? (h as ExtensionStatus) : 'all';
};

/** `/extensions/`: every extension, grouped, with status filter chips kept in the URL hash. */
export const ExtensionsIndex: FC = () => {
  const [filter, setFilter] = useState<Filter>(readHash);
  const all = getExtensions();

  useEffect(() => {
    const onHash = () => setFilter(readHash());
    window.addEventListener('hashchange', onHash);

    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const present = new Set(all.map((e) => e.status));
  const filters: Filter[] = ['all', ...EXTENSION_STATUSES.filter((s) => present.has(s))];
  const visible = filter === 'all' ? all : all.filter((e) => e.status === filter);

  const choose = (next: Filter) => {
    setFilter(next);
    history.replaceState(null, '', next === 'all' ? window.location.pathname : `#${next}`);
  };

  return (
    <main className='mx-auto w-full max-w-[880px] px-4 py-16 sm:py-24'>
      <p className='text-eyebrow mb-3 text-ink-mute'>Extensions</p>
      <h1 className='text-h2 mb-4 text-ink'>Turn on only what you use.</h1>
      <p className='mb-8 max-w-[56ch] text-ink-soft'>Optional features that ship with Devkitty. Switch each one on in Settings › Extensions.</p>

      <div
        aria-label='Filter by status'
        className='mb-8 flex flex-wrap gap-2'
        role='group'
      >
        {filters.map((f) => (
          <button
            aria-pressed={filter === f}
            className='cursor-pointer rounded-full border border-line bg-bg-raised px-3 py-1 text-sm text-ink-soft transition-colors duration-120 hover:text-ink aria-pressed:border-transparent aria-pressed:bg-accent-fill aria-pressed:text-accent-ink'
            key={f}
            onClick={() => choose(f)}
            type='button'
          >
            {LABEL[f]}
          </button>
        ))}
      </div>

      <ExtensionGroups extensions={visible} />
    </main>
  );
};
