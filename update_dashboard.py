#!/usr/bin/env python3
"""Alfred Trading Dashboard — 실시간 데이터 업데이트
매 5분마다 cron으로 실행. Hyperliquid API에서 데이터 가져와서 dashboard_data.json 및 live_data.json 업데이트
"""
import json, time, requests
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path("/Users/hyena/.openclaw/workspace/alfred-trading")
BOT_DIR = BASE_DIR / "bot"
ACCOUNT = "0xba14c0A8760908c367Ab3AD9E82AAf379D1b9Fc5"
API_URL = "https://api.hyperliquid.xyz"

def get_data():
    """Hyperliquid에서 실시간 데이터 수집"""
    result = {
        "account": {"equity": 0, "margin_used": 0, "spot_usdc": 0},
        "positions": [],
        "prices": {},
        "updated": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        # Spot balance
        r = requests.post(f"{API_URL}/info", json={"type":"spotClearinghouseState","user":ACCOUNT}, timeout=10)
        spot = r.json()
        for b in spot.get("balances", []):
            if b["coin"] == "USDC":
                result["account"]["spot_usdc"] = float(b["total"])
        
        # Perps balance
        r = requests.post(f"{API_URL}/info", json={"type":"clearinghouseState","user":ACCOUNT}, timeout=10)
        perps = r.json()
        ms = perps.get("marginSummary", {})
        result["account"]["equity"] = float(ms.get("accountValue", 0))
        result["account"]["margin_used"] = float(ms.get("totalMarginUsed", 0))
        
        for pos in perps.get("assetPositions", []):
            p = pos.get("position", {})
            if float(p.get("szi", 0)) != 0:
                result["positions"].append({
                    "coin": p.get("coin"),
                    "size": float(p.get("szi", 0)),
                    "entry": float(p.get("entryPx", 0)),
                    "pnl": float(p.get("unrealizedPnl", 0)),
                    "leverage": float(p.get("leverage", {}).get("value", 1))
                })
        
        # Prices
        r = requests.post(f"{API_URL}/info", json={"type":"allMids"}, timeout=10)
        mids = r.json()
        for coin in ["SOL", "ETH", "HYPE", "BTC"]:
            result["prices"][coin] = float(mids.get(coin, 0))
    
    except Exception as e:
        print(f"Error: {e}")
    
    return result

def main():
    data = get_data()
    
    # Bot state 읽기
    state_file = BOT_DIR / "state_v5.json"
    trades_file = BOT_DIR / "trades_v5.json"
    
    bot_state = {}
    if state_file.exists():
        bot_state = json.loads(state_file.read_text())
    
    trades = []
    if trades_file.exists():
        trades = json.loads(trades_file.read_text())
    
    # dashboard_data.json 업데이트
    dashboard = {
        "account": data["account"],
        "total_balance": data["account"]["spot_usdc"] + data["account"]["equity"],
        "positions": data["positions"],
        "prices": data["prices"],
        "bot": {
            "capital": bot_state.get("capital", 0),
            "total_pnl": bot_state.get("total_pnl", 0),
            "strategy": bot_state.get("strategy", ""),
            "daily_trades": bot_state.get("daily_trades", 0),
            "fear_greed": bot_state.get("fear_greed", 0),
        },
        "recent_trades": trades[-10:],
        "updated": data["updated"]
    }
    
    (BASE_DIR / "dashboard_data.json").write_text(json.dumps(dashboard, indent=2))
    
    # live_data.json 업데이트 (Vercel 대시보드용)
    live = {
        "balance": data["account"]["spot_usdc"] + data["account"]["equity"],
        "pnl": bot_state.get("total_pnl", 0),
        "positions": data["positions"],
        "prices": data["prices"],
        "trades": trades[-5:],
        "updated": data["updated"]
    }
    (BASE_DIR / "live_data.json").write_text(json.dumps(live, indent=2))
    
    print(f"Updated: USDC=${data['account']['spot_usdc']:.2f} Equity=${data['account']['equity']:.2f} Positions={len(data['positions'])}")

if __name__ == "__main__":
    main()
