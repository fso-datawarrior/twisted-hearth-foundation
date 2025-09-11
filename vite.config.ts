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
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['date-fns', '@radix-ui/react-checkbox'],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for now
  },
}));
