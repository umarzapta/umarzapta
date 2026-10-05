import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Keep the 3D runtime in its own chunk so the initial hero paints
          // before three.js arrives (the scene is lazy-loaded on the client).
          manualChunks(id) {
            if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three';
            if (id.includes('node_modules/gsap')) return 'gsap';
          },
        },
      },
    },
  },
});
