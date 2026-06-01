#!/usr/bin/env python3
"""Global SessionStart hook.

Runs in every project. Injects git branch, dirty file count, and recent
commits into the session as additionalContext. Stdlib only.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_DIR = Path.home() / ".claude" / "logs"
LOG_FILE = LOG_DIR / "session_start.json"


def run(cmd: list[str], timeout: int = 5) -> str | None:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def log_event(payload: dict) -> None:
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        if LOG_FILE.exists():
            try:
                data = json.loads(LOG_FILE.read_text())
                if not isinstance(data, list):
                    data = []
            except Exception:
                data = []
        else:
            data = []
        data.append(payload)
        LOG_FILE.write_text(json.dumps(data[-200:], indent=2))
    except Exception:
        pass


def git_context() -> list[str]:
    lines: list[str] = []

    if run(["git", "rev-parse", "--is-inside-work-tree"]) != "true":
        lines.append("Not inside a git repository.")
        return lines

    branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    if branch:
        lines.append(f"Git branch: {branch}")

    status = run(["git", "status", "--porcelain"])
    if status is not None:
        changes = [l for l in status.splitlines() if l.strip()]
        if changes:
            lines.append(f"Uncommitted changes: {len(changes)} file(s)")
            lines.extend(f"  {c}" for c in changes[:10])
        else:
            lines.append("Working tree clean")

    log_out = run(["git", "log", "--oneline", "-n", "5"])
    if log_out:
        lines.append("Recent commits:")
        lines.extend(f"  {l}" for l in log_out.splitlines())

    return lines


def build_context(source: str) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    parts = [f"Session started: {now} (source: {source})", ""]
    parts.extend(git_context())
    return "\n".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--load-context", action="store_true")
    args = parser.parse_args()

    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    source = payload.get("source", "unknown")
    log_event({"ts": datetime.now(timezone.utc).isoformat(), **payload})

    if args.load_context:
        context = build_context(source)
        output = {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": context,
            }
        }
        sys.stdout.write(json.dumps(output))

    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
