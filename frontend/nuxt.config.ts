export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
   css: [
    'vuetify/styles',
  ],
  build: {
    transpile: ['vuetify'],
  },
  vuetify: {
    icons: {
      defaultSet: 'mdi',
    },
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
  },
  runtimeConfig: {
    public: {
      pocketbaseUrl: process.env.POCKETBASE_URL || 'https://localhost:8090'
    }
  }
})
