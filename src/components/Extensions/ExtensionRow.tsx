import { type FC } from 'react';

import { type Extension } from '../../lib/extensions';
import { ExtensionIcon } from './ExtensionIcon';
import { StatusPill } from './StatusPill';

/** One compact native-style row; the whole row links to the extension's page. */
export const ExtensionRow: FC<{ extension: Extension }> = ({ extension }) => (
  <a
    className='group flex items-center gap-3 border-b border-line px-2 py-3 text-ink no-underline transition-colors duration-120 hover:bg-surface sm:gap-4 sm:px-3'
    href={`/extensions/${extension.id}/`}
  >
    <ExtensionIcon
      className='text-accent'
      src={extension.icon}
    />

    <span className='min-w-0 flex-1'>
      <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-semibold'>{extension.name}</span>
        <StatusPill status={extension.status} />
      </span>

      <span className='block text-[0.9375rem] leading-snug text-ink-soft'>{extension.tagline}</span>
    </span>


    <span
      aria-hidden='true'
      className='shrink-0 text-ink-mute transition-transform duration-120 group-hover:translate-x-0.5'
    >
      →
    </span>
  </a>
);
