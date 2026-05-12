import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export const buildDir = 'build';
export const tmpDir = '.tmp';
export const envPrefix = 'DOMO_';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      checker({
        eslint: {
          lintCommand: 'eslint',
          useFlatConfig: true,
          dev: {
            logLevel: ['error'],
          },
        },
      }),
      tsconfigPaths(),
    ],
    envDir: './.environment',
    envPrefix,
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          loadPaths: [path.resolve(__dirname)],
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
    build: {
      outDir: buildDir,
      emptyOutDir: true,
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          sourcemap: false,
          manualChunks: {},
        },
      },
    },
    clearScreen: false,
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Forward all BFF API calls to huckleberry-server. Keeps the browser
        // talking only to localhost:5173 so the hb_session cookie stays
        // same-origin (no CORS pre-flights, no cross-site cookie quirks).
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
