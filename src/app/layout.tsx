import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';
import Navigation from '@/components/Navigation';
import CookieConsent from '@/components/CookieConsent';
import { isClerkEnabled } from '@/lib/clerk';
import { getClerkRedirectConfig } from '@/lib/clerk-redirects';

export const metadata: Metadata = {
  title: {
    default: 'Fleet-Compliance Sentinel — Powered by Pipeline X | Pipeline Punks',
    template: '%s | Fleet-Compliance Sentinel',
  },
  icons: {
    icon: [
      { url: '/PipelineX-penny.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/PipelineX-penny.png',
    apple: '/PipelineX-penny.png',
  },
  description:
    'DOT/FMCSA fleet compliance platform with Pipeline Penny, your AI assistant built on Pipeline X. Track drivers, permits, and deadlines. Ask Penny what the regulation says and whether your fleet is currently in compliance.',
  keywords: [
    'fleet compliance',
    'DOT compliance',
    'FMCSA',
    'pipeline penny',
    'fleet management',
    'CDL tracking',
    'compliance alerts',
    'True North Data Strategies',
    'Pipeline Punks',
  ],
  authors: [{ name: 'Jacob Johnston', url: 'https://truenorthstrategyops.com' }],
  creator: 'True North Data Strategies LLC',
  metadataBase: new URL('https://truenorthstrategyops.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pipelinepunks.com',
    siteName: 'Fleet-Compliance Sentinel',
    title: 'Fleet-Compliance Sentinel — Powered by Pipeline X',
    description:
      'DOT/FMCSA fleet compliance platform with Pipeline Penny AI. Track drivers, permits, and deadlines.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Fleet-Compliance Sentinel by Pipeline Punks' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet-Compliance Sentinel — Pipeline Punks',
    description: 'DOT/FMCSA fleet compliance with AI-powered regulatory guidance from Pipeline Penny.',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = isClerkEnabled();
  const redirectConfig = getClerkRedirectConfig();
  const shell = (
    <>
      <Navigation clerkEnabled={hasClerk} />
      {children}
      <CookieConsent />
    </>
  );

  return (
    <html lang="en">
      <body>
        {hasClerk ? <ClerkProvider {...redirectConfig}>{shell}</ClerkProvider> : shell}
      </body>
    </html>
  );
}
