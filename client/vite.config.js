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
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@react-three') || id.includes('/three/')) return 'three-vendor'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router-dom')) return 'react-vendor'
          if (id.includes('/gsap/') || id.includes('/framer-motion/')) return 'motion-vendor'
        },
      },
    },
  },
})
