import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/puzzle_lock/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Puzzle Maker - 逕ｻ蜒上ヱ繧ｺ繝ｫ菴懈・繧｢繝励Μ',
        short_name: 'Puzzle Maker',
        description: '逕ｻ蜒上ｒ繧｢繝・・繝ｭ繝ｼ繝峨＠縺ｦ繝代ぜ繝ｫ繧剃ｽ懈・繝ｻ菫晏ｭ倥〒縺阪ｋ繧｢繝励Μ',
        start_url: '/puzzle_lock/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#007bff',
        orientation: 'portrait',
        scope: '/puzzle_lock/',
        lang: 'ja',
        categories: ['games', 'entertainment', 'utilities'],
        icons: [
          {
            src: '/puzzle_lock/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/puzzle_lock/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/puzzle_lock/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/puzzle_lock/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/puzzle_lock/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Puzzle Maker アプリのメイン画面'
          },
          {
            src: '/puzzle_lock/screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'モバイル版 Puzzle Maker'
          }
        ]
      }
    })
  ]
})

