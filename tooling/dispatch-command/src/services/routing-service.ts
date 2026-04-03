import { Location } from '../data/schema';
import { DISPATCH_CONFIG } from '../config';

/**
 * RoutingService handles distance calculations and travel time estimation.
 * Uses Haversine formula for distance calculation (no external API).
 */
export class RoutingService {
  /**
   * Calculate distance between two coordinates using Haversine formula.
   * Returns distance in miles.
   */
  static calculateDistance(from: Location, to: Location): number {
    const R = 3959; // Earth's radius in miles
    const lat1 = this.toRad(from.lat);
    const lat2 = this.toRad(to.lat);
    const deltaLat = this.toRad(to.lat - from.lat);
    const deltaLng = this.toRad(to.lng - from.lng);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians.
   */
  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Estimate travel time based on distance.
   * Uses average speed from config (default 30 mph in city).
   * Returns time in minutes.
   */
  static estimateTravelTime(distance: number): number {
    const speedMph = DISPATCH_CONFIG.defaultTravelSpeedMph;
    return Math.ceil((distance / speedMph) * 60);
  }

  /**
   * Find nearest location to origin from a list of candidates.
   * Returns { location, distance, travelTimeMinutes, index }
   */
  static findNearest(
    origin: Location,
    candidates: Location[]
  ): {
    location: Location;
    distance: number;
    travelTimeMinutes: number;
    index: number;
  } | null {
    if (candidates.length === 0) return null;

    let nearest = candidates[0];
    let nearestDistance = this.calculateDistance(origin, nearest);
    let nearestIndex = 0;

    for (let i = 1; i < candidates.length; i++) {
      const distance = this.calculateDistance(origin, candidates[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = candidates[i];
        nearestIndex = i;
      }
    }

    return {
      location: nearest,
      distance: nearestDistance,
      travelTimeMinutes: this.estimateTravelTime(nearestDistance),
      index: nearestIndex,
    };
  }

  /**
   * Optimize route order for multiple stops using greedy nearest-neighbor.
   * Returns array of indices in optimized order.
   */
  static optimizeRoute(origin: Location, stops: Location[]): number[] {
    if (stops.length === 0) return [];
    if (stops.length === 1) return [0];

    const visited = new Set<number>();
    const route: number[] = [];
    let current = origin;

    while (visited.size < stops.length) {
      let nearestIdx = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < stops.length; i++) {
        if (!visited.has(i)) {
          const dist = this.calculateDistance(current, stops[i]);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = i;
          }
        }
      }

      if (nearestIdx !== -1) {
        visited.add(nearestIdx);
        route.push(nearestIdx);
        current = stops[nearestIdx];
      }
    }

    return route;
  }
}
