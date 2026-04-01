from __future__ import annotations

from dataclasses import asdict, dataclass, field


@dataclass
class IngestSummary:
    source_id: str
    output_file: str
    rows: int
    start_date: str | None
    end_date: str | None
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, object]:
        return asdict(self)

