import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on any static host or sub-path
  // (GitHub Pages project sites, Netlify, Cloudflare Pages, plain Apache/Nginx).
  base: './',
  build: {
    target: 'es2020',
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
  },
});
