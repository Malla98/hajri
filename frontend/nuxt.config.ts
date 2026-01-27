export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss' // Add this
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
      pocketbaseUrl: process.env.POCKETBASE_URL || 'http://localhost:8090'
    }
  }
})
