import { readFileSync } from 'node:fs';

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

const privacy = normalize(readFileSync('src/app/privacy/page.tsx', 'utf8'));
const terms = normalize(readFileSync('src/app/terms/page.tsx', 'utf8'));

const failures = [];

const privacyChecks = [
  { name: 'driver records disclosure', patterns: ['driver qualification', 'medical compliance', 'permit'] },
  { name: 'ai non-training statement', patterns: ['not permit customer data to be used to train', 'foundation models'] },
  { name: 'retention terms 30/60', patterns: ['soft deleted at 30 days', 'hard deleted at 60 days'] },
  { name: 'subprocessor disclosure', patterns: ['subprocessors', 'vercel', 'neon', 'clerk'] },
];

for (const check of privacyChecks) {
  const ok = check.patterns.every((pattern) => privacy.includes(pattern));
  if (!ok) failures.push(`Privacy page missing: ${check.name}`);
}

const termsChecks = [
  { name: 'client data ownership', patterns: ['clients own their organization data'] },
  { name: 'availability commitments', patterns: ['service availability', 'commercially reasonable efforts'] },
  { name: 'cancellation lifecycle', patterns: ['soft delete at 30 days', 'hard delete at 60 days'] },
];

for (const check of termsChecks) {
  const ok = check.patterns.every((pattern) => terms.includes(pattern));
  if (!ok) failures.push(`Terms page missing: ${check.name}`);
}

if (failures.length > 0) {
  console.error('Legal page compliance checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Legal page compliance checks passed.');
