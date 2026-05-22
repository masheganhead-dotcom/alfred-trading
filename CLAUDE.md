# CLAUDE.md

Behavioral guidelines and project context for Claude Code on alfred-trading.

---

## Project Overview

**alfred-trading** is a Hyperliquid trading dashboard. A cron-driven Python script polls the Hyperliquid public API and writes JSON snapshots that a static HTML dashboard renders client-side.

### Stack
- **Backend**: Python 3.11, `requests` (stdlib JSON), no framework
- **Frontend**: Vanilla HTML + JS (`index.html`), no build step
- **Data source**: Hyperliquid REST API (`https://api.hyperliquid.xyz/info`)
- **Trigger**: macOS cron, every 5 minutes
- **Account**: Hardcoded wallet `0xba14c0A8760908c367Ab3AD9E82AAf379D1b9Fc5`

### Key files
- `update_dashboard.py` — polls Hyperliquid, writes `dashboard_data.json` + `live_data.json`
- `index.html` — renders the dashboard
- `dashboard_data.json` — full snapshot (account, positions, prices, bot state, recent trades)
- `live_data.json` — slim snapshot for the Vercel-hosted view
- `bot/` (gitignored) — local trading bot state (`state_v5.json`, `trades_v5.json`)

### Gotchas
- `BASE_DIR` in `update_dashboard.py` is hardcoded to a macOS path (`/Users/hyena/.openclaw/workspace/alfred-trading`). Cloud sessions cannot run this script as-is — only edit and rely on the user's local cron to execute it.
- `bot/` is gitignored; do not assume its contents are reproducible in a fresh checkout.
- `.env` and credentials must never be committed (already in `.gitignore`).

### Verification commands
- `python3 -c "import ast; ast.parse(open('update_dashboard.py').read())"` — syntax check
- `python3 -c "import json; json.loads(open('dashboard_data.json').read())"` — schema sanity
- Open `index.html` in a browser to spot-check rendering against the JSON snapshots

---

## Behavioral Guidelines

These are the four principles from Forrest Chang's distillation of Andrej Karpathy's observations about LLM coding agents (the most-starred CLAUDE.md template on GitHub). They bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write a check for invalid inputs, then run it"
- "Fix the bug" → "Reproduce it from the JSON snapshot, then re-run after fix"
- "Refactor X" → "Confirm the dashboard renders identically before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let the agent loop independently. Weak criteria ("make it work") require constant clarification.

---

## Harness Discipline (from claudecode-harness conventions)

- **Bug fixes ≤ 50 lines per session.** If the diff grows, stop and re-scope.
- **Features ≤ 300 lines.** Larger work should be split across PRs.
- **Files ≤ 500 lines.** This codebase is small; keep it that way.
- **No edits to files matching `bot/state_*.json` or `bot/trades_*.json`** — those are live runtime state.
- **Never commit `.env`, API keys, or wallet private keys.**

## Goal: zero "continue" presses

Every time the user has to type "continue", the harness has failed. State explicit success criteria up front, verify before declaring done, and finish the task in one turn whenever possible.
