export const OPEN_PALETTE_EVENT = 'devkitty:open-palette';

/** Opens the global command palette (the mounted `Palette` listens for this event). */
export function openPalette(): void {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}
