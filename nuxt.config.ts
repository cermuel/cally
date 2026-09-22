import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  alias: {
    '@': '.',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
