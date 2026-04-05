'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import SearchBar from '@/components/SearchBar'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal-dark mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {query ? `Search results for: "${query}"` : 'Enter a search query above'}
        </p>

        <div className="mb-8 max-w-md">
          <SearchBar />
        </div>

        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {query
              ? 'Search functionality is available through browsing categories and templates'
              : 'Enter a search query to find templates'}
          </p>
        </div>
      </div>
    </div>
  )
}
