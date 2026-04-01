from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

from config import API_CACHE_FILE, EIA_API_KEY, PROCESSED_DIR, SOURCE_CONFIGS, TRAFFIC_PROCESSED_DIR
from src.ingest.api_fetcher import run_api_update
from src.ingest.csv_loader import (
    load_client_average_inventory,
    load_fountain_opis_prices,
    load_weather_colorado_springs,
)
from src.ingest.excel_loader import (
    load_colorado_retail,
    load_futures,
    load_rocky_mountain_retail,
    load_spot_prices,
    load_standard_errors,
)
from src.ingest.normalize import build_summary, detect_gaps, normalize_for_output, write_processed_csv
from src.ingest.schema import IngestSummary
from src.ingest.traffic_loader import load_cdot_traffic

LOADER_MAP = {
    "spot_prices": load_spot_prices,
    "futures": load_futures,
    "colorado_retail": load_colorado_retail,
    "rocky_mountain_retail": load_rocky_mountain_retail,
    "standard_errors": load_standard_errors,
    "fountain_opis_prices": load_fountain_opis_prices,
    "client_average_inventory": load_client_average_inventory,
    "weather_colorado_springs": load_weather_colorado_springs,
    "traffic_cdot": load_cdot_traffic,
}


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest petroleum intelligence data sources.")
    parser.add_argument("--all", action="store_true", help="Process all configured data sources.")
    parser.add_argument("--source", choices=sorted(SOURCE_CONFIGS.keys()), help="Process one source.")
    parser.add_argument(
        "--output-dir",
        default=str(PROCESSED_DIR),
        help="Processed output directory (default: data/processed).",
    )
    parser.add_argument(
        "--api-update",
        action="store_true",
        help="Fetch latest EIA series via API and append to processed CSVs.",
    )
    parser.add_argument(
        "--force-api",
        action="store_true",
        help="Ignore API per-day cache and force live fetch.",
    )
    return parser.parse_args(argv)


def resolve_sources(args: argparse.Namespace) -> list[str]:
    if args.api_update and not args.all and not args.source:
        return []
    if args.all:
        return list(SOURCE_CONFIGS.keys())
    if args.source:
        return [args.source]
    return list(SOURCE_CONFIGS.keys())


def ingest_source(source_id: str, output_dir: Path) -> IngestSummary:
    cfg = SOURCE_CONFIGS[source_id]
    loader = LOADER_MAP[cfg.loader]
    if cfg.output_schema == "traffic" and not cfg.file_path.exists():
        cfg.file_path.mkdir(parents=True, exist_ok=True)

    if not cfg.file_path.exists():
        empty_output_path = (
            TRAFFIC_PROCESSED_DIR / cfg.output_file if cfg.output_schema == "traffic" else output_dir / cfg.output_file
        )
        warning = f"Source file missing: {cfg.file_path}"
        empty_summary = IngestSummary(
            source_id=source_id,
            output_file=str(empty_output_path),
            rows=0,
            start_date=None,
            end_date=None,
            warnings=[warning],
        )
        return empty_summary

    frame, loader_warnings = loader(cfg.file_path)

    if cfg.output_schema == "traffic":
        output_path = TRAFFIC_PROCESSED_DIR / cfg.output_file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        out = frame.copy()
        out["date"] = pd.to_datetime(out["date"], errors="coerce").dt.strftime("%Y-%m-%d")
        out.to_csv(output_path, index=False)
        return build_summary(
            source_id=source_id,
            output_file=str(output_path),
            df=frame,
            warnings=loader_warnings,
        )

    normalized = normalize_for_output(frame, source_id=source_id)
    gap_warnings = detect_gaps(normalized, cfg.frequency)

    output_path = output_dir / cfg.output_file
    write_processed_csv(normalized, output_path)

    return build_summary(
        source_id=source_id,
        output_file=str(output_path),
        df=normalized,
        warnings=[*loader_warnings, *gap_warnings],
    )


def print_summary(summary: IngestSummary) -> None:
    print(f"[{summary.source_id}]")
    print(f"  output: {summary.output_file}")
    print(f"  rows: {summary.rows}")
    print(f"  date_range: {summary.start_date} -> {summary.end_date}")
    if summary.warnings:
        print("  warnings:")
        for warning in summary.warnings:
            print(f"    - {warning}")
    print("")


def perform_api_update(output_dir: Path, force_api: bool) -> int:
    if not EIA_API_KEY:
        print("EIA API key missing. Set EIA_API_KEY in .env before using --api-update.")
        return 1

    api_summary = run_api_update(
        api_key=EIA_API_KEY,
        processed_dir=output_dir,
        cache_path=API_CACHE_FILE,
        force=force_api,
    )

    print("[api_update]")
    print(f"  ran_at: {api_summary['ran_at']}")
    print(f"  total_series: {api_summary['total_series']}")
    print(f"  total_rows_fetched: {api_summary['total_rows_fetched']}")
    print(f"  total_rows_added: {api_summary['total_rows_added']}")
    print("  series:")
    for item in api_summary["series"]:
        line = (
            f"    - {item['product']} ({item['series']}): status={item['status']}, "
            f"fetched={item.get('rows_fetched', 0)}, added={item.get('rows_added', 0)}"
        )
        print(line)
        if item.get("warning"):
            print(f"      warning: {item['warning']}")
    print("")

    statuses = {item.get("status") for item in api_summary["series"]}
    fatal_statuses = {"error", "http_error"}
    if statuses and statuses.issubset({"not_found"}):
        return 1
    return 1 if statuses.intersection(fatal_statuses) else 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    output_dir = Path(args.output_dir)
    source_ids = resolve_sources(args)
    exit_code = 0

    if args.api_update:
        api_exit = perform_api_update(output_dir=output_dir, force_api=args.force_api)
        exit_code = max(exit_code, api_exit)

    if not source_ids:
        return exit_code

    print(f"Running ingest for {len(source_ids)} source(s)...\n")
    summaries: list[IngestSummary] = []
    for source_id in source_ids:
        summary = ingest_source(source_id=source_id, output_dir=output_dir)
        summaries.append(summary)
        print_summary(summary)

    failed = [s for s in summaries if s.rows == 0]
    if failed:
        print(f"Completed with {len(failed)} source(s) with zero rows.")
        return max(exit_code, 1)

    print("Ingest complete.")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
