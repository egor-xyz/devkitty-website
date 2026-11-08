export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const SPRING_UI = { damping: 38, mass: 0.9, stiffness: 420, type: 'spring' } as const;
export const SPRING_SOFT = { damping: 26, stiffness: 160, type: 'spring' } as const;

/** Durations in seconds. Nothing over 0.9 s unless scroll-linked. */
export const DUR = { hover: 0.12, reveal: 0.6, ui: 0.24 } as const;
