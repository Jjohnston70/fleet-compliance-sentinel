'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type VisualTab = {
  id: string;
  label: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  points: string[];
};

const tabs: VisualTab[] = [
  {
    id: 'command-post',
    label: 'Command Post',
    title: 'Command Post View',
    summary: 'Central workspace for decisions, execution updates, and high-priority tasks.',
    image: '/pipelinex-screenshots/command-post-welcome.png',
    alt: 'PipelineX Command Post interface screenshot',
    points: [
      'Single screen to track what needs attention now',
      'Natural-language workflow for fast updates',
      'Designed for daily operational rhythm',
    ],
  },
  {
    id: 'prompt-lab',
    label: 'Prompt Lab',
    title: 'Prompt Lab View',
    summary: 'Run guided prompts against your real business context and review outputs instantly.',
    image: '/pipelinex-screenshots/prompt-run-result.png',
    alt: 'PipelineX Prompt Lab run result screenshot',
    points: [
      'Structured prompt inputs with reusable patterns',
      'Output history to compare iterations',
      'Fast handoff from draft to real action',
    ],
  },
  {
    id: 'workflow-status',
    label: 'Workflow Status',
    title: 'Workflow Approval View',
    summary: 'Track approvals and completion state without digging through emails and chats.',
    image: '/pipelinex-screenshots/sop-succeeded.png',
    alt: 'PipelineX workflow status success screenshot',
    points: [
      'Clear status indicators for each stage',
      'Audit-friendly visibility for owners and managers',
      'Fewer dropped steps in recurring processes',
    ],
  },
];

export default function PipelineXVisualTabs() {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId],
  );

  return (
    <div className="card border border-tn-teal/20">
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                isActive
                  ? 'border-tn-teal bg-tn-teal/20 text-white'
                  : 'border-gray-700 bg-[#0f1a35] text-gray-300 hover:border-tn-teal/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4">
          <h3 className="text-white text-xl font-semibold mb-2">{activeTab.title}</h3>
          <p className="text-gray-300 text-sm mb-4">{activeTab.summary}</p>
          <ul className="space-y-2">
            {activeTab.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-tn-teal mt-0.5">+</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="xl:col-span-8">
          <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#081029]">
            <div className="px-3 py-2 border-b border-gray-700 bg-[#0d1730] text-xs text-gray-300">
              {activeTab.label}
            </div>
            <Image
              src={activeTab.image}
              alt={activeTab.alt}
              width={3040}
              height={1740}
              className="w-full h-auto"
              sizes="(max-width: 1280px) 100vw, 70vw"
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Real PipelineX UI capture from the current template workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
