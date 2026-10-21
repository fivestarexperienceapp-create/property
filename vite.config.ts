import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { showcasePlugin } from './build/showcase-plugin.ts';

// Relative base: the same build works at https://USERNAME.github.io/REPOSITORY/,
// at a root site (https://USERNAME.github.io/) and on a custom domain.
// Hash routing keeps every page at index.html, so relative asset paths always resolve.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), showcasePlugin()],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    // Ships the licenses of bundled open-source packages with every site.
    license: { fileName: 'third-party-licenses.md' },
  },
});
