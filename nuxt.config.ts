import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: true,
      extensions: ['vue'],
    },
  ],
  alias: {
    '@': '.',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
