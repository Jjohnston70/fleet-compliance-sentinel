/**
 * SLA threshold definitions
 */

export interface SLAThreshold {
  priority: string;
  minutesToDeadline: number;
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
}

export const SLA_THRESHOLDS: SLAThreshold[] = [
  {
    priority: 'emergency',
    minutesToDeadline: parseInt(process.env.SLA_EMERGENCY_MINUTES || '30'),
    warningThresholdPercent: 75,
    criticalThresholdPercent: 90,
  },
  {
    priority: 'urgent',
    minutesToDeadline: parseInt(process.env.SLA_URGENT_MINUTES || '120'),
    warningThresholdPercent: 75,
    criticalThresholdPercent: 90,
  },
  {
    priority: 'standard',
    minutesToDeadline: parseInt(process.env.SLA_STANDARD_MINUTES || '240'),
    warningThresholdPercent: 75,
    criticalThresholdPercent: 90,
  },
  {
    priority: 'scheduled',
    minutesToDeadline: parseInt(process.env.SLA_SCHEDULED_MINUTES || '1440'),
    warningThresholdPercent: 75,
    criticalThresholdPercent: 90,
  },
];

export function getSLAThreshold(priority: string): SLAThreshold {
  const threshold = SLA_THRESHOLDS.find((t) => t.priority === priority);
  if (!threshold) {
    throw new Error(`Unknown priority: ${priority}`);
  }
  return threshold;
}

export function calculateSLADeadline(priority: string, createdAt: Date): Date {
  const threshold = getSLAThreshold(priority);
  return new Date(createdAt.getTime() + threshold.minutesToDeadline * 60 * 1000);
}
