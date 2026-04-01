#!/usr/bin/env python
"""
CFR DOT Regulation Scraper
True North Data Strategies
Pulls Title 49 CFR parts relevant to DOT compliance
and saves each as a clean markdown file for Penny / NotebookLM

Parts covered:
  40  - DOT Drug Testing Procedures
  172 - Hazardous Materials Communications & Emergency Response
  360 - FMCSA Administrative Rules & Fees
  365 - Operating Authority Registration
  367 - Application Fees for Operating Authority
  382 - Drug & Alcohol Testing
  383 - CDL Standards
  384 - State CDL Compliance
  387 - Insurance & Financial Responsibility
  391 - Driver Qualifications & Medical
  395 - Hours of Service & ELD
  396 - Vehicle Inspection & Maintenance
  397 - Transportation of Hazardous Materials; Driving and Parking Rules

Usage:
  pip install requests beautifulsoup4 html2text
  python cfr_dot_scraper.py
"""

import requests
import html2text
import time
import os
from bs4 import BeautifulSoup

# ── Output directory ──────────────────────────────────────────────
OUTPUT_DIR = "cfr_dot_markdown"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Parts to scrape ───────────────────────────────────────────────
PARTS = [
    {
        "part": "40",
        "title": "DOT Drug and Alcohol Testing Procedures",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-A/part-40",
        "filename": "cfr-part-040-drug-alcohol-testing.md",
        "agency": "FMCSA",
    },
    {
        "part": "172",
        "title": "Hazardous Materials Table, Special Provisions, Hazardous Materials Communications, Emergency Response Information, and Training Requirements",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-172",
        "filename": "cfr-part-172-hazardous-materials-communications.md",
        "agency": "PHMSA",
    },
    {
        "part": "360",
        "title": "FMCSA Fees for Registration-Related Activities",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-A/part-360",
        "filename": "cfr-part-360-fmcsa-fees.md",
        "agency": "FMCSA",
    },
    {
        "part": "365",
        "title": "Rules Governing Applications for Operating Authority",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-A/part-365",
        "filename": "cfr-part-365-operating-authority.md",
        "agency": "FMCSA",
    },
    {
        "part": "367",
        "title": "Standards for Registration of Foreign Motor Carriers and Brokers",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-A/part-367",
        "filename": "cfr-part-367-foreign-registration.md",
        "agency": "FMCSA",
    },
    {
        "part": "382",
        "title": "Controlled Substances and Alcohol Use and Testing",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382",
        "filename": "cfr-part-382-controlled-substances.md",
        "agency": "FMCSA",
    },
    {
        "part": "383",
        "title": "Commercial Driver's License Standards Requirements and Penalties",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-383",
        "filename": "cfr-part-383-cdl-standards.md",
        "agency": "FMCSA",
    },
    {
        "part": "384",
        "title": "State Compliance with Commercial Driver's License Program",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-384",
        "filename": "cfr-part-384-state-cdl-compliance.md",
        "agency": "FMCSA",
    },
    {
        "part": "387",
        "title": "Minimum Levels of Financial Responsibility for Motor Carriers",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-387",
        "filename": "cfr-part-387-financial-responsibility.md",
        "agency": "FMCSA",
    },
    {
        "part": "391",
        "title": "Qualifications of Drivers and Longer Combination Vehicle Operators",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391",
        "filename": "cfr-part-391-driver-qualifications.md",
        "agency": "FMCSA",
    },
    {
        "part": "395",
        "title": "Hours of Service of Drivers",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-395",
        "filename": "cfr-part-395-hours-of-service.md",
        "agency": "FMCSA",
    },
    {
        "part": "396",
        "title": "Inspection Repair and Maintenance",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396",
        "filename": "cfr-part-396-inspection-maintenance.md",
        "agency": "FMCSA",
    },
    {
        "part": "397",
        "title": "Transportation of Hazardous Materials; Driving and Parking Rules",
        "url": "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-397",
        "filename": "cfr-part-397-hazardous-materials-driving.md",
        "agency": "FMCSA",
    },
]

# ── HTML to Markdown converter config ────────────────────────────
def get_converter():
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = True
    h.ignore_tables = False
    h.body_width = 0          # no line wrapping
    h.unicode_snob = True
    h.mark_code = True
    return h


# ── Scrape one part ───────────────────────────────────────────────
def scrape_part(part_info, converter):
    print(f"  Fetching Part {part_info['part']}: {part_info['title']}...")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        response = requests.get(part_info["url"], headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  ERROR fetching Part {part_info['part']}: {e}")
        return False

    soup = BeautifulSoup(response.text, "html.parser")

    # eCFR renders regulation content inside #enhanced-content or .content-container
    content = (
        soup.find(id="enhanced-content")
        or soup.find(class_="content-container")
        or soup.find("main")
        or soup.find("article")
        or soup.body
    )

    if not content:
        print(f"  WARNING: Could not find main content for Part {part_info['part']}")
        content = soup

    # Remove nav, header, footer, sidebar noise
    for tag in content.find_all(
        ["nav", "header", "footer", "script", "style", "aside", "button"]
    ):
        tag.decompose()

    # html2text exposes `handle()` in current releases; keep a fallback for older APIs.
    if hasattr(converter, "handle"):
        raw_md = converter.handle(str(content))
    else:
        raw_md = converter.convert(str(content))

    # ── Clean up the markdown ─────────────────────────────────────
    lines = raw_md.splitlines()
    cleaned = []
    prev_blank = False

    for line in lines:
        stripped = line.strip()

        # Skip navigation artifacts
        if stripped in ("", ):
            if not prev_blank:
                cleaned.append("")
            prev_blank = True
            continue

        # Skip pure URL lines that are nav leftovers
        if stripped.startswith("http") and len(stripped.split()) == 1:
            continue

        cleaned.append(line)
        prev_blank = False

    markdown_body = "\n".join(cleaned).strip()

    # ── Build final document with metadata header ─────────────────
    metadata = f"""# 49 CFR Part {part_info['part']} — {part_info['title']}

**Source:** {part_info['url']}  
**Title:** 49 — Transportation  
**Agency:** {part_info.get('agency', 'FMCSA')}  
**Last scraped:** {time.strftime('%Y-%m-%d')}  
**Purpose:** DOT compliance reference for Fleet-Compliance Sentinel / Pipeline Penny knowledge base

---

{markdown_body}
"""

    output_path = os.path.join(OUTPUT_DIR, part_info["filename"])
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(metadata)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Saved: {part_info['filename']} ({size_kb:.1f} KB)")
    return True


# ── Index file ────────────────────────────────────────────────────
def write_index(results):
    lines = [
        "# DOT CFR Regulation Knowledge Base",
        "",
        "**True North Data Strategies — Fleet-Compliance Sentinel Compliance Reference**  ",
        f"**Generated:** {time.strftime('%Y-%m-%d')}  ",
        "**Source:** https://www.ecfr.gov — Title 49, Transportation  ",
        "",
        "---",
        "",
        "## Parts Included",
        "",
    ]

    for part_info, success in zip(PARTS, results):
        status = "OK" if success else "FAILED"
        lines.append(
            f"- [{status}] **Part {part_info['part']}** — {part_info['title']}  "
        )
        lines.append(f"  File: `{part_info['filename']}`  ")
        lines.append(f"  Source: {part_info['url']}  ")
        lines.append("")

    lines += [
        "---",
        "",
        "## Part Summaries",
        "",
        "### Administrative (360, 365, 367)",
        "- **Part 360** — FMCSA fees and registration-related administrative rules",
        "- **Part 365** — Rules governing applications for motor carrier operating authority",
        "- **Part 367** — Registration standards for foreign motor carriers and brokers",
        "",
        "### Driver & CDL (382, 383, 384, 391)",
        "- **Part 382** — Controlled substances and alcohol testing requirements for CDL drivers",
        "- **Part 383** — CDL standards, requirements, and penalties",
        "- **Part 384** — State compliance with the federal CDL program",
        "- **Part 391** — Driver qualification standards including medical requirements",
        "",
        "### Hazmat Communications & Emergency Response (172, 397)",
        "- **Part 172** — Hazmat shipping papers, markings, labels, placards, emergency response info, and hazmat training",
        "- **Part 397** — Hazardous materials driving and parking rules",
        "",
        "### Operations & Safety (40, 387, 395, 396)",
        "- **Part 40**  — DOT drug and alcohol testing procedures (all modes)",
        "- **Part 387** — Minimum financial responsibility / insurance requirements",
        "- **Part 395** — Hours of service, ELD, and fatigue management",
        "- **Part 396** — Vehicle inspection, repair, and maintenance",
        "",
        "---",
        "",
        "## Usage",
        "",
        "### NotebookLM",
        "Upload each `.md` file as a source, or paste the eCFR URLs directly.",
        "",
        "### Pipeline Penny",
        "Load each `.md` file into Penny's knowledge base under a `DOT Compliance` category.",
        "",
        "### Fleet-Compliance Sentinel Dashboard",
        "Link to the NotebookLM shared notebook from the dashboard toolbar.",
        "",
        "---",
        "",
        "*Public domain — 49 CFR is U.S. federal regulation, no copyright restrictions.*",
    ]

    index_path = os.path.join(OUTPUT_DIR, "INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n  Index written: INDEX.md")


# ── Main ──────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  CFR DOT Regulation Scraper")
    print("  True North Data Strategies")
    print("=" * 60)
    print(f"\n  Output directory: {OUTPUT_DIR}/")
    print(f"  Parts to fetch: {len(PARTS)}\n")

    converter = get_converter()
    results = []

    for i, part_info in enumerate(PARTS):
        success = scrape_part(part_info, converter)
        results.append(success)

        # Be polite to the server — pause between requests
        if i < len(PARTS) - 1:
            print("  Waiting 3 seconds...")
            time.sleep(3)

    write_index(results)

    succeeded = sum(results)
    failed = len(results) - succeeded

    print("\n" + "=" * 60)
    print(f"  Done. {succeeded} succeeded, {failed} failed.")
    print(f"  Files saved to: ./{OUTPUT_DIR}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
