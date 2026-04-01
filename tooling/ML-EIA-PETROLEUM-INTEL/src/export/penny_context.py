from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def _safe_read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}


def build_penny_context(output_dir: Path, processed_dir: Path, max_chars: int = 8000) -> str:
    analysis = _safe_read_json(output_dir / "reports" / "analysis_snapshot.json")
    alerts = _safe_read_json(output_dir / "alerts" / "active_alerts.json")

    prices_file = processed_dir / "spot_prices_daily.csv"
    latest_prices = {}
    if prices_file.exists():
        df = pd.read_csv(prices_file)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["value"] = pd.to_numeric(df["value"], errors="coerce")
        df = df.dropna(subset=["date", "product", "value"]).sort_values(["product", "date"])
        latest = df.groupby("product", as_index=False).tail(1)
        latest_prices = {
            row["product"]: {"date": str(pd.to_datetime(row["date"]).date()), "value": float(row["value"])}
            for _, row in latest.iterrows()
        }

    lines: list[str] = []
    lines.append("Petroleum Market Intelligence Context")
    lines.append(f"Generated: {pd.Timestamp.utcnow().isoformat()}")
    lines.append("")

    regime = analysis.get("regime", {})
    if regime:
        lines.append("Market Regime:")
        lines.append(
            f"- Current: {regime.get('current_regime')} | Days in regime: {regime.get('days_in_regime')} "
            f"| Transition probability: {regime.get('transition_probability')}"
        )
        lines.append("")

    strategy = analysis.get("pricing_strategy", {})
    if strategy:
        lines.append("Pricing Strategy:")
        lines.append(f"- Overall recommendation: {strategy.get('overall_recommendation')}")
        for product, info in strategy.get("products", {}).items():
            spread_pct = info.get("latest_spread_pct")
            spread_pct_str = f"{spread_pct:.2f}" if isinstance(spread_pct, (int, float)) else "n/a"
            lines.append(
                f"- {product}: spread_pct={spread_pct_str} "
                f"| recommendation={info.get('recommended_strategy')}"
            )
        lines.append("")

    if latest_prices:
        lines.append("Latest Spot Prices:")
        for product, info in sorted(latest_prices.items()):
            lines.append(f"- {product}: {info['value']} ({info['date']})")
        lines.append("")

    alert_list = alerts.get("alerts", [])
    lines.append(f"Active Alerts ({len(alert_list)}):")
    for alert in alert_list[:10]:
        lines.append(f"- [{alert.get('severity')}] {alert.get('message')}")

    context = "\n".join(lines)
    if len(context) > max_chars:
        context = context[: max_chars - 50] + "\n\n[TRUNCATED]"
    return context
