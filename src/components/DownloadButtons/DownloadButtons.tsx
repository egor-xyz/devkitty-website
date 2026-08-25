import { type FC } from 'react';
import { useVersion } from 'store/useVersions';

import { Apple } from '../icons';

type Props = { size?: 'lg' | 'md' };

const LATEST = 'https://github.com/egor-xyz/devkitty/releases/latest';

/**
 * A single prominent Apple-silicon download, with Intel demoted to a small text
 * link beneath it. Wired to the existing version store (version from Convex).
 */
export const DownloadButtons: FC<Props> = ({ size = 'md' }) => {
  const { download, version } = useVersion();
  const pad = size === 'lg' ? 'h-14 px-8 text-[15px]' : 'h-12 px-6 text-sm';

  return (
    <div className='flex flex-col items-center gap-3'>
      <a
        aria-label='Download Devkitty for Apple Silicon'
        className={`btn-grape group inline-flex items-center gap-3 rounded-xl font-semibold transition-[filter,box-shadow] duration-200 hover:brightness-110 ${pad}`}
        href={download.apple() ?? LATEST}
      >
        <Apple className='h-5 w-5' />

        <span className='flex flex-col items-start leading-none'>
          <span>Download for Mac</span>
          <span className='mt-0.5 font-mono text-[10px] font-normal opacity-80'>Apple Silicon</span>
        </span>
      </a>

      <p className='text-xs text-ink-mute'>
        <a
          className='underline decoration-white/25 underline-offset-4 transition-colors hover:text-ink-soft'
          href={download.intel() ?? LATEST}
        >
          Also for Intel Mac
        </a>

        {version && <span className='ml-2 font-mono opacity-70'>{version}</span>}
      </p>
    </div>
  );
};
