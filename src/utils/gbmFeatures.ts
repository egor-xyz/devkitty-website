import { IconName } from '@blueprintjs/icons';
import { AnimationControls, TargetAndTransition, Transition, VariantLabels } from 'framer-motion';

type GbmFeatures = {
  title: string;
  icon: IconName,
  desc?: string;
  image?: string;
  transition?: Transition;
  initial?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
  animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
}[]

export const gbmFeatures: GbmFeatures = [
  {
    icon: 'projects',
    title: 'Manage multiple projects',
  },
  {
    icon: 'git-new-branch',
    title: 'Quick checkout between branches with stash or create new branches'
  },
  {
    icon: 'refresh',
    title: 'Auto fetch projects',
    transition: {
      loop: Infinity,
      duration: 2,
      ease: 'linear',
    },
    initial: {
      rotate: 0,
    },
    animate: {
      rotate: '360deg'
    },
  },
  {
    icon: 'git-pull',
    title: 'Create and view pull requests',
  },
  {
    icon: 'clipboard',
    title: 'Quickly copy branch names'
  },
  {
    icon: 'arrow-down',
    title: 'Easily sync projects with their remote',
    transition: {
      loop: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
    initial: {
      opacity: 0,
      y: '-50%',
    },
    animate: {
      opacity: [0, 1, 0],
      y: ['-50%', '0%', '50%']
    },
  },
  {
    icon: 'git-repo',
    title: 'Open on GitHub, Bitbucket, GitLab...'
  },
  {
    icon: 'code',
    title: 'Integration with your favorite IDE or code editor'
  },
  {
    icon: 'small-minus',
    title: 'Open in iTerm (MacOS only)',
    transition: {
      loop: Infinity,
      duration: 3,
      ease: 'linear',
    },
    initial: {
      opacity: 0,
      y: '10px',
    },
    animate: {
      opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    },
  },
  {
    icon: 'folder-open',
    title: 'Reveal in Finder/File Explorer'
  }
];
