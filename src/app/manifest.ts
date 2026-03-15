import { MetadataRoute } from 'next'
import { seo } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seo.title,
    short_name: seo.title,
    description: seo.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
