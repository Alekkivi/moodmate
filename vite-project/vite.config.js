// vite.config.js
import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // List your html files here, e.g:
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        regular: resolve(__dirname, 'regular.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  // Public base path could be set here too:
  // base: '/~username/my-app/',
});