import { type FC } from 'react';

import { RELEASES_PAGE } from '../../lib/latestRelease';

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

    <p className='text-[13px]'>© {new Date().getFullYear()} devkitty.app. All rights reserved.</p>
  </footer>
);
