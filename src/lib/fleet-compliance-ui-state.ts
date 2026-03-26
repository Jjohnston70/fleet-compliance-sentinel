import type { FmcsaCarrierSummary } from '@/lib/fleet-compliance-fmcsa-client';

type SuspenseResolution = {
  resolved: boolean;
  note: string;
  resolvedAt: string;
};

type FmcsaSnapshot = {
  carrier: FmcsaCarrierSummary;
  savedAt: string;
};

type FleetComplianceUiState = {
  suspenseResolutions: Record<string, SuspenseResolution>;
  inlineNotes: Record<string, string>;
  assetStatusOverrides: Record<string, string>;
  fmcsaSnapshot: FmcsaSnapshot | null;
};

const UI_STATE_KEY = '__fleet_compliance_ui_state_v1__';

declare global {
  interface Window {
    [UI_STATE_KEY]?: FleetComplianceUiState;
  }
}

function defaultState(): FleetComplianceUiState {
  return {
    suspenseResolutions: {},
    inlineNotes: {},
    assetStatusOverrides: {},
    fmcsaSnapshot: null,
  };
}

function getState(): FleetComplianceUiState {
  if (typeof window === 'undefined') {
    return defaultState();
  }

  if (!window[UI_STATE_KEY]) {
    window[UI_STATE_KEY] = defaultState();
  }

  return window[UI_STATE_KEY]!;
}

export function readSuspenseResolution(suspenseItemId: string): SuspenseResolution | null {
  return getState().suspenseResolutions[suspenseItemId] ?? null;
}

export function writeSuspenseResolution(suspenseItemId: string, payload: SuspenseResolution): void {
  getState().suspenseResolutions[suspenseItemId] = payload;
}

export function readInlineNote(storageKey: string): string | null {
  return getState().inlineNotes[storageKey] ?? null;
}

export function writeInlineNote(storageKey: string, note: string): void {
  getState().inlineNotes[storageKey] = note;
}

export function clearInlineNote(storageKey: string): void {
  delete getState().inlineNotes[storageKey];
}

export function readAssetStatusOverride(assetId: string): string | null {
  return getState().assetStatusOverrides[assetId] ?? null;
}

export function writeAssetStatusOverride(assetId: string, status: string): void {
  getState().assetStatusOverrides[assetId] = status;
}

export function clearAssetStatusOverride(assetId: string): void {
  delete getState().assetStatusOverrides[assetId];
}

export function readFmcsaSnapshot(): FmcsaSnapshot | null {
  return getState().fmcsaSnapshot;
}

export function writeFmcsaSnapshot(snapshot: FmcsaSnapshot): void {
  getState().fmcsaSnapshot = snapshot;
}
