"use strict";
/**
 * SLA threshold definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLA_THRESHOLDS = void 0;
exports.getSLAThreshold = getSLAThreshold;
exports.calculateSLADeadline = calculateSLADeadline;
exports.SLA_THRESHOLDS = [
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
function getSLAThreshold(priority) {
    const threshold = exports.SLA_THRESHOLDS.find((t) => t.priority === priority);
    if (!threshold) {
        throw new Error(`Unknown priority: ${priority}`);
    }
    return threshold;
}
function calculateSLADeadline(priority, createdAt) {
    const threshold = getSLAThreshold(priority);
    return new Date(createdAt.getTime() + threshold.minutesToDeadline * 60 * 1000);
}
//# sourceMappingURL=sla-thresholds.js.map