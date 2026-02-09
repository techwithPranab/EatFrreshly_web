import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import FAQSchema from '@/components/seo/FAQSchema';
import { contactFaqs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - EatFreshly',
  description: 'Find answers to common questions about EatFreshly, our menu, delivery, pricing, and more.',
};

export default function FAQPage() {
  return (
    <MainLayout>
      <FAQSchema faqs={contactFaqs} />

      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
            <div className="space-y-6">
              {contactFaqs.map((faq, idx) => (
                <details key={idx} className="p-4 bg-white rounded-lg shadow">
                  <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                  <div className="mt-2 text-gray-600">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
