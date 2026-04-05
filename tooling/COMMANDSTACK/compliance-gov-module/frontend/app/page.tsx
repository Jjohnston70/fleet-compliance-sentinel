'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import CategoryCard from '@/components/CategoryCard'
import { getCategories } from '@/lib/api'
import { Category } from '@/lib/types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError('Failed to load categories')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <>
      <section className="bg-gradient-to-r from-brand-navy to-brand-navy-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Federal Compliance. Made Actionable.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            102 compliance templates across 10 skill areas. Built for small businesses pursuing government contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/intake"
              className="inline-flex items-center justify-center gap-2 bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Intake Assessment
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-brand-navy font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Browse Templates
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy dark:text-white text-center mb-12">
            Compliance Skills Library
          </h2>

          {loading && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              Loading categories...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy dark:text-white text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">
                Scope Your Compliance Needs
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take our brief intake assessment to identify which compliance skills are relevant to your business.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">
                Browse Implementation Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Explore our 102 templates organized by skill area. Each includes detailed guidance and implementation steps.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">
                Track Your Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use your dashboard to track implementation status and maintain evidence for compliance audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-brand-navy-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Built for businesses that existed before iPhones
          </h2>
          <p className="text-lg mb-8 text-gray-200">
            Whether you are pursuing GSA Schedule, DISA contracts, or any federal compliance requirement, we have templates for your business.
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold mb-2">102</div>
                <div className="text-sm text-gray-200">Templates</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">10</div>
                <div className="text-sm text-gray-200">Skill Areas</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">6</div>
                <div className="text-sm text-gray-200">Frameworks</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">1</div>
                <div className="text-sm text-gray-200">Expert Team</div>
              </div>
            </div>
          </div>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center gap-2 bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Get Started Today
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  )
}
