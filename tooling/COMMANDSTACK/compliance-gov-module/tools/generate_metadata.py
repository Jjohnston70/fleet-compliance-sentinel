#!/usr/bin/env python3
"""
Generate metadata JSON files for all markdown files in the compliance module.

For each .md file, creates a _meta.json companion with:
- title: from first H1 or first line
- category: parent directory name
- description: first paragraph after title (first 200 chars)
- tags: framework references (NIST, SOC 2, ISO 27001, HIPAA, GDPR, CCPA, FedRAMP, CMMC, CUI, FOIA, FAR, PII, PHI)
- difficulty: based on category
- frameworks: list of compliance frameworks referenced
- template_id: filename without extension
- skill: parent directory name
"""

import os
import json
import re
from pathlib import Path
from collections import defaultdict

# Configuration
DATA_DIR = "/sessions/festive-great-maxwell/mnt/00_FEDERAL-COMPLIANCE-TEMPLATE/compliance-gov-module/data/original_content"

# Difficulty mapping based on category/skill
DIFFICULTY_MAP = {
    "security-governance": "foundational",
    "compliance-usage": "foundational",
    "internal-compliance": "intermediate",
    "data-handling-privacy": "intermediate",
    "business-operations": "intermediate",
    "government-contracting": "advanced",
    "contracts-risk-assurance": "advanced",
    "cloud-platform-security": "advanced",
    "compliance-audit": "advanced",
    "compliance-research": "intermediate",
    "shared-reference": "intermediate",
}

# Framework keywords to search for
FRAMEWORKS = {
    "NIST CSF": r"\bNIST\s+CSF\b|\bNIST\s+Cybersecurity\s+Framework\b",
    "NIST 800-53": r"\bNIST\s+800[\-\.]53\b|\b800[\-\.]53\b",
    "NIST 800-171": r"\bNIST\s+800[\-\.]171\b|\b800[\-\.]171\b",
    "ISO 27001": r"\bISO\s+27001\b|\bISO/IEC\s+27001\b",
    "SOC 2": r"\bSOC\s+2\b|\bSOC2\b",
    "FedRAMP": r"\bFedRAMP\b",
    "HIPAA": r"\bHIPAA\b",
    "GDPR": r"\bGDPR\b",
    "CCPA": r"\bCCPA\b",
    "CMMC": r"\bCMMC\b",
}

# Tag keywords
TAG_KEYWORDS = {
    "NIST": r"\bNIST\b",
    "SOC 2": r"\bSOC\s+2\b|\bSOC2\b",
    "ISO 27001": r"\bISO\s+27001\b",
    "HIPAA": r"\bHIPAA\b",
    "GDPR": r"\bGDPR\b",
    "CCPA": r"\bCCPA\b",
    "FedRAMP": r"\bFedRAMP\b",
    "CMMC": r"\bCMMC\b",
    "CUI": r"\bCUI\b(?!\S)",  # Controlled Unclassified Information
    "FOIA": r"\bFOIA\b",
    "FAR": r"\bFAR\b(?!\S)",  # Federal Acquisition Regulation
    "PII": r"\bPII\b(?!\S)",  # Personally Identifiable Information
    "PHI": r"\bPHI\b(?!\S)",  # Protected Health Information
}


def extract_title(content):
    """Extract title from first H1 or first line of content."""
    lines = content.split('\n')

    for line in lines:
        # Look for H1 markdown
        if line.startswith('# '):
            return line[2:].strip()
        # Look for title-like content in first few lines
        stripped = line.strip()
        if stripped and not stripped.startswith('[') and len(stripped) > 3:
            return stripped

    return "Untitled"


def extract_description(content):
    """Extract first paragraph after title (first 200 chars)."""
    lines = content.split('\n')

    # Skip title line and empty lines
    in_content = False
    description_lines = []

    for line in lines:
        stripped = line.strip()

        # Skip title
        if line.startswith('# '):
            continue

        # Skip empty lines until we find content
        if not in_content and not stripped:
            continue

        if stripped:
            in_content = True
            description_lines.append(stripped)
        elif in_content:
            # Stop at first blank line after starting content
            break

    description = ' '.join(description_lines)
    return description[:200] if description else ""


def extract_tags(content):
    """Extract framework tags from content."""
    tags = set()

    for tag, pattern in TAG_KEYWORDS.items():
        if re.search(pattern, content, re.IGNORECASE):
            tags.add(tag)

    return sorted(list(tags))


def extract_frameworks(content):
    """Extract compliance frameworks from content."""
    frameworks = []

    for framework, pattern in FRAMEWORKS.items():
        if re.search(pattern, content, re.IGNORECASE):
            frameworks.append(framework)

    return sorted(list(set(frameworks)))


def get_difficulty(skill_name):
    """Get difficulty level based on skill/category."""
    return DIFFICULTY_MAP.get(skill_name, "intermediate")


def generate_metadata(md_path, skill_name):
    """Generate metadata for a single markdown file."""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {md_path}: {e}")
        return None

    # Extract components
    title = extract_title(content)
    description = extract_description(content)
    tags = extract_tags(content)
    frameworks = extract_frameworks(content)
    template_id = Path(md_path).stem

    # Build metadata
    metadata = {
        "title": title,
        "category": skill_name,
        "description": description,
        "tags": tags,
        "difficulty": get_difficulty(skill_name),
        "frameworks": frameworks,
        "template_id": template_id,
        "skill": skill_name,
    }

    return metadata


def main():
    """Walk through directory and generate metadata files."""

    stats = defaultdict(int)
    total_created = 0

    # Walk through all directories
    for root, dirs, files in os.walk(DATA_DIR):
        for filename in files:
            if filename.endswith('.md'):
                md_path = os.path.join(root, filename)

                # Get the skill name (first level subdirectory)
                rel_path = os.path.relpath(md_path, DATA_DIR)
                parts = rel_path.split(os.sep)

                # Skip root-level .md files like LIFECYCLE.md, PLAYBOOK.md, README.md
                if len(parts) == 1:
                    continue

                skill_name = parts[0]

                # Generate metadata
                metadata = generate_metadata(md_path, skill_name)

                if metadata:
                    # Create output path for _meta.json
                    meta_path = md_path.replace('.md', '_meta.json')

                    # Write metadata file
                    try:
                        with open(meta_path, 'w', encoding='utf-8') as f:
                            json.dump(metadata, f, indent=2, ensure_ascii=False)

                        stats[skill_name] += 1
                        total_created += 1
                        print(f"Created: {meta_path}")
                    except Exception as e:
                        print(f"Error writing {meta_path}: {e}")

    # Print summary
    print("\n" + "="*60)
    print("METADATA GENERATION SUMMARY")
    print("="*60)

    for skill in sorted(stats.keys()):
        count = stats[skill]
        print(f"{skill:<35} {count:>3} files")

    print("-"*60)
    print(f"{'TOTAL':<35} {total_created:>3} files")
    print("="*60)


if __name__ == "__main__":
    main()
