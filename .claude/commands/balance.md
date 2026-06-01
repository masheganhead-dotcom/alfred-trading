---
description: Print the latest dashboard snapshot — account equity, spot USDC, total balance, open positions, last update timestamp.
---

Read `dashboard_data.json` and print a one-screen summary:

- Total balance (spot USDC + perps equity)
- Spot USDC, perps equity, margin used
- Number of open positions, with coin / size / entry / unrealized PnL for each
- `updated` timestamp + how stale the snapshot is (compared to now)
- Bot strategy + total PnL from `bot.*` if present

Format as plain text, monospace-friendly. If `dashboard_data.json` is missing or malformed, say so plainly — don't try to fetch live data, the script runs from the user's local Mac cron.
