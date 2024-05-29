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
              { text: 'Dev', link: '/dev' },
            ],
          },
        ],

        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/student' },
              { text: 'Admin', link: '/admin' },
              { text: 'Dev', link: '/dev' },
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
              { text: 'Dev', link: '/en/dev' },
            ],
          },
        ],

        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/en/student' },
              { text: 'Admin', link: '/en/admin' },
              { text: 'Dev', link: '/en/dev' },
            ],
          },
        ],
      },
    },
  },
})
