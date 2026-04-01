import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import TrainingManagement from '@/components/training/TrainingManagement';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Training Management | Fleet Compliance Sentinel' };

export default async function TrainingManagePage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');
  return <TrainingManagement />;
}
