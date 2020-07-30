import { IconName } from '@blueprintjs/icons';

type GbmFeatures = {
  title: string;
  icon: IconName,
  desc?: string;
  image?: string;
}[]

export const gbmFeatures: GbmFeatures = [
  {
    icon: 'projects',
    title: 'Manage multiple projects'
  },
  {
    icon: 'git-new-branch',
    title: 'Quick checkout between branches with stash or create new branches'
  },
  {
    icon: 'refresh',
    title: 'Auto fetch projects'
  },
  {
    icon: 'arrow-down',
    title: 'Easily sync projects with their remote'
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
    icon: 'git-repo',
    title: 'Open on GitHub, Bitbucket, GitLab...'
  },
  {
    icon: 'code',
    title: 'Integration with your favorite IDE or code editor'
  },
  {
    icon: 'console',
    title: 'Open in iTerm (MacOS only)'
  },
  {
    icon: 'folder-open',
    title: 'Reveal in Finder/File Explorer'
  }
];
