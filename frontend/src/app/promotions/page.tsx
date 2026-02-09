import type { Metadata } from 'next';
import ClientPromotions from './ClientPromotions';

export const metadata: Metadata = {
  title: 'Special Offers & Promotions',
  description: 'Save on healthy meals with our exclusive promotions and discount codes. Get up to 50% off on selected items. Limited time offers!',
  openGraph: {
    title: 'Special Offers & Promotions | EatFreshly',
    description: 'Save on healthy meals with our exclusive promotions and discount codes.',
    type: 'website',
    images: ['/file.svg'],
  },
};

export default function Page() {
  return <ClientPromotions />;
}
