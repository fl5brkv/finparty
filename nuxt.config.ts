export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {enabled: false},

  future: {
    compatibilityVersion: 4,
  },

  modules: ['@nuxthub/core', 'nuxt-auth-utils'],

  hub: {
    database: true,
  },

  runtimeConfig: {
    oauth: {
      google: {
        clientId: import.meta.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: import.meta.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: import.meta.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: import.meta.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
      },
    },
  },
});
