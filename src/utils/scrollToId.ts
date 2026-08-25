import type { MouseEvent } from 'react';

/**
 * Smooth-scrolls to the element with the given id without adding a hash to the URL.
 */
export const scrollToId = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
