import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import FAQSchema from '@/components/seo/FAQSchema';
import { aboutFaqs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'About Us - EatFreshly Story',
  description: "Learn about EatFreshly's mission to provide fresh, healthy, and delicious meals. Discover our story, values, and commitment to quality.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      <FAQSchema faqs={aboutFaqs} />
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
            <h1 className="text-3xl font-bold mb-4">Our Story</h1>
            <p className="text-gray-700 mb-4">
              EatFreshly was founded with the mission to make healthy eating easy and delicious. We partner with local farms to source organic ingredients and our chefs create balanced meals that are both nutritious and full of flavor. Every dish is crafted with care and tested by nutritionists to ensure it meets high standards.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Meet Our Chefs</h2>
            <p className="text-gray-700 mb-4">Our culinary team combines professional experience with a passion for healthy cuisine. Led by Head Chef Rahul Sen (10+ years of experience in healthy gastronomy), our chefs design menus that maximize flavor while staying nutritionally balanced.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Sourcing & Quality</h2>
            <p className="text-gray-700 mb-4">We prioritize seasonal produce and work with small local farms for organic vegetables, ethically-raised proteins, and responsibly harvested ingredients. Learn more about our suppliers and sustainability program by contacting us.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {aboutFaqs.map((faq, idx) => (
                <details key={idx} className="p-4 bg-gray-50 rounded-md">
                  <summary className="cursor-pointer font-medium">{faq.question}</summary>
                  <div className="mt-2 text-sm text-gray-600">{faq.answer}</div>
                </details>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Sustainability & Community</h2>
            <p className="text-gray-700 mb-4">We are committed to reducing waste, using eco-friendly packaging, and supporting the local community through partnerships and initiatives.</p>

            <p className="text-gray-700 mt-6">Have more questions or want to partner with us? Contact our team via the <a href="/contact" className="text-primary-600">contact page</a>.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
