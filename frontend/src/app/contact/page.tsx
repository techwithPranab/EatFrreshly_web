import type { Metadata } from 'next';
import ClientContact from './ClientContact';
import FAQSchema from '@/components/seo/FAQSchema';
import { contactFaqs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch',
  description: "Contact EatFreshly for inquiries, feedback, or support. We're located in Barrackpore, West Bengal. Call us at +91-9836027578.",
  openGraph: {
    title: 'Contact Us | EatFreshly',
    description: "Get in touch with EatFreshly for inquiries, feedback, or support.",
    type: 'website'
  }
};

export default function Page() {
  return (
    <>
      <FAQSchema faqs={contactFaqs} />
      <ClientContact />
    </>
  );
}
