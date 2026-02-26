import type { User } from '@clerk/nextjs/server';

const ALLOWED_PENNY_ROLES = ['admin', 'demo', 'client'] as const;
type AllowedPennyRole = (typeof ALLOWED_PENNY_ROLES)[number];

function asRole(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  // Handle values like "org:admin"
  const parts = normalized.split(':').filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : normalized;
}

export function resolvePennyRole(sessionClaims: any, user: User | null): string {
  const claimCandidates = [
    sessionClaims?.metadata?.role,
    sessionClaims?.public_metadata?.role,
    sessionClaims?.publicMetadata?.role,
    sessionClaims?.private_metadata?.role,
    sessionClaims?.privateMetadata?.role,
    sessionClaims?.unsafe_metadata?.role,
    sessionClaims?.org_role,
    sessionClaims?.o?.rol,
  ];

  for (const candidate of claimCandidates) {
    const role = asRole(candidate);
    if (role) {
      return role;
    }
  }

  const userCandidates = [
    user?.publicMetadata?.role,
    user?.privateMetadata?.role,
    user?.unsafeMetadata?.role,
  ];

  for (const candidate of userCandidates) {
    const role = asRole(candidate);
    if (role) {
      return role;
    }
  }

  return 'member';
}

export function canAccessPenny(role: string): role is AllowedPennyRole {
  return ALLOWED_PENNY_ROLES.includes(role as AllowedPennyRole);
}

function getUserEmails(user: User | null): string[] {
  if (!user) {
    return [];
  }

  const emails = new Set<string>();
  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary) {
    emails.add(primary);
  }

  for (const item of user.emailAddresses || []) {
    const value = item.emailAddress?.trim().toLowerCase();
    if (value) {
      emails.add(value);
    }
  }

  return [...emails];
}

function getAllowedAdminEmails(): string[] {
  const raw = `${process.env.ADMIN_EMAIL || ''},${process.env.PENNY_ALLOWED_EMAILS || ''}`;
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function canBypassPennyRoleByEmail(user: User | null): boolean {
  const userEmails = getUserEmails(user);
  if (userEmails.length === 0) {
    return false;
  }

  const allowedEmails = new Set(getAllowedAdminEmails());
  return userEmails.some((email) => allowedEmails.has(email));
}
