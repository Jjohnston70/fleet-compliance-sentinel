'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Tag } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { getTemplate } from '@/lib/api'
import { Template } from '@/lib/types'

export default function TemplatePage() {
  const params = useParams()
  const category = params.category as string
  const id = params.id as string
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await getTemplate(category, id)
        setTemplate(data)
      } catch (err) {
        setError('Failed to load template')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (category && id) {
      fetchTemplate()
    }
  }, [category, id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Loading template...
          </div>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400 mb-4">
            {error || 'Template not found'}
          </div>
          <div className="text-center">
            <Link
              href={`/category/${category}`}
              className="text-brand-teal hover:text-brand-teal-dark inline-flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Category
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/category/${category}`}
          className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal-dark mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Category
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 sticky top-20">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Template Info
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">
                    Skill
                  </p>
                  <p className="text-sm font-medium text-brand-navy dark:text-white">
                    {template.skill}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">
                    Difficulty
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
                    template.difficulty === 'beginner'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : template.difficulty === 'intermediate'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                {template.frameworks.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">
                      Frameworks
                    </p>
                    <div className="space-y-1">
                      {template.frameworks.map((framework) => (
                        <span
                          key={framework}
                          className="block text-xs bg-brand-teal text-white px-2 py-1 rounded"
                        >
                          {framework}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {template.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
              {template.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {template.description}
            </p>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              {template.content ? (
                <MarkdownRenderer content={template.content} />
              ) : (
                <div className="text-gray-600 dark:text-gray-400 italic">
                  Template content is loading...
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
