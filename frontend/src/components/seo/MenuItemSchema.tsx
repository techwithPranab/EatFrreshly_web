import React from 'react';

interface MenuItemProps {
  item: {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
    calories?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    rating?: number;
    reviewCount?: number;
  };
}

export default function MenuItemSchema({ item }: MenuItemProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    image: item.imageUrl,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock'
    }
  };

  if (item.rating && item.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: item.rating,
      reviewCount: item.reviewCount
    };
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
