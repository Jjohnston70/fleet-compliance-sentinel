'use client';

import { useState } from 'react';
import InvoiceForm from '@/components/fleet-compliance/forms/InvoiceForm';
import type { LocalInvoice } from '@/lib/fleet-compliance-local-store';

type ExtractedInvoice = {
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  amount?: string;
  partsCost?: string;
  laborCost?: string;
};

type ParsePdfResponse = {
  extracted?: ExtractedInvoice;
  rawText?: string;
  error?: string;
};

interface Props {
  orgAssets?: Array<{ assetId: string; label: string }>;
}

function normalizeDateInput(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function toDraftInvoice(extracted: ExtractedInvoice | undefined): LocalInvoice {
  return {
    id: '',
    createdAt: '',
    vendor: extracted?.vendor?.trim() ?? '',
    invoiceNumber: extracted?.invoiceNumber?.trim() ?? '',
    invoiceDate: normalizeDateInput(extracted?.invoiceDate),
    dueDate: '',
    amount: extracted?.amount?.trim() ?? '',
    partsCost: extracted?.partsCost?.trim() ?? '',
    laborCost: extracted?.laborCost?.trim() ?? '',
    category: 'maintenance',
    assetId: '',
    serviceType: '',
    status: 'pending',
    note: '',
  };
}

export default function InvoiceUploadAndForm({ orgAssets = [] }: Props) {
  const [prefill, setPrefill] = useState<LocalInvoice | undefined>();
  const [rawText, setRawText] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setNotice('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/fleet-compliance/invoices/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as ParsePdfResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? `PDF parse failed (${response.status})`);
      }

      setPrefill(toDraftInvoice(payload.extracted));
      setRawText(payload.rawText ?? '');
      setNotice('Fields extracted from PDF. Review and adjust before saving.');
      setFormVersion((prev) => prev + 1);
    } catch (parseError: unknown) {
      setError(String(parseError));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <>
      <div className="fleet-compliance-list-card" style={{ marginBottom: '1.25rem' }}>
        <h3>Upload PDF Invoice</h3>
        <p className="fleet-compliance-table-note" style={{ marginBottom: '0.75rem' }}>
          Select a PDF invoice to auto-extract vendor, invoice number, date, and key amounts.
        </p>
        <label className="fleet-compliance-field-stack" style={{ maxWidth: '420px' }}>
          <span>PDF File</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelected}
            disabled={uploading}
          />
        </label>
        {uploading && <p className="fleet-compliance-table-note" style={{ marginTop: '0.65rem' }}>Parsing PDF…</p>}
        {error && <div className="fleet-compliance-info-banner"><strong>Error:</strong> {error}</div>}
      </div>

      {notice && <div className="fleet-compliance-info-banner" style={{ marginBottom: '1rem' }}>{notice}</div>}

      {rawText && (
        <details className="fleet-compliance-empty-state" style={{ marginBottom: '1rem' }}>
          <summary>Source Text</summary>
          <pre className="fleet-compliance-code-block">{rawText}</pre>
        </details>
      )}

      <InvoiceForm
        key={`invoice-form-${formVersion}`}
        initial={prefill}
        orgAssets={orgAssets}
      />
    </>
  );
}
