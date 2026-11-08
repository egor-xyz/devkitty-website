import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { type FC, type PointerEvent, type ReactNode, useState } from 'react';

import { SPRING_SOFT } from '../../lib/motion';

type Props = { children: ReactNode; className?: string; label: string };

/**
 * A small mono pill that follows the pointer over an interactive demo.
 * Fine pointers only; the system cursor is never hidden.
 */
export const CursorHint: FC<Props> = ({ children, className, label }) => {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_SOFT);
  const sy = useSpring(y, SPRING_SOFT);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const box = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - box.left + 14);
    y.set(e.clientY - box.top + 14);
    setActive(true);
  };

  return (
    <div
      className={`relative ${className ?? ''}`}
      onPointerLeave={() => setActive(false)}
      onPointerMove={onMove}
    >
      {children}

      <m.span
        aria-hidden
        className='pointer-events-none absolute top-0 left-0 hidden rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] text-bg [@media(pointer:fine)]:block'
        style={{ opacity: active ? 1 : 0, x: reduced ? x : sx, y: reduced ? y : sy }}
      >
        {label}
      </m.span>
    </div>
  );
};
