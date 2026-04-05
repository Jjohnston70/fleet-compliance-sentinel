'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Plus } from 'lucide-react'
import MaturityGauge from '@/components/MaturityGauge'
import { getTracker, getTrackerScore, updateTrackerTemplate, initializeTracker } from '@/lib/api'
import { TrackerEntry, MaturityScore } from '@/lib/types'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const clientIdParam = searchParams.get('client_id')
  const clientId = clientIdParam || 'default'

  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [score, setScore] = useState<MaturityScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterSkill, setFilterSkill] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        let trackerData = await getTracker(clientId)
        if (!trackerData || trackerData.entries.length === 0) {
          trackerData = await initializeTracker(clientId)
        }
        setEntries(trackerData.entries || [])

        const scoreData = await getTrackerScore(clientId)
        setScore(scoreData)
      } catch (err) {
        setError('Failed to load dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [clientId])

  const updateStatus = async (templateId: string, newStatus: TrackerEntry['status']) => {
    try {
      await updateTrackerTemplate(clientId, templateId, { status: newStatus })
      setEntries(
        entries.map((entry) =>
          entry.template_id === templateId
            ? { ...entry, status: newStatus, updated_at: new Date().toISOString() }
            : entry
        )
      )

      const scoreData = await getTrackerScore(clientId)
      setScore(scoreData)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const updateEvidenceLink = async (templateId: string, link: string) => {
    try {
      await updateTrackerTemplate(clientId, templateId, { evidence_link: link })
      setEntries(
        entries.map((entry) =>
          entry.template_id === templateId ? { ...entry, evidence_link: link } : entry
        )
      )
    } catch (err) {
      console.error('Failed to update evidence link:', err)
    }
  }

  const updateNotes = async (templateId: string, notes: string) => {
    try {
      await updateTrackerTemplate(clientId, templateId, { notes })
      setEntries(
        entries.map((entry) =>
          entry.template_id === templateId ? { ...entry, notes } : entry
        )
      )
    } catch (err) {
      console.error('Failed to update notes:', err)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    if (filterSkill && entry.skill !== filterSkill) return false
    if (filterStatus && entry.status !== filterStatus) return false
    return true
  })

  const skills = Array.from(new Set(entries.map((e) => e.skill)))
  const statuses: TrackerEntry['status'][] = ['not_started', 'in_progress', 'implemented', 'verified']

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
          <div className="text-center">
            <Link
              href="/intake"
              className="text-brand-teal hover:text-brand-teal-dark inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Start New Assessment
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
          Implementation Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Client ID: {clientId}
        </p>

        {score && (
          <div className="mb-12">
            <MaturityGauge score={score} />
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-brand-navy dark:text-white mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill
              </label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div
                key={entry.template_id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          entry.status === 'verified'
                            ? 'bg-green-500'
                            : entry.status === 'implemented'
                              ? 'bg-blue-500'
                              : entry.status === 'in_progress'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                        }`}
                      />
                      <h3 className="text-lg font-semibold text-brand-navy dark:text-white">
                        {entry.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-brand-teal text-white px-2 py-1 rounded">
                        {entry.skill}
                      </span>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                      {entry.status.replace('_', ' ')}
                      <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(entry.template_id, status)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Evidence Link
                    </label>
                    <input
                      type="url"
                      value={entry.evidence_link}
                      onChange={(e) => updateEvidenceLink(entry.template_id, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                    {entry.evidence_link && (
                      <a
                        href={entry.evidence_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-teal hover:text-brand-teal-dark text-xs mt-1 inline-flex items-center gap-1"
                      >
                        View evidence
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        setExpandedNotes(expandedNotes === entry.template_id ? null : entry.template_id)
                      }
                      className="text-sm font-medium text-brand-teal hover:text-brand-teal-dark"
                    >
                      {expandedNotes === entry.template_id ? 'Hide' : 'Show'} Notes
                    </button>
                    {expandedNotes === entry.template_id && (
                      <textarea
                        value={entry.notes}
                        onChange={(e) => updateNotes(entry.template_id, e.target.value)}
                        placeholder="Add notes about implementation..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        rows={3}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No templates match your filters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
