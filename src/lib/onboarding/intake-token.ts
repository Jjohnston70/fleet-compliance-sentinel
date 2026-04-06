import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 'v1';

export interface IntakeTokenClaims {
  v: string;
  tid: string;
  orgId: string;
  iat: number;
  exp: number;
}

export class IntakeTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntakeTokenError';
  }
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function readSecret(): string {
  const secret = process.env.ONBOARDING_INTAKE_TOKEN_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') {
    return 'local-dev-onboarding-intake-token-secret';
  }
  throw new IntakeTokenError('ONBOARDING_INTAKE_TOKEN_SECRET is required in production');
}

function signSegment(payloadSegment: string): string {
  const secret = readSecret();
  return createHmac('sha256', secret).update(payloadSegment).digest('base64url');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function issueSignedIntakeToken(input: {
  tokenId: string;
  orgId: string;
  expiresAt: Date;
  now?: Date;
}): string {
  const now = input.now ?? new Date();
  const claims: IntakeTokenClaims = {
    v: TOKEN_VERSION,
    tid: input.tokenId,
    orgId: input.orgId,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  };
  const payloadSegment = toBase64Url(JSON.stringify(claims));
  const signatureSegment = signSegment(payloadSegment);
  return `${payloadSegment}.${signatureSegment}`;
}

export function verifySignedIntakeToken(token: string, now = new Date()): IntakeTokenClaims {
  const trimmed = token.trim();
  const segments = trimmed.split('.');
  if (segments.length !== 2) {
    throw new IntakeTokenError('Invalid token format');
  }
  const [payloadSegment, signatureSegment] = segments;
  const expected = signSegment(payloadSegment);
  const signatureBuffer = Buffer.from(signatureSegment);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new IntakeTokenError('Invalid token signature');
  }

  let claims: IntakeTokenClaims;
  try {
    claims = JSON.parse(fromBase64Url(payloadSegment).toString('utf8')) as IntakeTokenClaims;
  } catch {
    throw new IntakeTokenError('Invalid token payload');
  }

  if (claims.v !== TOKEN_VERSION || !claims.tid || !claims.orgId) {
    throw new IntakeTokenError('Invalid token claims');
  }

  const nowSec = Math.floor(now.getTime() / 1000);
  if (claims.exp <= nowSec) {
    throw new IntakeTokenError('Token expired');
  }

  return claims;
}
