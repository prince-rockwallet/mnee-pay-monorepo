import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/button.tsx'),
      name: 'MneePayButton',
      fileName: () => 'button.js',
      formats: ['iife'], // Immediately Invoked Function Expression for direct script tag usage
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, 
      },
    },
    emptyOutDir: true,
    minify: true,
  },
});