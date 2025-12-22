/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  mode: 'production',
  plugins: [react(), dts({
    rollupTypes: true,
    tsconfigPath: './tsconfig.json'
  })],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MneePayCheckout',
      formats: ['es', 'cjs'],
      fileName: format => {
        if (format === 'es') return 'mnee-checkout.es.js';
        return 'mnee-checkout.cjs.js';
      }
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'
      // '@radix-ui/react-slot' 
      ],
      output: {
        inlineDynamicImports: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime'
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    emptyOutDir: true,
    minify: 'esbuild'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});