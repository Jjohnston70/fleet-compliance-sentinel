'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'PipelineX', href: '/pipelinex' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'FAQ', href: '/faq' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-darker-blue/95 backdrop-blur-md z-50 sticky top-0" role="banner">
      <nav className="container mx-auto flex items-center justify-between py-3 px-4" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-3" aria-label="True North Data Strategies - Home">
            <Image
              src="/True-North-Logo-Layered-v3.svg"
              alt="True North Data Strategies Logo"
              width={64}
              height={64}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>
        {/* Desktop nav */}
        <ul className="hidden lg:flex lg:gap-x-6 lg:items-center" role="menubar">
          {navigation.map((item) => (
            <li key={item.name} role="none">
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-tn-teal transition-colors"
                role="menuitem"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex flex-col items-end gap-1">
          <a
            href="tel:555-555-5555"
            className="bg-tn-teal text-dark-blue px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-tn-teal/90 transition-colors whitespace-nowrap"
            aria-label="Call Jacob at 555-555-5555"
          >
            Call Jacob: 555-555-5555
          </a>
          <Link href="/contact" className="text-xs text-gray-300 hover:text-tn-teal transition-colors">
            Or book a free 15-min call
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="p-2.5 text-gray-300 hover:bg-gray-800 rounded-md"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setMobileMenuOpen(false)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)} aria-label="Close menu" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card-bg px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/True-North-Logo-Layered-v3.svg" alt="True North Data Strategies" width={56} height={56} className="h-14 w-auto" />
              </Link>
              <button type="button" className="p-2.5 text-gray-300" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-gray-200 hover:bg-black/20 hover:text-tn-teal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <a
                  href="tel:555-555-5555"
                  className="bg-tn-teal w-full text-dark-blue justify-center py-3 px-4 rounded-lg text-center inline-flex items-center font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Call Jacob: 555-555-5555
                </a>
                <Link
                  href="/contact"
                  className="w-full text-center inline-block text-sm text-gray-300 hover:text-tn-teal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book a free 15-min call
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
