import type { Metadata } from 'next';

export const siteConfig = {
  name: 'EatFreshly',
  title: 'EatFreshly - Fresh, Healthy & Delicious Food',
  description: 'Order fresh, nutritious meals online. Fast delivery across Kolkata, West Bengal. Organic ingredients, chef-prepared dishes, health-certified menus.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  phone: process.env.NEXT_PUBLIC_SITE_PHONE || '+91-9836027578',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'freshhealthybite@gmail.com',
  ogImage: '/file.svg',
  keywords: [
    'healthy food delivery',
    'organic meals Kolkata',
    'fresh food online',
    'nutritious restaurant',
    'meal delivery West Bengal',
    'healthy eating',
    'diet food delivery',
    'vegetarian meals',
    'vegan food options',
  ],
  author: 'EatFreshly',
  twitter: {
    card: 'summary_large_image',
    site: '@eatfreshly',
    creator: '@eatfreshly',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default siteConfig;
