import { type FC } from 'react';

import Fox from '../assets/svg/fox.svg?react';

type Props = { className?: string };

/** The real Devkitty cat vector (recoloured silver to match the app icon). */
export const CatMark: FC<Props> = ({ className }) => <Fox className={className} />;

/** The full app icon exactly as it ships on macOS — the chrome-gradient cat on
 * its dark rounded tile (the real PNG, so the metallic shading matches). */
export const AppIcon: FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <img
    alt='Devkitty'
    className={`block shrink-0 object-contain ${className}`}
    src='/images/app-icon.png'
  />
);
