import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Dedicated Vite config for the content-script bundle.
 *
 * Unlike the sidePanel (which loads as a first-party extension page and
 * can freely use ESM dynamic chunks), content scripts run as classic
 * scripts in the host page's isolated world. ESM `import` statements
 * fail silently there. We therefore bundle the content-script entry as
 * a single self-contained IIFE with `inlineDynamicImports: true` so
 * React + the lib + our app code ship as one `dist/content.js` file.
 *
 * Runs alongside the main `vite build` (for sidepanel + service-worker).
 * The main build clears `dist/` first via `emptyOutDir`, so this one
 * uses `emptyOutDir: false` to avoid deleting the sidepanel output.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      input: resolve(__dirname, 'src/content/content-app.tsx'),
      output: {
        entryFileNames: 'content.js',
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
