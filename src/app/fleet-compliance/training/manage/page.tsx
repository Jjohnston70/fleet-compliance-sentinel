import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import TrainingManagement from '@/components/training/TrainingManagement';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Training Management | Fleet Compliance Sentinel' };

function normalizeRole(value: unknown): 'admin' | 'member' {
  if (typeof value !== 'string') return 'member';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'member';
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  return canonical === 'admin' ? 'admin' : 'member';
}

function resolveOrgRole(sessionClaims: any): 'admin' | 'member' {
  const candidates = [
    sessionClaims?.org_role,
    sessionClaims?.orgRole,
    sessionClaims?.o?.rol,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role === 'admin') return role;
  }
  return 'member';
}

export default async function TrainingManagePage() {
  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');
  const role = resolveOrgRole(sessionClaims);
  if (role !== 'admin') redirect('/fleet-compliance/training');
  return <TrainingManagement />;
}
