import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';

import { ChangelogStrip } from '../Changelog/ChangelogStrip';
import { Download } from '../Download/Download';
import { ExtensionsSection } from '../Extensions/ExtensionsSection';
import { FeaturesZoom } from '../Features/FeaturesZoom';
import { Hero } from '../Hero/Hero';
import { Palette } from '../Palette/Palette';
import { PaletteSection } from '../Palette/PaletteSection';
import { SiteFooter } from '../SiteFooter/SiteFooter';
import { SiteHeader } from '../SiteHeader/SiteHeader';

export const App = () => (
  <LazyMotion
    features={domAnimation}
    strict
  >
    <MotionConfig reducedMotion='user'>
      <SiteHeader />

      <main>
        <Hero />
        <FeaturesZoom />
        <ExtensionsSection />
        <PaletteSection />
        <ChangelogStrip />
        <Download />
      </main>

      <SiteFooter />
      <Palette />
    </MotionConfig>
  </LazyMotion>
);
