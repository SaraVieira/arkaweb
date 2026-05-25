#!/usr/bin/env python3
"""
Extract every fenced code block from SNIPPETS.md and emit Zed snippet JSONs.

For each code block:
- Look backwards a few hundred chars for the most recent `src/...` path mention.
- That determines the target file (and snippet scope via its extension).
- If no path is mentioned in-range, default to `src/App.tsx` (early beats).
- Track which beat heading (## Beat N or ### Na) the block sits under.

Output: ~/.config/zed/snippets/<scope>.json
Merges with any existing snippets (overwrites colliding keys).
"""
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SNIPPETS_MD = REPO / "SNIPPETS.md"
OUT_DIR = Path.home() / ".config" / "zed" / "snippets"

EXT_TO_SCOPE = {
    "ts": "typescript",
    "tsx": "tsx",
    "js": "javascript",
    "jsx": "jsx",
    "json": "json",
    "md": "markdown",
    "css": "css",
    "html": "html",
}

# Any fenced code block.
CODE_BLOCK = re.compile(r"```(\w*)\n(.*?)\n```", re.DOTALL)
# Match either `src/path.ext` or shorthand like `App.tsx`.
PATH_REF = re.compile(r"`(src/[^`]+\.[a-zA-Z]+|[A-Za-z][\w-]*\.(?:tsx?|jsx?|json|css))`")
# Verbs that signal "the code block applies to this path".
ACTION_PATH = re.compile(
    r"(?:Paste\s*→\s*|Edit\s+|Replace\s+→?\s*|Append\s+to\s+|"
    r"Open\s+the\s+empty\s+|paste\s+|Type\s+this\s+live\s+into\s+|Then\s+in\s+|"
    r"add\s+to\s+|inside\s+the\s+)"
    r"`(src/[^`]+\.[a-zA-Z]+|[A-Za-z][\w-]*\.(?:tsx?|jsx?|json|css))`",
    re.IGNORECASE,
)
BEAT_HEADER = re.compile(r"^##\s+Beat\s+(\d+)\b", re.MULTILINE)
SUB_HEADER = re.compile(r"^###\s+(\d+[a-z])\b", re.MULTILINE)

DEFAULT_PATH = "src/App.tsx"
LOOKBACK = 600  # chars before a block to scan for a path reference
SKIP_LANGS = {"bash", "sh", "shell", "console", "text", "diff"}


def normalize_path(p: str) -> str:
    return p if "/" in p else f"src/{p}"


def find_beat(pos: int, beat_positions: list[tuple[int, str]]) -> str:
    current = "?"
    for start, label in beat_positions:
        if start < pos:
            current = label
        else:
            break
    return current


def main() -> None:
    text = SNIPPETS_MD.read_text()

    beat_positions: list[tuple[int, str]] = []
    for m in BEAT_HEADER.finditer(text):
        beat_positions.append((m.start(), m.group(1)))
    for m in SUB_HEADER.finditer(text):
        beat_positions.append((m.start(), m.group(1)))
    beat_positions.sort()

    by_scope: dict[str, dict] = {}
    counters: dict[tuple[str, str], int] = {}
    skipped = 0

    for m in CODE_BLOCK.finditer(text):
        lang = m.group(1).lower()
        code = m.group(2)
        if not code.strip() or lang in SKIP_LANGS:
            skipped += 1
            continue

        pos = m.start()
        preceding = text[max(0, pos - LOOKBACK):pos]
        # Prefer action-verb paths (Paste/Edit/Then in/etc.) over passive mentions.
        action_paths = ACTION_PATH.findall(preceding)
        if action_paths:
            path = normalize_path(action_paths[-1])
        else:
            paths = PATH_REF.findall(preceding)
            path = normalize_path(paths[-1]) if paths else DEFAULT_PATH

        ext = path.rsplit(".", 1)[-1].lower()
        scope = EXT_TO_SCOPE.get(ext, ext)

        beat = find_beat(pos, beat_positions)

        filename = path.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        short = re.sub(r"[^a-z0-9]", "", filename.lower())

        key = (beat, short)
        counters[key] = counters.get(key, 0) + 1
        n = counters[key]
        suffix = "" if n == 1 else chr(ord("a") + n - 1)

        prefix = f"tk{beat}{short}{suffix}"
        title = f"Beat {beat} — {path}" + (f" ({n})" if n > 1 else "")

        # Escape Zed/VS Code snippet placeholders so the paste is literal.
        body_lines = code.replace("\\", "\\\\").replace("$", "\\$").split("\n")

        by_scope.setdefault(scope, {})[title] = {
            "prefix": prefix,
            "body": body_lines,
            "description": f"Talk beat {beat}: {path}",
        }

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    total = 0
    for scope, snippets in by_scope.items():
        out_file = OUT_DIR / f"{scope}.json"
        merged: dict = {}
        if out_file.exists():
            try:
                merged = json.loads(out_file.read_text())
            except json.JSONDecodeError:
                print(f"  warn: {out_file} was not valid JSON, overwriting")
                merged = {}
        merged.update(snippets)
        out_file.write_text(json.dumps(merged, indent=2) + "\n")
        print(f"  {scope:12s} ← {len(snippets):3d} snippets → {out_file}")
        total += len(snippets)

    print(f"\nwrote {total} snippets across {len(by_scope)} scopes ({skipped} empty blocks skipped)")
    print("in Zed: open the target file, type the prefix, hit Tab to expand")


if __name__ == "__main__":
    main()
