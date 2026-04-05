'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Compass } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-navy dark:text-brand-teal" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-brand-navy dark:text-white">
                Compliance Command
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                True North Data Strategies
              </span>
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-brand-navy dark:text-brand-teal hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex gap-8 items-center">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-brand-teal font-medium"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-brand-teal font-medium"
            >
              Categories
            </Link>
            <Link
              href="/intake"
              className="text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-brand-teal font-medium"
            >
              Intake
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-brand-teal font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-brand-teal font-medium"
            >
              Chat
            </Link>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-slate-700 mt-4 pt-4">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/intake"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Intake
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Chat
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
