import { MetadataRoute } from 'next'
import { seo } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin*',
    },
    sitemap: `${seo.url}/sitemap.xml`,
  }
}
