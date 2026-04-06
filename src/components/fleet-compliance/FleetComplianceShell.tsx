import FleetComplianceSidebar from '@/components/fleet-compliance/FleetComplianceSidebar';

export default function FleetComplianceShell({
  children,
  enabledModules,
  role,
  isPlatformAdmin,
}: {
  children: React.ReactNode;
  enabledModules: string[];
  role: 'admin' | 'member';
  isPlatformAdmin: boolean;
}) {
  return (
    <div className="fc-shell">
      <FleetComplianceSidebar enabledModules={enabledModules} role={role} isPlatformAdmin={isPlatformAdmin} />
      <div className="fc-main">{children}</div>
    </div>
  );
}
