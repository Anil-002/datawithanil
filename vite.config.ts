import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ isSsrBuild, mode }) => ({
  base: process.env.VITE_BASE_PATH || loadEnv(mode, process.cwd(), '').VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: {
    rollupOptions: { output: { manualChunks: isSsrBuild ? undefined : { charts: ['recharts'], animation: ['motion'] } } },
  },
}));
