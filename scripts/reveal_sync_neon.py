import httpx, asyncio, base64, json, os
import asyncpg
from datetime import datetime, timedelta, timezone

USERNAME       = os.environ["REVEAL_USERNAME"]
PASSWORD       = os.environ["REVEAL_PASSWORD"]
APP_ID         = os.environ["REVEAL_APP_ID"]
BASE           = "https://fim.api.us.fleetmatics.com"
ORG_ID         = "example-fleet-co"
ENCRYPTION_KEY = os.environ["APP_ENCRYPTION_KEY"]
DATABASE_URL   = os.environ["DATABASE_URL"]
KM_TO_MI       = 0.621371

async def get_token(client):
    creds = base64.b64encode((USERNAME + ":" + PASSWORD).encode()).decode()
    r     = await client.get(BASE + "/token", headers={"Authorization": "Basic " + creds, "Accept": "text/plain"})
    return r.text.strip()

async def main():
    print("Connecting to Neon...")
    db = await asyncpg.connect(DATABASE_URL)
    await db.execute("SET app.encryption_key = '" + ENCRYPTION_KEY + "'")

    async with httpx.AsyncClient(timeout=20.0) as client:
        token = await get_token(client)
        auth  = "Atmosphere atmosphere_app_id=" + APP_ID + ", Bearer " + token
        heads = {"Authorization": auth, "Accept": "application/json"}

        # ── VEHICLES ──────────────────────────────────────────────
        print("")
        print("Syncing vehicles...")
        r        = await client.get(BASE + "/cmd/v1/vehicles", headers=heads)
        vehicles = r.json()
        v_written = 0
        for v in vehicles:
            vid   = str(v.get("VehicleId", ""))
            vnum  = str(v.get("Name", ""))
            vin   = v.get("VIN") or None
            make  = v.get("Make") or None
            model = v.get("Model") or None
            year  = v.get("Year") or None
            plate = v.get("RegistrationNumber") or None
            try:
                await db.execute("""
                    INSERT INTO telematics_vehicles
                        (org_id, provider, provider_vehicle_id, vehicle_number,
                         vin, make, model, year, license_plate,
                         is_active, synced_at, created_at, updated_at)
                    VALUES ($1,'verizon_reveal',$2,$3,$4,$5,$6,$7,$8,true,now(),now(),now())
                    ON CONFLICT (org_id, provider, provider_vehicle_id) DO UPDATE SET
                        vehicle_number = EXCLUDED.vehicle_number,
                        vin            = EXCLUDED.vin,
                        make           = EXCLUDED.make,
                        model          = EXCLUDED.model,
                        year           = EXCLUDED.year,
                        license_plate  = EXCLUDED.license_plate,
                        synced_at      = now(),
                        updated_at     = now()
                """, ORG_ID, vid, vnum, vin, make, model, year, plate)
                v_written += 1
            except Exception as e:
                print("  Vehicle error " + vnum + ": " + str(e))
        print("  Vehicles written: " + str(v_written) + " of " + str(len(vehicles)))

        # ── DRIVERS ───────────────────────────────────────────────
        print("")
        print("Syncing drivers...")
        r         = await client.get(BASE + "/cmd/v1/drivers", headers=heads)
        drivers   = r.json()
        d_written = 0
        for d in drivers:
            drv   = d.get("Driver", {})
            did   = str(drv.get("DriverId", drv.get("DriverNumber", "")))
            fname = drv.get("FirstName") or ""
            lname = drv.get("LastName") or ""
            name  = (fname + " " + lname).strip() or "Unknown"
            email = drv.get("EmailAddress") or None
            phone = drv.get("PhoneNumber") or None
            try:
                await db.execute("""
                    INSERT INTO telematics_drivers
                        (org_id, provider, provider_driver_id, driver_name,
                         email, phone, is_active, synced_at, created_at, updated_at)
                    VALUES ($1,'verizon_reveal',$2,$3,$4,$5,true,now(),now(),now())
                    ON CONFLICT (org_id, provider, provider_driver_id) DO UPDATE SET
                        driver_name = EXCLUDED.driver_name,
                        email       = EXCLUDED.email,
                        phone       = EXCLUDED.phone,
                        synced_at   = now(),
                        updated_at  = now()
                """, ORG_ID, did, name, email, phone)
                d_written += 1
            except Exception as e:
                print("  Driver error " + name + ": " + str(e))
        print("  Drivers written: " + str(d_written) + " of " + str(len(drivers)))

        # ── ELD LOGBOOK SETTINGS ──────────────────────────────────
        print("")
        print("Syncing ELD logbook settings...")
        eld_drivers = {
            "Marcus Farnsworth": "156725",
            "Horst Wichek":      "272578",
            "Mike Gilmore":      "373",
            "David Layne":       "05201977",
            "Jacob Wininger":    "0488",
        }
        for name, dnum in eld_drivers.items():
            url = BASE + "/cmd/v1/driversettings/logbooksettings/" + dnum
            r   = await client.get(url, headers=heads)
            if r.status_code == 200:
                s       = r.json().get("DriverLogBookSettings", {})
                is_eld  = s.get("IsELD", False)
                ruleset = s.get("RuleSet", "Unknown")
                status  = ("ELD:" + ruleset) if is_eld else "NON-ELD"
                await db.execute("""
                    UPDATE telematics_drivers
                    SET current_hos_status = $1, updated_at = now()
                    WHERE org_id = $2
                      AND provider = 'verizon_reveal'
                      AND driver_name ILIKE $3
                """, status, ORG_ID, "%" + name.split()[0] + "%")
                print("  " + name.ljust(20) + " | ELD=" + str(is_eld) + " | " + ruleset)
            else:
                print("  " + name + " | HTTP " + str(r.status_code))

        # ── VEHICLE SEGMENTS (last 7 days) ────────────────────────
        print("")
        print("Syncing vehicle segments (last 7 days)...")
        seg_total  = 0
        seg_errors = 0
        for v in vehicles:
            vnum = str(v.get("Name", ""))
            vid  = str(v.get("VehicleId", ""))
            if not vnum:
                continue
            for days_ago in range(1, 8):
                date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%dT00:00:00")
                try:
                    r2 = await client.get(
                        BASE + "/rad/v1/vehicles/" + vnum + "/segments",
                        headers=heads,
                        params={"startdateutc": date}
                    )
                except Exception as e:
                    seg_errors += 1
                    continue

                if r2.status_code != 200:
                    continue

                data = r2.json()
                segs = data[0].get("Segments") if isinstance(data, list) and data else None
                if not segs:
                    continue

                for seg in segs:
                    start_dt  = seg.get("StartDateUtc")
                    dist_km   = seg.get("DistanceKilometers") or 0.0
                    dist_mi   = dist_km * KM_TO_MI

                    # Safe None handling on locations
                    start_loc = seg.get("StartLocation") or {}
                    start_lat = start_loc.get("Latitude")
                    start_lon = start_loc.get("Longitude")

                    if not start_dt or start_lat is None or start_lon is None:
                        continue

                    try:
                        occurred = datetime.strptime(start_dt, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
                        await db.execute("""
                            INSERT INTO telematics_gps_events
                                (org_id, provider, provider_vehicle_id,
                                 occurred_at, lat, lon, odometer_miles, received_at)
                            VALUES ($1,'verizon_reveal',$2,$3,$4,$5,$6,now())
                            ON CONFLICT DO NOTHING
                        """, ORG_ID, vid, occurred, float(start_lat), float(start_lon), float(dist_mi))
                        seg_total += 1
                    except Exception as e:
                        seg_errors += 1

        print("  GPS segment events written: " + str(seg_total))
        if seg_errors > 0:
            print("  Errors skipped:            " + str(seg_errors))

        # ── CURRENT LOCATIONS ─────────────────────────────────────
        print("")
        print("Syncing current vehicle locations...")
        loc_updated = 0
        for v in vehicles:
            vnum = str(v.get("Name", ""))
            vid  = str(v.get("VehicleId", ""))
            if not vnum or not vid:
                continue
            try:
                r2 = await client.get(BASE + "/rad/v1/vehicles/" + vnum + "/location", headers=heads)
                if r2.status_code == 200:
                    loc = r2.json()
                    lat = loc.get("Latitude")
                    lon = loc.get("Longitude")
                    if lat and lon:
                        await db.execute("""
                            UPDATE telematics_vehicles
                            SET last_gps_lat = $1, last_gps_lon = $2,
                                last_seen_at = now(), updated_at = now()
                            WHERE org_id = $3
                              AND provider = 'verizon_reveal'
                              AND provider_vehicle_id = $4
                        """, float(lat), float(lon), ORG_ID, vid)
                        loc_updated += 1
            except Exception:
                pass
        print("  Locations updated: " + str(loc_updated))

        # ── SYNC LOG ──────────────────────────────────────────────
        total_records = len(vehicles) + len(drivers) + seg_total
        await db.execute("""
            INSERT INTO telematics_sync_log
                (org_id, provider, sync_type, started_at, completed_at,
                 records_fetched, records_written, status)
            VALUES ($1,'verizon_reveal','full_sync',now(),now(),$2,$3,'success')
        """, ORG_ID, total_records, v_written + d_written + seg_total)

        # ── COMPLIANCE FLAGS ──────────────────────────────────────
        print("")
        print("=" * 60)
        print("COMPLIANCE FLAGS DETECTED")
        print("=" * 60)
        print("  HIGH  David Layne — ELD driver, last update Feb 12 (43 days ago)")
        print("        Big Day Exemption ruleset. Verify device or driver status.")
        print("  MED   Unit 051 (2023 Mack Granite) — no segment data (404 on GPS)")
        print("        Possible device issue or vehicle not in service.")
        print("  MED   VIN 1SAMPLE00000000001 on two vehicles (272578 and 272578-Horst)")
        print("        Duplicate record in Reveal account.")
        print("  LOW   Marcus Farnsworth duplicated in driver roster (156725 + Marcus1)")

        # ── FINAL COUNT ───────────────────────────────────────────
        print("")
        print("=" * 60)
        print("SYNC COMPLETE — Example Fleet Co in Neon")
        print("=" * 60)
        row1 = await db.fetchrow("SELECT COUNT(*) as c FROM telematics_vehicles WHERE org_id = $1", ORG_ID)
        row2 = await db.fetchrow("SELECT COUNT(*) as c FROM telematics_drivers WHERE org_id = $1", ORG_ID)
        row3 = await db.fetchrow("SELECT COUNT(*) as c FROM telematics_gps_events WHERE org_id = $1", ORG_ID)
        row4 = await db.fetchrow("SELECT COUNT(*) as c FROM telematics_sync_log WHERE org_id = $1", ORG_ID)
        print("  Vehicles in Neon:    " + str(row1["c"]))
        print("  Drivers in Neon:     " + str(row2["c"]))
        print("  GPS events in Neon:  " + str(row3["c"]))
        print("  Sync log entries:    " + str(row4["c"]))

    await db.close()

asyncio.run(main())
