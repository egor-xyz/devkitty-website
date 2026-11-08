/** The visible lit-layer monitor screen (the drawn Devkitty window), in viewport px. */
export function getMonitorScreenRect(): DOMRect | null {
  const el = document.querySelector('[data-hero-stage] .L-after [data-monitor-screen]');

  return el ? el.getBoundingClientRect() : null;
}
