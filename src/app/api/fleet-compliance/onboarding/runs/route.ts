import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { createOnboardingService } from '@/lib/onboarding/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const onboardingService = createOnboardingService();

export async function GET(request: Request) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawLimit = url.searchParams.get('limit');
  const parsedLimit = Number.parseInt(rawLimit || '100', 10);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 500)) : 100;

  const runs = await onboardingService.listRuns({
    orgId: context.orgId,
    limit,
  });

  return Response.json({
    ok: true,
    runs,
  });
}
