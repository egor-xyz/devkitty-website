import { type FC, useEffect, useState } from 'react';

import { useLatestRelease } from '../../lib/latestRelease';
import { openPalette } from '../../lib/palette';
import { AppIcon } from '../CatMark';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/extensions/', label: 'Extensions' },
  { href: '/#changelog', label: 'Changelog' }
];

export const SiteHeader: FC = () => {
  const { zipUrl } = useLatestRelease();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className='site-header'
      data-scrolled={scrolled}
    >
      <div className='mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4'>
        <a
          className='flex items-center gap-2 text-ink no-underline'
          href='/'
        >
          <AppIcon className='h-8 w-8' />
          <span className='font-display text-xl'>Devkitty</span>
        </a>

        <nav
          aria-label='Primary'
          className='hidden items-center gap-6 text-[0.9375rem] md:flex'
        >
          {LINKS.map(({ href, label }) => (
            <a
              className='text-ink-soft no-underline hover:text-ink hover:underline'
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className='flex items-center gap-3'>
          <button
            aria-label='Open command palette'
            className='cursor-pointer rounded-md border border-line bg-bg-raised px-2 py-0.5 font-mono text-xs text-ink-soft transition-transform duration-120 hover:text-ink active:scale-[0.98]'
            onClick={openPalette}
            type='button'
          >
            ⌘K
          </button>

          <a
            className='rounded-full bg-accent-fill px-4 py-1.5 text-sm font-medium text-accent-ink no-underline transition-transform duration-120 active:scale-[0.98]'
            href={zipUrl}
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
};
