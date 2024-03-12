import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { checker } from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
      },
      typescript: true
    })
  ]
});
