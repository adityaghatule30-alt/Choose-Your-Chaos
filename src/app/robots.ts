import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://chooseyourchaos.com'

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/games',
        '/play',
        '/spotlight',
        '/judge-me',
        '/rooms',
        '/leaderboard',
        '/achievements',
        '/guide',
        '/about',
        '/fuel',
        '/faq',
        '/contact',
        '/privacy',
        '/terms',
        '/cookie-policy',
      ],
      disallow: [
        '/admin/',
        '/api/',
        '/profile',
        '/settings',
        '/rooms/*/game',
        '/rooms/*/results',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
