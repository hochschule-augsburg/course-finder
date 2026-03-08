import { defineConfig } from 'vitepress'

const devItems = [
  { text: 'Backend', link: '/en/backend' },
  { text: 'Frontend', link: '/en/frontend' },
  { text: 'Deployment', link: '/en/deployment' },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'CourseFinder',
  description: 'Wahlpflichtfachanmeldung',
  base: '/course-finder/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/hochschule-augsburg/course-finder/',
      },
    ],
  },
  head: [['link', { rel: 'icon', href: '/course-finder/favicon.ico' }]],
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
                items: devItems,
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
                items: devItems,
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
              { text: 'Admin', link: '/admin' },
              {
                text: 'Dev',
                items: devItems,
              },
            ],
          },
        ],

        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Student', link: '/en/student' },
              { text: 'Admin', link: '/admin' },
              {
                text: 'Dev',
                items: devItems,
              },
            ],
          },
        ],
      },
    },
  },
})
