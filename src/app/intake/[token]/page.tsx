'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Section {
  id: string;
  title: string;
  description: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file' | 'repeater';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface IntakeData {
  sections?: Section[];
  driverName?: string;
  driver_name?: string;
}

const SECTION_CONFIGS: Record<string, Section> = {
  personal: {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true, placeholder: 'John' },
      { name: 'lastName', type: 'text', label: 'Last Name', required: true, placeholder: 'Smith' },
      { name: 'dateOfBirth', type: 'date', label: 'Date of Birth', required: true },
      { name: 'email', type: 'text', label: 'Email', required: true, placeholder: 'john@example.com' },
      { name: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '555-123-4567' },
    ],
  },
  licensing: {
    id: 'licensing',
    title: 'Licensing Information',
    description: 'CDL and driving license details',
    fields: [
      { name: 'cdlNumber', type: 'text', label: 'CDL Number', required: true, placeholder: 'A123456' },
      { name: 'cdlClass', type: 'select', label: 'CDL Class', required: true, options: ['A', 'B', 'C'] },
      { name: 'cdlExpiration', type: 'date', label: 'CDL Expiration', required: true },
      { name: 'hazmat', type: 'checkbox', label: 'HAZMAT Endorsement' },
      { name: 'tanker', type: 'checkbox', label: 'Tanker Endorsement' },
    ],
  },
  employment_history: {
    id: 'employment_history',
    title: 'Employment History',
    description: 'Previous employment as a driver',
    fields: [
      { name: 'previousEmployer', type: 'text', label: 'Previous Employer', placeholder: 'Company Name' },
      { name: 'yearsExperience', type: 'text', label: 'Years of Experience', placeholder: '5' },
      { name: 'employmentHistory', type: 'textarea', label: 'Employment History', placeholder: 'List previous employers and dates' },
    ],
  },
  violations: {
    id: 'violations',
    title: 'Traffic Violations',
    description: 'Disclose any traffic violations or accidents',
    fields: [
      { name: 'hasViolations', type: 'checkbox', label: 'I have traffic violations to disclose' },
      { name: 'violationDetails', type: 'textarea', label: 'Details', placeholder: 'Describe any violations or accidents' },
    ],
  },
  certifications: {
    id: 'certifications',
    title: 'Certifications & Medical',
    description: 'Medical certificate and other certifications',
    fields: [
      { name: 'medicalCertNumber', type: 'text', label: 'Medical Certificate Number', placeholder: 'MC-123456' },
      { name: 'medicalExpiration', type: 'date', label: 'Medical Expiration', required: true },
      { name: 'otherCertifications', type: 'textarea', label: 'Other Certifications', placeholder: 'List any other relevant certifications' },
    ],
  },
  uploads: {
    id: 'uploads',
    title: 'Document Uploads',
    description: 'Upload supporting documents',
    fields: [
      { name: 'cdlCopy', type: 'file', label: 'CDL Copy', required: true },
      { name: 'medicalCertificate', type: 'file', label: 'Medical Certificate', required: true },
      { name: 'driversLicense', type: 'file', label: 'Driver\'s License', required: true },
      { name: 'additionalDocs', type: 'file', label: 'Additional Documents' },
    ],
  },
};

export default function IntakePage() {
  const params = useParams();
  const token = params.token as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [driverName, setDriverName] = useState('');
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, string | boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadIntake() {
      try {
        const res = await fetch(`/api/fleet-compliance/dq/intake/${token}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('This intake link is invalid or has expired');
          } else {
            throw new Error('Failed to load intake form');
          }
          setLoading(false);
          return;
        }

        const data: IntakeData = await res.json();
        const apiSections = Array.isArray(data.sections) ? data.sections : [];
        const sectionIds = ['personal', 'licensing', 'employment_history', 'violations', 'certifications', 'uploads'];
        const loadedSections = sectionIds
          .map((id) => {
            const base = SECTION_CONFIGS[id];
            const fromApi = apiSections.find((section) => section?.id === id);
            if (!fromApi) return base;
            return {
              ...base,
              ...fromApi,
              title: fromApi.title || base.title,
              description: fromApi.description || base.description,
              fields: Array.isArray(fromApi.fields) && fromApi.fields.length > 0 ? fromApi.fields : base.fields,
            };
          })
          .filter(Boolean) as Section[];

        setSections(loadedSections);
        setDriverName(data.driverName || data.driver_name || '');
        setResponses(
          loadedSections.reduce((acc, section) => {
            acc[section.id] = {};
            return acc;
          }, {} as Record<string, Record<string, string | boolean>>)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadIntake();
  }, [token]);

  const handleFieldChange = (sectionId: string, fieldName: string, value: string | boolean) => {
    setResponses((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldName]: value,
      },
    }));
  };

  const handleSectionSubmit = async () => {
    setSubmitting(true);
    try {
      const section = sections[currentSectionIdx];
      const res = await fetch(`/api/fleet-compliance/dq/intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: section.id,
          response_data: responses[section.id],
        }),
      });

      if (!res.ok) throw new Error('Failed to save section');

      if (currentSectionIdx < sections.length - 1) {
        setCurrentSectionIdx((prev) => prev + 1);
      } else {
        const completeRes = await fetch(`/api/fleet-compliance/dq/intake/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete' }),
        });

        if (!completeRes.ok) throw new Error('Failed to complete intake');
        setCompleted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            ✓
          </div>
          <h1
            style={{
              color: '#1a3a5c',
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Intake Complete
          </h1>
          <p
            style={{
              color: '#4a4a4a',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Your intake form has been submitted successfully. Your fleet manager will contact you with next steps.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#4a4a4a' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Error
          </h1>
          <p style={{ color: '#4a4a4a', marginBottom: '1.5rem' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentSectionIdx];
  if (!currentSection) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Intake Form Unavailable
          </h1>
          <p style={{ color: '#4a4a4a' }}>
            This intake link is missing form sections. Please ask your fleet manager to regenerate the link.
          </p>
        </div>
      </div>
    );
  }
  const progress = ((currentSectionIdx + 1) / sections.length) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Section {currentSectionIdx + 1} of {sections.length}
            </p>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#3d8eb9',
                fontWeight: 700,
              }}
            >
              {Math.round(progress)}%
            </p>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#d1d5db',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: '#3d8eb9',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {/* Section Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#3d8eb9',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Driver Onboarding
          </p>
          <h1
            style={{
              color: '#1a3a5c',
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            {currentSection.title}
          </h1>
          <p style={{ color: '#4a4a4a', fontSize: '1rem' }}>
            {currentSection.description}
          </p>
        </div>

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSectionSubmit();
          }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {currentSection.fields.map((field) => (
              <div key={field.name}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      color: '#1a3a5c',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                  </span>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={String(responses[currentSection.id][field.name] || '')}
                      onChange={(e) =>
                        handleFieldChange(currentSection.id, field.name, e.target.value)
                      }
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      value={String(responses[currentSection.id][field.name] || '')}
                      onChange={(e) =>
                        handleFieldChange(currentSection.id, field.name, e.target.value)
                      }
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={String(responses[currentSection.id][field.name] || '')}
                      onChange={(e) =>
                        handleFieldChange(currentSection.id, field.name, e.target.value)
                      }
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      value={String(responses[currentSection.id][field.name] || '')}
                      onChange={(e) =>
                        handleFieldChange(currentSection.id, field.name, e.target.value)
                      }
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        minHeight: '120px',
                        resize: 'vertical',
                      }}
                    />
                  )}

                  {field.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      checked={Boolean(responses[currentSection.id][field.name])}
                      onChange={(e) =>
                        handleFieldChange(currentSection.id, field.name, e.target.checked)
                      }
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                  )}

                  {field.type === 'file' && (
                    <div
                      style={{
                        padding: '2rem',
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFieldChange(
                              currentSection.id,
                              field.name,
                              file.name
                            );
                          }
                        }}
                        required={field.required}
                        style={{ display: 'none' }}
                        id={field.name}
                      />
                      <label
                        htmlFor={field.name}
                        style={{
                          cursor: 'pointer',
                          display: 'block',
                          padding: '1rem',
                        }}
                      >
                        <p style={{ color: '#3d8eb9', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Click to upload
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {responses[currentSection.id][field.name]
                            ? String(responses[currentSection.id][field.name])
                            : 'or drag and drop'}
                        </p>
                      </label>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentSectionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentSectionIdx === 0}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#1a3a5c',
                borderRadius: '8px',
                cursor: currentSectionIdx === 0 ? 'default' : 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                opacity: currentSectionIdx === 0 ? 0.5 : 1,
              }}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3d8eb9',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'default' : 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting
                ? 'Saving...'
                : currentSectionIdx === sections.length - 1
                  ? 'Complete'
                  : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
