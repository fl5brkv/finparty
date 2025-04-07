import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: {enabled: true},

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

  routeRules: {
    '/': {redirect: '/dashboard'},
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    experimental: {
      tasks: true, // to make the database seed work
    },
  },
});
