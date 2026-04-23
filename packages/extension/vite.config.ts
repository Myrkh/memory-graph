import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Main MV3 build · sidePanel + service-worker (ESM).
 *
 * The content-script entry has its own config (`vite.content.config.ts`)
 * because it must ship as an IIFE with inlined dynamic imports — ESM
 * imports fail silently in the isolated world where content scripts
 * run. Two configs are cleaner than forcing one-size-fits-all Rollup
 * output options.
 *
 * `public/` (manifest.json + icons) is copied verbatim by Vite.
 */
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (info) =>
          info.name?.endsWith('.html')
            ? '[name][extname]'
            : 'assets/[name]-[hash][extname]',
        format: 'es',
      },
    },
  },
});
