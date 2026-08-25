import { motion, useScroll, useTransform } from 'framer-motion';
import { type ComponentType, type FC, type SVGProps, useRef } from 'react';

import { AppWindow } from '../AppWindow/AppWindow';
import { Branch, Check, Gauge, Pull, Workflow } from '../icons';

type Feature = {
  alt: string;
  bullets: string[];
  desc: string;
  eyebrow: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  src: string;
  title: string;
};

const features: Feature[] = [
  {
    alt: 'Workflow run with an actions menu open: re-run all jobs, re-run failed jobs, pin, hide',
    bullets: ['Runs grouped by branch and repo', 'Re-run, pin or hide any workflow', 'Native notifications when something fails'],
    desc: 'Every workflow run across every repository, color-coded by status. Re-run failed jobs, pin the ones you watch and hide the noise — without leaving the app.',
    eyebrow: 'GitHub Actions',
    icon: Workflow,
    src: '/images/demo-7.png',
    title: 'Every run, and every action'
  },
  {
    alt: 'Horizontal job graph: build, test, lint, then deploy to staging and production',
    bullets: ['Jobs laid out as a live DAG', 'Drill into steps and timings', 'Staging → production, stage by stage'],
    desc: 'Expand any run to see its jobs as a horizontal pipeline — build, test, lint, then staging and production deploys — with step-level detail and durations.',
    eyebrow: 'Pipelines',
    icon: Workflow,
    src: '/images/demo-1.png',
    title: 'Follow the pipeline, stage by stage'
  },
  {
    alt: 'Branch switcher dropdown open over a repository card',
    bullets: ['Switch branches with stash', 'Worktrees as checkout cards', 'Behind/ahead counts at a glance'],
    desc: 'Jump between branches without leaving the app. Devkitty stashes for you and shows each worktree as its own checkout card, so parallel work stays untangled.',
    eyebrow: 'Branches & worktrees',
    icon: Branch,
    src: '/images/demo-3.png',
    title: 'Switch branches without the ceremony'
  },
  {
    alt: 'Pull request rows with labels, review tags and check summaries',
    bullets: ['Labels, reviewers and check summaries', 'Draft and bot PRs called out', 'Always live — polled, never stale'],
    desc: 'See your pull requests where the work is: labels, review state and CI check summaries inline, refreshing on their own so the board is never out of date.',
    eyebrow: 'Pull requests',
    icon: Pull,
    src: '/images/demo-4.png',
    title: 'Pull requests, in context'
  },
  {
    alt: 'Claude Code usage popover with 7-day limit and a per-model token breakdown',
    bullets: ['5-hour and 7-day windows', 'Per account, per model', 'Live from Claude Code'],
    desc: 'Devkitty reads your Claude Code usage and shows it right in the footer — 5-hour and 7-day windows, per account, with a per-model breakdown that updates live.',
    eyebrow: 'Claude Code',
    icon: Gauge,
    src: '/images/demo-8.png',
    title: 'Your Claude Code usage, always in view'
  }
];

// Orchestrated one-time reveal: children rise and sharpen out of a blur in
// sequence — reads "expensive" without re-triggering on scroll.
const group = { hide: {}, show: { transition: { delayChildren: 0.06, staggerChildren: 0.1 } } };
const item = {
  hide: { filter: 'blur(10px)', opacity: 0, y: 28 },
  show: { filter: 'blur(0px)', opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }, y: 0 }
};
const pop = {
  hide: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.5, 1] as const } }
};

const Block: FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ offset: ['start end', 'end start'], target: ref });
  // Gentle continuous parallax as the block scrolls through — the screenshot
  // drifts up a touch, the glow drifts the other way. Not a re-triggering
  // reveal, just depth.
  const imgY = useTransform(scrollYProgress, [0, 1], [45, -45]);
  const glowY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const Icon = feature.icon;

  return (
    <div
      className='relative'
      data-stage={index}
      ref={ref}
    >
      {/* section separator: a short glowing sunset rule, so each stage reads
          as its own panel without a line cutting through the copy */}
      {index > 0 && (
        <div
          aria-hidden
          className='mx-auto mb-16 h-px w-28 bg-gradient-to-r from-transparent via-grape/60 to-transparent'
        />
      )}

      {/* colour wash behind the screenshot, parallaxed the opposite way */}
      <motion.div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[340px] max-w-4xl rounded-full bg-grape/15 blur-3xl'
        style={{ y: glowY }}
      />

      <motion.div
        className='mx-auto max-w-2xl text-center'
        initial='hide'
        variants={group}
        viewport={{ margin: '-12% 0px -30% 0px' }}
        whileInView='show'
      >
        <motion.span
          className='inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-coral'
          variants={item}
        >
          <Icon className='h-4 w-4' />
          {feature.eyebrow}
        </motion.span>

        <motion.h3
          className='mt-4 text-4xl font-bold md:text-5xl'
          variants={item}
        >
          <span className='gradient-text'>{feature.title}</span>
        </motion.h3>

        <motion.p
          className='mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft'
          variants={item}
        >
          {feature.desc}
        </motion.p>

        <motion.div
          className='mt-6 flex flex-wrap justify-center gap-2.5'
          variants={group}
        >
          {feature.bullets.map((b) => (
            <motion.span
              className='glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink-soft'
              key={b}
              variants={pop}
            >
              <span className='flex h-4 w-4 items-center justify-center rounded-full bg-grape/25 text-grape-lite'>
                <Check className='h-2.5 w-2.5' />
              </span>

              {b}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* big screenshot — full container width, so every detail is legible */}
      <motion.div
        className='mt-12'
        style={{ y: imgY }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ margin: '-12% 0px -25% 0px' }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
        >
          <AppWindow
            alt={feature.alt}
            src={feature.src}
            tilt={index % 2 === 0 ? 4 : -4}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Features: FC = () => (
  <section
    className='relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-32'
    id='features'
  >
    <div className='mx-auto max-w-2xl text-center'>
      <h2 className='text-4xl font-bold tracking-tight md:text-5xl'>
        Built for people who <span className='gradient-text'>live in GitHub</span>
      </h2>

      <p className='mt-4 text-lg text-ink-soft'>
        The daily flows — actions, pipelines, branches, pull requests — redesigned for a desktop that
        keeps up with you.
      </p>
    </div>

    <div className='relative mt-20'>
      <div className='space-y-28'>
        {features.map((feature, i) => (
          <Block
            feature={feature}
            index={i}
            key={feature.title}
          />
        ))}
      </div>
    </div>
  </section>
);
