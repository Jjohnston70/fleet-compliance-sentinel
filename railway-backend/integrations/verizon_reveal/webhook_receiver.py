"""
integrations/verizon_reveal/webhook_receiver.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Verizon Connect Reveal — GPS Push Service Webhook Receiver

Reveal's GPS Push Service sends real-time GPS events to your endpoint
via HTTP POST. This is separate from the REST polling client —
think of polling as the nightly S2 brief, this as the live SIGINT feed.

Setup (one-time per client):
  1. Give Verizon your HTTPS endpoint URL
  2. For GPS webhook: submit via Reveal Marketplace UI
  3. For Alert webhook: call 844-617-1100 (yes, phone call — Verizon's process)
  4. Verizon sends a subscription confirmation POST first — you must
     respond with the SubscribeURL to activate (SNS-style handshake)

Your FastAPI endpoint to mount this router:
  app.include_router(reveal_webhook_router, prefix="/api/telematics/reveal")

Verizon will POST to: https://www.pipelinepunks.com/api/telematics/reveal/gps
                  and: https://www.pipelinepunks.com/api/telematics/reveal/alerts

Authentication: Verizon sends your integration username in the payload.
Map username → org_id using the telematics_credentials table.

Schema note: Reveal's GPS Push Service schema is fixed — Verizon defines it
and it cannot be modified on their end. We normalize it on ours.
"""

import hmac
import logging
import ipaddress
import os
import socket
from typing import Optional
from urllib.parse import urlparse

import asyncpg
import httpx
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from pydantic import BaseModel, Field

from integrations.verizon_reveal.normalizer import RevealNormalizer
from models.telematics_event import NormalizedAlert, NormalizedGPSEvent

logger = logging.getLogger(__name__)

reveal_webhook_router = APIRouter(tags=["telematics", "verizon-reveal"])

REVEAL_WEBHOOKS_ENABLED = os.getenv("REVEAL_WEBHOOKS_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}
REVEAL_WEBHOOK_SECRET = os.getenv("REVEAL_WEBHOOK_SECRET", "")
REVEAL_WEBHOOK_ALLOWED_IPS = os.getenv("REVEAL_WEBHOOK_ALLOWED_IPS", "")
ALLOWED_CONFIRM_HOST_SUFFIXES = (
    "verizonconnect.com",
    "fleetmatics.com",
    "amazonaws.com",
)


def _parse_allowed_ip_networks() -> list[ipaddress._BaseNetwork]:
    raw = [part.strip() for part in REVEAL_WEBHOOK_ALLOWED_IPS.split(",") if part.strip()]
    networks: list[ipaddress._BaseNetwork] = []
    for value in raw:
        try:
            if "/" in value:
                networks.append(ipaddress.ip_network(value, strict=False))
            else:
                host_ip = ipaddress.ip_address(value)
                suffix = "/32" if host_ip.version == 4 else "/128"
                networks.append(ipaddress.ip_network(f"{value}{suffix}", strict=False))
        except ValueError:
            logger.warning("invalid_reveal_webhook_allowed_ip", extra={"value": value})
    return networks


ALLOWED_WEBHOOK_IP_NETWORKS = _parse_allowed_ip_networks()


def _require_webhooks_enabled() -> None:
    if not REVEAL_WEBHOOKS_ENABLED:
        raise HTTPException(status_code=503, detail="Reveal webhooks are disabled")


def _verify_webhook_secret(x_reveal_webhook_secret: Optional[str]) -> None:
    if not REVEAL_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Reveal webhook secret is not configured")

    provided = x_reveal_webhook_secret or ""
    if not hmac.compare_digest(provided, REVEAL_WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _verify_source_ip(request: Request) -> None:
    if not ALLOWED_WEBHOOK_IP_NETWORKS:
        return

    client_host = request.client.host if request.client else ""
    if not client_host:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        client_ip = ipaddress.ip_address(client_host)
    except ValueError:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not any(client_ip in network for network in ALLOWED_WEBHOOK_IP_NETWORKS):
        raise HTTPException(status_code=403, detail="Forbidden")


def _is_allowed_confirm_hostname(hostname: str) -> bool:
    normalized = hostname.strip().lower().rstrip(".")
    if not normalized:
        return False

    for suffix in ALLOWED_CONFIRM_HOST_SUFFIXES:
        if normalized == suffix or normalized.endswith(f".{suffix}"):
            return True
    return False


def _is_public_hostname(hostname: str) -> bool:
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(hostname, 443, type=socket.SOCK_STREAM)}
    except socket.gaierror:
        return False

    if not addresses:
        return False

    for address in addresses:
        try:
            ip = ipaddress.ip_address(address)
        except ValueError:
            return False
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            return False
    return True


# ---------------------------------------------------------------------------
# Reveal GPS Push Service payload schema (Verizon-defined, cannot change)
# ---------------------------------------------------------------------------

class RevealGPSPayload(BaseModel):
    """
    GPS Push Service event schema as defined by Verizon Connect Reveal.
    Field names match their exact casing from the API docs.
    Do not rename these fields — they come from Verizon exactly as-is.
    """
    Username: str                        # Maps to integration username → org_id
    VehicleId: str
    VehicleNumber: Optional[str] = None
    DriverId: Optional[str] = None
    DriverName: Optional[str] = None
    Latitude: float
    Longitude: float
    Speed: Optional[float] = None        # mph
    Heading: Optional[float] = None      # degrees
    Odometer: Optional[float] = None     # miles
    EventType: Optional[str] = None      # "Moving", "Idle", "Stop", etc.
    EventDateTime: str                   # ISO 8601
    IgnitionStatus: Optional[str] = None # "On" | "Off"
    Address: Optional[str] = None        # Reverse-geocoded address (if enabled)


class RevealAlertPayload(BaseModel):
    """
    Alert webhook payload schema from Reveal.
    Triggered by exceptions configured in the client's Reveal account.
    """
    Username: str
    VehicleId: Optional[str] = None
    DriverId: Optional[str] = None
    AlertType: str
    AlertDescription: Optional[str] = None
    Severity: Optional[str] = None
    EventDateTime: str
    Latitude: Optional[float] = None
    Longitude: Optional[float] = None
    Speed: Optional[float] = None
    Address: Optional[str] = None


# ---------------------------------------------------------------------------
# Subscription confirmation handler (Verizon SNS-style handshake)
# ---------------------------------------------------------------------------

@reveal_webhook_router.post("/confirm")
async def confirm_subscription(
    request: Request,
    x_reveal_webhook_secret: Optional[str] = Header(default=None, alias="X-Reveal-Webhook-Secret"),
):
    """
    Verizon sends a confirmation POST before activating the GPS push feed.
    The body contains a SubscribeURL — you must GET that URL to confirm.
    This is a one-time handshake per client registration.

    Verizon docs: "Review the feed logs in another browser tab to confirm
    the subscription by browsing to the Subscribe URL value."
    We automate that step here.
    """
    _require_webhooks_enabled()
    _verify_webhook_secret(x_reveal_webhook_secret)
    _verify_source_ip(request)

    try:
        body = await request.json()
        subscribe_url = body.get("SubscribeURL")

        if not subscribe_url:
            logger.warning("reveal_confirm_no_subscribe_url", extra={"body": body})
            raise HTTPException(status_code=400, detail="No SubscribeURL in payload")

        parsed = urlparse(subscribe_url)
        if parsed.scheme.lower() != "https" or not parsed.hostname:
            raise HTTPException(status_code=400, detail="Invalid SubscribeURL")
        if not _is_allowed_confirm_hostname(parsed.hostname):
            raise HTTPException(status_code=400, detail="Untrusted SubscribeURL host")
        if not _is_public_hostname(parsed.hostname):
            raise HTTPException(status_code=400, detail="SubscribeURL resolved to non-public address")

        # Confirm the subscription by GETting the URL
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=False) as client:
            response = await client.get(subscribe_url)

        if response.status_code == 200:
            logger.info("reveal_subscription_confirmed", extra={"url": subscribe_url})
            return {"status": "confirmed"}
        else:
            logger.error(
                "reveal_subscription_confirm_failed",
                extra={"status": response.status_code},
            )
            raise HTTPException(status_code=500, detail="Subscription confirmation failed")

    except Exception as e:
        logger.error("reveal_subscription_error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Internal error during confirmation")


# ---------------------------------------------------------------------------
# GPS Push Service receiver
# ---------------------------------------------------------------------------

@reveal_webhook_router.post("/gps")
async def receive_gps_event(
    payload: RevealGPSPayload,
    background_tasks: BackgroundTasks,
    request: Request,
    x_reveal_webhook_secret: Optional[str] = Header(default=None, alias="X-Reveal-Webhook-Secret"),
):
    """
    Receives real-time GPS events from Verizon Connect Reveal.
    Verizon POSTs here on every significant vehicle event (movement,
    stop, ignition change, etc.).

    Processing is async (background task) so we return 200 immediately.
    Verizon will retry if they don't receive 200 within timeout.
    Never do heavy processing synchronously in this handler.
    """
    _require_webhooks_enabled()
    _verify_webhook_secret(x_reveal_webhook_secret)
    _verify_source_ip(request)

    # Resolve org_id from the integration username
    # In production: lookup username → org_id from telematics_credentials
    org_id = await _resolve_org_from_username(payload.Username, request)
    if not org_id:
        # Return 200 anyway — returning 4xx causes Verizon to retry flood
        logger.warning(
            "reveal_gps_unknown_username",
            extra={"username": payload.Username},
        )
        return {"status": "ok"}

    background_tasks.add_task(_process_gps_event, org_id, payload)
    return {"status": "ok"}


@reveal_webhook_router.post("/alerts")
async def receive_alert_event(
    payload: RevealAlertPayload,
    background_tasks: BackgroundTasks,
    request: Request,
    x_reveal_webhook_secret: Optional[str] = Header(default=None, alias="X-Reveal-Webhook-Secret"),
):
    """
    Receives alert/exception events from Verizon Connect Reveal.
    Alert webhook requires phone activation: 844-617-1100.
    Same pattern as GPS — return 200 immediately, process async.
    """
    _require_webhooks_enabled()
    _verify_webhook_secret(x_reveal_webhook_secret)
    _verify_source_ip(request)

    org_id = await _resolve_org_from_username(payload.Username, request)
    if not org_id:
        logger.warning(
            "reveal_alert_unknown_username",
            extra={"username": payload.Username},
        )
        return {"status": "ok"}

    background_tasks.add_task(_process_alert_event, org_id, payload)
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Background processors
# ---------------------------------------------------------------------------

async def _process_gps_event(org_id: str, payload: RevealGPSPayload):
    """
    Normalize and persist GPS event. Called as background task.
    Write to telematics_events table → triggers risk score recalculation
    for this vehicle if speed violation or anomalous behavior detected.
    """
    try:
        normalizer = RevealNormalizer(org_id=org_id)
        event: NormalizedGPSEvent = normalizer.gps_event(payload.model_dump())

        # TODO: inject db dependency properly in production
        # await db.execute(INSERT INTO telematics_events ...)

        # Trigger risk score update if speeding detected
        if event.is_speeding:
            logger.warning(
                "reveal_gps_speeding_detected",
                extra={
                    "org_id": org_id,
                    "vehicle_id": event.provider_vehicle_id,
                    "speed_mph": event.speed_mph,
                    "limit_mph": event.posted_speed_limit_mph,
                },
            )
            # TODO: await risk_score_engine.flag_event(event)

        logger.info(
            "reveal_gps_event_processed",
            extra={
                "org_id": org_id,
                "vehicle_id": event.provider_vehicle_id,
                "event_time": event.occurred_at.isoformat(),
            },
        )
    except Exception as e:
        logger.error(
            "reveal_gps_processing_error",
            extra={"org_id": org_id, "error": str(e)},
        )


async def _process_alert_event(org_id: str, payload: RevealAlertPayload):
    """
    Normalize and persist alert event.
    HIGH/CRITICAL severity alerts → also write to compliance_alerts
    table so they surface in the Fleet-Compliance Sentinel dashboard.
    """
    try:
        normalizer = RevealNormalizer(org_id=org_id)
        alert: NormalizedAlert = normalizer.alert(payload.model_dump())

        # TODO: await db.execute(INSERT INTO compliance_alerts ...)

        logger.info(
            "reveal_alert_processed",
            extra={
                "org_id": org_id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "risk_weight": alert.risk_weight,
            },
        )
    except Exception as e:
        logger.error(
            "reveal_alert_processing_error",
            extra={"org_id": org_id, "error": str(e)},
        )


# ---------------------------------------------------------------------------
# Username → org_id resolution
# ---------------------------------------------------------------------------

async def _resolve_org_from_username(
    username: str,
    request: Request,
) -> Optional[str]:
    """
    Map Reveal integration username to Fleet-Compliance Sentinel org_id.
    Reveal sends the integration username (REST@domain.com format) in
    every webhook payload — this is how we identify which tenant's data
    is arriving.

    In production: SELECT org_id FROM telematics_credentials
                   WHERE username = $1 AND provider = 'verizon_reveal'
    """
    del request  # Reserved for future app-level dependency injection.

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("reveal_username_resolution_db_url_missing")
        return None

    normalized_username = (username or "").strip()
    if not normalized_username:
        return None

    conn = await asyncpg.connect(database_url)
    try:
        row = await conn.fetchrow(
            """
            SELECT org_id
            FROM telematics_credentials
            WHERE lower(username) = lower($1)
              AND provider = 'verizon_reveal'
              AND is_active = true
            LIMIT 1
            """,
            normalized_username,
        )
    except Exception as e:
        logger.error("reveal_username_resolution_error", extra={"error": str(e)})
        return None
    finally:
        await conn.close()

    if not row:
        return None
    return str(row["org_id"])
