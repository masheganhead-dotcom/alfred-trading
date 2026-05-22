---
description: Validate dashboard_data.json + live_data.json schema and freshness.
---

Run these checks and report pass/fail for each:

1. Both files parse as JSON.
2. `dashboard_data.json` has top-level keys `account`, `total_balance`, `positions`, `prices`, `bot`, `recent_trades`, `updated`.
3. `live_data.json` has top-level keys `balance`, `pnl`, `positions`, `prices`, `trades`, `updated`.
4. `updated` timestamps in both files are within the last 15 minutes (cron runs every 5).
5. For each position, `coin`, `size`, `entry`, `pnl`, `leverage` are present and numeric.
6. `prices` has entries for SOL, ETH, HYPE, BTC and all are > 0.

Report each check on one line with PASS/FAIL and the relevant value. If any FAIL, suggest the most likely cause (cron not running, Hyperliquid API down, schema drift in `update_dashboard.py`) — but don't try to fix anything without being asked.
