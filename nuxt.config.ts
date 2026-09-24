import tailwindcss from '@tailwindcss/vite'

const appDescription = 'Cally is a scheduling platform that lets users create a public booking page, connect their Google Calendar, set weekly availability, and allow others to book meetings only during free times. When someone schedules a meeting, the app automatically creates a Google Calendar event with a Google Meet link and sends confirmation details to both the host and guest.'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
    },
  },
  app: {
    head: {
      htmlAttrs: {
        class: 'dark',
      },
      title: 'Cally',
      meta: [
        { name: 'application-name', content: 'Cally' },
        { name: 'apple-mobile-web-app-title', content: 'Cally' },
        { name: 'description', content: appDescription },
        { name: 'theme-color', content: '#171717' },
        { property: 'og:title', content: 'Cally' },
        { property: 'og:description', content: appDescription },
        { property: 'og:image', content: '/logo.png' },
        { name: 'twitter:title', content: 'Cally' },
        { name: 'twitter:description', content: appDescription },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:image', content: '/logo.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'shortcut icon', href: '/logo.png' },
      ],
      script: [
        {
          innerHTML: "try{var t=localStorage.getItem('cally-theme')||'dark';var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t==='light'?'light':'dark'}catch(e){}",
          tagPosition: 'head',
        },
      ],
    },
  },
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
