import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3001,
    proxy: {
      // Proxy API requests to your backend
      '/api': {
        target: 'http://localhost:5000', // Change this to your backend URL
        changeOrigin: true,
        secure: false
      }
    }
  }
})