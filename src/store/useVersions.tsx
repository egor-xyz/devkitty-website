import { version } from 'version';
import { create } from 'zustand';

type State = {
  download: {
    apple: () => string;
    intel: () => string;
  };
  version: string;
};

export const useVersion = create<State>((_, get) => ({
  download: {
    apple: () => {
      const { version } = get();
      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-arm64-${version.replace(
        'v',
        ''
      )}.zip`;
    },
    intel: () => {
      const { version } = get();
      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-x64-${version.replace(
        'v',
        ''
      )}.zip`;
    }
  },
  version
}));
