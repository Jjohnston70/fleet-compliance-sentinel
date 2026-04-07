import { Driver, Truck, Zone } from './schema';

// Colorado Springs zone boundaries (simplified)
export const DEFAULT_ZONES: Zone[] = [
  {
    id: 'zone-cos-north',
    name: 'COS North',
    boundaries: [
      { lat: 39.15, lng: -104.82 },
      { lat: 39.15, lng: -104.75 },
      { lat: 39.05, lng: -104.75 },
      { lat: 39.05, lng: -104.82 },
    ],
    primary_drivers: [],
    backup_drivers: [],
    avg_response_time_minutes: 25,
    active_requests_count: 0,
  },
  {
    id: 'zone-cos-central',
    name: 'COS Central',
    boundaries: [
      { lat: 39.05, lng: -104.82 },
      { lat: 39.05, lng: -104.75 },
      { lat: 38.95, lng: -104.75 },
      { lat: 38.95, lng: -104.82 },
    ],
    primary_drivers: [],
    backup_drivers: [],
    avg_response_time_minutes: 20,
    active_requests_count: 0,
  },
  {
    id: 'zone-cos-east',
    name: 'COS East',
    boundaries: [
      { lat: 39.05, lng: -104.75 },
      { lat: 39.05, lng: -104.60 },
      { lat: 38.95, lng: -104.60 },
      { lat: 38.95, lng: -104.75 },
    ],
    primary_drivers: [],
    backup_drivers: [],
    avg_response_time_minutes: 30,
    active_requests_count: 0,
  },
  {
    id: 'zone-cos-south',
    name: 'COS South',
    boundaries: [
      { lat: 38.95, lng: -104.82 },
      { lat: 38.95, lng: -104.75 },
      { lat: 38.80, lng: -104.75 },
      { lat: 38.80, lng: -104.82 },
    ],
    primary_drivers: [],
    backup_drivers: [],
    avg_response_time_minutes: 35,
    active_requests_count: 0,
  },
  {
    id: 'zone-pueblo',
    name: 'Pueblo',
    boundaries: [
      { lat: 38.25, lng: -104.60 },
      { lat: 38.25, lng: -104.50 },
      { lat: 38.15, lng: -104.50 },
      { lat: 38.15, lng: -104.60 },
    ],
    primary_drivers: [],
    backup_drivers: [],
    avg_response_time_minutes: 45,
    active_requests_count: 0,
  },
];

// Drivers and trucks are added by users through the UI or CSV import.
// No default/seed data — orgs start empty.
export const DEFAULT_DRIVERS: Driver[] = [];
export const DEFAULT_TRUCKS: Truck[] = [];
