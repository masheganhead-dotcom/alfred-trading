#!/usr/bin/env python3
"""SessionStart hook for alfred-trading.

Adapted from disler/claude-code-hooks-mastery. Loads git state and project
context (recent commits, dashboard freshness, key file presence) and injects
it into the Claude Code session as additionalContext.

Runs on every session start/resume/clear. Failures are swallowed so a broken
hook can never block a session.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
LOG_DIR = PROJECT_ROOT / ".claude" / "logs"
LOG_FILE = LOG_DIR / "session_start.json"


def run(cmd: list[str], timeout: int = 5) -> str | None:
    try:
        result = subprocess.run(
            cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=timeout
        )
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
        LOG_FILE.write_text(json.dumps(data, indent=2))
    except Exception:
        pass


def git_context() -> list[str]:
    lines: list[str] = []
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


def dashboard_freshness() -> list[str]:
    lines: list[str] = []
    snapshot = PROJECT_ROOT / "dashboard_data.json"
    if not snapshot.exists():
        return lines
    try:
        data = json.loads(snapshot.read_text())
        updated = data.get("updated")
        if updated:
            lines.append(f"dashboard_data.json updated: {updated}")
        balance = data.get("total_balance")
        if balance is not None:
            lines.append(f"Last known total balance: ${balance:,.2f}")
        positions = data.get("positions") or []
        lines.append(f"Open positions in snapshot: {len(positions)}")
    except Exception:
        pass
    return lines


def build_context(source: str) -> str:
    parts: list[str] = []
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    parts.append(f"Session started: {now} (source: {source})")
    parts.append("")
    parts.extend(git_context())
    snapshot_lines = dashboard_freshness()
    if snapshot_lines:
        parts.append("")
        parts.append("Dashboard snapshot:")
        parts.extend(f"  {l}" for l in snapshot_lines)
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
