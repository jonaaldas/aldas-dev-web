// https://nuxt.com/docs/api/configuration/nuxt-config
const env = process.env.NODE_ENV;
const isProduction = env === 'production';
const umamiWebsiteId =
  process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || 'db0fe301-1e73-4e0e-b227-aa45eda1e015';
const script = isProduction && umamiWebsiteId
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

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', 'nuxt-studio', 'shadcn-nuxt'],

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  studio: {
    repository: {
      provider: 'github',
      owner: 'jonaaldas',
      repo: 'aldas-dev-web',
      branch: 'main',
    },
  },
});
