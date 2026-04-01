import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Training | Fleet Compliance Sentinel' };

interface DeckManifestModule {
  module_code: string;
  title: string;
  phmsa_equivalent: string;
  slide_count: number;
  estimated_duration_minutes: number;
}

interface DeckManifest {
  total_modules: number;
  total_slides: number;
  modules: DeckManifestModule[];
}

interface AssessmentManifestModule {
  module_code: string;
  question_count: number;
  passing_score: number;
}

interface AssessmentManifest {
  total_questions: number;
  modules: AssessmentManifestModule[];
}

async function loadManifests(): Promise<{
  decks: DeckManifest | null;
  assessments: AssessmentManifest | null;
}> {
  const basePath = join(process.cwd(), 'knowledge', 'training-content');
  let decks: DeckManifest | null = null;
  let assessments: AssessmentManifest | null = null;

  try {
    const deckJson = await readFile(join(basePath, 'decks', 'deck-manifest.json'), 'utf-8');
    decks = JSON.parse(deckJson);
  } catch { /* no decks */ }

  try {
    const assessJson = await readFile(join(basePath, 'assessments', 'assessment-manifest.json'), 'utf-8');
    assessments = JSON.parse(assessJson);
  } catch { /* no assessments */ }

  return { decks, assessments };
}

export default async function TrainingPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const { decks, assessments } = await loadManifests();

  const assessmentMap = new Map(
    (assessments?.modules || []).map((m) => [m.module_code, m]),
  );

  const modules = decks?.modules || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Training Modules</h1>
        <p className="text-slate-500 mt-1">
          PHMSA Hazardous Materials Training — 49 CFR Part 172, Subpart H
        </p>
        {decks && (
          <div className="flex gap-6 mt-4 text-sm text-slate-600">
            <span>{decks.total_modules} modules</span>
            <span>{decks.total_slides} slides</span>
            <span>{assessments?.total_questions || 0} assessment questions</span>
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">No training modules available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {modules.map((mod) => {
            const assess = assessmentMap.get(mod.module_code);
            return (
              <Link
                key={mod.module_code}
                href={`/fleet-compliance/training/${mod.module_code}`}
                className="block p-5 bg-white border border-slate-200 rounded-lg hover:border-teal-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-slate-400">
                        {mod.module_code}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {mod.phmsa_equivalent}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {mod.title}
                    </h2>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>{mod.slide_count} slides</span>
                      <span>{mod.estimated_duration_minutes} min</span>
                      {assess && (
                        <span>
                          {assess.question_count} questions (pass: {assess.passing_score}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-teal-600 transition-colors text-2xl ml-4">
                    &rarr;
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
