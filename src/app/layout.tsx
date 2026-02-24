import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'True North Data Strategies | PipelineX — Your Business, Organized',
    template: '%s | True North Data Strategies',
  },
  icons: {
    icon: '/favicon.ico',
  },
  description:
    'PipelineX connects your tools, documents, and data into one system you can actually talk to. Ask it a question, get a real answer. Veteran-owned. Based in Colorado Springs.',
  keywords: [
    'business automation',
    'small business AI',
    'HubSpot integration',
    'operations system',
    'PipelineX',
    'True North Data Strategies',
    'Colorado Springs',
    'veteran owned business',
    'SDVOSB',
  ],
  authors: [{ name: 'Jacob Johnston', url: 'https://truenorthstrategyops.com' }],
  creator: 'True North Data Strategies LLC',
  metadataBase: new URL('https://truenorthstrategyops.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://truenorthstrategyops.com',
    siteName: 'True North Data Strategies',
    title: 'True North Data Strategies | PipelineX',
    description:
      'Stop digging through files and asking your team what happened. PipelineX puts your whole operation in one place — and lets you ask it questions in plain English.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'True North Data Strategies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'True North Data Strategies | PipelineX',
    description: 'Your business, organized. Ask questions. Get answers. Move faster.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} dark`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
