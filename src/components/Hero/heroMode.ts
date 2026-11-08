/** The hero's switch, driven from outside (palette, zoom). heroController.ts listens for the event. */
export const HERO_MODE_EVENT = 'devkitty:hero-mode';

export const isHeroLit = (): boolean => document.querySelector('.hero')?.classList.contains('lit') ?? false;

/** Switch the hero to Devkitty (`true`) or Terminal (`false`). Returns false, and does nothing, when it is already there. */
export function setHeroMode(lit: boolean): boolean {
  if (isHeroLit() === lit) return false;
  window.dispatchEvent(new CustomEvent<{ lit: boolean }>(HERO_MODE_EVENT, { detail: { lit } }));

  return true;
}
