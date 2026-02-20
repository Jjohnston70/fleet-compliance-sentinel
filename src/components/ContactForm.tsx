'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', business: '', phone: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', business: '', phone: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-white font-semibold text-lg mb-2">Message received.</h3>
        <p className="text-gray-400">I&apos;ll be in touch same day on weekdays. Or just call: (555) 555-5555.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="text-sm text-gray-300 mb-1 block">Your Name <span className="text-tn-teal">*</span></label>
          <input
            id="name" name="name" type="text" required value={form.name} onChange={handleChange}
            className="w-full bg-[#0a1628] border border-gray-600 rounded-md px-3 py-2.5 text-white text-sm focus:border-tn-teal focus:outline-none"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label htmlFor="business" className="text-sm text-gray-300 mb-1 block">Business Name</label>
          <input
            id="business" name="business" type="text" value={form.business} onChange={handleChange}
            className="w-full bg-[#0a1628] border border-gray-600 rounded-md px-3 py-2.5 text-white text-sm focus:border-tn-teal focus:outline-none"
            placeholder="Smith HVAC"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="text-sm text-gray-300 mb-1 block">Phone <span className="text-tn-teal">*</span></label>
          <input
            id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange}
            className="w-full bg-[#0a1628] border border-gray-600 rounded-md px-3 py-2.5 text-white text-sm focus:border-tn-teal focus:outline-none"
            placeholder="(719) 555-0100"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm text-gray-300 mb-1 block">Email</label>
          <input
            id="email" name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full bg-[#0a1628] border border-gray-600 rounded-md px-3 py-2.5 text-white text-sm focus:border-tn-teal focus:outline-none"
            placeholder="john@smithhvac.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="text-sm text-gray-300 mb-1 block">What&apos;s going on in your business?</label>
        <textarea
          id="message" name="message" rows={4} value={form.message} onChange={handleChange}
          className="w-full bg-[#0a1628] border border-gray-600 rounded-md px-3 py-2.5 text-white text-sm focus:border-tn-teal focus:outline-none resize-none"
          placeholder="Tell me what's broken, what's taking too long, or what you can't see..."
        />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Something went wrong. Please call (555) 555-5555 directly.</p>
      )}
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center">
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
      <p className="text-gray-500 text-xs text-center">Faster? Just call: (555) 555-5555</p>
    </form>
  );
}
