// 🚨 CRITICAL: DO NOT MODIFY THIS FILE
// This file contains Lovable AI's componentTagger plugin
// Modifying this will break Lovable AI integration
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    force: true, // Force dependency re-optimization
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Normalize any direct file-path imports to use the ESM runtime
      // Force-redirect any accidental CJS runtime imports to an ESM shim
      { find: /^\/?node_modules\/react\/jsx-runtime\.js$/, replacement: path.resolve(__dirname, './src/shims/fix-jsx-runtime.ts') },
      { find: /^\/?node_modules\/react\/jsx-dev-runtime\.js$/, replacement: path.resolve(__dirname, './src/shims/fix-jsx-runtime.ts') },
      { find: 'react/jsx-runtime.js', replacement: path.resolve(__dirname, './src/shims/fix-jsx-runtime.ts') },
      { find: 'react/jsx-dev-runtime.js', replacement: path.resolve(__dirname, './src/shims/fix-jsx-runtime.ts') },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@tanstack/react-query'],
    force: true, // Force re-optimization
    esbuildOptions: {
      plugins: [
        {
          name: 'fix-react-jsx-runtime-paths',
          setup(build) {
            const redirect = (from: RegExp, to: string) => {
              build.onResolve({ filter: from }, () => ({ path: to }));
            };
            redirect(/react\/jsx-runtime\.js$/, 'react/jsx-runtime');
            redirect(/react\/jsx-dev-runtime\.js$/, 'react/jsx-dev-runtime');
          },
        },
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Add version to chunk names for better cache busting
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for now
  },
}));
