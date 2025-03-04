import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects', // Source file
          dest: '', // Copies to "dist/"
        },
      ],
    }),
  ],
  define: {
    'import.meta.env.STAGING': JSON.stringify(Boolean(process.env.STAGING)),
  },
});
