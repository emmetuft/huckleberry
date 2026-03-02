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
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/domo': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
