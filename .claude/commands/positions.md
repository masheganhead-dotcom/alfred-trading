---
description: Show open positions from the latest dashboard snapshot with unrealized PnL.
---

Read `dashboard_data.json` and print the open positions list. For each position show:

- Coin
- Side (long if size > 0, short if size < 0) and absolute size
- Entry price
- Current price from `prices[coin]` if available
- Unrealized PnL ($ and as % of (entry * |size|))
- Leverage

If there are no open positions, print "No open positions." and the snapshot timestamp. Don't speculate about whether the bot is "doing the right thing" — just report state.
