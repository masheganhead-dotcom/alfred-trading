#!/usr/bin/env python3
"""PreToolUse safety guard for alfred-trading.

Adapted from patterns in kenryu42/claude-code-safety-net and
disler/claude-code-damage-control. Runs before every tool call and blocks
destructive operations that the permission allowlist alone can't catch
(commands wrapped in `bash -c`, multi-statement chains, find -delete, etc.).

Output protocol: emit a JSON object with hookSpecificOutput.permissionDecision
set to "deny" + a reason. Anything else allows the tool call to proceed.
"""
from __future__ import annotations

import json
import re
import sys

DANGEROUS_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+/\s*(?:$|;|&)"),
     "Refusing rm -rf on filesystem root."),
    (re.compile(r"\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+~(/|\s|$)"),
     "Refusing rm -rf on home directory."),
    (re.compile(r"\bgit\s+push\s+(?:.*\s)?(?:--force\b|-f\b)"),
     "Force pushes are blocked. Resolve via a normal push or ask explicitly."),
    (re.compile(r"\bgit\s+reset\s+--hard\b"),
     "git reset --hard destroys uncommitted work. Ask before running."),
    (re.compile(r"\bgit\s+clean\s+-[a-zA-Z]*f"),
     "git clean -f removes untracked files. Ask before running."),
    (re.compile(r"\bgit\s+checkout\s+--\s"),
     "git checkout -- discards uncommitted changes. Ask before running."),
    (re.compile(r"\bfind\b[^;|&]*\s-delete\b"),
     "find -delete is too easy to misfire. Use rm on a reviewed list instead."),
    (re.compile(r"\bdd\s+[^;|&]*of=/dev/"),
     "Blocked: dd to a device node."),
    (re.compile(r":\(\)\s*\{\s*:\|:&\s*\}\s*;\s*:"),
     "Fork bomb pattern detected."),
    (re.compile(r"\bcurl\b[^;|&]*\|\s*(?:sh|bash|zsh)\b"),
     "Piping curl into a shell is unsafe. Download, inspect, then run."),
    (re.compile(r"\bwget\b[^;|&]*-O-?\s*\|\s*(?:sh|bash|zsh)\b"),
     "Piping wget into a shell is unsafe. Download, inspect, then run."),
]

PROTECTED_FILES = [
    "bot/state_v5.json",
    "bot/trades_v5.json",
    "dashboard_data.json",
    "live_data.json",
    ".env",
]


def check_command(cmd: str) -> str | None:
    for pattern, reason in DANGEROUS_PATTERNS:
        if pattern.search(cmd):
            return reason

    for protected in PROTECTED_FILES:
        if re.search(rf"\brm\b[^;|&]*\b{re.escape(protected)}\b", cmd):
            return f"Refusing rm against runtime file '{protected}'."
        if re.search(rf"\b(?:>|>>)\s*{re.escape(protected)}\b", cmd):
            return f"Refusing direct overwrite of runtime file '{protected}'."
    return None


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except Exception:
        sys.exit(0)

    tool = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {})

    reason: str | None = None
    if tool == "Bash":
        cmd = tool_input.get("command", "")
        reason = check_command(cmd)
    elif tool in {"Write", "Edit"}:
        path = tool_input.get("file_path", "")
        for protected in PROTECTED_FILES:
            if path.endswith(protected):
                reason = (
                    f"Refusing {tool} on runtime file '{protected}'. "
                    "This file is written by update_dashboard.py / the bot."
                )
                break

    if reason:
        out = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
        sys.stdout.write(json.dumps(out))
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
