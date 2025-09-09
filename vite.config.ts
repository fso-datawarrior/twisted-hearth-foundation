import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Enable CSS Houdini Paint API
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable modern CSS features
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Separate CSS Houdini worklets
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.js') && assetInfo.name.includes('paint')) {
            return 'assets/paint-worklets/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
    },
  },
  // Enable CSS Houdini support
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
