import path from "path"
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      // Proxy API requests to backend in development
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Production build optimizations
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts') || id.includes('node_modules/sonner')) {
              return 'ui';
            }
            if (id.includes('node_modules/axios') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/cn')) {
              return 'utils';
            }
          },
        },
      },
    },
    // Define global constants for feature flags
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0'),
    },
  }
})