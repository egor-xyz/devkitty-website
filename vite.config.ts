import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { checker } from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';

import { extensionsPlugin } from './scripts/extensionsPlugin';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: { main: 'index.html', privacy: 'privacy/index.html', terms: 'terms/index.html' }
    }
  },
  plugins: [
    extensionsPlugin(),
    tailwindcss(),
    react(),
    viteTsconfigPaths(),
    svgr(),
    checker({
      eslint: {
        lintCommand: 'eslint',
        useFlatConfig: true
      },
      typescript: true
    })
  ]
});
