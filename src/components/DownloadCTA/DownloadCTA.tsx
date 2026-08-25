import { motion } from 'framer-motion';
import { type FC } from 'react';

import { AppIcon, CatMark } from '../CatMark';
import { DownloadButtons } from '../DownloadButtons/DownloadButtons';

// Same orchestrated blur-in reveal the feature blocks use, so the closing
// call-to-action lands with the same "expensive" weight as the rest of the page.
const group = { hide: {}, show: { transition: { delayChildren: 0.08, staggerChildren: 0.12 } } };
const item = {
  hide: { filter: 'blur(10px)', opacity: 0, y: 26 },
  show: { filter: 'blur(0px)', opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }, y: 0 }
};
const pop = {
  hide: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.34, 1.56, 0.5, 1] as const } }
};

export const DownloadCTA: FC = () => (
  <section
    className='relative flex min-h-[92vh] scroll-mt-24 items-center justify-center overflow-hidden px-5 py-28'
    id='download'
  >
    {/* aurora glow behind the card so it never sits on flat black */}
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0 overflow-hidden'
    >
      <span
        className='aurora left-1/2 top-1/2 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-grape opacity-40'
        style={{ animation: 'drift 18s ease-in-out infinite' }}
      />

      <span
        className='aurora left-[28%] top-[42%] h-48 w-60 bg-coral opacity-30'
        style={{ animation: 'drift-2 22s ease-in-out infinite' }}
      />
    </div>

    <motion.div
      className='relative mx-auto w-full max-w-4xl'
      initial='hide'
      variants={group}
      viewport={{ margin: '-12% 0px -25% 0px' }}
      whileInView='show'
    >
      <div className='grad-ring win-shadow'>
        <div className='relative overflow-hidden rounded-[27px] glass-plum px-6 py-16 text-center md:px-16 md:py-24'>
          {/* the silver cat, embossed faintly into the card as a watermark */}
          <CatMark className='pointer-events-none absolute -right-10 -bottom-12 h-72 w-72 rotate-[-8deg] opacity-[0.07]' />

          <div className='relative'>
            <motion.div
              className='flex justify-center'
              variants={pop}
            >
              <AppIcon className='h-16 w-16 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]' />
            </motion.div>

            <motion.h2
              className='mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl'
              variants={item}
            >
              Bring the whole workflow
              <br />
              <span className='gradient-text'>into one window</span>
            </motion.h2>

            <motion.p
              className='mx-auto mt-5 max-w-lg text-lg text-ink-soft'
              variants={item}
            >
              Free and open source. Download for macOS and let Devkitty watch GitHub so you don’t have to.
            </motion.p>

            <motion.div
              className='mt-9 flex justify-center'
              variants={item}
            >
              <DownloadButtons size='lg' />
            </motion.div>

            <motion.p
              className='mt-6 font-mono text-xs text-ink-mute'
              variants={item}
            >
              Apple Silicon &amp; Intel · macOS 12 or later
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);
