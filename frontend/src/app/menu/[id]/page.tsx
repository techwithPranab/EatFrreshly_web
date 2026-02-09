import React from 'react';
import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import MenuItemSchema from '@/components/seo/MenuItemSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import siteConfig from '@/config/metadata';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${apiBase}/menu/${params.id}`);
    const json = await res.json();
    const item = json.data;

    if (!item) return { title: 'Menu Item' };

    return {
      title: `${item.name} - EatFreshly`,
      description: item.description,
      openGraph: {
        title: `${item.name} | EatFreshly`,
        description: item.description,
        images: [item.imageUrl || '/file.svg'],
      }
    };
  } catch (err) {
    return {
      title: 'Menu Item'
    };
  }
}

export default async function MenuItemPage({ params }: Props) {
  const res = await fetch(`${apiBase}/menu/${params.id}`);
  const json = await res.json();
  const item = json.data;

  if (!item) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Menu item not found</h1>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <img src={item.imageUrl || '/file.svg'} alt={item.name} className="w-full h-56 object-cover rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="text-xl font-semibold">₹{item.price}</div>
            </div>
          </div>
        </div>
      </div>

      <MenuItemSchema item={item} />
      <BreadcrumbSchema items={[
        { name: 'Menu', url: `${siteConfig.url}/menu` },
        { name: item.name, url: `${siteConfig.url}/menu/${item._id}` }
      ]} />
    </MainLayout>
  );
}
