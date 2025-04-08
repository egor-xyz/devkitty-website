import { create } from 'zustand';

type State = {
  download: {
    apple: () => string | undefined;
    intel: () => string | undefined;
  };
  setVersion: (version: string) => void;
  version?: string;
};

export const useVersion = create<State>((set, get) => ({
  download: {
    apple: () => {
      const { version } = get();
      if (!version) return;

      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-arm64-${version.replace(
        'v',
        ''
      )}.zip`;
    },
    intel: () => {
      const { version } = get();
      if (!version) return;
      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-x64-${version.replace(
        'v',
        ''
      )}.zip`;
    }
  },
  setVersion: (version: string) => set({ version })
}));
