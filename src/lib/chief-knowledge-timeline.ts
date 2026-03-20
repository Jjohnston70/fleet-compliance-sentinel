/**
 * chief-knowledge-timeline.ts
 *
 * Uses @tnds/memory-core to maintain a compliance event timeline.
 * Records permit renewals, driver updates, imports, audits, and
 * document ingestions per org.
 *
 * Enables Penny to answer:
 *   "What changed in our compliance status this month?"
 *   "When was our IRP permit last renewed?"
 */

import path from 'node:path'
import { createKnowledgeStore } from '@tnds/memory-core'

const TIMELINE_FILE = path.join(process.cwd(), 'knowledge', 'timeline', 'records.json')

export type ComplianceEventType =
  | 'permit_renewed'
  | 'driver_updated'
  | 'import_completed'
  | 'audit_run'
  | 'document_ingested'
  | 'suspense_resolved'
  | 'asset_updated'

export function getComplianceTimeline() {
  return createKnowledgeStore(TIMELINE_FILE)
}

/**
 * Record a compliance event. Call this after any significant
 * compliance action — import, renewal, audit, document upload.
 */
export async function recordComplianceEvent(params: {
  orgId: string
  eventType: ComplianceEventType
  title: string
  content: string
  sourceId: string
  tags?: string[]
}): Promise<void> {
  const store = getComplianceTimeline()
  await store.saveRecord({
    domainSlug: `org-${params.orgId}`,
    sourceType: 'txt',
    sourceId: params.sourceId,
    title: params.title,
    content: params.content,
    tags: [params.eventType, `org-${params.orgId}`, ...(params.tags ?? [])],
    metadata: {
      orgId: params.orgId,
      eventType: params.eventType,
    },
  })
}

/**
 * Get compliance events for an org within an optional date range.
 */
export async function getOrgComplianceHistory(params: {
  orgId: string
  fromDate?: string
  toDate?: string
  limit?: number
}) {
  const store = getComplianceTimeline()
  return store.listRecords({
    domainSlug: `org-${params.orgId}`,
    fromDate: params.fromDate,
    toDate: params.toDate,
    limit: params.limit ?? 50,
  })
}

/**
 * Get a timeline summary grouped by day for an org.
 * Used for "what changed this month" Penny queries.
 */
export async function getOrgTimelineSummary(params: {
  orgId: string
  fromDate?: string
  toDate?: string
}) {
  const store = getComplianceTimeline()
  return store.summarizeTimeline({
    domainSlug: `org-${params.orgId}`,
    fromDate: params.fromDate,
    toDate: params.toDate,
  })
}
