import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // NHC no expone CORS; proxy solo en desarrollo
      '/proxy/nhc': {
        target: 'https://www.nhc.noaa.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/nhc/, ''),
      },
      '/proxy/bc': {
        target: 'https://apis.do',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/bc/, ''),
      },
    },
  },
})
