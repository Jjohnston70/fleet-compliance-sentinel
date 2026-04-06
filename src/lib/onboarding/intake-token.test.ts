import test from 'node:test';
import assert from 'node:assert/strict';
import { IntakeTokenError, issueSignedIntakeToken, verifySignedIntakeToken } from '@/lib/onboarding/intake-token';

test('issue/verify roundtrip for signed intake token', () => {
  const now = new Date('2026-04-05T00:00:00.000Z');
  const token = issueSignedIntakeToken({
    tokenId: 'token-123',
    orgId: 'org_a',
    expiresAt: new Date('2026-04-06T00:00:00.000Z'),
    now,
  });

  const claims = verifySignedIntakeToken(token, new Date('2026-04-05T12:00:00.000Z'));
  assert.equal(claims.tid, 'token-123');
  assert.equal(claims.orgId, 'org_a');
});

test('verification fails for expired token', () => {
  const token = issueSignedIntakeToken({
    tokenId: 'token-456',
    orgId: 'org_a',
    expiresAt: new Date('2026-04-05T00:30:00.000Z'),
    now: new Date('2026-04-05T00:00:00.000Z'),
  });

  assert.throws(
    () => verifySignedIntakeToken(token, new Date('2026-04-05T01:00:00.000Z')),
    (error: unknown) => error instanceof IntakeTokenError && error.message.includes('expired'),
  );
});

test('verification fails for tampered token payload', () => {
  const token = issueSignedIntakeToken({
    tokenId: 'token-789',
    orgId: 'org_a',
    expiresAt: new Date('2026-04-06T00:00:00.000Z'),
    now: new Date('2026-04-05T00:00:00.000Z'),
  });
  const parts = token.split('.');
  const tamperedPayload = `${parts[0].slice(0, -2)}aa`;
  const tampered = `${tamperedPayload}.${parts[1]}`;

  assert.throws(
    () => verifySignedIntakeToken(tampered, new Date('2026-04-05T01:00:00.000Z')),
    (error: unknown) => error instanceof IntakeTokenError,
  );
});
