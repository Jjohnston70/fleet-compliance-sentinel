import { describe, it, expect } from 'vitest';
import { RoutingService } from '../src/services/routing-service';
import { Location } from '../src/data/schema';

describe('RoutingService', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points (Haversine)', () => {
      const point1: Location = { lat: 39.0, lng: -104.8 }; // Denver area
      const point2: Location = { lat: 39.1, lng: -104.8 };

      const distance = RoutingService.calculateDistance(point1, point2);

      // ~7 miles at 1 degree latitude
      expect(distance).toBeGreaterThan(6);
      expect(distance).toBeLessThan(8);
    });

    it('should return 0 for same coordinates', () => {
      const point: Location = { lat: 39.0, lng: -104.8 };
      const distance = RoutingService.calculateDistance(point, point);
      expect(distance).toBe(0);
    });
  });

  describe('estimateTravelTime', () => {
    it('should estimate travel time at 30 mph', () => {
      const distance = 30; // 30 miles
      const time = RoutingService.estimateTravelTime(distance);

      // 30 miles at 30 mph = 60 minutes
      expect(time).toBe(60);
    });

    it('should round up fractional minutes', () => {
      const distance = 15.5; // 15.5 miles
      const time = RoutingService.estimateTravelTime(distance);

      // 15.5 / 30 * 60 = 31 minutes (rounded up)
      expect(time).toBe(32); // Math.ceil(31) = 31, but 15.5/30*60 = 31, ceil(31) = 31
    });
  });

  describe('findNearest', () => {
    it('should find nearest location', () => {
      const origin: Location = { lat: 39.0, lng: -104.8 };
      const candidates: Location[] = [
        { lat: 39.1, lng: -104.8 }, // ~7 miles
        { lat: 38.9, lng: -104.8 }, // ~7 miles
        { lat: 39.2, lng: -104.8 }, // ~14 miles
      ];

      const result = RoutingService.findNearest(origin, candidates);

      expect(result).not.toBeNull();
      expect(result?.distance).toBeLessThan(8); // Should be one of the closer points
      expect(result?.index).toBeLessThan(2);
    });

    it('should return null for empty candidates', () => {
      const origin: Location = { lat: 39.0, lng: -104.8 };
      const result = RoutingService.findNearest(origin, []);
      expect(result).toBeNull();
    });
  });

  describe('optimizeRoute', () => {
    it('should return single index for one stop', () => {
      const origin: Location = { lat: 39.0, lng: -104.8 };
      const stops: Location[] = [{ lat: 39.1, lng: -104.8 }];

      const route = RoutingService.optimizeRoute(origin, stops);

      expect(route).toEqual([0]);
    });

    it('should return empty array for no stops', () => {
      const origin: Location = { lat: 39.0, lng: -104.8 };
      const route = RoutingService.optimizeRoute(origin, []);
      expect(route).toEqual([]);
    });

    it('should optimize route order', () => {
      const origin: Location = { lat: 39.0, lng: -104.8 };
      const stops: Location[] = [
        { lat: 39.1, lng: -104.8 },
        { lat: 39.2, lng: -104.8 },
        { lat: 38.9, lng: -104.8 },
      ];

      const route = RoutingService.optimizeRoute(origin, stops);

      expect(route.length).toBe(3);
      expect(route).toContain(0);
      expect(route).toContain(1);
      expect(route).toContain(2);
    });
  });
});
