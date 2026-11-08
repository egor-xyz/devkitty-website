import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';

import { SiteZoom } from '../Features/FeaturesZoom';
import { Hero } from '../Hero/Hero';
import { Palette } from '../Palette/Palette';
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
        <SiteZoom />
      </main>

      <SiteFooter />
      <Palette />
    </MotionConfig>
  </LazyMotion>
);
