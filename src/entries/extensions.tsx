import '@fontsource-variable/baloo-2';
import '@fontsource/chewy';
import '@fontsource-variable/geist-mono';
import '@fontsource/gochi-hand';
import '@fontsource/lilita-one';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { createRoot } from 'react-dom/client';

import { ExtensionPage } from '../components/Extensions/ExtensionPage';
import { ExtensionsIndex } from '../components/Extensions/ExtensionsIndex';
import { Palette } from '../components/Palette/Palette';
import { SiteFooter } from '../components/SiteFooter/SiteFooter';
import { SiteHeader } from '../components/SiteHeader/SiteHeader';
import { openExternalLinksInNewTab } from '../lib/externalLinks';
import { markDownloadSupport } from '../lib/platform';
import '../index.css';

openExternalLinksInNewTab();
markDownloadSupport();

const { extensionId } = document.body.dataset;

createRoot(document.getElementById('root')!).render(
  <LazyMotion
    features={domAnimation}
    strict
  >
    <MotionConfig reducedMotion='user'>
      <SiteHeader />
      {extensionId ? <ExtensionPage id={extensionId} /> : <ExtensionsIndex />}
      <SiteFooter />
      <Palette />
    </MotionConfig>
  </LazyMotion>
);
