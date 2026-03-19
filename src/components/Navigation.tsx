// components/Navigation.tsx
// Stripped-down navigation for Pipeline Penny product site
// Removes: Dropouts, Learning Modules, Community, Discussions, Blog
// Keeps: Home, Resources (Clerk-protected), Penny (Clerk-protected), Sign In/Up

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

interface NavigationProps {
  clerkEnabled?: boolean;
}

export default function Navigation({ clerkEnabled = true }: NavigationProps) {
  if (!clerkEnabled) {
    return (
      <nav className="nav">
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
        <ul className="nav-links">
          <li>
            <Link href="/sign-in">Sign In</Link>
          </li>
          <li>
            <Link href="/sign-up" className="btn-nav">
              Get Access
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="nav">
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

      <ul className="nav-links">
        <SignedOut>
          <li>
            <Link href="/sign-in">Sign In</Link>
          </li>
          <li>
            <Link href="/sign-up" className="btn-nav">
              Get Access
            </Link>
          </li>
        </SignedOut>

        <SignedIn>
          <li>
            <Link href="/chief">Chief</Link>
          </li>
          <li>
            <Link href="/penny">Penny</Link>
          </li>
          <li>
            <Link href="/resources">Resources</Link>
          </li>
          <li>
            <UserButton afterSignOutUrl="/" />
          </li>
        </SignedIn>
      </ul>
    </nav>
  );
}
