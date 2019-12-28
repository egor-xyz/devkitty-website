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
    title: 'Easy manage multiple projects'
  },
  {
    icon: 'git-new-branch',
    title: 'Quick checkout between branches with stash or create new branch'
  },
  {
    icon: 'refresh',
    title: 'Auto fetch for all projects'
  },
  {
    icon: 'arrow-down',
    title: 'Easy pull latest changes from remote'
  },
  {
    icon: 'git-pull',
    title: 'Easy create pull requests'
  },
  {
    icon: 'clipboard',
    title: 'Easy copy branch name'
  },
  {
    icon: 'git-repo',
    title: 'Open on GitHub, Bitbucket, GitLab and etc...'
  },
  {
    icon: 'code',
    title: 'Open on your favorite IDE or any code editor'
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