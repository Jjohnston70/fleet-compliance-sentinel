#!/usr/bin/env python3
"""
parse-assessment.py
Extracts assessment questions from training markdown files and outputs
structured JSON. One assessment JSON file per training module.

Usage:
  python tools/parse-assessment.py                           # all modules
  python tools/parse-assessment.py TNDS-HZ-000               # single module
  python tools/parse-assessment.py --input-dir path/to/md     # custom input
  python tools/parse-assessment.py --dry-run                  # preview only
"""

import argparse
import json
import os
import re
import sys
import yaml
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class AssessmentOption:
    label: str        # "A", "B", "C", "D"
    text: str
    is_correct: bool


@dataclass
class AssessmentQuestion:
    number: int
    question_type: str          # multiple_choice | true_false | scenario
    question_text: str
    options: list               # list of AssessmentOption dicts
    correct_answer: str         # "A", "B", "True", "False", etc.
    explanation: str
    cfr_reference: str


@dataclass
class TrainingAssessment:
    module_code: str
    title: str
    category: str
    cfr_reference: str
    phmsa_equivalent: str
    passing_score: int
    estimated_duration_minutes: int
    version: str
    question_count: int
    questions: list             # list of AssessmentQuestion dicts


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def parse_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter from markdown."""
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    return yaml.safe_load(match.group(1)) or {}


def parse_questions(content: str) -> list:
    """Extract assessment questions from the markdown body."""
    # Split on ### Q patterns
    question_blocks = re.split(r'\n### Q(\d+)\s*\n', content)
    # First element is everything before Q1 — skip it
    questions = []

    # question_blocks alternates: [pre-text, "1", block1, "2", block2, ...]
    for i in range(1, len(question_blocks), 2):
        q_num = int(question_blocks[i])
        block = question_blocks[i + 1] if i + 1 < len(question_blocks) else ""
        q = parse_single_question(q_num, block)
        if q:
            questions.append(q)

    return questions


def parse_single_question(number: int, block: str) -> Optional[dict]:
    """Parse one question block into an AssessmentQuestion dict."""
    lines = block.strip().split('\n')

    q_type = extract_field(lines, "Type")
    question_text = extract_field(lines, "Question")
    correct_answer = extract_field(lines, "Correct Answer")
    explanation = extract_field(lines, "Explanation")
    cfr_ref = extract_field(lines, "CFR Reference")

    if not question_text:
        return None

    # Parse options based on type
    options = []
    if q_type in ("multiple_choice", "scenario"):
        for label in ("A", "B", "C", "D", "E"):
            opt_text = extract_field(lines, label)
            if opt_text:
                # Support both formats:
                # Format 1: **Correct Answer**: B
                # Format 2: **B**: Some text (correct)
                is_correct_inline = opt_text.rstrip().endswith("(correct)")
                if is_correct_inline:
                    opt_text = re.sub(r'\s*\(correct\)\s*$', '', opt_text)
                is_correct = is_correct_inline or (
                    correct_answer is not None and correct_answer.strip().upper() == label
                )
                options.append(asdict(AssessmentOption(
                    label=label,
                    text=opt_text,
                    is_correct=is_correct,
                )))
        # Derive correct_answer from inline marker if not explicitly set
        if correct_answer is None:
            for opt in options:
                if opt['is_correct']:
                    correct_answer = opt['label']
                    break
    elif q_type == "true_false":
        if correct_answer is None:
            correct_answer = ""
        for label in ("True", "False"):
            is_correct = correct_answer.strip().lower() == label.lower()
            options.append(asdict(AssessmentOption(
                label=label,
                text=label,
                is_correct=is_correct,
            )))

    return asdict(AssessmentQuestion(
        number=number,
        question_type=q_type or "multiple_choice",
        question_text=question_text,
        options=options,
        correct_answer=correct_answer or "",
        explanation=explanation or "",
        cfr_reference=cfr_ref or "",
    ))


def extract_field(lines: list, field_name: str) -> Optional[str]:
    """Extract a **Field**: value from lines."""
    pattern = re.compile(r'^\*\*' + re.escape(field_name) + r'\*\*:\s*(.+)$')
    for line in lines:
        m = pattern.match(line.strip())
        if m:
            return m.group(1).strip()
    return None


def parse_module(filepath: Path) -> Optional[dict]:
    """Parse a single training markdown file into a TrainingAssessment dict."""
    content = filepath.read_text(encoding='utf-8')
    meta = parse_frontmatter(content)

    if not meta.get('module_code'):
        print(f"  SKIP {filepath.name}: no module_code in frontmatter")
        return None

    questions = parse_questions(content)
    if not questions:
        print(f"  SKIP {filepath.name}: no assessment questions found")
        return None

    assessment = TrainingAssessment(
        module_code=meta.get('module_code', ''),
        title=meta.get('title', ''),
        category=meta.get('category', ''),
        cfr_reference=meta.get('cfr_reference', ''),
        phmsa_equivalent=meta.get('phmsa_equivalent', ''),
        passing_score=meta.get('passing_score', 80),
        estimated_duration_minutes=meta.get('estimated_duration_minutes', 30),
        version=meta.get('version', '1.0'),
        question_count=len(questions),
        questions=questions,
    )
    return asdict(assessment)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Extract assessment questions from training markdown into JSON."
    )
    parser.add_argument(
        "module", nargs="?", default=None,
        help="Specific module code to parse (e.g. TNDS-HZ-000). Omit for all."
    )
    parser.add_argument(
        "--input-dir", default=None,
        help="Input directory containing training markdown files."
    )
    parser.add_argument(
        "--output-dir", default=None,
        help="Output directory for assessment JSON files."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview parsed output without writing files."
    )
    args = parser.parse_args()

    # Resolve paths relative to repo root
    repo_root = Path(__file__).resolve().parent.parent
    input_dir = Path(args.input_dir) if args.input_dir else repo_root / "knowledge" / "training-content" / "hazmat"
    output_dir = Path(args.output_dir) if args.output_dir else repo_root / "knowledge" / "training-content" / "assessments"

    if not input_dir.exists():
        print(f"ERROR: Input directory not found: {input_dir}")
        sys.exit(1)

    # Collect markdown files
    if args.module:
        # Find file matching module code
        matches = list(input_dir.glob(f"{args.module}*.md"))
        if not matches:
            print(f"ERROR: No markdown file found for module '{args.module}' in {input_dir}")
            sys.exit(1)
        md_files = matches
    else:
        md_files = sorted(input_dir.glob("TNDS-HZ-*.md"))

    if not md_files:
        print(f"ERROR: No TNDS-HZ-*.md files found in {input_dir}")
        sys.exit(1)

    print(f"Parsing {len(md_files)} training module(s) from {input_dir}\n")

    results = []
    errors = []

    for md_file in md_files:
        print(f"  Parsing {md_file.name}...", end=" ")
        try:
            assessment = parse_module(md_file)
            if assessment:
                results.append(assessment)
                print(f"OK ({assessment['question_count']} questions)")
            else:
                errors.append(md_file.name)
        except Exception as e:
            print(f"ERROR: {e}")
            errors.append(md_file.name)

    # Summary
    total_questions = sum(a['question_count'] for a in results)
    print(f"\nParsed: {len(results)}/{len(md_files)} modules, {total_questions} total questions")

    if errors:
        print(f"Errors: {', '.join(errors)}")

    if args.dry_run:
        print("\n--- DRY RUN: JSON preview ---")
        print(json.dumps(results, indent=2))
        return

    # Write output
    output_dir.mkdir(parents=True, exist_ok=True)

    # Individual assessment files per module
    for assessment in results:
        code = assessment['module_code']
        out_path = output_dir / f"{code}-assessment.json"
        out_path.write_text(json.dumps(assessment, indent=2), encoding='utf-8')
        print(f"  Wrote {out_path.name}")

    # Combined manifest
    manifest = {
        "generated_at": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),
        "total_modules": len(results),
        "total_questions": total_questions,
        "modules": [
            {
                "module_code": a['module_code'],
                "title": a['title'],
                "phmsa_equivalent": a['phmsa_equivalent'],
                "question_count": a['question_count'],
                "passing_score": a['passing_score'],
            }
            for a in results
        ]
    }
    manifest_path = output_dir / "assessment-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f"  Wrote {manifest_path.name}")

    print(f"\nDone. {len(results)} assessments written to {output_dir}")


if __name__ == "__main__":
    main()
