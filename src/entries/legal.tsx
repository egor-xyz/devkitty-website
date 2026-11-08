import '@fontsource-variable/baloo-2';
import '@fontsource/chewy';
import '@fontsource/lilita-one';
import '@fontsource-variable/geist-mono';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { Palette } from '../components/Palette/Palette';
import { SiteFooter } from '../components/SiteFooter/SiteFooter';
import { SiteHeader } from '../components/SiteHeader/SiteHeader';
import { openExternalLinksInNewTab } from '../lib/externalLinks';
import '../index.css';

openExternalLinksInNewTab();

// The static header and footer in the HTML stay as the no-JS fallback; with JS the shared ones replace them.
const mount = (id: string, node: ReactNode) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.replaceChildren();
  createRoot(el).render(
    <LazyMotion
      features={domAnimation}
      strict
    >
      <MotionConfig reducedMotion='user'>{node}</MotionConfig>
    </LazyMotion>
  );
};

mount(
  'site-header',
  <>
    <SiteHeader />
    <Palette />
  </>
);
mount('site-footer', <SiteFooter />);
