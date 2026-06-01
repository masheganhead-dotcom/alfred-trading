# Global Claude Code harness

These files are the **machine-wide** version of the harness in this repo's `.claude/`. Install them once per computer; they apply to every project you open in Claude Code on that machine.

**Claude Code does not sync `~/.claude/` across machines through your Anthropic account.** You must install on every Mac/PC/Linux box where you run Claude Code.

## Install

```bash
# In a terminal on the machine you want to configure:
git clone https://github.com/masheganhead-dotcom/alfred-trading.git
cd alfred-trading/dotfiles-claude
bash install.sh
```

That copies into `~/.claude/`:

| File | What it does |
|---|---|
| `CLAUDE.md` | Karpathy 4 behavioral principles + universal safety rules |
| `settings.json` | Read-only command allowlist, gates on push/rm/curl, denies on force-push & `.env` reads |
| `hooks/session_start.py` | Injects git branch + recent commits at every session start |
| `hooks/pre_tool_use.py` | Blocks `rm -rf /`, `git push --force`, fork bombs, `curl \| sh`, writes to `.env`/`*.pem`/`*.key`, etc. |
| `agents/code-reviewer.md` | Subagent for diff review (security, correctness, style) |
| `agents/python-pro.md` | Subagent for non-trivial Python work |

Existing files in `~/.claude/` are backed up to `~/.claude.bak.<timestamp>/` first.

## Upgrade

When you change the dotfiles in this repo and want to re-install on a machine:

```bash
cd /path/to/alfred-trading
git pull
bash dotfiles-claude/install.sh --force
```

## Uninstall

```bash
rm -rf ~/.claude
# Or restore from a backup:
mv ~/.claude.bak.20260522-200000 ~/.claude
```

## Per-project overrides

Each project can override anything here by adding its own `.claude/settings.json` and `CLAUDE.md`. Project files take precedence. This repo's own `.claude/` is an example of that.
