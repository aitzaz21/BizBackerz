import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  /* In production: drop debugger + noisy logs; keep console.error and console.warn */
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.info', 'console.trace'],
    legalComments: 'none',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        /* Fine-grained chunk splits so the browser can cache vendor code independently */
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          /* Three.js + R3F ecosystem — heaviest chunk, loaded only on pages that need it */
          if (
            id.includes('@react-three') ||
            id.includes('/three/') ||
            id.includes('three')
          ) return 'three-vendor'

          /* React core — changes rarely, long-lived browser cache */
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('react-router-dom') ||
            id.includes('scheduler')
          ) return 'react-vendor'

          /* Framer Motion — separate from GSAP so each can be cached independently */
          if (id.includes('/framer-motion/')) return 'framer-vendor'

          /* GSAP */
          if (id.includes('/gsap/')) return 'gsap-vendor'

          /* Icon library — large, rarely changes */
          if (id.includes('/lucide-react/')) return 'icons-vendor'

          /* Lenis smooth scroll */
          if (id.includes('/lenis/')) return 'lenis-vendor'
        },
      },
    },
  },
})
