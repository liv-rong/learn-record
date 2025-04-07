import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'learn-records',
  description: 'Record and share problems encountered at work',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'doc', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'node',
        items: [
          { text: 'node', link: '/node' },
          { text: 'api-examples', link: '/api-examples' }
        ]
      },
      {
        text: 'nest',
        items: [{ text: 'nest', link: '/nest' }]
      },
      {
        text: 'there',
        items: [{ text: 'perspective-camera', link: '/there/perspective-camera' }]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/liv-rong' }]
  }
})
