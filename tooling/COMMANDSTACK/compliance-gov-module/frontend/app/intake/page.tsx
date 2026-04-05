'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { submitIntake } from '@/lib/api'
import { IntakeAnswers, IntakeResult } from '@/lib/types'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [results, setResults] = useState<{ client_id: string; results: IntakeResult[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [answers, setAnswers] = useState<IntakeAnswers>({
    business_size: '',
    handles_phi: false,
    handles_pci: false,
    federal_contracts: false,
    cloud_platform: '',
    existing_docs: false,
    frameworks_asked: [],
  })

  const handleBusinessSizeChange = (size: string) => {
    setAnswers({ ...answers, business_size: size })
  }

  const handlePHIChange = (value: boolean) => {
    setAnswers({ ...answers, handles_phi: value })
  }

  const handlePCIChange = (value: boolean) => {
    setAnswers({ ...answers, handles_pci: value })
  }

  const handleFederalContractsChange = (value: boolean) => {
    setAnswers({ ...answers, federal_contracts: value })
  }

  const handleCloudPlatformChange = (platform: string) => {
    setAnswers({ ...answers, cloud_platform: platform })
  }

  const handleExistingDocsChange = (value: boolean) => {
    setAnswers({ ...answers, existing_docs: value })
  }

  const handleFrameworkToggle = (framework: string) => {
    setAnswers({
      ...answers,
      frameworks_asked: answers.frameworks_asked.includes(framework)
        ? answers.frameworks_asked.filter((f) => f !== framework)
        : [...answers.frameworks_asked, framework],
    })
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return answers.business_size !== ''
      case 2:
        return true
      case 3:
        return true
      case 4:
        return answers.cloud_platform !== ''
      case 5:
        return true
      case 6:
        return true
      case 7:
        return false
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (step === 6) {
      setLoading(true)
      setError(null)
      try {
        const data = await submitIntake(answers)
        setResults(data)
        setStep(7)
      } catch (err) {
        setError('Failed to submit intake assessment. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else if (step < 6) {
      setStep((step + 1) as Step)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleCreateTracker = () => {
    if (results) {
      router.push(`/dashboard?client_id=${results.client_id}`)
    }
  }

  const progressPercentage = (step / 7) * 100

  if (step === 7 && results) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
              Your Compliance Roadmap
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Based on your answers, here are the compliance skills you should prioritize
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {results.results.map((result) => (
              <div
                key={result.skill}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-brand-navy dark:text-white">
                    {result.display_name}
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    result.priority === 'CRITICAL'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : result.priority === 'HIGH'
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        : result.priority === 'MEDIUM'
                          ? 'bg-brand-teal bg-opacity-20 text-brand-teal'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200'
                  }`}>
                    {result.priority}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {result.reason}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded">
                    {result.template_count} templates
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/categories')}
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-brand-navy dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold transition-colors"
            >
              Browse All Templates
            </button>
            <button
              onClick={handleCreateTracker}
              className="px-6 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg font-semibold transition-colors"
            >
              Create Your Tracker
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-brand-navy dark:text-white">
              Compliance Intake Assessment
            </h1>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Step {step} of 6
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-brand-teal rounded-full h-2 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm">
              {error}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 mb-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                What is your business size?
              </h2>
              <div className="space-y-4">
                {['1-5', '5-20', '20+'].map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="business_size"
                      value={size}
                      checked={answers.business_size === size}
                      onChange={(e) => handleBusinessSizeChange(e.target.value)}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {size} employees
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                What types of data does your business handle?
              </h2>
              <div className="space-y-4">
                {['PHI (Protected Health Information)', 'PCI (Payment Card Information)'].map((dataType) => (
                  <label
                    key={dataType}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={dataType === 'PHI (Protected Health Information)' ? answers.handles_phi : answers.handles_pci}
                      onChange={(e) => {
                        if (dataType === 'PHI (Protected Health Information)') {
                          handlePHIChange(e.target.checked)
                        } else {
                          handlePCIChange(e.target.checked)
                        }
                      }}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {dataType}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                Does your business pursue federal contracts?
              </h2>
              <div className="space-y-4">
                {['Yes', 'No'].map((response) => (
                  <label
                    key={response}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="federal_contracts"
                      value={response}
                      checked={answers.federal_contracts === (response === 'Yes')}
                      onChange={(e) => handleFederalContractsChange(e.target.value === 'Yes')}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {response}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                What cloud platform does your business use?
              </h2>
              <div className="space-y-4">
                {['Google Cloud', 'AWS', 'Azure', 'Other'].map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="cloud_platform"
                      value={platform}
                      checked={answers.cloud_platform === platform}
                      onChange={(e) => handleCloudPlatformChange(e.target.value)}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {platform}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                Do you have existing compliance documentation?
              </h2>
              <div className="space-y-4">
                {['Yes', 'No'].map((response) => (
                  <label
                    key={response}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="existing_docs"
                      value={response}
                      checked={answers.existing_docs === (response === 'Yes')}
                      onChange={(e) => handleExistingDocsChange(e.target.value === 'Yes')}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {response}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">
                Which frameworks are relevant to your business?
              </h2>
              <div className="space-y-4">
                {['NIST', 'SOC 2', 'ISO 27001', 'HIPAA', 'FedRAMP', 'CMMC', 'Not sure'].map((framework) => (
                  <label
                    key={framework}
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={answers.frameworks_asked.includes(framework)}
                      onChange={() => handleFrameworkToggle(framework)}
                      className="w-4 h-4 accent-brand-teal"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {framework}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-brand-navy dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : step === 6 ? 'Submit' : 'Next'}
            {!loading && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
