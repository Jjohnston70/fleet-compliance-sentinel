import asyncio
import hmac
import os
import re
from typing import Any, Optional

import asyncpg
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import JSONResponse

telematics_router = APIRouter()


def verify_api_key(x_penny_api_key: Optional[str]) -> None:
    expected = os.getenv("PENNY_API_KEY", "")
    if not expected:
        return
    provided = x_penny_api_key or ""
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _extract_flags(stdout_text: str) -> list[str]:
    flags: list[str] = []
    for raw_line in stdout_text.splitlines():
        if raw_line.startswith("  HIGH") or raw_line.startswith("  MED") or raw_line.startswith("  LOW"):
            flags.append(raw_line.strip())
    return flags


def _extract_count(pattern: str, stdout_text: str) -> int:
    match = re.search(pattern, stdout_text, flags=re.IGNORECASE)
    if not match:
        return 0
    return int(match.group(1))


def _tail(value: str, max_chars: int = 2000) -> str:
    if len(value) <= max_chars:
        return value
    return value[-max_chars:]


@telematics_router.post("/telematics/sync")
async def telematics_sync(x_penny_api_key: Optional[str] = Header(default=None)):
    verify_api_key(x_penny_api_key)

    process: asyncio.subprocess.Process
    try:
        process = await asyncio.create_subprocess_exec(
            "python",
            "/app/scripts/reveal_sync_neon.py",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout_bytes, stderr_bytes = await asyncio.wait_for(process.communicate(), timeout=200)
    except asyncio.TimeoutError:
        process.kill()
        await process.communicate()
        payload = {
            "status": "error",
            "records_written": 0,
            "vehicles": 0,
            "drivers": 0,
            "gps_events": 0,
            "stdout_tail": "Sync timed out after 200 seconds.",
            "flags": [],
        }
        return JSONResponse(payload, status_code=500)
    except Exception as exc:
        payload = {
            "status": "error",
            "records_written": 0,
            "vehicles": 0,
            "drivers": 0,
            "gps_events": 0,
            "stdout_tail": _tail(str(exc)),
            "flags": [],
        }
        return JSONResponse(payload, status_code=500)

    stdout_text = stdout_bytes.decode("utf-8", errors="replace")
    stderr_text = stderr_bytes.decode("utf-8", errors="replace")

    vehicles = _extract_count(r"Vehicles\s+written:\s*(\d+)", stdout_text)
    drivers = _extract_count(r"Drivers\s+written:\s*(\d+)", stdout_text)
    gps_events = _extract_count(r"GPS\s+segment\s+events\s+written:\s*(\d+)", stdout_text)
    records_written = vehicles + drivers + gps_events
    flags = _extract_flags(stdout_text)

    stdout_tail = _tail(stdout_text)
    if stderr_text.strip():
        stdout_tail = _tail(f"{stdout_tail}\n\nSTDERR:\n{stderr_text}")

    payload: dict[str, Any] = {
        "status": "success" if process.returncode == 0 else "error",
        "records_written": records_written,
        "vehicles": vehicles,
        "drivers": drivers,
        "gps_events": gps_events,
        "stdout_tail": stdout_tail,
        "flags": flags,
    }

    if process.returncode != 0:
        return JSONResponse(payload, status_code=500)

    return payload


@telematics_router.get("/telematics/health")
async def telematics_health(
    x_penny_api_key: Optional[str] = Header(default=None),
    org_id: Optional[str] = None,
):
    verify_api_key(x_penny_api_key)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not set")
    scoped_org_id = (org_id or os.getenv("REVEAL_ORG_ID", "")).strip()
    if not scoped_org_id:
        raise HTTPException(status_code=400, detail="org_id query param or REVEAL_ORG_ID env var is required")

    conn = await asyncpg.connect(database_url)
    try:
        vehicles_count = int(
            await conn.fetchval(
                "SELECT COUNT(*)::int FROM telematics_vehicles WHERE org_id = $1",
                scoped_org_id,
            ) or 0
        )
        drivers_count = int(
            await conn.fetchval(
                "SELECT COUNT(*)::int FROM telematics_drivers WHERE org_id = $1",
                scoped_org_id,
            ) or 0
        )
        gps_events_count = int(
            await conn.fetchval(
                "SELECT COUNT(*)::int FROM telematics_gps_events WHERE org_id = $1",
                scoped_org_id,
            ) or 0
        )

        last_sync = await conn.fetchrow(
            """
            SELECT org_id, provider, sync_type, started_at, completed_at, records_fetched, records_written, status
            FROM telematics_sync_log
            WHERE org_id = $1
            ORDER BY started_at DESC
            LIMIT 1
            """,
            scoped_org_id,
        )
    finally:
        await conn.close()

    last_sync_payload: Optional[dict[str, Any]]
    if last_sync is None:
        last_sync_payload = None
    else:
        started_at = last_sync.get("started_at")
        completed_at = last_sync.get("completed_at")
        last_sync_payload = {
            "org_id": last_sync.get("org_id"),
            "provider": last_sync.get("provider"),
            "sync_type": last_sync.get("sync_type"),
            "started_at": started_at.isoformat() if started_at else None,
            "completed_at": completed_at.isoformat() if completed_at else None,
            "records_fetched": last_sync.get("records_fetched"),
            "records_written": last_sync.get("records_written"),
            "status": last_sync.get("status"),
        }

    return {
        "status": "ok",
        "org_id": scoped_org_id,
        "counts": {
            "telematics_vehicles": vehicles_count,
            "telematics_drivers": drivers_count,
            "telematics_gps_events": gps_events_count,
        },
        "last_sync": last_sync_payload,
    }
