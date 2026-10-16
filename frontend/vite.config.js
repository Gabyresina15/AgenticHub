import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import newsPlugin from './build/newsPlugin.js'

const newsContentDir = fileURLToPath(new URL('../content/news', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    newsPlugin({ contentDir: newsContentDir }),
  ],
  test: {
    include: ['test/**/*.test.js'],
    environment: 'node',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})