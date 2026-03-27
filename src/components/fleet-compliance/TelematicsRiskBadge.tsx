'use client';

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface Props {
  riskLevel: RiskLevel;
  riskScore: number;
}

const stylesByLevel: Record<RiskLevel, { background: string; color: string; border: string }> = {
  HIGH: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  MEDIUM: {
    background: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fcd34d',
  },
  LOW: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
};

export default function TelematicsRiskBadge({ riskLevel, riskScore }: Props) {
  const style = stylesByLevel[riskLevel] ?? stylesByLevel.LOW;

  return (
    <span
      style={{
        ...style,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {`${riskLevel} — ${Math.max(0, Math.min(100, Math.round(Number(riskScore) || 0)))}`}
    </span>
  );
}
