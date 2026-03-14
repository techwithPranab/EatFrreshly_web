// Server wrapper for menu page - exports metadata and renders client component
import type { Metadata } from 'next';
import ClientMenu from './ClientMenu';

export const metadata: Metadata = {
  title: 'Our Menu - Fresh & Healthy Dishes',
  description: 'Explore our nutritionist-approved menu featuring fresh salads, protein-rich main courses, healthy starters, and refreshing drinks. All dishes made with organic ingredients.',
  openGraph: {
    title: 'Our Menu - Fresh & Healthy Dishes | EatFreshly',
    description: 'Explore our nutritionist-approved menu featuring fresh salads, protein-rich main courses, and more.',
    type: 'website',
    images: ['/file.svg'],
  },
};

export default function Page() {
  return <ClientMenu />;
}