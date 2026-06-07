import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

const isEnabled = (value: string | undefined) => value === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
    sourcemap: false,
  },
  define: {
    'import.meta.env.STAGING': JSON.stringify(isEnabled(process.env.STAGING)),
    'import.meta.env.PRODUCTION': JSON.stringify(isEnabled(process.env.PRODUCTION)),
  },
});
