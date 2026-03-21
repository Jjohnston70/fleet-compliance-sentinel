// middleware.ts
// Clerk middleware - protects /penny routes
// Public routes: /, /sign-in, /sign-up, /privacy, /terms, /api/penny/health

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';

const isProtectedRoute = createRouteMatcher([
  '/penny(.*)',
  '/api/penny/query(.*)',
]);

const hasClerk = isClerkEnabled();

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default hasClerk ? clerkAuthMiddleware : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
