// app/penny/PennyChat.tsx
// Client-side chat component for Pipeline Penny
// Connects to FastAPI backend via API route (to keep backend URL server-side)

'use client';

import { useState, useRef, useEffect } from 'react';

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
  isDemo: boolean;
}

export default function PennyChat({ userName, userRole, isDemo }: PennyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'penny',
      content: `Hey ${userName}! I'm Pipeline Penny. Ask me anything about the knowledge base and I'll find the answer from your actual documents. What do you need?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth();
  }, []);

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

  async function sendMessage() {
    const query = input.trim();
    if (!query || loading) return;

    // Demo users get limited queries
    if (isDemo && messages.filter((m) => m.role === 'user').length >= 10) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'penny',
          content:
            "You've reached the demo query limit. Want Pipeline Penny for your own business? Talk to Jacob — truenorthstrategyops.com/contact",
          timestamp: new Date(),
        },
      ]);
      return;
    }

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
        body: JSON.stringify({ query, role: userRole }),
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
    } catch (err) {
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

  return (
    <div className="penny-container">
      <div className="penny-header">
        <h1>Pipeline Penny</h1>
        <p>Ask questions about your business knowledge base</p>
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
              <p>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="penny-msg-source">
                  Sources: {msg.sources.join(', ')}
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
        {isDemo && (
          <div className="penny-demo-banner">
            Demo mode — {10 - messages.filter((m) => m.role === 'user').length} queries remaining.{' '}
            <a href="https://www.truenorthstrategyops.com/contact">Want this for your business?</a>
          </div>
        )}
        <div className="penny-input-wrap" style={{ marginTop: isDemo ? '0.75rem' : 0 }}>
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
            onClick={sendMessage}
            disabled={loading || !input.trim() || backendStatus === 'offline'}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
