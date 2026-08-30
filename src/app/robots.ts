import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://chooseyourchaos.com'

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/about',
        '/faq',
        '/contact',
        '/privacy',
        '/terms',
        '/cookie-policy',
        '/play',
        '/truth-or-dare',
        '/judge-me',
        '/leaderboard',
        '/rooms',
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
