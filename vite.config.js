import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    watch: { usePolling: true },
    // En desarrollo, /api se reenvía al backend (en Docker: http://api:3001)
    proxy: { '/api': process.env.API_URL || 'http://localhost:3001' },
  },
})
