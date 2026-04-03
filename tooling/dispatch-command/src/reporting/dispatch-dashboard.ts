import { InMemoryRepository } from '../data/repository';
import { DispatchService } from '../services/dispatch-service';
import { DriverService } from '../services/driver-service';

export interface DashboardMetrics {
  activeRequests: {
    pending: number;
    dispatched: number;
    en_route: number;
    on_site: number;
  };
  driverUtilization: {
    available: number;
    en_route: number;
    on_site: number;
    off_duty: number;
  };
  zoneHeatmap: Array<{
    zoneId: string;
    zoneName: string;
    activeRequestCount: number;
    avgResponseTimeMinutes: number;
  }>;
  completedToday: number;
  cancelledToday: number;
}

/**
 * DispatchDashboard provides real-time dispatch metrics.
 */
export class DispatchDashboard {
  private dispatchService: DispatchService;
  private driverService: DriverService;

  constructor(private repository: InMemoryRepository) {
    this.dispatchService = new DispatchService(repository);
    this.driverService = new DriverService(repository);
  }

  /**
   * Get current dashboard metrics.
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const requests = await this.dispatchService.listDispatchRequests();
    const drivers = await this.driverService.listDrivers();
    const zones = await this.repository.listZones();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const completedToday = requests.filter((r) => {
      const createdStr = r.created_at.toISOString().split('T')[0];
      return r.status === 'completed' && createdStr === todayStr;
    }).length;

    const cancelledToday = requests.filter((r) => {
      const createdStr = r.created_at.toISOString().split('T')[0];
      return r.status === 'cancelled' && createdStr === todayStr;
    }).length;

    const zoneHeatmap = zones.map((zone) => {
      const zoneRequests = requests.filter(
        (r) =>
          r.zone_id === zone.id &&
          r.status !== 'completed' &&
          r.status !== 'cancelled'
      );

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        activeRequestCount: zoneRequests.length,
        avgResponseTimeMinutes: zone.avg_response_time_minutes,
      };
    });

    return {
      activeRequests: {
        pending: requests.filter((r) => r.status === 'pending').length,
        dispatched: requests.filter((r) => r.status === 'dispatched').length,
        en_route: requests.filter((r) => r.status === 'en_route').length,
        on_site: requests.filter((r) => r.status === 'on_site').length,
      },
      driverUtilization: {
        available: drivers.filter((d) => d.status === 'available').length,
        en_route: drivers.filter((d) => d.status === 'en_route').length,
        on_site: drivers.filter((d) => d.status === 'on_site').length,
        off_duty: drivers.filter((d) => d.status === 'off_duty').length,
      },
      zoneHeatmap,
      completedToday,
      cancelledToday,
    };
  }
}
