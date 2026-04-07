"""
Vercel Python ML Gateway

Runs ML module actions (ML-EIA, Signal Stack, PaperStack) as Vercel Python
serverless functions. Called by the Next.js module gateway runner via internal
HTTP instead of spawning child processes (which isn't possible on Vercel Node).

Auth: Requires ML_GATEWAY_INTERNAL_KEY header match.
"""

import json
import os
import subprocess
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

INTERNAL_KEY = os.environ.get("ML_GATEWAY_INTERNAL_KEY", "")

ALLOWED_MODULES = {
    "ML-EIA-PETROLEUM-INTEL",
    "ML-SIGNAL-STACK-TNCC",
    "MOD-PAPERSTACK-PP",
}

# Max stdout/stderr capture (50KB)
OUTPUT_LIMIT = 50_000


def resolve_cwd(module_id: str) -> str:
    """Resolve the working directory for a module relative to project root."""
    base = os.getcwd()
    return os.path.join(base, "tooling", module_id)


def verify_auth(request: Request) -> bool:
    """Verify the internal API key from the Next.js module gateway."""
    if not INTERNAL_KEY:
        return False
    provided = request.headers.get("x-ml-gateway-key", "")
    return provided == INTERNAL_KEY


@app.post("/api/ml/run")
async def run_module(request: Request):
    if not verify_auth(request):
        return JSONResponse(
            {"ok": False, "error": "Unauthorized", "code": "AUTH_ERROR"},
            status_code=401,
        )

    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            {"ok": False, "error": "Invalid JSON body", "code": "VALIDATION_ERROR"},
            status_code=400,
        )

    module_id = body.get("moduleId", "")
    command = body.get("command", [])
    timeout_ms = body.get("timeoutMs", 300_000)
    timeout_s = min(timeout_ms / 1000, 295)  # Stay under Vercel 300s limit

    if module_id not in ALLOWED_MODULES:
        return JSONResponse(
            {"ok": False, "error": f"Unknown module: {module_id}", "code": "MODULE_NOT_FOUND"},
            status_code=404,
        )

    if not command or not isinstance(command, list):
        return JSONResponse(
            {"ok": False, "error": "command must be a non-empty array", "code": "VALIDATION_ERROR"},
            status_code=400,
        )

    cwd = resolve_cwd(module_id)
    if not os.path.isdir(cwd):
        return JSONResponse(
            {"ok": False, "error": f"Module directory not found: {cwd}", "code": "MODULE_NOT_FOUND"},
            status_code=404,
        )

    started_at = time.time()

    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout_s,
            env={**os.environ},
        )

        elapsed_ms = int((time.time() - started_at) * 1000)

        return JSONResponse({
            "ok": True,
            "exitCode": result.returncode,
            "stdout": result.stdout[:OUTPUT_LIMIT] if result.stdout else "",
            "stderr": result.stderr[:OUTPUT_LIMIT] if result.stderr else "",
            "elapsedMs": elapsed_ms,
        })

    except subprocess.TimeoutExpired:
        elapsed_ms = int((time.time() - started_at) * 1000)
        return JSONResponse({
            "ok": False,
            "error": f"Process timed out after {timeout_s:.0f}s",
            "code": "TIMEOUT",
            "elapsedMs": elapsed_ms,
        })

    except FileNotFoundError:
        return JSONResponse({
            "ok": False,
            "error": f"Executable not found: {command[0]}",
            "code": "SPAWN_ERROR",
        })

    except Exception as e:
        return JSONResponse({
            "ok": False,
            "error": str(e),
            "code": "INTERNAL_ERROR",
        })


@app.get("/api/ml/health")
async def health():
    import sys
    return {"ok": True, "python": sys.version, "cwd": os.getcwd()}
