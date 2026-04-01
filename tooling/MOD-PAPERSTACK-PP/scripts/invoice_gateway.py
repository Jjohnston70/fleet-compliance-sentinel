"""
PaperStack invoice gateway runner.

Provides a stable CLI wrapper around invoice_module APIs for:
  - single invoice extraction
  - batch invoice extraction
  - JSON and XLSX export (fleet/original format)
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INVOICE_MODULE_SRC = PROJECT_ROOT / "invoice-module" / "src"

if str(INVOICE_MODULE_SRC) not in sys.path:
    sys.path.insert(0, str(INVOICE_MODULE_SRC))

from invoice_module import extract, extract_batch, to_fleet_xlsx, to_json, to_xlsx  # noqa: E402


def resolve_within_root(raw_path: str, label: str) -> Path:
    value = Path(raw_path.strip())
    absolute = value if value.is_absolute() else (PROJECT_ROOT / value)
    absolute = absolute.resolve()
    try:
        absolute.relative_to(PROJECT_ROOT)
    except ValueError as exc:
        raise ValueError(f"{label} must stay inside {PROJECT_ROOT}") from exc
    return absolute


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def default_single_outputs(input_pdf: Path, export_format: str) -> tuple[Path, Path]:
    out_dir = PROJECT_ROOT / "output" / "invoices"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = input_pdf.stem
    json_out = out_dir / f"{stem}_{timestamp}.json"
    suffix = "fleet" if export_format == "fleet" else "original"
    xlsx_out = out_dir / f"{stem}_{suffix}_{timestamp}.xlsx"
    return json_out, xlsx_out


def default_batch_outputs(export_format: str) -> tuple[Path, Path]:
    out_dir = PROJECT_ROOT / "output" / "invoices"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_out = out_dir / f"batch_{timestamp}.json"
    suffix = "fleet" if export_format == "fleet" else "original"
    xlsx_out = out_dir / f"batch_{suffix}_{timestamp}.xlsx"
    return json_out, xlsx_out


def list_pdf_files(input_dir: Path, pattern: str) -> list[Path]:
    matches = sorted(p for p in input_dir.glob(pattern) if p.is_file() and p.suffix.lower() == ".pdf")
    return matches


def write_json_output(output_path: Path, payload: dict | list) -> None:
    ensure_parent(output_path)
    output_path.write_text(to_json(payload, indent=2), encoding="utf-8")


def write_xlsx_output(output_path: Path, records: list[dict], export_format: str) -> None:
    ensure_parent(output_path)
    if export_format == "fleet":
        to_fleet_xlsx(records, str(output_path))
    else:
        to_xlsx(records, str(output_path))


def summarize_vendors(records: Iterable[dict]) -> str:
    vendors = sorted({str(item.get("vendor", "Unknown")) for item in records if isinstance(item, dict)})
    if not vendors:
        return "(none)"
    return ", ".join(vendors)


def run_single(args: argparse.Namespace) -> int:
    input_pdf = resolve_within_root(args.input, "input")
    if not input_pdf.exists() or input_pdf.suffix.lower() != ".pdf":
        raise FileNotFoundError(f"input PDF not found: {input_pdf}")

    record = extract(str(input_pdf), org_id=args.org_id, operator=args.operator)
    records = [record]

    json_out_default, xlsx_out_default = default_single_outputs(input_pdf, args.format)
    json_out = resolve_within_root(args.json_out, "json_out") if args.json_out else json_out_default
    xlsx_out = resolve_within_root(args.xlsx_out, "xlsx_out") if args.xlsx_out else xlsx_out_default

    write_json_output(json_out, record)
    write_xlsx_output(xlsx_out, records, args.format)

    print(f"[invoice] processed: 1")
    print(f"[invoice] vendor: {record.get('vendor', 'Unknown')}")
    print(f"[invoice] json: {json_out}")
    print(f"[invoice] xlsx: {xlsx_out}")
    return 0


def run_batch(args: argparse.Namespace) -> int:
    input_dir = resolve_within_root(args.input_dir, "input_dir")
    if not input_dir.exists() or not input_dir.is_dir():
        raise NotADirectoryError(f"input_dir not found: {input_dir}")

    pdf_files = list_pdf_files(input_dir, args.pattern)
    if not pdf_files:
        raise FileNotFoundError(f"No PDF files matched pattern '{args.pattern}' in {input_dir}")

    records = extract_batch(
        [str(path) for path in pdf_files],
        org_id=args.org_id,
        operator=args.operator,
    )

    json_out_default, xlsx_out_default = default_batch_outputs(args.format)
    json_out = resolve_within_root(args.json_out, "json_out") if args.json_out else json_out_default
    xlsx_out = resolve_within_root(args.xlsx_out, "xlsx_out") if args.xlsx_out else xlsx_out_default

    write_json_output(json_out, records)
    write_xlsx_output(xlsx_out, records, args.format)

    print(f"[invoice] processed: {len(records)}")
    print(f"[invoice] vendors: {summarize_vendors(records)}")
    print(f"[invoice] json: {json_out}")
    print(f"[invoice] xlsx: {xlsx_out}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="PaperStack invoice extraction gateway")
    subparsers = parser.add_subparsers(dest="mode", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--format", choices=["fleet", "original"], default="fleet")
    common.add_argument("--org-id", default=None)
    common.add_argument("--operator", default="module-gateway")
    common.add_argument("--json-out", default=None)
    common.add_argument("--xlsx-out", default=None)

    single = subparsers.add_parser("single", parents=[common], help="Extract one invoice PDF")
    single.add_argument("--input", required=True, help="PDF file path")

    batch = subparsers.add_parser("batch", parents=[common], help="Extract all PDFs in a directory")
    batch.add_argument("--input-dir", required=True, help="Directory containing PDF files")
    batch.add_argument("--pattern", default="*.pdf", help="Glob pattern inside input-dir")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        if args.mode == "single":
            return run_single(args)
        if args.mode == "batch":
            return run_batch(args)
        parser.error(f"Unsupported mode: {args.mode}")
    except Exception as exc:
        print(f"[invoice] ERROR: {exc}", file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
