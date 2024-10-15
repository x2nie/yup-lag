import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/notebook/renderer/ipstate.ts'),
      formats: ['es']
    }
  }
});