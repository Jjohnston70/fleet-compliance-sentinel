from dataclasses import dataclass, field
from typing import Literal


DatasetKind = Literal["csv", "worksheet", "config_sheet"]


@dataclass(frozen=True)
class TargetAssignment:
    collection: str
    field: str
    transform: str = "identity"
    required: bool = False
    notes: str = ""


@dataclass(frozen=True)
class ColumnMapping:
    source_column: str
    assignments: tuple[TargetAssignment, ...] = field(default_factory=tuple)
    ignore: bool = False
    ignore_reason: str = ""


@dataclass(frozen=True)
class DerivedMapping:
    source_columns: tuple[str, ...]
    collection: str
    field: str
    transform: str
    required: bool = False
    notes: str = ""


@dataclass(frozen=True)
class ConfigEntryMapping:
    setting_key: str
    assignment: TargetAssignment


@dataclass(frozen=True)
class DatasetMapping:
    key: str
    kind: DatasetKind
    source_path: str
    worksheet: str | None = None
    notes: str = ""
    merge_key: str | None = None
    column_mappings: tuple[ColumnMapping, ...] = field(default_factory=tuple)
    derived_mappings: tuple[DerivedMapping, ...] = field(default_factory=tuple)
    config_entry_mappings: tuple[ConfigEntryMapping, ...] = field(default_factory=tuple)
