#!/usr/bin/env python3
"""
training-to-deck.py
Converts training markdown files into DeckRecord-compatible slide JSON
for the web-based deck viewer component.

Splits markdown on ## headings to create slides. Maps YAML frontmatter
to deck metadata. Outputs one JSON file per module.

Usage:
  python tools/training-to-deck.py                           # all modules
  python tools/training-to-deck.py TNDS-HZ-000               # single module
  python tools/training-to-deck.py --dry-run                  # preview only
"""

import argparse
import json
import re
import sys
import yaml
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# TNDS Training Theme
# ---------------------------------------------------------------------------

TNDS_THEME = {
    "id": "tnds-training",
    "name": "TNDS Training",
    "colors": {
        "primary": "#0F2B46",         # Navy
        "secondary": "#1A7A7A",       # Teal
        "accent": "#F59E0B",          # Amber (warnings/highlights)
        "background": "#FFFFFF",
        "surface": "#F8FAFC",
        "text": "#1E293B",
        "text_secondary": "#64748B",
        "success": "#10B981",
        "error": "#EF4444",
    },
    "slide_types": {
        "title": {"bg": "#0F2B46", "text": "#FFFFFF"},
        "objectives": {"bg": "#1A7A7A", "text": "#FFFFFF"},
        "content": {"bg": "#FFFFFF", "text": "#1E293B"},
        "section_divider": {"bg": "#0F2B46", "text": "#F59E0B"},
        "key_takeaways": {"bg": "#1A7A7A", "text": "#FFFFFF"},
        "assessment_intro": {"bg": "#0F2B46", "text": "#FFFFFF"},
    }
}


# ---------------------------------------------------------------------------
# Data model (DeckRecord schema)
# ---------------------------------------------------------------------------

def make_slide(
    slide_number: int,
    slide_type: str,
    title: str,
    content: str,
    notes: str = "",
    bullet_points: list = None,
) -> dict:
    """Create a single slide record."""
    return {
        "slide_number": slide_number,
        "slide_type": slide_type,
        "title": title,
        "content": content,
        "notes": notes,
        "bullet_points": bullet_points or [],
    }


def make_deck(meta: dict, slides: list) -> dict:
    """Create a full DeckRecord."""
    return {
        "module_code": meta.get("module_code", ""),
        "title": meta.get("title", ""),
        "category": meta.get("category", ""),
        "cfr_reference": meta.get("cfr_reference", ""),
        "phmsa_equivalent": meta.get("phmsa_equivalent", ""),
        "estimated_duration_minutes": meta.get("estimated_duration_minutes", 30),
        "passing_score": meta.get("passing_score", 80),
        "version": meta.get("version", "1.0"),
        "created": meta.get("created", ""),
        "theme": TNDS_THEME,
        "slide_count": len(slides),
        "slides": slides,
    }


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def parse_frontmatter(content: str) -> tuple:
    """Extract YAML frontmatter and return (meta_dict, remaining_body)."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n?', content, re.DOTALL)
    if not match:
        return {}, content
    meta = yaml.safe_load(match.group(1)) or {}
    body = content[match.end():]
    return meta, body


def split_into_sections(body: str) -> list:
    """Split markdown body on ## headings into (heading, content) pairs."""
    # Split on lines starting with ##  (but not ### which are sub-sections)
    parts = re.split(r'\n(?=## [^#])', body)
    sections = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        # Extract heading
        heading_match = re.match(r'^##\s+(.+?)(?:\n|$)', part)
        if heading_match:
            heading = heading_match.group(1).strip()
            content = part[heading_match.end():].strip()
            sections.append((heading, content))
        elif part.startswith('# '):
            # Top-level heading (module title) — skip, used in title slide
            continue
        else:
            # Content before first ## heading
            sections.append(("", part))
    return sections


def extract_bullets(text: str) -> list:
    """Extract markdown bullet points from text."""
    bullets = []
    for line in text.split('\n'):
        line = line.strip()
        if line.startswith('- ') or line.startswith('* '):
            bullets.append(line[2:].strip())
    return bullets


def strip_assessment_section(body: str) -> str:
    """Remove Assessment Questions section from body (handled separately by parse-assessment.py)."""
    # Cut everything from "## Assessment Questions" onward
    match = re.search(r'\n## Assessment Questions', body)
    if match:
        return body[:match.start()]
    return body


def convert_module(filepath: Path) -> Optional[dict]:
    """Convert a single training markdown file to DeckRecord JSON."""
    content = filepath.read_text(encoding='utf-8')
    meta, body = parse_frontmatter(content)

    if not meta.get('module_code'):
        print(f"  SKIP {filepath.name}: no module_code in frontmatter")
        return None

    # Remove assessment section (separate pipeline)
    body = strip_assessment_section(body)

    sections = split_into_sections(body)
    slides = []
    slide_num = 0

    # Slide 1: Title slide
    slide_num += 1
    slides.append(make_slide(
        slide_number=slide_num,
        slide_type="title",
        title=meta.get("title", ""),
        content="",
        notes=f"PHMSA Equivalent: {meta.get('phmsa_equivalent', '')} | "
              f"CFR Reference: {meta.get('cfr_reference', '')} | "
              f"Estimated Duration: {meta.get('estimated_duration_minutes', 30)} minutes",
        bullet_points=[
            meta.get("phmsa_equivalent", ""),
            meta.get("cfr_reference", ""),
            f"Duration: {meta.get('estimated_duration_minutes', 30)} min",
            f"Passing Score: {meta.get('passing_score', 80)}%",
        ],
    ))

    for heading, content in sections:
        if not heading:
            continue

        # Determine slide type
        heading_lower = heading.lower()
        if "learning objectives" in heading_lower:
            slide_type = "objectives"
        elif "key takeaways" in heading_lower:
            slide_type = "key_takeaways"
        elif re.match(r'^section \d+', heading_lower):
            slide_type = "content"
        else:
            slide_type = "content"

        bullets = extract_bullets(content)

        # For long content sections, split into multiple slides
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

        if slide_type in ("objectives", "key_takeaways"):
            # Single slide with bullets
            slide_num += 1
            slides.append(make_slide(
                slide_number=slide_num,
                slide_type=slide_type,
                title=heading,
                content=content,
                bullet_points=bullets,
            ))
        elif len(paragraphs) > 4:
            # Long content section — create section divider + content slides
            slide_num += 1
            slides.append(make_slide(
                slide_number=slide_num,
                slide_type="section_divider",
                title=heading,
                content="",
            ))

            # Chunk paragraphs into slides of ~2-3 paragraphs each
            chunk_size = 3
            for i in range(0, len(paragraphs), chunk_size):
                chunk = paragraphs[i:i + chunk_size]
                chunk_text = '\n\n'.join(chunk)
                chunk_bullets = extract_bullets(chunk_text)
                slide_num += 1
                sub_title = heading if i == 0 else f"{heading} (cont.)"
                slides.append(make_slide(
                    slide_number=slide_num,
                    slide_type="content",
                    title=sub_title,
                    content=chunk_text,
                    bullet_points=chunk_bullets,
                ))
        else:
            # Normal content section — one slide
            slide_num += 1
            slides.append(make_slide(
                slide_number=slide_num,
                slide_type="content",
                title=heading,
                content=content,
                bullet_points=bullets,
            ))

    # Final slide: Assessment intro
    slide_num += 1
    slides.append(make_slide(
        slide_number=slide_num,
        slide_type="assessment_intro",
        title="Assessment",
        content=f"You have completed the training content for {meta.get('title', 'this module')}. "
                f"You will now take a short assessment to verify your understanding. "
                f"A score of {meta.get('passing_score', 80)}% or higher is required to pass.",
        bullet_points=[
            f"Passing score: {meta.get('passing_score', 80)}%",
            "Questions are drawn from the material covered in this module",
            "You may retake the assessment if needed",
        ],
    ))

    return make_deck(meta, slides)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Convert training markdown to DeckRecord slide JSON."
    )
    parser.add_argument(
        "module", nargs="?", default=None,
        help="Specific module code to convert (e.g. TNDS-HZ-000). Omit for all."
    )
    parser.add_argument(
        "--input-dir", default=None,
        help="Input directory containing training markdown files."
    )
    parser.add_argument(
        "--output-dir", default=None,
        help="Output directory for deck JSON files."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview slide counts without writing files."
    )
    args = parser.parse_args()

    # Resolve paths relative to repo root
    repo_root = Path(__file__).resolve().parent.parent
    input_dir = Path(args.input_dir) if args.input_dir else repo_root / "knowledge" / "training-content" / "hazmat"
    output_dir = Path(args.output_dir) if args.output_dir else repo_root / "knowledge" / "training-content" / "decks"

    if not input_dir.exists():
        print(f"ERROR: Input directory not found: {input_dir}")
        sys.exit(1)

    # Collect markdown files
    if args.module:
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

    print(f"Converting {len(md_files)} training module(s) from {input_dir}\n")

    results = []
    errors = []

    for md_file in md_files:
        print(f"  Converting {md_file.name}...", end=" ")
        try:
            deck = convert_module(md_file)
            if deck:
                results.append(deck)
                print(f"OK ({deck['slide_count']} slides)")
            else:
                errors.append(md_file.name)
        except Exception as e:
            print(f"ERROR: {e}")
            errors.append(md_file.name)

    # Summary
    total_slides = sum(d['slide_count'] for d in results)
    print(f"\nConverted: {len(results)}/{len(md_files)} modules, {total_slides} total slides")

    if errors:
        print(f"Errors: {', '.join(errors)}")

    if args.dry_run:
        print("\n--- DRY RUN: Slide count summary ---")
        for d in results:
            print(f"  {d['module_code']}: {d['slide_count']} slides")
        return

    # Write output
    output_dir.mkdir(parents=True, exist_ok=True)

    for deck in results:
        code = deck['module_code']
        out_path = output_dir / f"{code}-deck.json"
        out_path.write_text(json.dumps(deck, indent=2), encoding='utf-8')
        print(f"  Wrote {out_path.name}")

    # Combined manifest
    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "theme": "tnds-training",
        "total_modules": len(results),
        "total_slides": total_slides,
        "modules": [
            {
                "module_code": d['module_code'],
                "title": d['title'],
                "phmsa_equivalent": d['phmsa_equivalent'],
                "slide_count": d['slide_count'],
                "estimated_duration_minutes": d['estimated_duration_minutes'],
            }
            for d in results
        ]
    }
    manifest_path = output_dir / "deck-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f"  Wrote {manifest_path.name}")

    print(f"\nDone. {len(results)} decks written to {output_dir}")


if __name__ == "__main__":
    main()
