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

      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-${version.replace(
        'v',
        ''
      )}-arm64-mac.zip`;
    },
    intel: () => {
      const { version } = get();
      if (!version) return;
      return `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-${version.replace(
        'v',
        ''
      )}-mac.zip`;
    }
  },
  setVersion: (version: string) => set({ version })
}));
