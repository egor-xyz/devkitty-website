/**
 * Devkitty runs only on macOS desktops. iPadOS reports "Macintosh" too, so a touch screen rules it out.
 */
export function canDownload(): boolean {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean; platform?: string } };
  const isMac = nav.userAgentData?.platform
    ? nav.userAgentData.platform === 'macOS'
    : /Macintosh|Mac OS X/.test(nav.userAgent);
  return isMac && !nav.userAgentData?.mobile && nav.maxTouchPoints < 2;
}

/** Hides every element marked `data-download-link` on devices that cannot run the app (see index.css). */
export function markDownloadSupport(): void {
  if (!canDownload()) document.documentElement.dataset.download = 'no';
}
