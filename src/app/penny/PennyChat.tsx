// app/penny/PennyChat.tsx
// Client-side chat component for Pipeline Penny
// Connects to FastAPI backend via API route (to keep backend URL server-side)

'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'penny';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface PennyChatProps {
  userName: string;
  userRole: string;
}

interface CatalogCategory {
  name: string;
  count: number;
}

interface CatalogDocument {
  title: string;
  source?: string;
  category?: string;
}

type LlmProvider = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'none';

const SETTINGS_STORAGE_KEY = 'penny-llm-settings-v1';

const PROVIDER_LABELS: Record<LlmProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
  ollama: 'Ollama (Local)',
  none: 'Fallback Only',
};

const PROVIDER_MODEL_OPTIONS: Record<LlmProvider, string[]> = {
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-3-haiku-20240307'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  ollama: ['llama3.1', 'deepseek-coder-v2', 'qwen2.5'],
  none: ['fallback'],
};

function defaultModelFor(provider: LlmProvider): string {
  return PROVIDER_MODEL_OPTIONS[provider]?.[0] || 'fallback';
}

const HELPER_QUESTIONS = [
  'List the CFR parts you can answer from right now.',
  'What is the 150 air-mile radius exemption under DOT rules?',
  'Summarize driver qualification requirements in Part 391.',
  'What does Part 395 say about hours of service recordkeeping?',
  'What maintenance requirements are covered in Part 396?',
];

function getSourceUrl(source: string): string | null {
  const match = source.match(/https?:\/\/[^\s,]+/);
  return match ? match[0] : null;
}

export default function PennyChat({ userName, userRole }: PennyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'penny',
      content: `Hey ${userName}! I'm Pipeline Penny. Ask me about the current CFR and DOT compliance corpus and I'll answer from the indexed documents when it's available.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<CatalogDocument[]>([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState<CatalogCategory[]>([]);
  const [knowledgeDocCount, setKnowledgeDocCount] = useState(0);
  const [llmProvider, setLlmProvider] = useState<LlmProvider>('anthropic');
  const [llmModel, setLlmModel] = useState<string>(defaultModelFor('anthropic'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check backend health on mount
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { llmProvider?: LlmProvider; llmModel?: string };
        if (parsed.llmProvider && PROVIDER_MODEL_OPTIONS[parsed.llmProvider]) {
          setLlmProvider(parsed.llmProvider);
          setLlmModel(parsed.llmModel?.trim() || defaultModelFor(parsed.llmProvider));
        }
      }
    } catch {
      // Ignore malformed local settings and use defaults.
    }

    checkHealth();
    loadCatalog();
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ llmProvider, llmModel })
    );
  }, [llmProvider, llmModel]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkHealth() {
    try {
      const res = await fetch('/api/penny/health');
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  }

  async function loadCatalog() {
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/penny/catalog?limit=160');
      if (!res.ok) return;
      const data = await res.json();
      setKnowledgeDocs(Array.isArray(data?.documents) ? data.documents : []);
      setKnowledgeCategories(Array.isArray(data?.categories) ? data.categories : []);
      setKnowledgeDocCount(typeof data?.knowledge_docs === 'number' ? data.knowledge_docs : 0);
    } finally {
      setCatalogLoading(false);
    }
  }

  async function sendMessage(overrideQuery?: string) {
    const query = (overrideQuery ?? input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/penny/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          role: userRole,
          llm_provider: llmProvider,
          llm_model: llmModel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data = await res.json();

      const pennyMsg: Message = {
        id: `penny-${Date.now()}`,
        role: 'penny',
        content: data.answer || "I couldn't find an answer to that in the knowledge base.",
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, pennyMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'penny',
          content:
            "I'm having trouble connecting to the backend right now. This usually means the server is starting up or temporarily unavailable. Try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectHelperQuestion(question: string) {
    sendMessage(question);
  }

  function handleProviderChange(nextProvider: LlmProvider) {
    setLlmProvider(nextProvider);
    if (nextProvider === 'none') {
      setLlmModel('fallback');
      return;
    }
    const modelOptions = PROVIDER_MODEL_OPTIONS[nextProvider];
    const hasCurrent = modelOptions.includes(llmModel);
    if (!hasCurrent) {
      setLlmModel(defaultModelFor(nextProvider));
    }
  }

  return (
    <div className="penny-container">
      <div className="penny-shell">
        <section className="penny-main">
          <div className="penny-header">
            <h1>Pipeline Penny</h1>
            <p>Ask questions about the current CFR and DOT compliance knowledge base</p>
            <div className="penny-status">
              <span
                className={`penny-status-dot ${
                  backendStatus === 'online'
                    ? ''
                    : backendStatus === 'checking'
                    ? 'loading'
                    : 'offline'
                }`}
              />
              {backendStatus === 'online' && 'Connected'}
              {backendStatus === 'offline' && 'Backend offline'}
              {backendStatus === 'checking' && 'Connecting...'}
            </div>
          </div>

          <div className="penny-messages">
            {messages.map((msg) => (
              <div key={msg.id} className="penny-msg">
                <div className={`penny-msg-avatar ${msg.role === 'penny' ? 'penny' : 'user'}`}>
                  {msg.role === 'penny' ? 'PP' : userName.charAt(0).toUpperCase()}
                </div>
                <div className="penny-msg-body">
                  <div className="penny-msg-text penny-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      skipHtml
                      components={{
                        html: () => null,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="penny-link">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="penny-msg-source">
                      <span className="penny-msg-source-label">Sources</span>
                      <div className="penny-source-list">
                        {msg.sources.map((source, idx) => {
                          const url = getSourceUrl(source);
                          if (url) {
                            return (
                              <a
                                key={`${source}-${idx}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="penny-source-pill"
                              >
                                {source}
                              </a>
                            );
                          }
                          return (
                            <span key={`${source}-${idx}`} className="penny-source-pill">
                              {source}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="penny-msg">
                <div className="penny-msg-avatar penny">PP</div>
                <div className="penny-msg-body">
                  <p style={{ color: 'var(--text-muted)' }}>Searching knowledge base...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="penny-input-area">
            <div className="penny-input-wrap">
              <textarea
                ref={inputRef}
                className="penny-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Penny a question..."
                rows={1}
                disabled={loading || backendStatus === 'offline'}
              />
              <button
                className="penny-send"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim() || backendStatus === 'offline'}
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="penny-sidebar">
          <div className="penny-side-card">
            <p className="penny-side-eyebrow">Settings</p>
            <h2>Model Routing</h2>
            <p className="penny-side-note">
              Choose provider and model for Penny responses.
            </p>
            <div className="penny-side-list" style={{ gap: '0.5rem' }}>
              <label htmlFor="penny-provider" className="penny-side-note">
                Provider
              </label>
              <select
                id="penny-provider"
                className="penny-input"
                value={llmProvider}
                onChange={(e) => handleProviderChange(e.target.value as LlmProvider)}
              >
                {(Object.keys(PROVIDER_LABELS) as LlmProvider[]).map((provider) => (
                  <option key={provider} value={provider}>
                    {PROVIDER_LABELS[provider]}
                  </option>
                ))}
              </select>

              <label htmlFor="penny-model" className="penny-side-note">
                Model
              </label>
              <input
                id="penny-model"
                className="penny-input"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                list={`penny-model-options-${llmProvider}`}
                disabled={llmProvider === 'none'}
                placeholder="Model name"
              />
              <datalist id={`penny-model-options-${llmProvider}`}>
                {PROVIDER_MODEL_OPTIONS[llmProvider].map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="penny-side-card">
            <p className="penny-side-eyebrow">Try These</p>
            <h2>Helper Questions</h2>
            <div className="penny-side-list">
              {HELPER_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="penny-side-button"
                  onClick={() => selectHelperQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="penny-side-card">
            <p className="penny-side-eyebrow">Current Corpus</p>
            <h2>Knowledge in Penny</h2>
            <p className="penny-side-note">
              {catalogLoading
                ? 'Loading knowledge index...'
                : `${knowledgeDocCount} docs indexed${knowledgeCategories.length ? ` across ${knowledgeCategories.length} categories` : ''}.`}
            </p>
            {knowledgeCategories.length > 0 && (
              <div className="penny-side-chip-row">
                {knowledgeCategories.slice(0, 8).map((category) => (
                  <span key={category.name} className="penny-side-chip">
                    {category.name} ({category.count})
                  </span>
                ))}
              </div>
            )}
            <div className="penny-side-list">
              {knowledgeDocs.slice(0, 18).map((doc, idx) => (
                <button
                  key={`${doc.source || doc.title}-${idx}`}
                  type="button"
                  className="penny-side-button"
                  onClick={() => sendMessage(`Summarize the document: ${doc.title}`)}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
