import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chooseyourchaos.com'

  const publicRoutes = [
    '',
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
  ]

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route.startsWith('/judge-me') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))
}
