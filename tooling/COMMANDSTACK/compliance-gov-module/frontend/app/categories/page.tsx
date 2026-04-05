'use client'

import { useEffect, useState } from 'react'
import CategoryCard from '@/components/CategoryCard'
import { getCategories } from '@/lib/api'
import { Category } from '@/lib/types'

export default function CategoriesPage() {
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
          Compliance Skills Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Browse all compliance skill areas and their associated templates
        </p>

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
    </div>
  )
}
