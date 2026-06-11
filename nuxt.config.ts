// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

const env = process.env.NODE_ENV;
const isProduction = env === 'production';
const umamiWebsiteId = process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || 'db0fe301-1e73-4e0e-b227-aa45eda1e015';
const script =
  isProduction && umamiWebsiteId
    ? [
      {
        defer: true,
        src: '/stats/script.js',
        'data-host-url': '/stats',
        'data-website-id': umamiWebsiteId,
      },
    ]
    : [];

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    xBearerToken: '',
    umamiProxyTarget: process.env.NUXT_UMAMI_PROXY_TARGET || 'https://track.aldas.dev',
    public: {
      xUsername: '',
      umamiWebsiteId,
    },
  },

  app: {
    head: {
      title: 'aldas.dev',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'aldas - developer, builder, human' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap',
        },
      ],
      script,
    },
  },

  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  colorMode: {
    classSuffix: '',
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  routeRules: {
    // Prerender static pages at build time — served as pure HTML from CDN
    '/': { prerender: true },
    '/bucket-list': { prerender: true },
    '/cli': { prerender: true },
    // API routes stay dynamic
    '/api/**': { cache: false },
  },
});
