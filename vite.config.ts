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
      { find: /^\/?node_modules\/react\/jsx-runtime\.js$/, replacement: 'react/jsx-runtime' },
      { find: /^\/?node_modules\/react\/jsx-dev-runtime\.js$/, replacement: 'react/jsx-dev-runtime' },
      { find: 'react/jsx-runtime.js', replacement: 'react/jsx-runtime' },
      { find: 'react/jsx-dev-runtime.js', replacement: 'react/jsx-dev-runtime' },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@tanstack/react-query'],
    force: true, // Force re-optimization
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
