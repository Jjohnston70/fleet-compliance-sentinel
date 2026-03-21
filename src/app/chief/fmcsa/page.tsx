import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import ChiefErrorBoundary from '@/components/chief/ChiefErrorBoundary';
import {
  lookupFmcsaCarrier,
  CHIEF_PETROLEUM_DOT,
  FmcsaFullProfile,
} from '@/lib/chief-fmcsa-client';
import FmcsaResultSaver from '@/components/chief/FmcsaResultSaver';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function StatusBadge({ allowed, oos }: { allowed: boolean; oos: boolean }) {
  if (oos) {
    return <span className="chief-pill" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>Out of Service</span>;
  }
  if (allowed) {
    return <span className="chief-pill chief-pill-active">Authorized to Operate</span>;
  }
  return <span className="chief-pill" style={{ background: '#fef9c3', borderColor: '#fde047', color: '#854d0e' }}>Not Authorized</span>;
}

function RatingBadge({ code, label }: { code: string; label: string }) {
  const color = code === 'S' ? '#16a34a' : code === 'U' ? '#dc2626' : code === 'C' ? '#d97706' : '#64748b';
  return <span style={{ fontWeight: 700, color }}>{label || 'Not Rated'}</span>;
}

function DeficientCell({ value }: { value: boolean }) {
  return value
    ? <span style={{ color: '#dc2626', fontWeight: 700 }}>Deficient</span>
    : <span style={{ color: '#16a34a' }}>OK</span>;
}

function OosRate({ rate, avg, label }: { rate: number; avg: string; label: string }) {
  const over = avg ? rate > parseFloat(avg) : false;
  return (
    <div>
      <dt>{label} OOS Rate</dt>
      <dd style={over ? { color: '#dc2626', fontWeight: 700 } : undefined}>
        {rate}% <span className="chief-table-note">(national avg {avg}%)</span>
      </dd>
    </div>
  );
}

function FullProfile({ profile }: { profile: FmcsaFullProfile }) {
  const { carrier, basics, authority, cargo } = profile;

  return (
    <>
      <div className="chief-kv-grid">
        {/* Identity */}
        <article className="chief-kv-card">
          <h3>Identity</h3>
          <dl className="chief-kv-list">
            <div><dt>DOT Number</dt><dd>{carrier.dotNumber}</dd></div>
            <div><dt>Legal Name</dt><dd>{carrier.legalName || '—'}</dd></div>
            {carrier.dbaName && <div><dt>DBA</dt><dd>{carrier.dbaName}</dd></div>}
            <div><dt>Operation Type</dt><dd>{carrier.operationType || '—'}</dd></div>
            <div><dt>Address</dt><dd>{carrier.address || '—'}</dd></div>
            <div><dt>Common Authority</dt><dd>{carrier.commonAuthorityStatus || '—'}</dd></div>
            <div><dt>Contract Authority</dt><dd>{carrier.contractAuthorityStatus || '—'}</dd></div>
          </dl>
        </article>

        {/* Operating status */}
        <article className="chief-kv-card">
          <h3>Operating Status</h3>
          <dl className="chief-kv-list">
            <div>
              <dt>Authorization</dt>
              <dd><StatusBadge allowed={carrier.allowedToOperate} oos={carrier.outOfService} /></dd>
            </div>
            {carrier.outOfServiceDate && <div><dt>OOS Date</dt><dd>{carrier.outOfServiceDate}</dd></div>}
            <div>
              <dt>Safety Rating</dt>
              <dd><RatingBadge code={carrier.safetyRating} label={carrier.safetyRatingFullLabel} /></dd>
            </div>
            {carrier.safetyRatingDate && <div><dt>Rating Date</dt><dd>{carrier.safetyRatingDate}</dd></div>}
            {carrier.reviewDate && <div><dt>Review Date</dt><dd>{carrier.reviewDate}</dd></div>}
            <div><dt>MCS-150 Outdated</dt><dd>{carrier.mcs150Outdated ? 'Yes' : 'No'}</dd></div>
          </dl>
        </article>

        {/* Fleet & inspections */}
        <article className="chief-kv-card">
          <h3>Fleet &amp; Inspections</h3>
          <dl className="chief-kv-list">
            <div><dt>Total Drivers</dt><dd>{carrier.totalDrivers ?? '—'}</dd></div>
            <div><dt>Power Units</dt><dd>{carrier.totalPowerUnits ?? '—'}</dd></div>
            <div><dt>Crashes (total / fatal / injury)</dt><dd>{carrier.crashTotal} / {carrier.fatalCrash} / {carrier.injCrash}</dd></div>
            <OosRate rate={carrier.driverOosRate} avg={carrier.driverOosNationalAvg} label="Driver" />
            <OosRate rate={carrier.vehicleOosRate} avg={carrier.vehicleOosNationalAvg} label="Vehicle" />
            <OosRate rate={carrier.hazmatOosRate} avg={carrier.hazmatOosNationalAvg} label="Hazmat" />
            <div><dt>Hazmat Inspections</dt><dd>{carrier.hazmatInspections}</dd></div>
          </dl>
        </article>
      </div>

      {/* BASICs */}
      {basics.length > 0 && (
        <div className="chief-list-card" style={{ marginTop: '1.5rem' }}>
          <h3>BASIC Safety Scores</h3>
          <div className="chief-table-wrap">
            <table className="chief-table">
              <thead>
                <tr>
                  <th>BASIC</th>
                  <th>Measure</th>
                  <th>Percentile</th>
                  <th>Road Deficient</th>
                  <th>Intervention</th>
                  <th>Serious Violation</th>
                  <th>Violations</th>
                  <th>Run Date</th>
                </tr>
              </thead>
              <tbody>
                {basics.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.shortDesc}</strong></td>
                    <td>{b.measureValue || '—'}</td>
                    <td>{b.percentile}</td>
                    <td><DeficientCell value={b.roadDeficient} /></td>
                    <td><DeficientCell value={b.interventionExceeded} /></td>
                    <td><DeficientCell value={b.seriousViolation} /></td>
                    <td>{b.totalViolations} ({b.inspectionsWithViolation} insp.)</td>
                    <td className="chief-table-note">{b.runDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Authority */}
      {authority.length > 0 && (
        <div className="chief-list-card" style={{ marginTop: '1rem' }}>
          <h3>Operating Authority</h3>
          <div className="chief-table-wrap">
            <table className="chief-table">
              <thead>
                <tr>
                  <th>Docket</th>
                  <th>Common</th>
                  <th>Contract</th>
                  <th>Broker</th>
                  <th>For-Hire Property</th>
                  <th>Passenger</th>
                </tr>
              </thead>
              <tbody>
                {authority.map((a, i) => (
                  <tr key={i}>
                    <td>{a.prefix}{a.docketNumber}</td>
                    <td>{a.commonStatus}</td>
                    <td>{a.contractStatus}</td>
                    <td>{a.brokerStatus}</td>
                    <td>{a.authorizedForProperty ? 'Yes' : 'No'}</td>
                    <td>{a.authorizedForPassenger ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cargo */}
      {cargo.length > 0 && (
        <div className="chief-list-card" style={{ marginTop: '1rem' }}>
          <h3>Cargo Types</h3>
          <ul>
            {cargo.map((c) => <li key={c.id}>{c.description}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}

export default async function ChiefFmcsaPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isClerkEnabled()) return null;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const resolved = await searchParams;
  const dot = firstParam(resolved.dot);
  const fmcsaConfigured = Boolean(process.env.FMCSA_API_KEY);

  type LookupState =
    | { state: 'idle' }
    | { state: 'no-key' }
    | { state: 'result'; profile: FmcsaFullProfile }
    | { state: 'error'; message: string };

  let lookup: LookupState = { state: 'idle' };

  if (dot) {
    if (!fmcsaConfigured) {
      lookup = { state: 'no-key' };
    } else {
      const result = await lookupFmcsaCarrier(dot);
      lookup = result.ok
        ? { state: 'result', profile: result.profile }
        : { state: 'error', message: result.error };
    }
  }

  return (
    <ChiefErrorBoundary page="/chief/fmcsa" userId={userId}>
      <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">FMCSA Lookup</p>
            <h1>Carrier safety data</h1>
          </div>
          <Link href="/chief" className="btn-secondary">Back to Chief</Link>
        </div>
        <p className="chief-subcopy">
          Look up any carrier by USDOT number. Returns carrier profile, BASIC safety scores,
          operating authority, cargo types, and OOS inspection rates from the FMCSA QCMobile API.
        </p>

        <form className="chief-filter-bar" action="/chief/fmcsa">
          <div className="chief-filter-grid">
            <label className="chief-field-stack">
              <span>USDOT Number</span>
              <input
                type="text"
                name="dot"
                defaultValue={dot || CHIEF_PETROLEUM_DOT}
                placeholder="e.g. 135370"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </label>
          </div>
          <div className="chief-action-row">
            <button type="submit" className="btn-primary">Look Up Carrier</button>
            <Link href="/chief/fmcsa" className="btn-secondary">Reset</Link>
          </div>
        </form>

        {!fmcsaConfigured && (
          <div className="chief-info-banner">
            <strong>FMCSA_API_KEY not set.</strong> Add your key from the FMCSA QCMobile portal to enable live lookups.
          </div>
        )}

        {lookup.state === 'result' && (
          <>
            <FmcsaResultSaver carrier={lookup.profile.carrier} />
            <div className="chief-section-head" style={{ marginTop: '1.5rem' }}>
              <div>
                <p className="chief-eyebrow">Live result — DOT {dot}</p>
                <h2>{lookup.profile.carrier.legalName || 'Carrier'}</h2>
              </div>
            </div>
            <FullProfile profile={lookup.profile} />
          </>
        )}

        {lookup.state === 'error' && (
          <div className="chief-empty-state">
            <h3>Lookup failed</h3>
            <p>{lookup.message}</p>
          </div>
        )}

        {lookup.state === 'no-key' && (
          <div className="chief-empty-state">
            <h3>API key required</h3>
            <p>Set <code>FMCSA_API_KEY</code> in your environment to enable carrier lookups.</p>
          </div>
        )}

        {lookup.state === 'idle' && (
          <div className="chief-list-card" style={{ marginTop: '1.5rem' }}>
            <h3>Sample carrier</h3>
            <p>
              Example Fleet Co DOT: <strong>{CHIEF_PETROLEUM_DOT}</strong>. Click{' '}
              <em>Look Up Carrier</em> to pull live FMCSA data including BASIC scores, authority records, and OOS rates.
            </p>
          </div>
        )}
      </section>
      </main>
    </ChiefErrorBoundary>
  );
}
