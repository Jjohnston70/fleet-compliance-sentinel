from __future__ import annotations

import argparse
from pathlib import Path
import sys

from config import OUTPUT_DIR, PROCESSED_DIR
from src.export.json_exporter import export_api_payloads
from src.export.penny_context import build_penny_context
from src.export.report_generator import generate_executive_report


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export petroleum executive reports and API payloads.")
    parser.add_argument("--format", choices=["docx"], default="docx", help="Report format.")
    parser.add_argument("--period", default="monthly", help="Report period label.")
    parser.add_argument("--skip-docx", action="store_true", help="Skip Word report generation.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    output_dir = Path(OUTPUT_DIR)
    processed_dir = Path(PROCESSED_DIR)

    if not args.skip_docx:
        report_path = generate_executive_report(output_dir=output_dir, period=args.period)
        print(f"[report] docx -> {report_path}")

    api_paths = export_api_payloads(output_dir=output_dir, processed_dir=processed_dir)
    for name, path in api_paths.items():
        print(f"[json] {name} -> {path}")

    context = build_penny_context(output_dir=output_dir, processed_dir=processed_dir, max_chars=8000)
    context_path = output_dir / "reports" / "penny_context_latest.txt"
    context_path.parent.mkdir(parents=True, exist_ok=True)
    context_path.write_text(context, encoding="utf-8")
    print(f"[penny] context -> {context_path}")
    print("Export complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

