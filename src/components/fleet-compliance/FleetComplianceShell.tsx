import FleetComplianceSidebar from '@/components/fleet-compliance/FleetComplianceSidebar';

export default function FleetComplianceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fc-shell">
      <FleetComplianceSidebar />
      <div className="fc-main">{children}</div>
    </div>
  );
}
