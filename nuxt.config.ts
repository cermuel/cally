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
      title: 'Cally',
      meta: [
        { name: 'application-name', content: 'Cally' },
        { name: 'apple-mobile-web-app-title', content: 'Cally' },
        { name: 'description', content: appDescription },
        { name: 'theme-color', content: '#ffffff' },
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
          innerHTML: "try{var k='cally-theme';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';localStorage.setItem(k,t)}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;document.querySelector('meta[name=theme-color]').setAttribute('content',t==='dark'?'#171717':'#ffffff')}catch(e){}",
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
