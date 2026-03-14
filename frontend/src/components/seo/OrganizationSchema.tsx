import React from 'react';
import siteConfig from '@/config/metadata';

// Server component that injects Organization/Restaurant schema as JSON-LD
export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    telephone: siteConfig.phone || '+91-9836027578',
    email: siteConfig.email || 'freshhealthybite@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Barrackpore',
      addressLocality: '24Pgs(N)',
      addressRegion: 'West Bengal',
      postalCode: '700122',
      addressCountry: 'IN',
    },
    sameAs: [
      siteConfig.url
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        opens: '09:00',
        closes: '23:00'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
