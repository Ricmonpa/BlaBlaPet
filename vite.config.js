import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { videoPreviewPlugin } from './vite-plugin-video-preview.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // videoPreviewPlugin() temporalmente deshabilitado
  json: {
    stringify: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    middlewareMode: false
  },
  define: {
    'process.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL || 'http://localhost:5173')
  }
})
