import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      devOptions: {
        enabled: true // <--- This lets you test it on localhost!
      },
      manifest: {
        name: 'Cinema Plus+ Reservations',
        short_name: 'Cinema+',
        description: 'Book your seats in real-time.',
        theme_color: '#E50914',
        icons: [
          {
            src: 'tickets.png', // using this temporary icon for now
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'tickets.png',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})