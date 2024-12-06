import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: join(__dirname, 'src'),
  base: './',
  build: {
    outDir: join(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: join(__dirname, 'src/index.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
}); 