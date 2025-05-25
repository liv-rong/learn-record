import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  sitemap: {
    hostname: 'https://example.com'
  },
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
          { text: 'slate', link: '/edit/slate-概念.md' },

          { text: 'api-examples', link: '/api-examples' }
        ]
      },
      {
        text: 'react',
        items: [{ text: 'react', link: '/react/react' }]
      },
      {
        text: 'engineering',
        items: [
          { text: 'engineering', link: '/engineering' },
          { text: 'pnpm', link: '/engineering/pnpm' }
        ]
      },
      {
        text: 'nest',
        items: [
          { text: 'nest', link: '/nest' },
          { text: 'prisma', link: '/nest/prisma' },
          { text: 'redis', link: '/nest/redis' },
          { text: 'swagger', link: '/nest/swagger' }
        ]
      },
      {
        text: 'there',
        items: [{ text: 'perspective-camera', link: '/there/perspective-camera' }]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/liv-rong' }]
  }
})
