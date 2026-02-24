import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/community-blood-donor-finder/',
  plugins: [react()],
})