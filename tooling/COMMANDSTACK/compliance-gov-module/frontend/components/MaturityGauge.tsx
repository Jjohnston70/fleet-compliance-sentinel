'use client'

import { MaturityScore } from '@/lib/types'

interface MaturityGaugeProps {
  score: MaturityScore
}

export default function MaturityGauge({ score }: MaturityGaugeProps) {
  const overall = Math.round(score.overall)

  const getGaugeColor = (value: number): string => {
    if (value <= 3) return 'from-red-500 to-red-600'
    if (value <= 5) return 'from-amber-500 to-amber-600'
    if (value <= 7) return 'from-brand-teal to-brand-teal-dark'
    return 'from-green-500 to-green-600'
  }

  const getLabel = (value: number): string => {
    if (value <= 3) return 'DEVELOPING'
    if (value <= 5) return 'PROGRESSING'
    if (value <= 7) return 'STRONG'
    return 'EXCELLENT'
  }

  const gaugeColor = getGaugeColor(overall)
  const gaugeLabel = getLabel(overall)
  const percentage = (overall / 10) * 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
        Compliance Maturity
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                className="dark:stroke-slate-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gauge-gradient)"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 440} 440`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {gaugeColor === 'from-red-500 to-red-600' && (
                    <>
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </>
                  )}
                  {gaugeColor === 'from-amber-500 to-amber-600' && (
                    <>
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </>
                  )}
                  {gaugeColor === 'from-brand-teal to-brand-teal-dark' && (
                    <>
                      <stop offset="0%" stopColor="#3d8eb9" />
                      <stop offset="100%" stopColor="#2d7a9e" />
                    </>
                  )}
                  {gaugeColor === 'from-green-500 to-green-600' && (
                    <>
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </>
                  )}
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-brand-navy dark:text-white">
                {overall}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                / 10
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="text-sm font-bold text-brand-navy dark:text-white">
              {gaugeLabel}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Templates
                </div>
                <div className="text-2xl font-bold text-brand-navy dark:text-white">
                  {score.total_templates}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {score.completed}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  In Progress
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {score.in_progress}
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-slate-600 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Not Started
                </div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {score.not_started}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-brand-navy dark:text-white mb-3">
                By Skill
              </h3>
              <div className="space-y-2">
                {Object.entries(score.by_skill).map(([skill, skillScore]) => (
                  <div key={skill} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {skill}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-full h-2 transition-all"
                          style={{ width: `${(skillScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-brand-navy dark:text-brand-teal-light w-8 text-right">
                      {Math.round(skillScore)}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
