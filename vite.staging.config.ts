import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Staging-specific Vite configuration
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081, // Different port for staging
    open: true, // Auto-open browser
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-staging",
    sourcemap: true, // Enable source maps for staging
    minify: false, // Disable minification for easier debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  define: {
    __STAGING__: true,
    __DEV__: mode === 'development'
  }
}));
