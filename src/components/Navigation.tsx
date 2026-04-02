// components/Navigation.tsx
// Stripped-down navigation for Pipeline Penny product site

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';

interface NavigationProps {
  clerkEnabled?: boolean;
}

function AuthNav() {
  const { isSignedIn } = useAuth();

  return (
    <ul className="nav-links">
      <li><Link href="/platform">Platform</Link></li>
      {!isSignedIn ? (
        <>
          <li><Link href="/sign-in">Sign In</Link></li>
          <li>
            <Link href="/sign-up" className="btn-nav">Get Access</Link>
          </li>
        </>
      ) : (
        <>
          <li><Link href="/fleet-compliance">Fleet-Compliance</Link></li>
          <li><Link href="/penny">Penny</Link></li>
          <li><UserButton /></li>
        </>
      )}
    </ul>
  );
}

export default function Navigation({ clerkEnabled = true }: NavigationProps) {
  const brand = (
    <Link href="/" className="nav-brand">
      <Image
        src="/PipelineX-penny.png"
        alt="Pipeline Penny"
        width={32}
        height={32}
        className="nav-brand-logo"
        priority
      />
      <span className="nav-brand-text">Pipeline Penny</span>
    </Link>
  );

  if (!clerkEnabled) {
    return (
      <nav className="nav">
        {brand}
        <ul className="nav-links">
          <li><Link href="/platform">Platform</Link></li>
          <li><Link href="/sign-in">Sign In</Link></li>
          <li>
            <Link href="/sign-up" className="btn-nav">Get Access</Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="nav">
      {brand}
      <AuthNav />
    </nav>
  );
}
