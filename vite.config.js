import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { morgesSite, htmlInputs } from './build/site-plugin.js';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Absolute base: the site uses clean URLs (/carte/, /histoire/ …) and is meant
  // to be served from the root of its domain.
  base: '/',
  plugins: [morgesSite()],
  build: {
    target: 'es2022',
    rollupOptions: { input: htmlInputs(root) },
    // MapLibre GL is ~1 MB minified (~280 kB gzipped). It is lazy-loaded in its
    // own chunk (map page and home preview), so pages render first.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
  },
});
