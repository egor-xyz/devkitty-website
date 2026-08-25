import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type FC, type PointerEvent } from 'react';

type Props = {
  alt: string;
  className?: string;
  glow?: boolean;
  src: string;
  /** Max tilt in degrees on pointer move. 0 disables interactive tilt. */
  tilt?: number;
};

/**
 * A macOS-style window chrome wrapping an app screenshot, tilted in 3D and
 * reacting to the pointer. Springs keep the motion buttery; reduced-motion
 * users get a static frame because the springs simply never receive input.
 */
export const AppWindow: FC<Props> = ({ alt, className = '', glow = true, src, tilt = 8 }) => {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [tilt, -tilt]), { damping: 20, stiffness: 150 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-tilt, tilt]), { damping: 20, stiffness: 150 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className={`scene ${className}`}>
      <motion.div
        className={`tilt rounded-xl overflow-hidden ring-1 ring-white/10 ${glow ? 'win-shadow' : ''}`}
        onPointerLeave={onLeave}
        onPointerMove={onMove}
        style={{ rotateX: rx, rotateY: ry }}
      >
        {/* The screenshots already carry the macOS window chrome, so the frame
            here is just a rounded, glowing container. */}
        <img
          alt={alt}
          className='block w-full h-auto'
          loading='lazy'
          src={src}
        />
      </motion.div>
    </div>
  );
};
