import { type FC } from 'react';

import { RELEASES_PAGE } from '../../lib/latestRelease';
import { ThemeSwitch } from './ThemeSwitch';

export const SiteFooter: FC = () => (
  <footer className='site-footer'>
    <nav className='flex flex-wrap items-center gap-x-6 gap-y-2'>
      <a href='/privacy/'>Privacy</a>
      <a href='/terms/'>Terms</a>

      <a
        href={RELEASES_PAGE}
        rel='noreferrer'
      >
        Releases
      </a>
    </nav>

    <ThemeSwitch />
    <p>© 2026 Devkitty</p>
  </footer>
);
