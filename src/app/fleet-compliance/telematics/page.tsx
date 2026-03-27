import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import TelematicsRiskBadge from '@/components/fleet-compliance/TelematicsRiskBadge';

export const dynamic = 'force-dynamic';

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type VehicleRiskRow = {
  vehicleNumber: string;
  make: string | null;
  model: string | null;
  year: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  lastSeenAt: string | null;
  gpsEventsLast7Days: number;
  flags: string[];
};

type DriverRiskRow = {
  driverName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  hosStatus: string | null;
  flags: string[];
};

type TelematicsRiskSummary = {
  totalVehicles: number;
  totalDrivers: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  topFlags: string[];
};

type TelematicsRiskApiResponse = {
  orgId: string;
  generatedAt: string;
  vehicles: VehicleRiskRow[];
  drivers: DriverRiskRow[];
  summary: TelematicsRiskSummary;
};

function formatLastSync(value: string | null | undefined): string {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return formatted.replace(',', ' at');
}

function formatLastSeen(value: string | null): string {
  if (!value) return 'Never';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function normalizeFlag(flag: string): string {
  return flag
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeFlags(flags: string[] | null | undefined): string[] {
  if (!Array.isArray(flags)) return [];
  return flags
    .filter((flag): flag is string => typeof flag === 'string' && flag.trim().length > 0)
    .map(normalizeFlag);
}

function formatHosStatus(status: string | null): string {
  if (!status) return '—';
  const trimmed = status.trim();
  if (!trimmed || trimmed.toUpperCase() === 'UNKNOWN') return '—';
  return trimmed.replace(/^ELD:\s*/i, '') || '—';
}

async function loadTelematicsRiskData(): Promise<{ data: TelematicsRiskApiResponse | null; error: string | null }> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${baseUrl}/api/fleet-compliance/telematics-risk`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Risk API returned ${response.status}.`,
      };
    }

    const parsed = (await response.json()) as Partial<TelematicsRiskApiResponse>;
    if (!parsed || typeof parsed !== 'object') {
      return { data: null, error: 'Risk API returned an invalid payload.' };
    }

    const safeData: TelematicsRiskApiResponse = {
      orgId: typeof parsed.orgId === 'string' ? parsed.orgId : '',
      generatedAt: typeof parsed.generatedAt === 'string' ? parsed.generatedAt : '',
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles as VehicleRiskRow[] : [],
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers as DriverRiskRow[] : [],
      summary: {
        totalVehicles: Number(parsed.summary?.totalVehicles ?? 0),
        totalDrivers: Number(parsed.summary?.totalDrivers ?? 0),
        highRisk: Number(parsed.summary?.highRisk ?? 0),
        mediumRisk: Number(parsed.summary?.mediumRisk ?? 0),
        lowRisk: Number(parsed.summary?.lowRisk ?? 0),
        topFlags: Array.isArray(parsed.summary?.topFlags) ? parsed.summary.topFlags.filter((flag): flag is string => typeof flag === 'string') : [],
      },
    };

    return { data: safeData, error: null };
  } catch {
    return {
      data: null,
      error: 'Telematics risk data is temporarily unavailable.',
    };
  }
}

export default async function FleetComplianceTelematicsPage() {
  if (!isClerkEnabled()) return null;

  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const result = await loadTelematicsRiskData();
  const data = result.data;

  const vehicles = [...(data?.vehicles ?? [])].sort((a, b) => Number(b.riskScore || 0) - Number(a.riskScore || 0));
  const drivers = [...(data?.drivers ?? [])].sort((a, b) => Number(b.riskScore || 0) - Number(a.riskScore || 0));
  const summary: TelematicsRiskSummary = data?.summary ?? {
    totalVehicles: 0,
    totalDrivers: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    topFlags: [],
  };
  const lastSyncLabel = formatLastSync(data?.generatedAt ?? null);
  const topFlags = normalizeFlags(summary.topFlags);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/telematics" userId={userId} orgId={orgId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-hero">
          <p className="fleet-compliance-eyebrow">Telematics Intelligence</p>
          <h1>Live fleet risk scores powered by Verizon Connect Reveal.</h1>
          <p className="fleet-compliance-subcopy">
            {data
              ? `Last sync ${lastSyncLabel}.`
              : 'Last sync unavailable while the telematics risk API recovers.'}
          </p>
          <div className="fleet-compliance-action-row">
            <Link href="/fleet-compliance" className="btn-secondary">Back to Fleet-Compliance</Link>
          </div>
        </section>

        {result.error && !data && (
          <section className="fleet-compliance-section">
            <div className="fleet-compliance-empty-state">
              <h3>Telematics data is not available right now.</h3>
              <p>{result.error}</p>
            </div>
          </section>
        )}

        <section className="fleet-compliance-stats">
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Total Vehicles</p>
            <p className="fleet-compliance-stat-value">{summary.totalVehicles}</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Total Drivers</p>
            <p className="fleet-compliance-stat-value">{summary.totalDrivers}</p>
          </article>
          <article
            className="fleet-compliance-stat-card"
            style={summary.highRisk > 0 ? { borderColor: '#fca5a5', background: '#fef2f2' } : undefined}
          >
            <p className="fleet-compliance-stat-label">HIGH Risk</p>
            <p className="fleet-compliance-stat-value" style={summary.highRisk > 0 ? { color: '#991b1b' } : undefined}>{summary.highRisk}</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Last Sync</p>
            <p className="fleet-compliance-stat-value" style={{ fontSize: '1.2rem', lineHeight: 1.35 }}>{lastSyncLabel}</p>
          </article>
        </section>

        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Top Flags</p>
              <h2>Most common risk signals</h2>
            </div>
          </div>
          {topFlags.length ? (
            <div className="fleet-compliance-chip-row">
              {topFlags.map((flag) => (
                <span key={flag} className="fleet-compliance-chip">{flag}</span>
              ))}
            </div>
          ) : (
            <p className="fleet-compliance-subcopy">No recurring flags in the latest snapshot.</p>
          )}
        </section>

        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Vehicle Risk</p>
              <h2>Vehicle risk table</h2>
            </div>
          </div>
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Make/Model/Year</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Last Seen</th>
                  <th>7-Day GPS Events</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const normalizedVehicleFlags = normalizeFlags(vehicle.flags);
                  const visibleFlags = normalizedVehicleFlags.slice(0, 2);
                  const hiddenCount = Math.max(normalizedVehicleFlags.length - visibleFlags.length, 0);

                  return (
                    <tr key={`${vehicle.vehicleNumber}-${vehicle.make ?? 'unknown'}-${vehicle.model ?? 'unknown'}`}>
                      <td><strong>{vehicle.vehicleNumber || '—'}</strong></td>
                      <td>
                        {[vehicle.make, vehicle.model, typeof vehicle.year === 'number' ? String(vehicle.year) : null]
                          .filter((value): value is string => Boolean(value))
                          .join(' / ') || '—'}
                      </td>
                      <td>{vehicle.riskScore ?? 0}</td>
                      <td>
                        <TelematicsRiskBadge
                          riskLevel={vehicle.riskLevel ?? 'LOW'}
                          riskScore={Number(vehicle.riskScore ?? 0)}
                        />
                      </td>
                      <td>{formatLastSeen(vehicle.lastSeenAt ?? null)}</td>
                      <td>{Number(vehicle.gpsEventsLast7Days ?? 0)}</td>
                      <td>
                        {normalizedVehicleFlags.length === 0 ? (
                          <span className="fleet-compliance-table-note">—</span>
                        ) : (
                          <span title={normalizedVehicleFlags.join(', ')}>
                            {visibleFlags.join(', ')}{hiddenCount > 0 ? ` + ${hiddenCount} more` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Driver Risk</p>
              <h2>Driver risk table</h2>
            </div>
          </div>
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>HOS/ELD Status</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const normalizedDriverFlags = normalizeFlags(driver.flags);
                  const visibleFlags = normalizedDriverFlags.slice(0, 2);
                  const hiddenCount = Math.max(normalizedDriverFlags.length - visibleFlags.length, 0);

                  return (
                    <tr key={driver.driverName}>
                      <td><strong>{driver.driverName || '—'}</strong></td>
                      <td>{formatHosStatus(driver.hosStatus ?? null)}</td>
                      <td>{driver.riskScore ?? 0}</td>
                      <td>
                        <TelematicsRiskBadge
                          riskLevel={driver.riskLevel ?? 'LOW'}
                          riskScore={Number(driver.riskScore ?? 0)}
                        />
                      </td>
                      <td>
                        {normalizedDriverFlags.length === 0 ? (
                          <span className="fleet-compliance-table-note">—</span>
                        ) : (
                          <span title={normalizedDriverFlags.join(', ')}>
                            {visibleFlags.join(', ')}{hiddenCount > 0 ? ` + ${hiddenCount} more` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
