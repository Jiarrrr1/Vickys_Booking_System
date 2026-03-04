// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3002,
    proxy: {
      // This should match the endpoints you're calling
      '/getAllReservations': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/getReservation': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/updateStatus': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/createReservation': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/createReservation': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})