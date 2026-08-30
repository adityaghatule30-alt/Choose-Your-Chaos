import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chooseyourchaos.com'

  const publicRoutes = [
    '',
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
  ]

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route.startsWith('/judge-me') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))
}
