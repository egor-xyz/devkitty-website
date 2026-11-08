import { type FC } from 'react';

/** The extension's own line icon, painted in the current text colour (an <img> cannot inherit it). */
export const ExtensionIcon: FC<{ className?: string; size?: number; src: string }> = ({ className = '', size = 28, src }) => (
  <span
    aria-hidden='true'
    className={`inline-block shrink-0 bg-current ${className}`}
    style={{
      height: size,
      mask: `url(${src}) center / contain no-repeat`,
      WebkitMask: `url(${src}) center / contain no-repeat`,
      width: size
    }}
  />
);
