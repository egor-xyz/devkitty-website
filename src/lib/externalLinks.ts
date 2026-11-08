/**
 * Open every link to another site in a new tab (releases, GitHub, policies, changelog links...).
 * One delegated listener covers static HTML and React links. Direct file downloads (.zip, .txt)
 * stay in the same tab, so no empty tab is left behind.
 */
const isDownload = (url: URL) => /\.(zip|dmg|txt)$/i.test(url.pathname);

export function openExternalLinksInNewTab(): void {
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!(a instanceof HTMLAnchorElement) || a.target) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(url.protocol) || url.origin === window.location.origin || isDownload(url)) return;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    },
    { capture: true }
  );
}
