from __future__ import annotations

import pandas as pd


def _prep(df: pd.DataFrame, value_col: str) -> pd.DataFrame:
    out = df.copy()
    out["date"] = pd.to_datetime(out["date"], errors="coerce")
    out[value_col] = pd.to_numeric(out["value"], errors="coerce")
    out = out.dropna(subset=["date", "product", value_col])
    out = out[["date", "product", value_col]].drop_duplicates(subset=["date", "product"])
    return out


def analyze_pricing_strategy(opis_df: pd.DataFrame, inventory_df: pd.DataFrame) -> dict[str, object]:
    opis = _prep(opis_df, "opis_price")
    inventory = _prep(inventory_df, "cost_basis_price")

    merged = opis.merge(inventory, on=["date", "product"], how="inner")
    if merged.empty:
        return {
            "overall_recommendation": "insufficient_data",
            "products": {},
            "spread_table": pd.DataFrame(columns=["date", "product", "spread", "spread_pct", "spread_30d_avg"]),
        }

    merged["spread"] = merged["cost_basis_price"] - merged["opis_price"]
    merged["spread_pct"] = (merged["spread"] / merged["opis_price"]) * 100.0
    merged = merged.sort_values(["product", "date"])
    merged["spread_30d_avg"] = merged.groupby("product")["spread"].transform(lambda s: s.rolling(30, min_periods=5).mean())

    product_summary: dict[str, object] = {}
    recommendation_votes: list[str] = []
    for product, group in merged.groupby("product"):
        latest = group.iloc[-1]
        avg_spread_pct = float(group["spread_pct"].tail(30).mean())
        recommendation = "cost_plus" if avg_spread_pct > 0 else "opis_plus"
        recommendation_votes.append(recommendation)

        product_summary[product] = {
            "latest_date": str(latest["date"].date()),
            "latest_opis_price": float(latest["opis_price"]),
            "latest_cost_basis_price": float(latest["cost_basis_price"]),
            "latest_spread": float(latest["spread"]),
            "latest_spread_pct": float(latest["spread_pct"]),
            "avg_spread_pct_30d": avg_spread_pct,
            "recommended_strategy": recommendation,
        }

    overall = "cost_plus" if recommendation_votes.count("cost_plus") > recommendation_votes.count("opis_plus") else "opis_plus"
    return {
        "overall_recommendation": overall,
        "products": product_summary,
        "spread_table": merged[["date", "product", "spread", "spread_pct", "spread_30d_avg"]].copy(),
    }

