let locks = 0;

/**
 * Stops the page scrolling without a sideways jump: the removed scrollbar's width goes back as padding.
 * Nested locks (the palette over the zoom) are counted. Returns the unlock function; call it once.
 */
export const lockScroll = (): (() => void) => {
  const root = document.documentElement;
  if (locks++ === 0) {
    const bar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (bar > 0) {
      root.style.paddingRight = `${bar}px`;
      root.style.setProperty('--lock-pad', `${bar}px`); // fixed elements read this: padding does not move them
    }
  }

  let done = false;

  return () => {
    if (done) return;
    done = true;
    if (--locks === 0) {
      root.style.overflow = '';
      root.style.paddingRight = '';
      root.style.removeProperty('--lock-pad');
    }
  };
};
