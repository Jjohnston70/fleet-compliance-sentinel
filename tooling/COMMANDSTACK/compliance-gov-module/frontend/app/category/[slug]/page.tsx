'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import { getCategory } from '@/lib/api'
import { Category, Template } from '@/lib/types'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategory(slug)
        setCategory(data)
        setTemplates([])
      } catch (err) {
        setError('Failed to load category')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategory()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Loading category...
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400 mb-4">
            {error || 'Category not found'}
          </div>
          <div className="text-center">
            <Link
              href="/categories"
              className="text-brand-teal hover:text-brand-teal-dark inline-flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Categories
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
          href="/categories"
          className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal-dark mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Categories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-3">
                {category.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {category.description}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Templates
                  </span>
                  <span className="bg-brand-teal text-white text-sm font-bold px-3 py-1 rounded-full">
                    {category.template_count}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
              Templates
            </h3>

            <div className="space-y-4">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/template/${category.slug}/${template.id}`}
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-xl hover:border-brand-teal dark:hover:border-brand-teal transition-all cursor-pointer">
                      <div className="flex items-start gap-4">
                        <FileText className="w-5 h-5 text-brand-teal flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-brand-navy dark:text-white mb-2">
                            {template.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              template.difficulty === 'beginner'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : template.difficulty === 'intermediate'
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {template.difficulty}
                            </span>
                            {template.frameworks.map((framework) => (
                              <span
                                key={framework}
                                className="text-xs bg-brand-teal text-white px-2 py-1 rounded"
                              >
                                {framework}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  No templates available in this category
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
