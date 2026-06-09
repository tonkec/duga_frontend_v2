import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

const isEnabled = (value: string | undefined) => value === 'true';
const shouldCollectCoverage = isEnabled(process.env.CYPRESS_COVERAGE);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      extension: ['.ts', '.tsx'],
      requireEnv: true,
      cypress: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects',
          dest: '',
        },
        {
          src: 'public/_headers',
          dest: '',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: shouldCollectCoverage,
  },
  server: {
    watch: {
      ignored: ['**/coverage/**', '**/.nyc_output/**'],
    },
  },
  define: {
    'import.meta.env.STAGING': JSON.stringify(isEnabled(process.env.STAGING)),
    'import.meta.env.PRODUCTION': JSON.stringify(isEnabled(process.env.PRODUCTION)),
  },
});
