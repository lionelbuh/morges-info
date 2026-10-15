import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on any static host or sub-path
  // (GitHub Pages project sites, Netlify, Cloudflare Pages, plain Apache/Nginx).
  base: './',
  build: {
    target: 'es2022',
    // MapLibre GL is ~1 MB minified (~280 kB gzipped). It is lazy-loaded in its
    // own chunk (see initMap in src/main.js), so the interface renders first.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
  },
});
