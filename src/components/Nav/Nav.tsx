import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { type FC, useState } from 'react';
import { useVersion } from 'store/useVersions';

import { AppIcon } from '../CatMark';
import { GitHub } from '../icons';

export const Nav: FC = () => {
  const { version } = useVersion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 24));

  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className='fixed inset-x-0 top-0 z-50'
      initial={{ opacity: 0, y: -20 }}
      transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={`mx-auto flex h-[var(--nav-h)] max-w-6xl items-center justify-between rounded-2xl border px-5 transition-[background-color,border-color,box-shadow,margin] duration-300 ease-out ${
          solid
            ? 'my-2 border-white/10 bg-white/[0.06] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent'
        }`}
      >
        <a
          className='flex items-center gap-2.5'
          href='#'
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ behavior: 'smooth', top: 0 });
          }}
        >
          <AppIcon className='h-10 w-10' />
          <span className='shine-text text-2xl font-bold tracking-tight'>devkitty</span>
        </a>

        <nav className='hidden items-center gap-8 text-sm text-ink-soft md:flex'>
          <a
            className='transition-colors hover:text-ink'
            href='#features'
          >
            Features
          </a>

          <a
            className='transition-colors hover:text-ink'
            href='#download'
          >
            Download{version ? ` ${version}` : ''}
          </a>
        </nav>

        <a
          aria-label='Star egor-xyz/devkitty on GitHub'
          className='glass inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-ink transition-colors hover:bg-white/10'
          href='https://github.com/egor-xyz/devkitty'
          rel='noreferrer'
          target='_blank'
        >
          <GitHub className='h-4 w-4' />
          <span className='hidden sm:inline'>Star</span>
        </a>
      </div>
    </motion.header>
  );
};
