import { POST as uploadCertificatePost } from '@/app/api/v1/hazmat-training/records/[recordId]/certificate/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { employeeId } = await params;
  return uploadCertificatePost(request, {
    params: Promise.resolve({ recordId: employeeId }),
  });
}
