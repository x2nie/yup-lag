import path = require('path');
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
    //   '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
    //   '@components': path.resolve(__dirname, './src/components'),
    },
  },
  plugins: []
});