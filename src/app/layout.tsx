import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';
import Navigation from '@/components/Navigation';
import { isClerkEnabled } from '@/lib/clerk';

export const metadata: Metadata = {
  title: {
    default: 'Pipeline Penny | True North Data Strategies',
    template: '%s | Pipeline Penny',
  },
  icons: {
    icon: '/favicon.ico',
  },
  description:
    'Pipeline Penny helps business owners search and query their SOPs, contracts, and internal knowledge in plain English.',
  keywords: [
    'pipeline penny',
    'small business AI',
    'knowledge base assistant',
    'business operations',
    'True North Data Strategies',
  ],
  authors: [{ name: 'Jacob Johnston', url: 'https://truenorthstrategyops.com' }],
  creator: 'True North Data Strategies LLC',
  metadataBase: new URL('https://truenorthstrategyops.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://truenorthstrategyops.com',
    siteName: 'Pipeline Penny',
    title: 'Pipeline Penny',
    description:
      'Ask questions about your business knowledge and get answers from your real documents.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'True North Data Strategies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pipeline Penny',
    description: 'Your business knowledge, searchable and queryable.',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = isClerkEnabled();
  const shell = (
    <>
      <Navigation clerkEnabled={hasClerk} />
      {children}
    </>
  );

  return (
    <html lang="en">
      <body>
        {hasClerk ? <ClerkProvider>{shell}</ClerkProvider> : shell}
      </body>
    </html>
  );
}
