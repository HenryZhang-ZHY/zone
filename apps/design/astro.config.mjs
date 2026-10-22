import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://design.shuzhi.zone',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'esbuild' },
  },
})
