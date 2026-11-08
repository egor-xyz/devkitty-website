import { type FC } from 'react';

import { useResolvedTheme } from '../../lib/theme';

type Props = {
  alt: string;
  className?: string;
  height: number;
  /** File stem under /shots/, e.g. 'workspace' for /shots/workspace-light.webp. */
  name: string;
  priority?: boolean;
  /** Append '-1280' to the file name (the smaller variant). */
  small?: boolean;
  width: number;
};

/** A real app screenshot in the resolved theme, with intrinsic size to keep layout stable. */
export const Shot: FC<Props> = ({ alt, className, height, name, priority = false, small = false, width }) => {
  const theme = useResolvedTheme();

  return (
    <img
      alt={alt}
      className={className}
      decoding='async'
      fetchPriority={priority ? 'high' : 'auto'}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      src={`/shots/${name}-${theme}${small ? '-1280' : ''}.webp`}
      width={width}
    />
  );
};
