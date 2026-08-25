import { motion } from 'framer-motion';
import { type FC } from 'react';

import { AppWindow } from '../AppWindow/AppWindow';
import { DownloadButtons } from '../DownloadButtons/DownloadButtons';
import { Branch, Gauge, Pull, Workflow } from '../icons';

const chips = [
  { icon: Workflow, label: 'GitHub Actions' },
  { icon: Pull, label: 'Pull requests' },
  { icon: Branch, label: 'Worktrees' },
  { icon: Gauge, label: 'Claude Code usage' }
];

// Each hero line rises into place; the parent staggers them on load.
const rise = {
  hide: { opacity: 0, y: 22 },
  show: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }, y: 0 }
};

export const Hero: FC = () => (
  <section
    className='relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32'
  >
    {/* aurora field */}
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0'
    >
      <span
        className='aurora right-[-6%] top-[-6%] h-[380px] w-[460px] bg-coral opacity-40'
        style={{ animation: 'drift-2 20s ease-in-out infinite' }}
      />

      <span
        className='aurora bottom-[6%] left-[30%] h-[300px] w-[520px] bg-grape-deep opacity-30'
        style={{ animation: 'drift 24s ease-in-out infinite' }}
      />

    </div>

    <div className='relative mx-auto max-w-6xl px-5'>
      <motion.div
        animate='show'
        className='mx-auto max-w-3xl text-center'
        initial='hide'
        variants={{ show: { transition: { delayChildren: 0.1, staggerChildren: 0.12 } } }}
      >
        <motion.span
          className='glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-soft'
          variants={rise}
        >
          <span className='h-1.5 w-1.5 rounded-full bg-coral' />
          <span>The GitHub desktop copilot for macOS</span>
        </motion.span>

        <motion.h1
          className='mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl'
          variants={rise}
        >
          All your repos.
          <br />
          <span className='gradient-text'>One calm window.</span>
        </motion.h1>

        <motion.p
          className='mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft'
          variants={rise}
        >
          Devkitty keeps every repository, GitHub Action, pull request and branch in a single native
          app — so you stop tab-hopping and start shipping.
        </motion.p>

        <motion.div
          className='mt-9 flex justify-center'
          variants={rise}
        >
          <DownloadButtons size='lg' />
        </motion.div>

        <motion.div
          className='mt-8 flex flex-wrap items-center justify-center gap-2.5'
          variants={rise}
        >
          {chips.map(({ icon: Icon, label }) => (
            <span
              className='glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-ink-soft'
              key={label}
            >
              <Icon className='h-3.5 w-3.5 text-grape-lite' />
              {label}
            </span>
            ))}
        </motion.div>
      </motion.div>

      <div className='relative mx-auto mt-16 max-w-5xl'>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 80 }}
          transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <AppWindow
            alt='Devkitty showing a repo with its CI pipeline, run actions and live Claude Code usage'
            src='/images/demo-main.png'
            tilt={6}
          />
        </motion.div>
      </div>
    </div>
  </section>
  );
