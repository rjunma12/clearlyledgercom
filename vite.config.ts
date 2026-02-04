import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit (intentional chunking)
    chunkSizeWarningLimit: 800,
  },
  // Strip console in production to prevent info leakage
  esbuild: mode === "production" ? {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  } : undefined,
}));
