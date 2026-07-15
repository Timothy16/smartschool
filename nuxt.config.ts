import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/color-mode', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  colorMode: {
    classSuffix: ''
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    seedSecret: process.env.SEED_SECRET || '',
    sessionSecret: process.env.SESSION_SECRET || '',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },
})
