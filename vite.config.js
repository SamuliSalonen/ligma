import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app source (entry HTML + JSX) lives in src/, so the built index.html can
// sit at the repo root without colliding with the dev entry. See scripts/ship.mjs.
export default defineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  // relative asset URLs, so the shipped index.html works served from the repo
  // root, from a subpath, or opened straight off disk
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
