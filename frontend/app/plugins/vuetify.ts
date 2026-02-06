import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    blueprint: md3, // ✅ Material Design 3 (mobile-first)
    components,
    directives,
    ssr: true,

    theme: {
      defaultTheme: 'light',
    },

    display: {
      mobileBreakpoint: 'md', // ✅ correct
    },

    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
