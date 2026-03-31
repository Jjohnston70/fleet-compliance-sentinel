'use client';

import { useState, useEffect, useCallback } from 'react';

export default function UserManualModal() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  return (
    <>
      <button
        type="button"
        className="fc-sidebar-link"
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left', width: '100%' }}
      >
        User Manual
      </button>

      {open && (
        <div
          className="manual-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="User Manual"
        >
          <div className="manual-modal">
            <div className="manual-header">
              <h2>Fleet-Compliance Sentinel User Manual</h2>
              <button
                type="button"
                className="manual-close"
                onClick={() => setOpen(false)}
                aria-label="Close manual"
              >
                X
              </button>
            </div>
            <div className="manual-body">
              <section>
                <h3>Getting Started</h3>
                <p>
                  Fleet-Compliance Sentinel tracks drivers, vehicles, permits, and DOT deadlines in one place.
                  After signing in, your dashboard shows operational snapshots across all compliance areas.
                </p>
              </section>

              <section>
                <h3>Dashboard</h3>
                <p>
                  The main dashboard provides quick stats for tracked assets, driver records, open suspense items,
                  and permit records. Each module card shows its current status and links to the full view.
                </p>
              </section>

              <section>
                <h3>Assets</h3>
                <p>
                  Manage your fleet inventory including VINs, inspection dates, maintenance schedules, and
                  registration details. Assets can be added individually or via bulk Excel import.
                </p>
              </section>

              <section>
                <h3>Compliance Tracking</h3>
                <p>
                  Track CDL expirations, medical cards, MVR records, and drug testing schedules. The system
                  sends automated email alerts for approaching deadlines and overdue items.
                </p>
              </section>

              <section>
                <h3>Suspense Items</h3>
                <p>
                  Suspense items are compliance tasks that require action. They include severity levels,
                  due dates, and can be resolved with notes and audit trails.
                </p>
              </section>

              <section>
                <h3>Telematics</h3>
                <p>
                  View real-time fleet risk scores powered by your telematics provider (Geotab, Samsara, or
                  Verizon Reveal Connect). Risk scores are computed from vehicle activity, GPS events,
                  and HOS/ELD status. Vehicles and drivers are classified as HIGH, MEDIUM, or LOW risk.
                </p>
              </section>

              <section>
                <h3>Invoices</h3>
                <p>
                  Track maintenance invoices with vendor, amount, and asset linkage. PDF invoices can be
                  uploaded and automatically parsed to extract vendor, amounts, and line items for 12
                  supported fleet maintenance vendors.
                </p>
              </section>

              <section>
                <h3>FMCSA Lookup</h3>
                <p>
                  Pull live carrier safety data from the federal FMCSA database using USDOT numbers.
                  Results can be saved as snapshots for compliance documentation.
                </p>
              </section>

              <section>
                <h3>Pipeline Penny (AI Assistant)</h3>
                <p>
                  Pipeline Penny is an AI compliance assistant grounded in 13 CFR parts (040-397).
                  Ask questions about DOT regulations and get source-cited answers using your fleet context.
                  Penny supports multiple LLM providers: Anthropic, OpenAI, Gemini, and Ollama (local).
                </p>
              </section>

              <section>
                <h3>Bulk Data Import</h3>
                <p>
                  Upload fleet records from Excel files across 12 validated collection types including
                  assets, drivers, permits, maintenance, and compliance records.
                </p>
              </section>

              <section>
                <h3>Alerts and Notifications</h3>
                <p>
                  Configure automated compliance alerts sent via email. Set thresholds for expiration
                  warnings, overdue notifications, and risk escalation triggers.
                </p>
              </section>

              <section>
                <h3>Settings</h3>
                <p>
                  Manage alert configurations, notification preferences, and organization settings.
                  Admin users can configure team member access and role assignments.
                </p>
              </section>

              <section>
                <h3>Data Security</h3>
                <p>
                  All data is encrypted in transit and at rest, org-isolated, and never used to train AI models.
                  The platform is SOC 2 Type I audit-ready with comprehensive audit logging.
                </p>
              </section>

              <section>
                <h3>Support</h3>
                <p>
                  For questions or support, contact True North Data Strategies at{' '}
                  <a href="tel:555-555-5555">555-555-5555</a> or{' '}
                  <a href="mailto:jacob@truenorthstrategyops.com">jacob@truenorthstrategyops.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
