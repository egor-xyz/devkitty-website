import { type FC } from 'react';

import { useLatestRelease } from '../../lib/latestRelease';
import { Apple } from '../icons';

type Props = { size?: 'lg' | 'md' };

/** One prominent Apple Silicon download, wired to the latest devkitty-releases zip. */
export const DownloadButtons: FC<Props> = ({ size = 'md' }) => {
  const { build, version, zipUrl } = useLatestRelease();
  const pad = size === 'lg' ? 'h-14 px-8 text-[15px]' : 'h-12 px-6 text-sm';

  return (
    <div className='flex flex-col items-center gap-3'>
      <a
        aria-label='Download Devkitty for Mac (Apple Silicon)'
        className={`btn-grape group inline-flex items-center gap-3 rounded-xl font-semibold transition-[filter,box-shadow] duration-200 hover:brightness-110 ${pad}`}
        href={zipUrl}
      >
        <Apple className='h-5 w-5' />

        <span className='flex flex-col items-start leading-none'>
          <span>Download for Mac</span>
          <span className='mt-0.5 font-mono text-[10px] font-normal opacity-80'>Apple Silicon</span>
        </span>
      </a>

      <p className='font-mono text-xs tabular-nums text-ink-mute'>
        {version} (build {build})
      </p>
    </div>
  );
};
