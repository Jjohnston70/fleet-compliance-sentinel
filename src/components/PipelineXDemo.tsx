'use client';

import { useState } from 'react';

const demos = [
  {
    id: 1,
    prompt: 'Summarize Stage 1 and Stage 2 in plain language.',
    label: 'Ask about a process',
    response: {
      type: 'honest',
      content: [
        {
          type: 'text',
          text: "The context doesn't contain definitions for \"Stage 1\" or \"Stage 2\" — no staged process is described in the retrieved material.",
        },
        {
          type: 'text',
          text: 'The provided context covers general content accessibility guidelines, policy building recommendations, and technical writing best practices, but does not define or describe any numbered stages.',
        },
        {
          type: 'bold-heading',
          text: 'To get you an accurate summary, I\'d need:',
        },
        {
          type: 'numbered-list',
          items: [
            'The specific document or guide that references Stage 1 and Stage 2',
            'A link or additional context excerpt where those stages are defined',
          ],
        },
        {
          type: 'bold-heading',
          text: 'What I can summarize from the available context:',
        },
        {
          type: 'numbered-list',
          items: [
            'The guide aims to establish a baseline of recommended policies for content accessibility',
            'It encourages giving models clear, complete information',
            'It recommends monitoring or tagging as a best practice',
            'Instructions should describe a clear end state (e.g., "save the file to your desktop with a different name")',
          ],
        },
        {
          type: 'text',
          text: "If you can share the source document containing Stage 1 and Stage 2, I'll summarize them accurately right away.",
        },
      ],
    },
    note: "Notice: PipelineX didn't guess or make something up. It told you exactly what it found — and what it didn't. That's the difference between useful AI and dangerous AI.",
  },
  {
    id: 2,
    prompt: 'What is the mapping stage of direction protocol?',
    label: 'Ask about your sales process',
    response: {
      type: 'detailed',
      content: [
        {
          type: 'text',
          text: 'The MAP stage is Stage 3 of the Direction Protocol — a 90–120 minute deep discovery session used to scope the engagement and generate a quote.',
        },
        {
          type: 'bold-heading',
          text: 'Key details from the protocol:',
        },
        {
          type: 'numbered-list',
          items: [
            'Position in sequence — MAP only happens after a successful ASSESS (Stage 2). You cannot skip to MAP without completing IDENTIFY and ASSESS first.',
            'Duration — 90 to 120 minutes (the longest discovery stage in the protocol).',
            'Purpose — Conduct deep discovery and fully scope the engagement.',
            'Outcome — Generate a Quote (which feeds into Stage 4: CHART).',
            'Rule — Never quote without mapping. The protocol explicitly states this as a protective guardrail to prevent bad-fit or under-scoped engagements.',
          ],
        },
        {
          type: 'bold-heading',
          text: 'Where it fits in the full flow:',
        },
        {
          type: 'code',
          text: 'IDENTIFY → ASSESS → MAP → CHART → LAUNCH\n              ↑\n        You are here\n       (90-120 min)\n      Deep discovery\n    → Generates Quote',
        },
        {
          type: 'platform-note',
          text: 'Platform: This is a TNDS internal sales process (Direction Protocol SOP), not a software platform.',
        },
        {
          type: 'warning',
          text: 'Note: The context does not include the specific questions or script used during the MAP stage. If you need the detailed MAP call script or discovery framework, that content isn\'t present in the retrieved context — check the full Direction Protocol document for Stage 3 scripting.',
        },
      ],
    },
    note: 'Notice: PipelineX pulled this directly from your actual SOP document. Your whole team can ask questions like this — instead of asking you.',
  },
];

export default function PipelineXDemo() {
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  const current = demos.find((d) => d.id === activeDemo);

  return (
    <div className="bg-[#0a1628] rounded-xl border border-gray-700 overflow-hidden">
      {/* Prompt buttons */}
      <div className="p-4 border-b border-gray-700 bg-[#081020]">
        <p className="text-gray-400 text-sm mb-3">Click a prompt to see PipelineX respond:</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {demos.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDemo(activeDemo === d.id ? null : d.id)}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                activeDemo === d.id
                  ? 'border-tn-teal bg-tn-teal/10 text-tn-teal'
                  : 'border-gray-600 text-gray-300 hover:border-tn-teal/50 hover:text-white'
              }`}
            >
              <span className="block font-medium mb-0.5">{d.label}</span>
              <span className="text-xs opacity-70 italic">&ldquo;{d.prompt}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo output */}
      {current ? (
        <div className="p-5">
          {/* User bubble */}
          <div className="flex justify-end mb-4">
            <div className="bg-[#132046] border border-gray-600 rounded-lg px-4 py-3 max-w-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">You</span>
              </div>
              <p className="text-white text-sm">{current.prompt}</p>
            </div>
          </div>

          {/* Assistant bubble */}
          <div className="bg-[#0d1b30] border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-xs font-medium">Assistant</span>
            </div>
            <div className="space-y-3 text-sm">
              {current.response.content.map((block, i) => {
                if (block.type === 'text') return <p key={i} className="text-gray-200">{block.text}</p>;
                if (block.type === 'bold-heading') return <p key={i} className="text-white font-bold mt-2">{block.text}</p>;
                if (block.type === 'numbered-list') return (
                  <ol key={i} className="list-decimal list-inside space-y-1 ml-2">
                    {block.items!.map((item, j) => <li key={j} className="text-gray-300">{item}</li>)}
                  </ol>
                );
                if (block.type === 'code') return (
                  <pre key={i} className="bg-[#050d1a] border border-gray-600 rounded p-3 text-tn-teal text-xs font-mono whitespace-pre overflow-x-auto">
                    {block.text}
                  </pre>
                );
                if (block.type === 'platform-note') return (
                  <p key={i} className="text-gray-400 text-xs italic">{block.text}</p>
                );
                if (block.type === 'warning') return (
                  <div key={i} className="border-l-4 border-yellow-500 bg-yellow-500/5 pl-3 py-2 text-gray-300 text-xs">
                    ⚠️ {block.text}
                  </div>
                );
                return null;
              })}
            </div>
          </div>

          {/* Callout */}
          <div className="bg-tn-teal/10 border border-tn-teal/30 rounded-lg px-4 py-3">
            <p className="text-tn-teal text-sm font-medium">{current.note}</p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 text-sm">
          Select a prompt above to see PipelineX respond.
        </div>
      )}
    </div>
  );
}
