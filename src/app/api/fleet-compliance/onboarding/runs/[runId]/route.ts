import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { createOnboardingService, OnboardingServiceError } from '@/lib/onboarding/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const onboardingService = createOnboardingService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const context = await requireOnboardingAdminContext(request);
    const { runId } = await params;

    const detail = await onboardingService.getRunDetail({
      orgId: context.orgId,
      runId,
    });

    return Response.json({
      ok: true,
      ...detail,
    });
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    if (error instanceof OnboardingServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('[onboarding-runs-detail-get] failed:', error);
    return Response.json({ error: 'Failed to fetch onboarding run detail' }, { status: 500 });
  }
}
