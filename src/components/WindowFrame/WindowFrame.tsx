import { type FC, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; title?: string };

/** A macOS-style window: traffic lights, optional title, content below. */
export const WindowFrame: FC<Props> = ({ children, className = '', title }) => (
  <div className={`overflow-hidden rounded-xl border border-line bg-bg-raised shadow-xl ${className}`}>
    <div className='flex h-9 items-center gap-2 border-b border-line bg-surface px-3'>
      <span
        aria-hidden
        className='h-3 w-3 rounded-full bg-[#ff5f57]'
      />

      <span
        aria-hidden
        className='h-3 w-3 rounded-full bg-[#febc2e]'
      />

      <span
        aria-hidden
        className='h-3 w-3 rounded-full bg-[#28c840]'
      />

      {title && <span className='ml-2 truncate font-mono text-xs text-ink-mute'>{title}</span>}
    </div>

    {children}
  </div>
);
