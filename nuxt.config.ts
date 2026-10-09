import tailwindcss from "@tailwindcss/vite";

const siteUrl = "https://cally.cermuel.dev";
const lastmod = "2026-10-08";
const publicRoutes = [
  "/",
  "/blog",
  "/blog/best-calendly-alternatives-2026",
  "/privacy",
  "/terms",
];

export default defineNuxtConfig({
  compatibilityDate: "2026-09-22",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/image", "@nuxt/fonts", "@nuxtjs/seo"],
  site: {
    url: siteUrl,
    name: "Cally",
    description:
      "Cally is a meeting scheduler for sharing availability, booking meetings, and keeping Google Calendar in sync.",
    defaultLocale: "en",
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "",
      reverbAppKey:
        process.env.NUXT_PUBLIC_REVERB_APP_KEY ||
        process.env.VITE_REVERB_APP_KEY ||
        "",
      reverbHost:
        process.env.NUXT_PUBLIC_REVERB_HOST ||
        process.env.VITE_REVERB_HOST ||
        "",
      reverbPort:
        process.env.NUXT_PUBLIC_REVERB_PORT ||
        process.env.VITE_REVERB_PORT ||
        "",
      reverbScheme:
        process.env.NUXT_PUBLIC_REVERB_SCHEME ||
        process.env.VITE_REVERB_SCHEME ||
        "https",
    },
  },
  app: {
    head: {
      title: "Cally — Scheduling, without the back-and-forth",
      meta: [
        { name: "application-name", content: "Cally" },
        { name: "apple-mobile-web-app-title", content: "Cally" },
        { name: "theme-color", content: "#ffffff" },
        { name: "color-scheme", content: "light dark" },
        // Use the booking-page artwork as the default link preview image.
        // Keep the logo reserved for the favicon and app branding.
        { property: "og:image", content: `${siteUrl}/cally-public-og.png` },
        { property: "og:image:alt", content: "Cally public booking page" },
        { property: "og:image:type", content: "image/png" },
        { name: "twitter:image", content: `${siteUrl}/cally-public-og.png` },
        { name: "twitter:image:alt", content: "Cally public booking page" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/logo.png" },
        { rel: "apple-touch-icon", href: "/logo.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      script: [
        {
          innerHTML:
            "try{var k='cally-theme';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';localStorage.setItem(k,t)}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;document.querySelector('meta[name=theme-color]').setAttribute('content',t==='dark'?'#171717':'#ffffff')}catch(e){}",
          tagPosition: "head",
        },
      ],
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/blog": { prerender: true },
    "/blog/**": { prerender: true },
    "/privacy": { prerender: true },
    "/terms": { prerender: true },
    "/app/**": { ssr: false, robots: false },
    "/auth/**": { ssr: false, robots: false },
    "/google/**": { ssr: false, robots: false },
    "/settings/**": { ssr: false, robots: false },
    "/public/**": { ssr: false, robots: false },
    "/team/**": { ssr: false, robots: false },
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/images/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  },
  robots: {
    allow: ["/"],
    disallow: [
      "/app",
      "/dashboard",
      "/api",
      "/auth",
      "/google",
      "/settings",
      "/public",
      "/team",
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  },
  sitemap: {
    includeAppSources: false,
    urls: publicRoutes.map((loc) => ({ loc, lastmod })),
  },
  ogImage: {
    defaults: { width: 1200, height: 630, extension: "png" },
    zeroRuntime: false,
  },
  schemaOrg: {
    identity: {
      type: "Organization",
      name: "Cally",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
  },
  linkChecker: {
    runOnBuild: true,
    failOnError: false,
    fetchRemoteUrls: false,
    excludePages: [
      "/app/**",
      "/auth/**",
      "/google/**",
      "/settings/**",
      "/public/**",
    ],
    excludeLinks: ["/samuel", "/app/**", "/auth/**", "/public/**"],
    report: { html: true, json: true },
  },
  image: {
    format: ["avif", "webp"],
    quality: 80,
  },
  fonts: {
    families: [
      {
        name: "Geist",
        provider: "google",
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
        display: "swap",
        preload: true,
      },
      {
        name: "Geist Mono",
        provider: "google",
        weights: [400, 500, 600],
        styles: ["normal"],
        subsets: ["latin"],
        display: "swap",
      },
    ],
  },
  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    prerender: {
      crawlLinks: true,
      routes: publicRoutes,
      ignore: ["/samuel"],
    },
  },
  css: ["~/assets/css/tailwind.css"],
  components: [
    {
      path: "~/components",
      pathPrefix: true,
      extensions: ["vue"],
    },
  ],
  alias: {
    "@": ".",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
