import { IconName } from '@blueprintjs/icons';
import { AnimationControls, TargetAndTransition, Transition, VariantLabels } from 'framer-motion';

type GbmFeatures = {
  animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
  desc?: string;
  icon: IconName,
  image?: string;
  initial?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
  title: string;
  transition?: Transition;
}[]

export const gbmFeatures: GbmFeatures = [
  {
    icon: 'projects',
    title: 'Manage multiple projects'
  },
  {
    animate: {
      opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
    },
    icon: 'play',
    initial: {
      opacity: 0
    },
    title: 'Manage Jenkins Jobs',
    transition: {
      duration: 6,
      ease: 'linear',
      loop: Infinity
    }
  },
  {
    icon: 'git-new-branch',
    title: 'Quick checkout between branches with stash or create new branches'
  },
  {
    animate: {
      rotate: '360deg'
    },
    icon: 'refresh',
    initial: {
      rotate: 0
    },
    title: 'Auto fetch projects',
    transition: {
      duration: 2,
      ease: 'linear',
      loop: Infinity
    }
  },
  {
    icon: 'git-pull',
    title: 'Create and view pull requests'
  },
  {
    icon: 'clipboard',
    title: 'Quickly copy branch names'
  },
  {
    animate: {
      opacity: [0, 1, 0],
      y: ['-50%', '0%', '50%']
    },
    icon: 'arrow-down',
    initial: {
      opacity: 0,
      y: '-50%'
    },
    title: 'Easily sync projects with their remote',
    transition: {
      duration: 1.5,
      ease: 'linear',
      loop: Infinity
    }
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
    animate: {
      opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
    },
    icon: 'small-minus',
    initial: {
      opacity: 0,
      y: '10px'
    },
    title: 'Open in iTerm (MacOS only)',
    transition: {
      duration: 3,
      ease: 'linear',
      loop: Infinity
    }
  },
  {
    icon: 'folder-open',
    title: 'Reveal in Finder/File Explorer'
  }
];
