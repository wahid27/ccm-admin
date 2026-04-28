import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Pastikan paket-paket ini sudah ada:
// npm install @vitejs/plugin-react @tailwindcss/vite tailwindcss
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})