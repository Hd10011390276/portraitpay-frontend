#!/usr/bin/env python3
"""Vercel Email Debug Skill - Validation Script"""

import os
import sys
from pathlib import Path

def validate_skill(skill_dir):
    errors = []
    warnings = []

    # Check required files
    required = ['SKILL.md', 'references/detailed-debug-guide.md']
    for f in required:
        path = skill_dir / f
        if not path.exists():
            errors.append(f"Missing required file: {f}")

    # Check SKILL.md format
    skill_md = skill_dir / 'SKILL.md'
    if skill_md.exists():
        try:
            content = skill_md.read_text(encoding='utf-8')
        except:
            content = ""

        if not content.startswith('---'):
            errors.append("SKILL.md must start with YAML frontmatter")
        if 'name:' not in content:
            errors.append("SKILL.md missing 'name:' field")
        if 'description:' not in content:
            errors.append("SKILL.md missing 'description:' field")
        if '/vercel-email-debug-skill' not in content:
            errors.append("SKILL.md missing trigger '/vercel-email-debug-skill'")

        lines = content.split('\n')
        if len(lines) > 500:
            warnings.append(f"SKILL.md is {len(lines)} lines (recommended: <500)")

    # Check directory name
    if skill_dir.name != 'vercel-email-debug-skill':
        errors.append(f"Directory must be named 'vercel-email-debug-skill'")

    if errors:
        print("FAIL - Validation FAILED:")
        for e in errors:
            print(f"  - {e}")
        return False

    if warnings:
        print("WARN - Warnings:")
        for w in warnings:
            print(f"  - {w}")

    print("PASS - Validation PASSED")
    print(f"   Skill: vercel-email-debug-skill")
    print(f"   Location: {skill_dir}")
    return True

if __name__ == '__main__':
    skill_dir = Path(__file__).parent.parent
    success = validate_skill(skill_dir)
    sys.exit(0 if success else 1)