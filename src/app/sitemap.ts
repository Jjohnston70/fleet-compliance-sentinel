import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://truenorthstrategyops.com';
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/penny`, lastModified: now },
    { url: `${baseUrl}/privacy`, lastModified: now },
    { url: `${baseUrl}/terms`, lastModified: now },
    { url: `${baseUrl}/accessibility`, lastModified: now },
    { url: `${baseUrl}/sign-in`, lastModified: now },
    { url: `${baseUrl}/sign-up`, lastModified: now },
  ];
}
