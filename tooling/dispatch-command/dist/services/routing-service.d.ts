import { Location } from '../data/schema';
/**
 * RoutingService handles distance calculations and travel time estimation.
 * Uses Haversine formula for distance calculation (no external API).
 */
export declare class RoutingService {
    /**
     * Calculate distance between two coordinates using Haversine formula.
     * Returns distance in miles.
     */
    static calculateDistance(from: Location, to: Location): number;
    /**
     * Convert degrees to radians.
     */
    private static toRad;
    /**
     * Estimate travel time based on distance.
     * Uses average speed from config (default 30 mph in city).
     * Returns time in minutes.
     */
    static estimateTravelTime(distance: number): number;
    /**
     * Find nearest location to origin from a list of candidates.
     * Returns { location, distance, travelTimeMinutes, index }
     */
    static findNearest(origin: Location, candidates: Location[]): {
        location: Location;
        distance: number;
        travelTimeMinutes: number;
        index: number;
    } | null;
    /**
     * Optimize route order for multiple stops using greedy nearest-neighbor.
     * Returns array of indices in optimized order.
     */
    static optimizeRoute(origin: Location, stops: Location[]): number[];
}
//# sourceMappingURL=routing-service.d.ts.map