import { type FC, useEffect, useState } from 'react';

import { useLatestRelease } from '../../lib/latestRelease';
import { openPalette } from '../../lib/palette';
import { AppIcon } from '../CatMark';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#extensions', label: 'Extensions' },
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
      <div className='mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1'>
        <a
          className='flex items-center gap-2 text-ink no-underline'
          href='/'
        >
          <AppIcon className='h-12 w-12 sm:h-16 sm:w-16' />
          <span className='font-display text-xl'>Devkitty</span>
        </a>

        <nav
          aria-label='Primary'
          className='order-last flex w-full items-center justify-center gap-2 font-fun text-lg tracking-wide md:order-none md:w-auto md:gap-6'
        >
          {LINKS.map(({ href, label }) => (
            <a
              className='inline-flex min-h-11 items-center px-2 text-ink-soft no-underline hover:text-ink hover:underline md:min-h-0 md:px-0'
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
            className='hdr-key'
            onClick={openPalette}
            type='button'
          >
            ⌘K
          </button>

          <a
            className='hdr-download'
            data-download-link
            href={zipUrl}
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
};
