import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/menu', '/promotions', '/contact', '/about', '/privacy', '/terms'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  let menuRoutes = [];
  try {
    const res = await fetch(`${apiBase}/menu`);
    const json = await res.json();
    const items = json.data?.items || [];
    menuRoutes = items.map((item: any) => ({
      url: `${baseUrl}/menu/${item._id}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now())
    }));
  } catch (err) {
    console.warn('Failed to fetch menu items for sitemap:', err);
  }

  let promoRoutes = [];
  try {
    const res = await fetch(`${apiBase}/promotions`);
    const json = await res.json();
    const promos = json.data?.promotions || [];
    promoRoutes = promos.map((p: any) => ({
      url: `${baseUrl}/promotions/${p._id}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now())
    }));
  } catch (err) {
    console.warn('Failed to fetch promotions for sitemap:', err);
  }

  return [...staticRoutes, ...menuRoutes, ...promoRoutes];
}
