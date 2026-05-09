import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        name: 'Étude — 피아노 연습 기록',
        short_name: 'Étude',
        description: '피아니스트를 위한 연습 기록·레퍼토리·정밀 메트로놈',
        lang: 'ko',
        theme_color: '#4f46e5',
        background_color: '#0b0a14',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,ogg,woff2}'],
      },
    }),
  ],
})
