import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MyTraining from '@/components/training/MyTraining';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Training | Fleet Compliance Sentinel' };

export default async function MyTrainingPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');
  return <MyTraining />;
}
