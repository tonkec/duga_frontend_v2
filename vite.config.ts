import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.STAGING': JSON.stringify(Boolean(process.env.STAGING)),
  },
});
