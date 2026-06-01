# CLAUDE.md (global)

Behavioral guidelines that apply to every project Claude Code touches on this machine.

These are the four principles from Forrest Chang's distillation of Andrej Karpathy's observations about LLM coding agents — the most-starred CLAUDE.md template on GitHub. They bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals. State a brief plan before multi-step work:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let the agent loop independently. Weak criteria ("make it work") require constant clarification.

---

## Universal safety rules

- **Never commit `.env`, API keys, wallet private keys, or any file matching `*secret*`, `*credential*`, `*.key`, `*.pem`.**
- **Never run `git push --force`, `git reset --hard`, `git clean -f`, or `rm -rf` on paths outside the current project without explicit user confirmation.**
- **Never pipe `curl` or `wget` directly into `sh`/`bash`** — download, inspect, then run.
- **Project-specific CLAUDE.md overrides this file.** If a project's CLAUDE.md says something different, follow the project file.

## Goal: zero "continue" presses

Every time the user has to type "continue", the harness has failed. State explicit success criteria up front, verify before declaring done, and finish the task in one turn whenever possible.
