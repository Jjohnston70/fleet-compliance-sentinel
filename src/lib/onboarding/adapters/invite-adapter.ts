import { clerkClient } from '@clerk/nextjs/server';

export interface OnboardingInviteResult {
  status: 'completed' | 'skipped' | 'failed';
  reason:
    | 'sent'
    | 'missing_email'
    | 'clerk_unavailable'
    | 'error';
  invitationId?: string;
  message?: string;
}

export async function sendOnboardingInvite(input: {
  emailAddress: string | null;
  redirectUrl?: string | null;
  publicMetadata?: Record<string, unknown>;
}): Promise<OnboardingInviteResult> {
  const email = (input.emailAddress || '').trim().toLowerCase();
  if (!email) {
    return {
      status: 'skipped',
      reason: 'missing_email',
      message: 'No email address available to send invite',
    };
  }

  try {
    const client = await clerkClient();
    const invitationsApi = (client as unknown as { invitations?: any }).invitations;
    if (!invitationsApi?.createInvitation) {
      return {
        status: 'failed',
        reason: 'clerk_unavailable',
        message: 'Clerk invitations API unavailable',
      };
    }

    const invitation = await invitationsApi.createInvitation({
      emailAddress: email,
      redirectUrl: input.redirectUrl || undefined,
      notify: true,
      ignoreExisting: true,
      publicMetadata: input.publicMetadata || undefined,
    });

    return {
      status: 'completed',
      reason: 'sent',
      invitationId: typeof invitation?.id === 'string' ? invitation.id : undefined,
    };
  } catch (error: unknown) {
    return {
      status: 'failed',
      reason: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
