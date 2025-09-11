import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist-staging',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  define: {
    __STAGING__: true,
    __DEV__: true,
  },
  envPrefix: 'VITE_',
  envDir: '.',
  env: {
    NODE_ENV: 'staging',
  },
});