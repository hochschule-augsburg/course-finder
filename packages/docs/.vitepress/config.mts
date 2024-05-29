import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'CourseFinder',
  description: 'Wahlpflichtfachanmeldung',
  base: '/subject-enroll/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sirchnik/subject-enroll' },
    ],
  },
  head: [['link', { rel: 'icon', href: '/subject-enroll/favicon.ico' }]],
  locales: {
    root: {
      label: 'Deutsch',
      lang: 'de',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/student' },
              { text: 'Admin', link: '/admin' },
              {
                text: 'Dev',
                items: [
                  { text: 'Backend', link: '/backend' },
                  { text: 'Frontend', link: '/frontend' },
                ],
              },
            ],
          },
        ],

        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/student' },
              { text: 'Admin', link: '/admin' },
              {
                text: 'Dev',
                items: [
                  { text: 'Backend', link: '/backend' },
                  { text: 'Frontend', link: '/frontend' },
                ],
              },
            ],
          },
        ],
      },
    },
    en: {
      label: 'Englisch',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/en/student' },
              { text: 'Admin', link: '/en/admin' },
              {
                text: 'Dev',
                items: [
                  { text: 'Backend', link: '/en/backend' },
                  { text: 'Frontend', link: '/en/frontend' },
                ],
              },
            ],
          },
        ],

        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/en/student' },
              { text: 'Admin', link: '/en/admin' },
              {
                text: 'Dev',
                items: [
                  { text: 'Backend', link: '/en/backend' },
                  { text: 'Frontend', link: '/en/frontend' },
                ],
              },
            ],
          },
        ],
      },
    },
  },
})
