'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addRecord,
  updateRecord,
  generateId,
  type LocalEmployee,
} from '@/lib/chief-local-store';

interface Props {
  initial?: LocalEmployee;
  returnHref?: string;
}

const BLANK: Omit<LocalEmployee, 'id' | 'createdAt'> = {
  status: 'active',
  employeeId: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  department: '',
  supervisor: '',
  workEmail: '',
  workPhone: '',
  companyPhone: '',
  hireDate: '',
  assignedVehicle: '',
  cdlNumber: '',
  cdlClass: '',
  cdlExpiration: '',
  hazmatEndorsement: '',
  tankEndorsement: '',
  medicalCertNumber: '',
  medicalExpiration: '',
  nextMvrDue: '',
  lastDrugTest: '',
  tsaExpiration: '',
  clearinghouseStatus: '',
  note: '',
};

export default function EmployeeForm({ initial, returnHref = '/chief/employees' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<LocalEmployee, 'id' | 'createdAt'>>(
    initial ?? BLANK
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof BLANK, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }
    if (!form.workEmail.trim()) {
      setError('Work email is required.');
      return;
    }

    if (initial) {
      updateRecord<LocalEmployee>('chief:store:employees', initial.id, form);
    } else {
      const record: LocalEmployee = {
        id: generateId('emp'),
        createdAt: new Date().toISOString(),
        ...form,
        employeeId: form.employeeId || generateId('EMP'),
      };
      addRecord<LocalEmployee>('chief:store:employees', record);
    }
    setSaved(true);
    setTimeout(() => router.push(returnHref), 1200);
  }

  const f = (
    field: keyof typeof BLANK,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; options?: string[] } = {}
  ) => (
    <label className="chief-field-stack">
      <span>{label}{opts.required && ' *'}</span>
      {opts.options ? (
        <select value={String(form[field])} onChange={(e) => set(field, e.target.value)}>
          {opts.options.map((o) => <option key={o} value={o}>{o || '— select —'}</option>)}
        </select>
      ) : (
        <input
          type={opts.type ?? 'text'}
          value={String(form[field])}
          onChange={(e) => set(field, e.target.value)}
          placeholder={opts.placeholder}
          required={opts.required}
        />
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="chief-form-page">
      {saved && <div className="chief-success-banner">Saved. Redirecting…</div>}
      {error && <div className="chief-info-banner"><strong>Error:</strong> {error}</div>}

      <fieldset className="chief-fieldset">
        <legend>Basic Information</legend>
        <div className="chief-form-grid">
          {f('firstName', 'First Name', { required: true })}
          {f('lastName', 'Last Name', { required: true })}
          {f('employeeId', 'Employee ID', { placeholder: 'Auto-generated if blank' })}
          {f('jobTitle', 'Job Title')}
          {f('department', 'Department')}
          {f('supervisor', 'Supervisor')}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Contact</legend>
        <div className="chief-form-grid">
          {f('workEmail', 'Work Email', { type: 'email', required: true })}
          {f('workPhone', 'Work Phone', { type: 'tel' })}
          {f('companyPhone', 'Company Phone', { type: 'tel' })}
          {f('hireDate', 'Hire Date', { type: 'date' })}
          {f('assignedVehicle', 'Assigned Vehicle')}
          {f('status', 'Status', { options: ['active', 'archived'] })}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>CDL & Endorsements</legend>
        <div className="chief-form-grid">
          {f('cdlNumber', 'CDL Number')}
          {f('cdlClass', 'CDL Class', { options: ['', 'A', 'B', 'C', 'None'] })}
          {f('cdlExpiration', 'CDL Expiration', { type: 'date' })}
          {f('hazmatEndorsement', 'Hazmat Endorsement', { options: ['', 'Yes', 'No'] })}
          {f('tankEndorsement', 'Tank Endorsement', { options: ['', 'Yes', 'No'] })}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Medical & Compliance</legend>
        <div className="chief-form-grid">
          {f('medicalCertNumber', 'Medical Certificate #')}
          {f('medicalExpiration', 'Medical Expiration', { type: 'date' })}
          {f('nextMvrDue', 'Next MVR Due', { type: 'date' })}
          {f('lastDrugTest', 'Last Drug Test', { type: 'date' })}
          {f('tsaExpiration', 'TSA Expiration', { type: 'date' })}
          {f('clearinghouseStatus', 'Clearinghouse Status', {
            options: ['', 'Clear', 'Query Pending', 'Violation', 'Not Enrolled'],
          })}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Notes</legend>
        <label className="chief-field-stack">
          <span>Notes</span>
          <textarea
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            rows={3}
          />
        </label>
      </fieldset>

      <div className="chief-action-row">
        <button type="submit" className="btn-primary" disabled={saved}>
          {initial ? 'Save Changes' : 'Add Employee'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push(returnHref)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
