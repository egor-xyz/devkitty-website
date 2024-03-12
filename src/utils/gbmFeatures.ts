import { IconName } from '@blueprintjs/icons';
import { AnimationControls, TargetAndTransition, Transition, VariantLabels } from 'framer-motion';

type GbmFeatures = {
  animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
  desc?: string;
  icon: IconName;
  image?: string;
  initial?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
  title: string;
  transition?: Transition;
}[];

export const features: GbmFeatures = [
  {
    icon: 'projects',
    title: 'Manage multiple GitHub repositories'
  },
  {
    animate: {
      opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
    },
    icon: 'play',
    initial: {
      opacity: 0
    },
    title: 'View GitHub Actions',
    transition: {
      duration: 6,
      ease: 'linear',
      repeat: Infinity
    }
  },
  {
    icon: 'git-new-branch',
    title: 'Quick checkout between branches with stash'
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
      repeat: Infinity
    }
  },
  {
    icon: 'git-pull',
    title: 'Remotely reset any branch'
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
      repeat: Infinity
    }
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
    title: 'Integration with your favorite terminal',
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity
    }
  }
];
