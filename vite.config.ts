import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

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
      ],
    }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'import.meta.env.STAGING': JSON.stringify(Boolean(process.env.STAGING)),
    'import.meta.env.PRODUCTION': JSON.stringify(Boolean(process.env.PRODUCTION)),
  },
});
