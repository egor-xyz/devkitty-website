import { type FC } from 'react';
import { useVersion } from 'store/useVersions';
import { scrollToId } from 'utils';

import { AppIcon } from '../CatMark';
import { GitHub } from '../icons';

export const Footer: FC = () => {
  const { version } = useVersion();

  return (
    <footer className='relative border-t border-white/10 px-5 py-12'>
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row'>
        <div className='flex items-center gap-2.5'>
          <AppIcon className='h-9 w-9' />
          <span className='shine-text text-xl font-bold'>devkitty</span>
          {version && <span className='font-mono text-xs text-ink-mute'>{version}</span>}
        </div>

        <nav className='flex items-center gap-6 text-sm text-ink-soft'>
          <a
            className='transition-colors hover:text-ink'
            href='#features'
            onClick={scrollToId('features')}
          >
            Features
          </a>

          <a
            className='transition-colors hover:text-ink'
            href='#download'
            onClick={scrollToId('download')}
          >
            Download
          </a>

          <a
            className='inline-flex items-center gap-2 transition-colors hover:text-ink'
            href='https://github.com/egor-xyz/devkitty'
            rel='noreferrer'
            target='_blank'
          >
            <GitHub className='h-4 w-4' />
            GitHub
          </a>
        </nav>

        <p className='font-mono text-xs text-ink-mute'>© {new Date().getFullYear()} Devkitty · MIT</p>
      </div>
    </footer>
  );
};
