import type { Metadata } from "next";
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { GoogleAnalytics, GoogleTagManager, GTMNoScript } from '@/components/analytics/GoogleAnalytics';
import { defaultMetadata } from '@/config/metadata';
import OrganizationSchema from '@/components/seo/OrganizationSchema';
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization schema for rich results / AI */}
        <OrganizationSchema />
      </head>
      <body className="antialiased">
        <Suspense fallback={<div />}>{/* Wrap client components to avoid SSR bailout for pages like /_not-found */}
          {/* GTM NoScript fallback */}
          <GTMNoScript />
          
          {/* Google Analytics */}
          <GoogleAnalytics />
          <AuthProvider>
            {children}
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
