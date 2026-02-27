export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css', // ← THIS is what makes icons show
  ],

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',
  ],

  nitro: {
    preset: 'static',
    output: {
      publicDir: '../pb_public',
    },
  },

  app: {
    baseURL: '/',
    buildAssetsDir: '/_nuxt/',
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/icon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/icons/icon-72x72.png' },
      ]
    }
  },

  runtimeConfig: {
    public: {
      pocketbaseUrl: process.env.POCKETBASE_URL || 'https://localhost:8090'
    }
  }
})