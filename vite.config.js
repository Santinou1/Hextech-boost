import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'ss12mw-ip-200-68-72-177.tunnelmole.net',
    ],
  },
})
