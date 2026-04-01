import asyncio
import hmac
import os
import re
import time
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, ConfigDict, Field

modules_router = APIRouter()

DEFAULT_TIMEOUT_MS = 300_000
MAX_TIMEOUT_MS = 900_000
OUTPUT_CAPTURE_CHARS = 20_000
OUTPUT_PREVIEW_CHARS = 4_000
PYTHON_EXECUTABLE = os.getenv("MODULE_GATEWAY_PYTHON_BIN", "python")
_configured_tooling_root = os.getenv("MODULE_GATEWAY_TOOLING_ROOT")
if _configured_tooling_root:
    TOOLING_ROOT = Path(_configured_tooling_root).resolve()
elif Path("/app/tooling").exists():
    TOOLING_ROOT = Path("/app/tooling").resolve()
else:
    TOOLING_ROOT = (Path(__file__).resolve().parents[2] / "tooling").resolve()

EIA_PRODUCTS = ["crude", "diesel", "gasoline", "heating_oil"]
EIA_INGEST_SOURCES = [
    "spot_prices",
    "futures",
    "colorado_retail",
    "rocky_mountain_retail",
    "residential_standard_errors",
    "fountain_opis_prices",
    "client_average_inventory",
    "weather_colorado_springs",
    "traffic_cdot",
]
SIGNAL_SOURCES = ["sales", "ops_pulse", "cash_flow_compass", "pipeline_pulse", "team_tempo"]
SIGNAL_SOURCE_OPTIONS = [*SIGNAL_SOURCES, "all"]
PAPERSTACK_GENERATE_FORMATS = ["pdf", "docx"]
PAPERSTACK_REVERSE_MODES = ["js", "python", "pdf", "python_pdf"]
PAPERSTACK_SCAN_DPI_VALUES = [200, 300, 400]

PAPERSTACK_ROOT = (TOOLING_ROOT / "MOD-PAPERSTACK-PP").resolve()
RUNS: dict[str, dict[str, Any]] = {}
RUNS_LOCK = asyncio.Lock()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _verify_api_key(x_penny_api_key: Optional[str]) -> None:
    expected = os.getenv("PENNY_API_KEY", "")
    if not expected:
        return
    provided = x_penny_api_key or ""
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _clamp_timeout(requested_timeout_ms: Optional[int], action_default_ms: Optional[int]) -> int:
    base = requested_timeout_ms if isinstance(requested_timeout_ms, int) else action_default_ms
    timeout_ms = base if isinstance(base, int) else DEFAULT_TIMEOUT_MS
    if timeout_ms <= 0:
        return DEFAULT_TIMEOUT_MS
    return min(timeout_ms, MAX_TIMEOUT_MS)


def _truncate_capture(value: str) -> tuple[str, bool]:
    if len(value) <= OUTPUT_CAPTURE_CHARS:
        return value, False
    return value[:OUTPUT_CAPTURE_CHARS], True


def _preview_output(value: str, was_capture_truncated: bool) -> tuple[str, bool]:
    if len(value) <= OUTPUT_PREVIEW_CHARS and not was_capture_truncated:
        return value, False
    return value[:OUTPUT_PREVIEW_CHARS], True


def _fail_response(code: str, message: str, status_code: int, details: Optional[list[str]] = None):
    payload: dict[str, Any] = {"ok": False, "error": {"code": code, "message": message}}
    if details:
        payload["error"]["details"] = details
    return payload, status_code


def _is_path_within_root(root_path: Path, target_path: Path) -> bool:
    try:
        target_path.relative_to(root_path)
        return True
    except ValueError:
        return False


def _relative_to_paperstack_root(absolute_path: Path) -> str:
    relative = absolute_path.relative_to(PAPERSTACK_ROOT).as_posix()
    return relative if relative else "."


def _resolve_paperstack_path_arg(
    raw_value: Any,
    *,
    label: str,
    allow_missing: bool = False,
    extensions: Optional[list[str]] = None,
    base_dir: Optional[Path] = None,
) -> str:
    if not isinstance(raw_value, str) or not raw_value.strip():
        raise ValueError(f"{label} must be a non-empty string path")
    trimmed = raw_value.strip()
    if "\x00" in trimmed:
        raise ValueError(f"{label} contains invalid path characters")

    anchor = base_dir or PAPERSTACK_ROOT
    absolute_path = (Path(trimmed).resolve() if Path(trimmed).is_absolute() else (anchor / trimmed).resolve())
    if not _is_path_within_root(PAPERSTACK_ROOT, absolute_path):
        raise ValueError(f"{label} must stay within the MOD-PAPERSTACK-PP module directory")

    allowed_extensions = [ext.lower() for ext in (extensions or [])]
    if allowed_extensions:
        extension = absolute_path.suffix.lower()
        if extension not in allowed_extensions:
            raise ValueError(f"{label} must use one of: {', '.join(allowed_extensions)}")

    if not allow_missing and not absolute_path.exists():
        raise ValueError(f"{label} not found: {_relative_to_paperstack_root(absolute_path)}")

    return _relative_to_paperstack_root(absolute_path)


def _catalog_action(
    action_id: str,
    description: str,
    command_preview: list[str],
    args_schema: Optional[dict[str, Any]] = None,
    default_timeout_ms: Optional[int] = None,
) -> dict[str, Any]:
    return {
        "actionId": action_id,
        "description": description,
        "argsSchema": args_schema or {"type": "object", "properties": {}, "required": []},
        "timeoutMs": default_timeout_ms or DEFAULT_TIMEOUT_MS,
        "commandPreview": command_preview,
    }


def _build_paperstack_convert_command(args: dict[str, Any]) -> list[str]:
    input_path = _resolve_paperstack_path_arg(args["inputPath"], label="args.inputPath", extensions=[".md"])
    command = [PYTHON_EXECUTABLE, "paperstack.py", "convert", input_path]
    output_path = args.get("outputPath")
    if isinstance(output_path, str) and output_path.strip():
        command.append(
            _resolve_paperstack_path_arg(
                output_path,
                label="args.outputPath",
                allow_missing=True,
                extensions=[".html"],
            )
        )
    if args.get("dark"):
        command.append("--dark")
    return command


def _build_paperstack_reverse_command(args: dict[str, Any]) -> list[str]:
    input_path = _resolve_paperstack_path_arg(args["inputPath"], label="args.inputPath", extensions=[".docx"])
    mode = str(args.get("mode", "js"))
    command = [PYTHON_EXECUTABLE, "paperstack.py", "reverse", input_path]
    if mode == "python":
        command.append("--python")
    elif mode == "pdf":
        command.append("--pdf")
    elif mode == "python_pdf":
        command.extend(["--python", "--pdf"])

    output_path = args.get("outputPath")
    if isinstance(output_path, str) and output_path.strip():
        command.extend(
            [
                "--output",
                _resolve_paperstack_path_arg(output_path, label="args.outputPath", allow_missing=True),
            ]
        )
    return command


def _build_paperstack_scan_command(args: dict[str, Any]) -> list[str]:
    input_path = _resolve_paperstack_path_arg(args["inputPath"], label="args.inputPath", extensions=[".pdf"])
    command = [
        PYTHON_EXECUTABLE,
        "paperstack.py",
        "scan",
        input_path,
        "--port",
        str(int(args["port"])),
        "--dpi",
        str(int(args["dpi"])),
    ]
    if args.get("forceOcr"):
        command.append("--force-ocr")
    return command


def _build_registry() -> dict[str, dict[str, Any]]:
    empty = {"type": "object", "properties": {}, "required": []}

    return {
        "ML-EIA-PETROLEUM-INTEL": {
            "moduleId": "ML-EIA-PETROLEUM-INTEL",
            "displayName": "ML-EIA-PETROLEUM-INTEL",
            "runtime": "python",
            "workingDirectory": str((TOOLING_ROOT / "ML-EIA-PETROLEUM-INTEL").resolve()),
            "actions": {
                "tests": {
                    **_catalog_action(
                        "tests",
                        "Run module pytest suite",
                        ["python", "-m", "pytest", "tests", "-q"],
                        empty,
                        180_000,
                    ),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "-m", "pytest", "tests", "-q"],
                },
                "pipeline.product": {
                    **_catalog_action(
                        "pipeline.product",
                        "Run petroleum forecast pipeline for one product",
                        ["python", "run_pipeline.py", "--product", "<product>", "--horizon", "<30|60|90>"],
                        {
                            "type": "object",
                            "properties": {
                                "product": {"type": "string", "enum": EIA_PRODUCTS},
                                "horizon": {"type": "number", "enum": [30, 60, 90], "default": 30},
                                "trainYears": {"type": "number", "min": 1, "max": 20, "default": 10},
                            },
                            "required": ["product"],
                        },
                        600_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_pipeline.py",
                        "--product",
                        str(args["product"]),
                        "--horizon",
                        str(args["horizon"]),
                        "--train-years",
                        str(args["trainYears"]),
                    ],
                },
                "ingest.all": {
                    **_catalog_action(
                        "ingest.all",
                        "Run ingest for all configured petroleum data sources",
                        ["python", "run_ingest.py", "--all", "--api-update?", "--force-api?"],
                        {
                            "type": "object",
                            "properties": {
                                "apiUpdate": {"type": "boolean", "default": False},
                                "forceApi": {"type": "boolean", "default": False},
                            },
                        },
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_ingest.py",
                        "--all",
                        *(["--api-update"] if args.get("apiUpdate") else []),
                        *(["--force-api"] if args.get("forceApi") else []),
                    ],
                },
                "ingest.source": {
                    **_catalog_action(
                        "ingest.source",
                        "Run ingest for one configured petroleum data source",
                        ["python", "run_ingest.py", "--source", "<source>", "--api-update?", "--force-api?"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": EIA_INGEST_SOURCES},
                                "apiUpdate": {"type": "boolean", "default": False},
                                "forceApi": {"type": "boolean", "default": False},
                            },
                            "required": ["source"],
                        },
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_ingest.py",
                        "--source",
                        str(args["source"]),
                        *(["--api-update"] if args.get("apiUpdate") else []),
                        *(["--force-api"] if args.get("forceApi") else []),
                    ],
                },
                "ingest.api_update": {
                    **_catalog_action(
                        "ingest.api_update",
                        "Fetch latest EIA API series and merge into processed outputs",
                        ["python", "run_ingest.py", "--api-update", "--force-api?"],
                        {"type": "object", "properties": {"forceApi": {"type": "boolean", "default": False}}},
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_ingest.py",
                        "--api-update",
                        *(["--force-api"] if args.get("forceApi") else []),
                    ],
                },
                "pipeline.all": {
                    **_catalog_action(
                        "pipeline.all",
                        "Run petroleum pipeline for all default products",
                        ["python", "run_pipeline.py", "--all", "--horizon?", "--train-years?"],
                        {
                            "type": "object",
                            "properties": {
                                "horizon": {"type": "number", "enum": [30, 60, 90]},
                                "trainYears": {"type": "number", "min": 1, "max": 20, "default": 10},
                            },
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_pipeline.py",
                        "--all",
                        *(["--horizon", str(args["horizon"])] if isinstance(args.get("horizon"), (int, float)) else []),
                        "--train-years",
                        str(args["trainYears"]),
                    ],
                },
                "export.report": {
                    **_catalog_action(
                        "export.report",
                        "Generate executive DOCX report and API payload exports",
                        ["python", "export_reports.py", "--format", "docx", "--period", "<period>"],
                        {"type": "object", "properties": {"period": {"type": "string", "default": "monthly"}}},
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "export_reports.py",
                        "--format",
                        "docx",
                        "--period",
                        str(args["period"]),
                    ],
                },
                "export.skip_docx": {
                    **_catalog_action(
                        "export.skip_docx",
                        "Export API payloads and Penny context without DOCX generation",
                        ["python", "export_reports.py", "--skip-docx"],
                        empty,
                    ),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "export_reports.py", "--skip-docx"],
                },
                "export.json_only": {
                    **_catalog_action(
                        "export.json_only",
                        "Export API payloads and Penny context without DOCX generation",
                        ["python", "export_reports.py", "--skip-docx"],
                        empty,
                    ),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "export_reports.py", "--skip-docx"],
                },
            },
        },
        "ML-SIGNAL-STACK-TNCC": {
            "moduleId": "ML-SIGNAL-STACK-TNCC",
            "displayName": "ML-SIGNAL-STACK-TNCC",
            "runtime": "python",
            "workingDirectory": str((TOOLING_ROOT / "ML-SIGNAL-STACK-TNCC").resolve()),
            "actions": {
                "pipeline.source": {
                    **_catalog_action(
                        "pipeline.source",
                        "Run SignalStack pipeline for a selected source",
                        ["python", "run_pipeline.py", "--source", "<source>", "--skip-search?"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCE_OPTIONS},
                                "skipSearch": {"type": "boolean", "default": True},
                            },
                            "required": ["source"],
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_pipeline.py",
                        "--source",
                        str(args["source"]),
                        *(["--skip-search"] if args.get("skipSearch") else []),
                    ],
                },
                "pipeline.all": {
                    **_catalog_action(
                        "pipeline.all",
                        "Run SignalStack pipeline across all sources",
                        ["python", "run_pipeline.py", "--source", "all", "--skip-search?"],
                        {
                            "type": "object",
                            "properties": {"skipSearch": {"type": "boolean", "default": True}},
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_pipeline.py",
                        "--source",
                        "all",
                        *(["--skip-search"] if args.get("skipSearch") else []),
                    ],
                },
                "export.csv": {
                    **_catalog_action(
                        "export.csv",
                        "Export source workbook data to CSV",
                        ["python", "export_to_csv.py", "--source", "<source|all>", "--skip-root-fix?"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCE_OPTIONS, "default": "all"},
                                "skipRootFix": {"type": "boolean", "default": False},
                            },
                        },
                        180_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "export_to_csv.py",
                        "--source",
                        str(args.get("source", "all")),
                        *(["--skip-root-fix"] if args.get("skipRootFix") else []),
                    ],
                },
                "export.csv_all": {
                    **_catalog_action(
                        "export.csv_all",
                        "Export all SignalStack workbook data to CSV",
                        ["python", "export_to_csv.py", "--source", "all", "--skip-root-fix?"],
                        {
                            "type": "object",
                            "properties": {"skipRootFix": {"type": "boolean", "default": False}},
                        },
                        180_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "export_to_csv.py",
                        "--source",
                        "all",
                        *(["--skip-root-fix"] if args.get("skipRootFix") else []),
                    ],
                },
                "export.csv_source": {
                    **_catalog_action(
                        "export.csv_source",
                        "Export one SignalStack workbook source to CSV",
                        ["python", "export_to_csv.py", "--source", "<source>", "--skip-root-fix?"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCES},
                                "skipRootFix": {"type": "boolean", "default": False},
                            },
                            "required": ["source"],
                        },
                        180_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "export_to_csv.py",
                        "--source",
                        str(args["source"]),
                        *(["--skip-root-fix"] if args.get("skipRootFix") else []),
                    ],
                },
                "report.generate": {
                    **_catalog_action(
                        "report.generate",
                        "Generate SignalStack DOCX report from latest pipeline outputs",
                        ["python", "generate_report.py", "--source?", "<source>", "--out?", "<out>"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCE_OPTIONS, "default": "all"},
                                "out": {"type": "string"},
                            },
                        },
                        300_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "generate_report.py",
                        *(["--source", str(args["source"])] if str(args.get("source", "all")) != "all" else []),
                        *(["--out", str(args["out"]).strip()] if isinstance(args.get("out"), str) and str(args["out"]).strip() else []),
                    ],
                },
                "package.output": {
                    **_catalog_action(
                        "package.output",
                        "Package SignalStack report artifacts into delivery ZIP",
                        ["python", "package_output.py", "--source?", "<source>", "--no-code?", "--out-dir?", "<outDir>"],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCE_OPTIONS, "default": "all"},
                                "noCode": {"type": "boolean", "default": False},
                                "outDir": {"type": "string"},
                            },
                        },
                        300_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "package_output.py",
                        *(["--source", str(args["source"])] if str(args.get("source", "all")) != "all" else []),
                        *(["--no-code"] if args.get("noCode") else []),
                        *(["--out-dir", str(args["outDir"]).strip()] if isinstance(args.get("outDir"), str) and str(args["outDir"]).strip() else []),
                    ],
                },
                "workflow.delivery": {
                    **_catalog_action(
                        "workflow.delivery",
                        "Run full SignalStack operator workflow (export -> pipeline -> report -> package)",
                        [
                            "python",
                            "run_delivery.py",
                            "--source",
                            "<source|all>",
                            "--skip-search?",
                            "--skip-root-fix?",
                            "--no-code?",
                            "--out-dir?",
                            "<outDir>",
                        ],
                        {
                            "type": "object",
                            "properties": {
                                "source": {"type": "string", "enum": SIGNAL_SOURCE_OPTIONS, "default": "all"},
                                "skipSearch": {"type": "boolean", "default": True},
                                "skipRootFix": {"type": "boolean", "default": False},
                                "noCode": {"type": "boolean", "default": False},
                                "outDir": {"type": "string"},
                            },
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "run_delivery.py",
                        "--source",
                        str(args.get("source", "all")),
                        *(["--skip-search"] if args.get("skipSearch") else []),
                        *(["--skip-root-fix"] if args.get("skipRootFix") else []),
                        *(["--no-code"] if args.get("noCode") else []),
                        *(["--out-dir", str(args["outDir"]).strip()] if isinstance(args.get("outDir"), str) and str(args["outDir"]).strip() else []),
                    ],
                },
            },
        },
        "MOD-PAPERSTACK-PP": {
            "moduleId": "MOD-PAPERSTACK-PP",
            "displayName": "MOD-PAPERSTACK-PP",
            "runtime": "python",
            "workingDirectory": str(PAPERSTACK_ROOT),
            "actions": {
                "list": {
                    **_catalog_action("list", "List available PaperStack tools and readiness", ["python", "paperstack.py", "list"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "list"],
                },
                "check": {
                    **_catalog_action("check", "Run dependency diagnostics for PaperStack", ["python", "paperstack.py", "check"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "check"],
                },
                "generate": {
                    **_catalog_action(
                        "generate",
                        "Generate the default PaperStack marketing flyer (PDF or DOCX)",
                        ["python", "paperstack.py", "generate", "<pdf|docx>"],
                        {"type": "object", "properties": {"format": {"type": "string", "enum": PAPERSTACK_GENERATE_FORMATS}}, "required": ["format"]},
                    ),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "generate", str(args["format"])],
                },
                "tools.list": {
                    **_catalog_action("tools.list", "List available PaperStack tools and readiness", ["python", "paperstack.py", "list"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "list"],
                },
                "tools.check": {
                    **_catalog_action("tools.check", "Run dependency diagnostics for PaperStack", ["python", "paperstack.py", "check"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "check"],
                },
                "generate.pdf": {
                    **_catalog_action("generate.pdf", "Generate the default Pipeline flyer PDF", ["python", "paperstack.py", "generate", "pdf"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "generate", "pdf"],
                },
                "generate.docx": {
                    **_catalog_action("generate.docx", "Generate the default Pipeline flyer DOCX", ["python", "paperstack.py", "generate", "docx"], empty),
                    "buildCommand": lambda args: [PYTHON_EXECUTABLE, "paperstack.py", "generate", "docx"],
                },
                "convert": {
                    **_catalog_action(
                        "convert",
                        "Convert Markdown file to styled HTML",
                        ["python", "paperstack.py", "convert", "<input.md>", "<output.html?>", "--dark?"],
                        {
                            "type": "object",
                            "properties": {
                                "inputPath": {"type": "string"},
                                "outputPath": {"type": "string"},
                                "dark": {"type": "boolean", "default": False},
                            },
                            "required": ["inputPath"],
                        },
                    ),
                    "buildCommand": lambda args: _build_paperstack_convert_command(args),
                },
                "reverse": {
                    **_catalog_action(
                        "reverse",
                        "Reverse engineer DOCX into generator code",
                        ["python", "paperstack.py", "reverse", "<input.docx>", "--python|--pdf?", "--output?"],
                        {
                            "type": "object",
                            "properties": {
                                "inputPath": {"type": "string"},
                                "mode": {"type": "string", "enum": PAPERSTACK_REVERSE_MODES, "default": "js"},
                                "outputPath": {"type": "string"},
                            },
                            "required": ["inputPath"],
                        },
                    ),
                    "buildCommand": lambda args: _build_paperstack_reverse_command(args),
                },
                "inspect": {
                    **_catalog_action(
                        "inspect",
                        "Launch PDF inspector for text-based PDFs",
                        ["python", "paperstack.py", "inspect", "<input.pdf>", "--port", "<port>"],
                        {
                            "type": "object",
                            "properties": {
                                "inputPath": {"type": "string"},
                                "port": {"type": "number", "min": 1, "max": 65535, "default": 5000},
                            },
                            "required": ["inputPath"],
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: [
                        PYTHON_EXECUTABLE,
                        "paperstack.py",
                        "inspect",
                        _resolve_paperstack_path_arg(args["inputPath"], label="args.inputPath", extensions=[".pdf"]),
                        "--port",
                        str(int(args["port"])),
                    ],
                },
                "scan": {
                    **_catalog_action(
                        "scan",
                        "Launch OCR scan inspector for scanned PDFs",
                        ["python", "paperstack.py", "scan", "<input.pdf>", "--port", "<port>", "--dpi", "<200|300|400>", "--force-ocr?"],
                        {
                            "type": "object",
                            "properties": {
                                "inputPath": {"type": "string"},
                                "port": {"type": "number", "min": 1, "max": 65535, "default": 5000},
                                "dpi": {"type": "number", "enum": PAPERSTACK_SCAN_DPI_VALUES, "default": 300},
                                "forceOcr": {"type": "boolean", "default": False},
                            },
                            "required": ["inputPath"],
                        },
                        900_000,
                    ),
                    "buildCommand": lambda args: _build_paperstack_scan_command(args),
                },
            },
        },
    }


REGISTRY = _build_registry()


def _get_catalog() -> list[dict[str, Any]]:
    catalog: list[dict[str, Any]] = []
    for module in REGISTRY.values():
        actions = list(module["actions"].values())
        catalog.append(
            {
                "moduleId": module["moduleId"],
                "displayName": module["displayName"],
                "runtime": module["runtime"],
                "actions": [
                    {
                        "actionId": action["actionId"],
                        "description": action["description"],
                        "argsSchema": action["argsSchema"],
                        "timeoutMs": action["timeoutMs"],
                        "commandPreview": action["commandPreview"],
                    }
                    for action in actions
                ],
            }
        )
    return catalog


def _validate_action_args(action: dict[str, Any], raw_args: Any) -> tuple[bool, dict[str, Any], list[str]]:
    args = raw_args if isinstance(raw_args, dict) else {}
    schema = action.get("argsSchema") or {"type": "object", "properties": {}, "required": []}
    properties = schema.get("properties") or {}
    required_keys = set(schema.get("required") or [])

    normalized: dict[str, Any] = {}
    errors: list[str] = []

    for key in args.keys():
        if key not in properties:
            errors.append(f"args.{key} is not allowed")

    for key, spec in properties.items():
        required = bool(spec.get("required")) or key in required_keys
        has_value = key in args
        value = args.get(key)

        if not has_value or value is None:
            if "default" in spec:
                normalized[key] = deepcopy(spec["default"])
                continue
            if required:
                errors.append(f"args.{key} is required")
            continue

        expected_type = spec.get("type")
        if expected_type == "string":
            if not isinstance(value, str):
                errors.append(f"args.{key} must be a string")
                continue
        elif expected_type == "number":
            if not isinstance(value, (int, float)) or isinstance(value, bool):
                errors.append(f"args.{key} must be a number")
                continue
            minimum = spec.get("min")
            maximum = spec.get("max")
            if isinstance(minimum, (int, float)) and value < minimum:
                errors.append(f"args.{key} must be >= {minimum}")
            if isinstance(maximum, (int, float)) and value > maximum:
                errors.append(f"args.{key} must be <= {maximum}")
        elif expected_type == "boolean":
            if not isinstance(value, bool):
                errors.append(f"args.{key} must be a boolean")
                continue
        elif expected_type == "object":
            if not isinstance(value, dict):
                errors.append(f"args.{key} must be an object")
                continue

        allowed_enum = spec.get("enum")
        if isinstance(allowed_enum, list) and value not in allowed_enum:
            enum_values = ", ".join(str(entry) for entry in allowed_enum)
            errors.append(f"args.{key} must be one of: {enum_values}")
            continue

        normalized[key] = value

    return len(errors) == 0, normalized, errors


def _collect_paperstack_artifacts(run: dict[str, Any]) -> list[dict[str, Any]]:
    if run["moduleId"] != "MOD-PAPERSTACK-PP":
        return []

    args = run.get("args") or {}
    action_id = run["actionId"]
    candidates: list[str] = []
    input_path = args.get("inputPath") if isinstance(args.get("inputPath"), str) else None
    output_path = args.get("outputPath") if isinstance(args.get("outputPath"), str) else None

    if action_id in {"generate.pdf", "generate"} and (action_id != "generate" or args.get("format") != "docx"):
        candidates = ["Pipeline_Flyer.pdf"]
    elif action_id in {"generate.docx", "generate"} and (action_id != "generate" or args.get("format") == "docx"):
        candidates = ["Pipeline_Flyer.docx"]
    elif action_id == "convert" and input_path:
        if output_path:
            candidates = [output_path]
        else:
            stem = Path(input_path).stem
            candidates = [f"{stem}.html"]
    elif action_id == "reverse" and input_path:
        if output_path:
            candidates = [output_path]
        else:
            base_name = Path(input_path).stem
            mode = str(args.get("mode", "js"))
            if mode == "python":
                candidates = [f"{base_name}_generator.py"]
            elif mode == "pdf":
                candidates = [f"{base_name}_pdf_generator.py"]
            elif mode == "python_pdf":
                candidates = [f"{base_name}_generator.py", f"{base_name}_pdf_generator.py"]
            else:
                candidates = [f"{base_name}_generator.js"]

    artifacts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for candidate in candidates:
        candidate_path = (Path(run["cwd"]) / candidate).resolve()
        if not candidate_path.exists() or not candidate_path.is_file():
            continue
        relative = candidate_path.relative_to(Path(run["cwd"])).as_posix()
        if relative in seen:
            continue
        seen.add(relative)
        stat = candidate_path.stat()
        artifacts.append(
            {
                "kind": "file",
                "path": relative,
                "sizeBytes": stat.st_size,
                "modifiedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        )
    return artifacts


def _collect_ml_signal_artifacts(run: dict[str, Any], stdout_raw: str) -> list[dict[str, Any]]:
    if run["moduleId"] != "ML-SIGNAL-STACK-TNCC":
        return []

    action_id = run["actionId"]
    patterns: list[str] = []
    if action_id == "report.generate":
        patterns.append(r"\[report\]\s+Saved:\s+(.+)")
    elif action_id in {"package.output", "workflow.delivery"}:
        patterns.extend(
            [
                r"\[package\]\s+Delivered:\s+(.+)",
                r"\[package\]\s+HTML:\s+(.+)",
            ]
        )

    if not patterns:
        return []

    artifacts: list[dict[str, Any]] = []
    seen: set[str] = set()

    for pattern in patterns:
        for match in re.finditer(pattern, stdout_raw):
            raw_path = match.group(1).strip().strip("\"'")
            if not raw_path:
                continue

            candidate_path = Path(raw_path)
            if not candidate_path.is_absolute():
                candidate_path = (Path(run["cwd"]) / candidate_path).resolve()

            if not candidate_path.exists() or not candidate_path.is_file():
                continue

            try:
                relative = candidate_path.relative_to(Path(run["cwd"])).as_posix()
            except ValueError:
                relative = str(candidate_path)

            if relative in seen:
                continue
            seen.add(relative)

            stat = candidate_path.stat()
            artifacts.append(
                {
                    "kind": "file",
                    "path": relative,
                    "sizeBytes": stat.st_size,
                    "modifiedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                }
            )

    return artifacts


def _collect_ml_eia_artifacts(run: dict[str, Any], stdout_raw: str) -> list[dict[str, Any]]:
    if run["moduleId"] != "ML-EIA-PETROLEUM-INTEL":
        return []

    artifacts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for match in re.finditer(r"->\s+([^\r\n]+)", stdout_raw):
        raw_path = match.group(1).strip().strip("\"'")
        if not raw_path:
            continue

        candidate_path = Path(raw_path)
        if not candidate_path.is_absolute():
            candidate_path = (Path(run["cwd"]) / candidate_path).resolve()

        if not candidate_path.exists() or not candidate_path.is_file():
            continue

        try:
            relative = candidate_path.relative_to(Path(run["cwd"])).as_posix()
        except ValueError:
            relative = str(candidate_path)

        if relative in seen:
            continue
        seen.add(relative)

        stat = candidate_path.stat()
        artifacts.append(
            {
                "kind": "file",
                "path": relative,
                "sizeBytes": stat.st_size,
                "modifiedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        )

    return artifacts


def _artifact_media_type(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".zip":
        return "application/zip"
    if suffix == ".html":
        return "text/html; charset=utf-8"
    if suffix == ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if suffix == ".json":
        return "application/json; charset=utf-8"
    if suffix == ".txt":
        return "text/plain; charset=utf-8"
    return "application/octet-stream"


def _resolve_artifact_path(run: dict[str, Any], artifact_path: str) -> Optional[Path]:
    artifacts = run.get("artifacts") or []
    if not isinstance(artifacts, list):
        return None

    selected = next(
        (
            artifact
            for artifact in artifacts
            if isinstance(artifact, dict) and artifact.get("path") == artifact_path
        ),
        None,
    )
    if not selected:
        return None

    candidate = Path(artifact_path)
    if not candidate.is_absolute():
        candidate = (Path(run["cwd"]) / candidate).resolve()

    if not candidate.exists() or not candidate.is_file():
        return None

    return candidate


def _collect_run_artifacts(run: dict[str, Any], stdout_raw: str) -> list[dict[str, Any]]:
    if run["moduleId"] == "MOD-PAPERSTACK-PP":
        return _collect_paperstack_artifacts(run)
    if run["moduleId"] == "ML-SIGNAL-STACK-TNCC":
        return _collect_ml_signal_artifacts(run, stdout_raw)
    if run["moduleId"] == "ML-EIA-PETROLEUM-INTEL":
        return _collect_ml_eia_artifacts(run, stdout_raw)
    return []


async def _update_run(run_id: str, mutate):
    async with RUNS_LOCK:
        current = RUNS.get(run_id)
        if current is None:
            return None
        next_value = mutate(current)
        RUNS[run_id] = next_value
        return next_value


async def _execute_run(run_id: str):
    queued = RUNS.get(run_id)
    if not queued:
        return
    started_epoch = time.time()
    await _update_run(run_id, lambda run: {**run, "status": "running", "startedAt": _now_iso()})
    run = RUNS.get(run_id)
    if not run:
        return

    command = run["command"]
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            cwd=run["cwd"],
            env=os.environ.copy(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except Exception as exc:
        ended = _now_iso()
        duration = int((time.time() - started_epoch) * 1000)
        await _update_run(
            run_id,
            lambda current: {
                **current,
                "status": "fail",
                "endedAt": ended,
                "durationMs": duration,
                "exitCode": None,
                "error": {"code": "INTERNAL_ERROR", "message": str(exc)},
            },
        )
        return

    timed_out = False
    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(process.communicate(), timeout=run["timeoutMs"] / 1000)
    except asyncio.TimeoutError:
        timed_out = True
        process.kill()
        await process.communicate()
        stdout_bytes, stderr_bytes = b"", b""

    stdout_raw = stdout_bytes.decode("utf-8", errors="replace")
    stderr_raw = stderr_bytes.decode("utf-8", errors="replace")
    stdout_capture, stdout_capture_truncated = _truncate_capture(stdout_raw)
    stderr_capture, stderr_capture_truncated = _truncate_capture(stderr_raw)
    stdout_preview, stdout_preview_truncated = _preview_output(stdout_capture, stdout_capture_truncated)
    stderr_preview, stderr_preview_truncated = _preview_output(stderr_capture, stderr_capture_truncated)
    ended = _now_iso()
    duration = int((time.time() - started_epoch) * 1000)
    artifacts = _collect_run_artifacts(run, stdout_raw)

    if timed_out:
        await _update_run(
            run_id,
            lambda current: {
                **current,
                "status": "fail",
                "endedAt": ended,
                "durationMs": duration,
                "exitCode": None,
                "stdoutPreview": stdout_preview,
                "stderrPreview": stderr_preview,
                "stdoutTruncated": stdout_preview_truncated,
                "stderrTruncated": stderr_preview_truncated,
                "artifacts": artifacts,
                "error": {"code": "EXEC_TIMEOUT", "message": f"Process exceeded timeout of {current['timeoutMs']}ms"},
            },
        )
        return

    if process.returncode == 0:
        await _update_run(
            run_id,
            lambda current: {
                **current,
                "status": "success",
                "endedAt": ended,
                "durationMs": duration,
                "exitCode": 0,
                "stdoutPreview": stdout_preview,
                "stderrPreview": stderr_preview,
                "stdoutTruncated": stdout_preview_truncated,
                "stderrTruncated": stderr_preview_truncated,
                "artifacts": artifacts,
            },
        )
        return

    await _update_run(
        run_id,
        lambda current: {
            **current,
            "status": "fail",
            "endedAt": ended,
            "durationMs": duration,
            "exitCode": process.returncode,
            "stdoutPreview": stdout_preview,
            "stderrPreview": stderr_preview,
            "stdoutTruncated": stdout_preview_truncated,
            "stderrTruncated": stderr_preview_truncated,
            "artifacts": artifacts,
            "error": {"code": "EXEC_FAILED", "message": f"Process exited with code {process.returncode}"},
        },
    )


class ModuleRunRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    moduleId: str = Field(..., min_length=1)
    actionId: str = Field(..., min_length=1)
    args: dict[str, Any] = Field(default_factory=dict)
    correlationId: Optional[str] = None
    timeoutMs: Optional[int] = None
    dryRun: Optional[bool] = False


@modules_router.get("/modules/catalog")
async def modules_catalog(x_penny_api_key: Optional[str] = Header(default=None)):
    _verify_api_key(x_penny_api_key)
    return {"ok": True, "catalog": _get_catalog()}


@modules_router.post("/modules/run")
async def modules_run(payload: ModuleRunRequest, x_penny_api_key: Optional[str] = Header(default=None)):
    _verify_api_key(x_penny_api_key)

    module = REGISTRY.get(payload.moduleId)
    if not module:
        body, status = _fail_response("MODULE_NOT_FOUND", f"Module '{payload.moduleId}' is not registered", 404)
        return JSONResponse(body, status_code=status)

    module_dir = Path(module["workingDirectory"])
    if not module_dir.exists():
        body, status = _fail_response(
            "MODULE_NOT_FOUND",
            f"Module working directory not found for '{payload.moduleId}'",
            404,
        )
        return JSONResponse(body, status_code=status)

    action = module["actions"].get(payload.actionId)
    if not action:
        body, status = _fail_response(
            "ACTION_NOT_ALLOWED",
            f"Action '{payload.actionId}' is not allowlisted for module '{payload.moduleId}'",
            400,
        )
        return JSONResponse(body, status_code=status)

    is_valid, normalized_args, errors = _validate_action_args(action, payload.args)
    if not is_valid:
        body, status = _fail_response("VALIDATION_ERROR", "Action args validation failed", 400, details=errors)
        return JSONResponse(body, status_code=status)

    try:
        command = action["buildCommand"](normalized_args)
    except ValueError as exc:
        body, status = _fail_response("VALIDATION_ERROR", str(exc), 400)
        return JSONResponse(body, status_code=status)
    except Exception as exc:
        body, status = _fail_response("INTERNAL_ERROR", str(exc), 500)
        return JSONResponse(body, status_code=status)

    timeout_ms = _clamp_timeout(payload.timeoutMs, action.get("timeoutMs"))
    created_at = _now_iso()
    run_id = f"run_{uuid.uuid4()}"
    dry_run = bool(payload.dryRun)
    dry_run_message = f"Dry run validated command: {' '.join(command)}" if dry_run else ""

    run_record = {
        "id": run_id,
        "moduleId": payload.moduleId,
        "actionId": payload.actionId,
        "status": "success" if dry_run else "queued",
        "args": normalized_args,
        "requestedBy": "railway-remote",
        "correlationId": payload.correlationId,
        "timeoutMs": timeout_ms,
        "dryRun": dry_run,
        "command": command,
        "cwd": str(module_dir),
        "createdAt": created_at,
        "startedAt": created_at if dry_run else None,
        "endedAt": created_at if dry_run else None,
        "durationMs": 0 if dry_run else None,
        "exitCode": 0 if dry_run else None,
        "stdoutPreview": dry_run_message,
        "stderrPreview": "",
        "stdoutTruncated": False,
        "stderrTruncated": False,
        "artifacts": [],
    }

    async with RUNS_LOCK:
        RUNS[run_id] = run_record

    if not dry_run:
        asyncio.create_task(_execute_run(run_id))

    status_code = 200 if dry_run else 202
    return JSONResponse({"ok": True, "run": run_record}, status_code=status_code)


@modules_router.get("/modules/status/{run_id}")
async def modules_status(run_id: str, x_penny_api_key: Optional[str] = Header(default=None)):
    _verify_api_key(x_penny_api_key)

    run = RUNS.get(run_id)
    if run is None:
        body, status = _fail_response("MODULE_NOT_FOUND", f"Run '{run_id}' was not found", 404)
        return JSONResponse(body, status_code=status)
    return {"ok": True, "run": run}


@modules_router.get("/modules/artifact/{run_id}")
async def modules_artifact(
    run_id: str,
    artifact_path: str = Query(..., alias="path"),
    x_penny_api_key: Optional[str] = Header(default=None),
):
    _verify_api_key(x_penny_api_key)

    run = RUNS.get(run_id)
    if run is None:
        body, status = _fail_response("MODULE_NOT_FOUND", f"Run '{run_id}' was not found", 404)
        return JSONResponse(body, status_code=status)

    resolved = _resolve_artifact_path(run, artifact_path)
    if not resolved:
        body, status = _fail_response(
            "MODULE_NOT_FOUND",
            f"Artifact '{artifact_path}' was not found for run '{run_id}'",
            404,
        )
        return JSONResponse(body, status_code=status)

    media_type = _artifact_media_type(resolved)
    return FileResponse(str(resolved), media_type=media_type, filename=resolved.name)
