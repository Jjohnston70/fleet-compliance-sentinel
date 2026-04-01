'use client';

import { useEffect, useMemo, useState } from 'react';

type ModuleRunStatus = 'queued' | 'running' | 'success' | 'fail';

interface ModuleActionArgSpec {
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
  enum?: Array<string | number | boolean>;
  default?: string | number | boolean | Record<string, unknown>;
}

interface ModuleActionArgsSchema {
  type: 'object';
  properties: Record<string, ModuleActionArgSpec>;
  required?: string[];
}

interface ModuleCatalogAction {
  actionId: string;
  description: string;
  argsSchema: ModuleActionArgsSchema;
  timeoutMs: number;
  commandPreview: string[];
}

interface ModuleCatalogEntry {
  moduleId: string;
  displayName: string;
  runtime: 'python' | 'node';
  actions: ModuleCatalogAction[];
}

interface ModuleRunError {
  code: string;
  message: string;
  details?: string[];
}

interface ModuleRunArtifact {
  kind: 'file';
  path: string;
  sizeBytes: number;
  modifiedAt: string;
}

interface ModuleRunRecord {
  id: string;
  moduleId: string;
  actionId: string;
  status: ModuleRunStatus;
  args: Record<string, unknown>;
  timeoutMs: number;
  correlationId?: string;
  dryRun: boolean;
  command: string[];
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  stdoutPreview: string;
  stderrPreview: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  artifacts: ModuleRunArtifact[];
  result?: unknown;
  error?: ModuleRunError;
}

interface ApiFailure {
  error?: {
    message?: string;
    code?: string;
    details?: string[];
  } | string;
}

interface QuickRunPreset {
  moduleId: string;
  moduleLabel: string;
  actionId: string;
  actionLabel: string;
  description: string;
  args: Record<string, unknown>;
  timeoutMs: number;
  sourceOptions?: string[];
}

function getErrorMessage(body: ApiFailure | null, fallback: string): string {
  if (!body) return fallback;
  if (typeof body.error === 'string') return body.error;
  if (body.error?.message) return body.error.message;
  return fallback;
}

function formatLocalDate(value: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function buildDefaultArgs(action: ModuleCatalogAction | null): Record<string, unknown> {
  if (!action) return {};
  const defaults: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(action.argsSchema.properties || {})) {
    if (spec.default !== undefined) {
      defaults[key] = spec.default;
    }
  }
  return defaults;
}

function buildArtifactUrl(runId: string, artifactPath: string): string {
  return `/api/modules/artifact?runId=${encodeURIComponent(runId)}&path=${encodeURIComponent(artifactPath)}`;
}

function buildMlEiaDashboardUrl(runId: string): string {
  return `/api/modules/dashboard/ml-eia?runId=${encodeURIComponent(runId)}`;
}

function canOpenInline(artifactPath: string): boolean {
  return /\.(html?|txt|json|log)$/i.test(artifactPath);
}

function hasMlEiaDashboardInputs(run: ModuleRunRecord): boolean {
  if (run.moduleId !== 'ML-EIA-PETROLEUM-INTEL') return false;
  if (run.status !== 'success') return false;
  const artifactPaths = run.artifacts.map((artifact) => artifact.path);
  const hasSnapshot = artifactPaths.some((artifactPath) => /analysis_snapshot\.json$/i.test(artifactPath));
  const hasAlerts = artifactPaths.some((artifactPath) => /active_alerts\.json$/i.test(artifactPath));
  const hasForecasts = artifactPaths.some((artifactPath) => /[\\/]+forecasts[\\/].+\.json$/i.test(artifactPath));
  return hasSnapshot && hasAlerts && hasForecasts;
}

function statusClassName(status: ModuleRunStatus): string {
  if (status === 'success') return 'fleet-compliance-pill fleet-compliance-pill-active';
  if (status === 'fail') return 'fleet-compliance-pill fleet-compliance-pill-fail';
  if (status === 'running') return 'fleet-compliance-pill fleet-compliance-pill-running';
  return 'fleet-compliance-pill fleet-compliance-pill-queued';
}

interface RunGuidance {
  heading: string;
  bullets: string[];
}

function buildRunGuidance(run: ModuleRunRecord): RunGuidance | null {
  if (run.status !== 'success' || run.dryRun) return null;

  if (run.moduleId === 'ML-EIA-PETROLEUM-INTEL' && (run.actionId === 'pipeline.all' || run.actionId === 'pipeline.product')) {
    return {
      heading: 'What to do with these ML-EIA outputs',
      bullets: [
        'Open analysis_snapshot.json first to review regime/strategy context and model snapshot details.',
        'Open active_alerts.json to see actionable alert conditions to route into compliance/ops workflows.',
        'Use forecast JSON files as machine-readable inputs for pricing dashboards, downstream automations, or exports.',
      ],
    };
  }

  if (run.moduleId === 'ML-SIGNAL-STACK-TNCC' && run.actionId === 'workflow.delivery') {
    return {
      heading: 'What to do with this SignalStack delivery',
      bullets: [
        'Open the generated HTML artifact for a human-readable executive report.',
        'Download the ZIP artifact for client handoff or archive retention.',
        'Use JSON artifacts as structured inputs for internal dashboards and follow-on analysis.',
      ],
    };
  }

  if (run.moduleId === 'MOD-PAPERSTACK-PP' && (run.actionId === 'invoice.extract' || run.actionId === 'invoice.extract_batch')) {
    return {
      heading: 'What to do with these PaperStack outputs',
      bullets: [
        'Open/download the JSON artifact for programmatic ingestion into your invoice workflows.',
        'Download the XLSX artifact for finance/operator review and reconciliation.',
        'Store outputs per run as your audit trail for extracted vendor invoice data.',
      ],
    };
  }

  return null;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function ModuleGatewayPanel() {
  const [catalog, setCatalog] = useState<ModuleCatalogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState('');
  const [actionId, setActionId] = useState('');
  const [argsJson, setArgsJson] = useState('{}');
  const [timeoutMs, setTimeoutMs] = useState<string>('');
  const [dryRun, setDryRun] = useState(true);
  const [correlationId, setCorrelationId] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [runs, setRuns] = useState<ModuleRunRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [quickModuleId, setQuickModuleId] = useState('ML-SIGNAL-STACK-TNCC');
  const [quickSource, setQuickSource] = useState('all');
  const [quickDryRun, setQuickDryRun] = useState(false);
  const [quickSubmitState, setQuickSubmitState] = useState<'idle' | 'submitting'>('idle');
  const [quickSubmitError, setQuickSubmitError] = useState<string | null>(null);

  const selectedModule = useMemo(
    () => catalog.find((entry) => entry.moduleId === moduleId) || null,
    [catalog, moduleId],
  );

  const selectedAction = useMemo(
    () => selectedModule?.actions.find((entry) => entry.actionId === actionId) || null,
    [selectedModule, actionId],
  );

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) || null,
    [runs, selectedRunId],
  );
  const selectedRunGuidance = useMemo(() => (selectedRun ? buildRunGuidance(selectedRun) : null), [selectedRun]);
  const showMlEiaDashboardLink = useMemo(
    () => (selectedRun ? hasMlEiaDashboardInputs(selectedRun) : false),
    [selectedRun],
  );

  const quickRunPresets = useMemo<QuickRunPreset[]>(() => {
    const moduleById = new Map(catalog.map((entry) => [entry.moduleId, entry]));
    const presets: QuickRunPreset[] = [];

    const registerPreset = (
      moduleId: string,
      actionId: string,
      actionLabel: string,
      description: string,
      defaults: Record<string, unknown> = {},
    ) => {
      const moduleEntry = moduleById.get(moduleId);
      const action = moduleEntry?.actions.find((entry) => entry.actionId === actionId);
      if (!moduleEntry || !action) return;

      const args = { ...buildDefaultArgs(action), ...defaults };
      const sourceSpec = action.argsSchema.properties.source;
      const sourceOptions = Array.isArray(sourceSpec?.enum)
        ? sourceSpec.enum.filter((value): value is string => typeof value === 'string')
        : undefined;

      presets.push({
        moduleId,
        moduleLabel: moduleEntry.displayName,
        actionId,
        actionLabel,
        description,
        args,
        timeoutMs: action.timeoutMs,
        sourceOptions: sourceOptions && sourceOptions.length > 0 ? sourceOptions : undefined,
      });
    };

    registerPreset(
      'ML-SIGNAL-STACK-TNCC',
      'workflow.delivery',
      'SignalStack full workflow',
      'Runs export, pipeline, report generation, and packaging in one step.',
      { source: 'all', skipSearch: true, skipRootFix: false, noCode: false },
    );
    registerPreset(
      'ML-EIA-PETROLEUM-INTEL',
      'pipeline.all',
      'EIA pipeline (all products)',
      'Runs petroleum forecasting pipeline across all default products.',
      { trainYears: 10 },
    );
    const paperstackEntry = moduleById.get('MOD-PAPERSTACK-PP');
    const paperstackActionIds = new Set(paperstackEntry?.actions.map((entry) => entry.actionId) || []);
    if (paperstackActionIds.has('invoice.extract_batch')) {
      registerPreset(
        'MOD-PAPERSTACK-PP',
        'invoice.extract_batch',
        'PaperStack invoice batch extraction',
        'Parses vendor invoice PDFs and exports fleet-ready JSON + XLSX artifacts.',
        { inputDir: 'invoice-samples', pattern: '*.pdf', format: 'fleet' },
      );
    } else if (paperstackActionIds.has('generate.pdf')) {
      registerPreset(
        'MOD-PAPERSTACK-PP',
        'generate.pdf',
        'PaperStack generate PDF',
        'Generates the default PaperStack PDF output.',
      );
    } else if (paperstackActionIds.has('tools.list')) {
      registerPreset(
        'MOD-PAPERSTACK-PP',
        'tools.list',
        'PaperStack tool check',
        'Lists available PaperStack capabilities and readiness.',
      );
    } else if (paperstackActionIds.has('list')) {
      registerPreset(
        'MOD-PAPERSTACK-PP',
        'list',
        'PaperStack tool check',
        'Lists available PaperStack capabilities and readiness.',
      );
    }

    const commandCenterEntry = moduleById.get('command-center');
    const commandCenterActionIds = new Set(commandCenterEntry?.actions.map((entry) => entry.actionId) || []);
    if (commandCenterActionIds.has('discover.tools')) {
      registerPreset(
        'command-center',
        'discover.tools',
        'Command-center tool catalog',
        'Discovers currently registered command-center tools.',
      );
    } else if (commandCenterActionIds.has('discover.modules')) {
      registerPreset(
        'command-center',
        'discover.modules',
        'Command-center module catalog',
        'Discovers currently registered command-center modules.',
      );
    }

    return presets;
  }, [catalog]);

  const selectedQuickPreset = useMemo(
    () => quickRunPresets.find((entry) => entry.moduleId === quickModuleId) || quickRunPresets[0] || null,
    [quickRunPresets, quickModuleId],
  );

  const activeRunIds = useMemo(
    () => runs.filter((run) => run.status === 'queued' || run.status === 'running').map((run) => run.id),
    [runs],
  );

  function upsertRun(record: ModuleRunRecord) {
    setRuns((current) => {
      const next = [...current];
      const existingIndex = next.findIndex((item) => item.id === record.id);
      if (existingIndex >= 0) {
        next[existingIndex] = record;
      } else {
        next.unshift(record);
      }
      return next.slice(0, 20);
    });
    setSelectedRunId((current) => current || record.id);
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setCatalogError(null);
      const res = await fetch('/api/modules/catalog', { credentials: 'include' });
      const body = await safeJson<{ ok?: boolean; catalog?: ModuleCatalogEntry[] } & ApiFailure>(res);

      if (isCancelled) return;
      if (!res.ok || !body?.ok || !body.catalog) {
        setCatalogError(getErrorMessage(body, `Failed to load catalog (HTTP ${res.status})`));
        setCatalog([]);
        setCatalogLoading(false);
        return;
      }

      setCatalog(body.catalog);
      setCatalogLoading(false);
      if (body.catalog.length > 0) {
        const preferredModule =
          body.catalog.find((entry) => entry.moduleId === 'ML-SIGNAL-STACK-TNCC') || body.catalog[0];
        const preferredAction =
          preferredModule.actions.find((entry) => entry.actionId === 'workflow.delivery')
          || preferredModule.actions[0];
        setModuleId(preferredModule.moduleId);
        setActionId(preferredAction?.actionId || '');
      }
    }

    void loadCatalog();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    if (!selectedModule.actions.some((entry) => entry.actionId === actionId)) {
      const firstAction = selectedModule.actions[0];
      setActionId(firstAction?.actionId || '');
    }
  }, [selectedModule, actionId]);

  useEffect(() => {
    const defaults = buildDefaultArgs(selectedAction);
    setArgsJson(JSON.stringify(defaults, null, 2));
    setTimeoutMs(selectedAction ? String(selectedAction.timeoutMs) : '');
  }, [selectedAction]);

  useEffect(() => {
    if (quickRunPresets.length === 0) return;
    if (!quickRunPresets.some((preset) => preset.moduleId === quickModuleId)) {
      setQuickModuleId(quickRunPresets[0].moduleId);
    }
  }, [quickRunPresets, quickModuleId]);

  useEffect(() => {
    const options = selectedQuickPreset?.sourceOptions || [];
    if (options.length === 0) {
      setQuickSource('all');
      return;
    }
    setQuickSource(options.includes('all') ? 'all' : options[0] || 'all');
  }, [selectedQuickPreset]);

  useEffect(() => {
    if (activeRunIds.length === 0) return;

    let cancelled = false;

    async function pollOne(runId: string) {
      const res = await fetch(`/api/modules/status/${encodeURIComponent(runId)}`, {
        credentials: 'include',
      });
      const body = await safeJson<{ ok?: boolean; run?: ModuleRunRecord } & ApiFailure>(res);
      if (cancelled) return;
      if (!res.ok || !body?.ok || !body.run) return;
      upsertRun(body.run);
    }

    async function pollActiveRuns() {
      await Promise.all(activeRunIds.map((runId) => pollOne(runId)));
    }

    void pollActiveRuns();
    const timer = setInterval(() => {
      void pollActiveRuns();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeRunIds]);

  async function handleRunSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!moduleId || !actionId) {
      setSubmitError('Select a module and action first.');
      return;
    }

    let parsedArgs: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(argsJson || '{}') as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setSubmitError('Args JSON must be an object.');
        return;
      }
      parsedArgs = parsed as Record<string, unknown>;
    } catch (error) {
      setSubmitError(`Args JSON parse error: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    const timeoutValue = timeoutMs.trim().length > 0 ? Number(timeoutMs.trim()) : undefined;
    if (timeoutValue !== undefined && (!Number.isFinite(timeoutValue) || timeoutValue <= 0)) {
      setSubmitError('timeoutMs must be a positive number.');
      return;
    }

    setSubmitState('submitting');
    try {
      const res = await fetch('/api/modules/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          actionId,
          args: parsedArgs,
          dryRun,
          timeoutMs: timeoutValue,
          correlationId: correlationId.trim() || `tools-ui-${Date.now()}`,
        }),
      });

      const body = await safeJson<{ ok?: boolean; run?: ModuleRunRecord } & ApiFailure>(res);
      if (!res.ok || !body?.ok || !body.run) {
        setSubmitError(getErrorMessage(body, `Run request failed (HTTP ${res.status})`));
        return;
      }

      upsertRun(body.run);
    } finally {
      setSubmitState('idle');
    }
  }

  async function handleQuickRun(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuickSubmitError(null);

    if (!selectedQuickPreset) {
      setQuickSubmitError('No quick-run presets are available from the module catalog.');
      return;
    }

    const args = { ...selectedQuickPreset.args };
    if (selectedQuickPreset.sourceOptions && selectedQuickPreset.sourceOptions.length > 0) {
      const source = selectedQuickPreset.sourceOptions.includes(quickSource)
        ? quickSource
        : selectedQuickPreset.sourceOptions[0];
      args.source = source;
    }

    setQuickSubmitState('submitting');
    try {
      const res = await fetch('/api/modules/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedQuickPreset.moduleId,
          actionId: selectedQuickPreset.actionId,
          args,
          dryRun: quickDryRun,
          timeoutMs: selectedQuickPreset.timeoutMs,
          correlationId: `tools-ui-quick-${Date.now()}`,
        }),
      });

      const body = await safeJson<{ ok?: boolean; run?: ModuleRunRecord } & ApiFailure>(res);
      if (!res.ok || !body?.ok || !body.run) {
        setQuickSubmitError(getErrorMessage(body, `Run request failed (HTTP ${res.status})`));
        return;
      }

      upsertRun(body.run);
      setModuleId(selectedQuickPreset.moduleId);
      setActionId(selectedQuickPreset.actionId);
    } finally {
      setQuickSubmitState('idle');
    }
  }

  return (
    <>
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Module Operations</p>
            <h2>Run gateway actions</h2>
          </div>
          <p className="fleet-compliance-section-copy">
            Submit allowlisted module actions, monitor status, and inspect output previews from one operator panel.
          </p>
        </div>

        {catalogLoading ? (
          <div className="fleet-compliance-empty-state">
            <h3>Loading module catalog</h3>
            <p>Fetching `/api/modules/catalog`...</p>
          </div>
        ) : catalogError ? (
          <div className="fleet-compliance-empty-state">
            <h3>Catalog unavailable</h3>
            <p style={{ color: '#b91c1c' }}>{catalogError}</p>
          </div>
        ) : (
          <>
            {selectedQuickPreset && (
              <form className="fleet-compliance-filter-bar" onSubmit={handleQuickRun} style={{ marginBottom: '0.9rem' }}>
                <p className="fleet-compliance-eyebrow">Quick Run (Recommended)</p>
                <h3 style={{ marginTop: '0.2rem' }}>{selectedQuickPreset.actionLabel}</h3>
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                  {selectedQuickPreset.description}
                </p>
                <div className="fleet-compliance-filter-grid fleet-compliance-filter-grid-wide">
                  <label className="fleet-compliance-field-stack">
                    <span>Module</span>
                    <select value={quickModuleId} onChange={(event) => setQuickModuleId(event.target.value)}>
                      {quickRunPresets.map((preset) => (
                        <option key={preset.moduleId} value={preset.moduleId}>
                          {preset.moduleLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedQuickPreset.sourceOptions && selectedQuickPreset.sourceOptions.length > 0 && (
                    <label className="fleet-compliance-field-stack">
                      <span>Source</span>
                      <select value={quickSource} onChange={(event) => setQuickSource(event.target.value)}>
                        {selectedQuickPreset.sourceOptions.map((sourceOption) => (
                          <option key={sourceOption} value={sourceOption}>
                            {sourceOption}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="fleet-compliance-field-stack">
                    <span>Mode</span>
                    <select
                      value={quickDryRun ? 'dry' : 'live'}
                      onChange={(event) => setQuickDryRun(event.target.value === 'dry')}
                    >
                      <option value="live">Live Run</option>
                      <option value="dry">Dry Run</option>
                    </select>
                  </label>
                </div>
                <div className="fleet-compliance-action-row">
                  <button className="btn-primary" type="submit" disabled={quickSubmitState === 'submitting'}>
                    {quickSubmitState === 'submitting' ? 'Submitting…' : `Run ${selectedQuickPreset.actionId}`}
                  </button>
                </div>
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.45rem' }}>
                  Action: <code>{selectedQuickPreset.actionId}</code>
                </p>
                {quickSubmitError && (
                  <div className="fleet-compliance-empty-state" style={{ marginTop: '0.85rem' }}>
                    <p style={{ color: '#b91c1c' }}>{quickSubmitError}</p>
                  </div>
                )}
              </form>
            )}

            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#1a3a5c' }}>Advanced module controls</summary>
              <form className="fleet-compliance-filter-bar" onSubmit={handleRunSubmit} style={{ marginTop: '0.75rem' }}>
                <div className="fleet-compliance-filter-grid fleet-compliance-filter-grid-wide">
                  <label className="fleet-compliance-field-stack">
                    <span>Module</span>
                    <select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>
                      {catalog.map((entry) => (
                        <option key={entry.moduleId} value={entry.moduleId}>
                          {entry.displayName} ({entry.runtime})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="fleet-compliance-field-stack">
                    <span>Action</span>
                    <select value={actionId} onChange={(event) => setActionId(event.target.value)}>
                      {(selectedModule?.actions || []).map((entry) => (
                        <option key={entry.actionId} value={entry.actionId}>
                          {entry.actionId}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="fleet-compliance-field-stack">
                    <span>Timeout (ms)</span>
                    <input
                      value={timeoutMs}
                      onChange={(event) => setTimeoutMs(event.target.value)}
                      inputMode="numeric"
                      placeholder={selectedAction ? String(selectedAction.timeoutMs) : '300000'}
                    />
                  </label>

                  <label className="fleet-compliance-field-stack">
                    <span>Correlation ID</span>
                    <input
                      value={correlationId}
                      onChange={(event) => setCorrelationId(event.target.value)}
                      placeholder="tools-ui-<timestamp>"
                    />
                  </label>

                  <label className="fleet-compliance-field-stack">
                    <span>Mode</span>
                    <select value={dryRun ? 'dry' : 'live'} onChange={(event) => setDryRun(event.target.value === 'dry')}>
                      <option value="dry">Dry Run</option>
                      <option value="live">Live Run</option>
                    </select>
                  </label>
                </div>

                <label className="fleet-compliance-field-stack" style={{ marginTop: '0.85rem' }}>
                  <span>Args JSON</span>
                  <textarea
                    className="fleet-compliance-textarea"
                    rows={8}
                    value={argsJson}
                    onChange={(event) => setArgsJson(event.target.value)}
                    spellCheck={false}
                  />
                </label>

                <div className="fleet-compliance-action-row">
                  <button className="btn-primary" type="submit" disabled={submitState === 'submitting'}>
                    {submitState === 'submitting' ? 'Submitting…' : `Run ${actionId || 'Action'}`}
                  </button>
                </div>

                {selectedAction && (
                  <p className="fleet-compliance-table-note">
                    {selectedAction.description} | Command preview: <code>{selectedAction.commandPreview.join(' ')}</code>
                  </p>
                )}

                {submitError && (
                  <div className="fleet-compliance-empty-state" style={{ marginTop: '0.85rem' }}>
                    <p style={{ color: '#b91c1c' }}>{submitError}</p>
                  </div>
                )}
              </form>
            </details>
          </>
        )}
      </section>

      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Run History</p>
            <h2>Recent module runs</h2>
          </div>
          <p className="fleet-compliance-section-copy">
            Session-scoped history for recent module runs submitted from this panel.
          </p>
        </div>

        {runs.length === 0 ? (
          <div className="fleet-compliance-empty-state">
            <h3>No runs yet</h3>
            <p>Submit a module action above to start tracking status and outputs.</p>
          </div>
        ) : (
          <div className="fleet-compliance-list-grid">
            <div className="fleet-compliance-list-card">
              <div className="fleet-compliance-table-wrap" style={{ marginTop: 0 }}>
                <table className="fleet-compliance-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Module / Action</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() => setSelectedRunId(run.id)}
                        style={{
                          cursor: 'pointer',
                          background: selectedRunId === run.id ? 'rgba(61, 142, 185, 0.08)' : undefined,
                        }}
                      >
                        <td>
                          <span className={statusClassName(run.status)}>{run.status}</span>
                        </td>
                        <td>
                          <strong>{run.moduleId}</strong>
                          <div className="fleet-compliance-table-note">{run.actionId}</div>
                          <div className="fleet-compliance-table-note">{run.id}</div>
                        </td>
                        <td className="fleet-compliance-table-note">{formatLocalDate(run.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fleet-compliance-list-card">
              {!selectedRun ? (
                <div className="fleet-compliance-empty-state" style={{ marginTop: 0 }}>
                  <p>Select a run to view details.</p>
                </div>
              ) : (
                <>
                  <h3>{selectedRun.moduleId}</h3>
                  <p className="fleet-compliance-table-note">{selectedRun.actionId}</p>
                  <dl className="fleet-compliance-kv-list">
                    <div>
                      <dt>Status</dt>
                      <dd><span className={statusClassName(selectedRun.status)}>{selectedRun.status}</span></dd>
                    </div>
                    <div>
                      <dt>Run ID</dt>
                      <dd className="fleet-compliance-table-note">{selectedRun.id}</dd>
                    </div>
                    <div>
                      <dt>Correlation</dt>
                      <dd className="fleet-compliance-table-note">{selectedRun.correlationId || '-'}</dd>
                    </div>
                    <div>
                      <dt>Duration</dt>
                      <dd>{selectedRun.durationMs !== null ? `${selectedRun.durationMs} ms` : '-'}</dd>
                    </div>
                    <div>
                      <dt>Exit Code</dt>
                      <dd>{selectedRun.exitCode ?? '-'}</dd>
                    </div>
                    <div>
                      <dt>Started</dt>
                      <dd className="fleet-compliance-table-note">{formatLocalDate(selectedRun.startedAt)}</dd>
                    </div>
                    <div>
                      <dt>Ended</dt>
                      <dd className="fleet-compliance-table-note">{formatLocalDate(selectedRun.endedAt)}</dd>
                    </div>
                    <div>
                      <dt>Mode</dt>
                      <dd>{selectedRun.dryRun ? 'Dry run' : 'Live run'}</dd>
                    </div>
                  </dl>

                  {selectedRunGuidance && (
                    <div className="fleet-compliance-info-banner">
                      <strong>{selectedRunGuidance.heading}</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        {selectedRunGuidance.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showMlEiaDashboardLink && (
                    <div className="fleet-compliance-info-banner">
                      <strong>ML-EIA dashboard view</strong>
                      <p className="fleet-compliance-table-note" style={{ marginTop: '0.35rem' }}>
                        Open a rendered HTML dashboard from this run&apos;s JSON artifacts.
                      </p>
                      <p className="fleet-compliance-table-note" style={{ marginTop: '0.45rem' }}>
                        <a
                          href={buildMlEiaDashboardUrl(selectedRun.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open dashboard
                        </a>
                        {' · '}
                        <a href={buildMlEiaDashboardUrl(selectedRun.id)} download>
                          Download HTML
                        </a>
                      </p>
                    </div>
                  )}

                  {selectedRun.error && (
                    <div className="fleet-compliance-info-banner" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#991b1b' }}>
                      <strong>{selectedRun.error.code}</strong>: {selectedRun.error.message}
                      {selectedRun.error.details?.length ? (
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {selectedRun.error.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  )}

                  <h3 style={{ marginTop: '1rem' }}>Output Preview</h3>
                  <p className="fleet-compliance-table-note">STDOUT</p>
                  <pre className="fleet-compliance-code-block">
                    {selectedRun.stdoutPreview || '(empty)'}
                  </pre>
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.75rem' }}>STDERR</p>
                  <pre className="fleet-compliance-code-block">
                    {selectedRun.stderrPreview || '(empty)'}
                  </pre>

                  {selectedRun.result !== undefined && (
                    <>
                      <p className="fleet-compliance-table-note" style={{ marginTop: '0.75rem' }}>Result Payload</p>
                      <pre className="fleet-compliance-code-block">
                        {JSON.stringify(selectedRun.result, null, 2)}
                      </pre>
                    </>
                  )}

                  {selectedRun.artifacts.length > 0 && (
                    <>
                      <h3 style={{ marginTop: '1rem' }}>Artifacts</h3>
                      <ul className="fleet-compliance-artifact-list">
                        {selectedRun.artifacts.map((artifact) => (
                          <li key={`${artifact.path}-${artifact.modifiedAt}`} className="fleet-compliance-artifact-item">
                            <code className="fleet-compliance-artifact-path">{artifact.path}</code>
                            <div className="fleet-compliance-table-note">
                              ({artifact.sizeBytes} bytes, {formatLocalDate(artifact.modifiedAt)})
                            </div>
                            <div className="fleet-compliance-table-note" style={{ marginTop: '0.2rem' }}>
                              {canOpenInline(artifact.path) ? (
                                <>
                                  <a
                                    href={buildArtifactUrl(selectedRun.id, artifact.path)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open
                                  </a>
                                  {' · '}
                                </>
                              ) : null}
                              <a href={buildArtifactUrl(selectedRun.id, artifact.path)} download>
                                Download
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
