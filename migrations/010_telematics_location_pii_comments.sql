-- Mark location telemetry fields as PII for privacy controls and retention governance.
COMMENT ON COLUMN telematics_gps_events.lat IS 'PII — precise geolocation tied to vehicle/driver activity';
COMMENT ON COLUMN telematics_gps_events.lon IS 'PII — precise geolocation tied to vehicle/driver activity';
COMMENT ON COLUMN telematics_vehicles.last_gps_lat IS 'PII — latest known precise vehicle geolocation';
COMMENT ON COLUMN telematics_vehicles.last_gps_lon IS 'PII — latest known precise vehicle geolocation';
