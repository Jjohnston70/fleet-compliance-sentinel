'use client'

import Link from 'next/link'
import {
  Shield,
  Lock,
  FileText,
  Cloud,
  Building,
  CheckSquare,
  AlertCircle,
  Users,
  Database,
  Zap,
} from 'lucide-react'
import { Category } from '@/lib/types'

const categoryIcons: Record<string, React.ReactNode> = {
  'access-control': <Lock className="w-6 h-6" />,
  'incident-response': <AlertCircle className="w-6 h-6" />,
  'security-assessment': <Shield className="w-6 h-6" />,
  'compliance-frameworks': <CheckSquare className="w-6 h-6" />,
  'data-protection': <Database className="w-6 h-6" />,
  'cloud-security': <Cloud className="w-6 h-6" />,
  'vendor-management': <Users className="w-6 h-6" />,
  'business-continuity': <Zap className="w-6 h-6" />,
  'documentation': <FileText className="w-6 h-6" />,
  'governance': <Building className="w-6 h-6" />,
}

export default function CategoryCard({ category }: { category: Category }) {
  const icon = categoryIcons[category.slug] || <Shield className="w-6 h-6" />

  return (
    <Link href={`/category/${category.slug}`}>
      <div className="h-full bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-xl hover:border-brand-teal dark:hover:border-brand-teal transition-all cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="text-brand-teal dark:text-brand-teal-light mt-1">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-brand-navy dark:text-white mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {category.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block bg-brand-teal text-white text-xs px-2 py-1 rounded">
                {category.template_count} templates
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
