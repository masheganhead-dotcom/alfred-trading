#!/usr/bin/env python3
"""Global PreToolUse safety guard.

Runs before every Bash/Write/Edit. Blocks destructive patterns that the
permission allowlist alone can't catch (commands wrapped in `bash -c`,
multi-statement chains, find -delete, credential file writes, etc.).
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
    (re.compile(r"\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+\$HOME(/|\s|$)"),
     "Refusing rm -rf on $HOME."),
    (re.compile(r"\bgit\s+push\s+(?:.*\s)?(?:--force\b|-f\b)"),
     "Force pushes are blocked. Resolve via a normal push or ask explicitly."),
    (re.compile(r"\bgit\s+reset\s+--hard\b"),
     "git reset --hard destroys uncommitted work. Ask before running."),
    (re.compile(r"\bgit\s+clean\s+-[a-zA-Z]*f"),
     "git clean -f removes untracked files. Ask before running."),
    (re.compile(r"\bgit\s+checkout\s+--\s"),
     "git checkout -- discards uncommitted changes. Ask before running."),
    (re.compile(r"\bgit\s+stash\s+clear\b"),
     "git stash clear deletes ALL stashes. Ask before running."),
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
    (re.compile(r"\beval\s+[\"'`].*\$\("),
     "eval of command substitution is unsafe. Refactor."),
    (re.compile(r"\bchmod\s+-R?\s+777\b"),
     "chmod 777 is almost never correct. Use narrower permissions."),
    (re.compile(r"\b(?:rm|mv|cp)\b[^;|&]*\.env\b"),
     "Refusing to move/copy/delete .env files."),
]

PROTECTED_WRITE_PATTERNS = [
    re.compile(r"(^|/)\.env$"),
    re.compile(r"(^|/)\.env\.[^/]+$"),
    re.compile(r".*\.pem$"),
    re.compile(r".*\.key$"),
    re.compile(r".*[/-]secret[s]?[/-].*"),
    re.compile(r".*credentials.*"),
]


def check_command(cmd: str) -> str | None:
    for pattern, reason in DANGEROUS_PATTERNS:
        if pattern.search(cmd):
            return reason
    return None


def check_write_path(path: str) -> str | None:
    for pattern in PROTECTED_WRITE_PATTERNS:
        if pattern.search(path):
            return f"Refusing write to credential/secret file: {path}"
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
        reason = check_command(tool_input.get("command", ""))
    elif tool in {"Write", "Edit"}:
        reason = check_write_path(tool_input.get("file_path", ""))

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
