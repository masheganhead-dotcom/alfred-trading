#!/usr/bin/env python3
"""Alfred Trading — iPhone Remote Control Server
Tailscale 네트워크를 통해 아이폰에서 서버 맥북 제어.
사용법: python3 control_server.py
"""

import json
import subprocess
import os
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# ─── 설정 ────────────────────────────────────────────────
BASE_DIR = Path("/Users/hyena/.openclaw/workspace/alfred-trading")
BOT_DIR = BASE_DIR / "bot"
BOT_SCRIPT = "alfred_ws_v5.py"
LOG_DIR = BOT_DIR / "logs"
STATE_FILE = BOT_DIR / "state_v5.json"
TRADES_FILE = BOT_DIR / "trades_v5.json"

HOST = "0.0.0.0"  # Tailscale 인터페이스 포함 모든 인터페이스에서 리슨
PORT = 7777        # 아이폰에서 http://<tailscale-ip>:7777 로 접속

# ─── 유틸리티 ─────────────────────────────────────────────
def get_bot_pid():
    """현재 실행 중인 봇 프로세스 PID 찾기"""
    try:
        result = subprocess.run(
            ["pgrep", "-f", BOT_SCRIPT],
            capture_output=True, text=True, timeout=5
        )
        pids = result.stdout.strip().split("\n")
        return [int(p) for p in pids if p.strip()] if pids[0] else []
    except Exception:
        return []


def get_bot_status():
    """봇 상태 정보 수집"""
    pids = get_bot_pid()
    running = len(pids) > 0

    state = {}
    if STATE_FILE.exists():
        try:
            state = json.loads(STATE_FILE.read_text())
        except Exception:
            pass

    trades = []
    if TRADES_FILE.exists():
        try:
            trades = json.loads(TRADES_FILE.read_text())
        except Exception:
            pass

    return {
        "running": running,
        "pids": pids,
        "state": state,
        "recent_trades": trades[-5:] if trades else [],
        "trade_count": len(trades),
        "checked_at": datetime.now(timezone.utc).isoformat()
    }


def get_system_info():
    """시스템 상태 (CPU, 메모리, 디스크, 업타임)"""
    info = {}
    try:
        # macOS uptime
        r = subprocess.run(["uptime"], capture_output=True, text=True, timeout=5)
        info["uptime"] = r.stdout.strip()
    except Exception:
        info["uptime"] = "N/A"

    try:
        # 디스크 사용량
        r = subprocess.run(["df", "-h", "/"], capture_output=True, text=True, timeout=5)
        lines = r.stdout.strip().split("\n")
        if len(lines) >= 2:
            parts = lines[1].split()
            info["disk"] = {"total": parts[1], "used": parts[2], "avail": parts[3], "pct": parts[4]}
    except Exception:
        info["disk"] = {}

    try:
        # 메모리 (macOS)
        r = subprocess.run(
            ["vm_stat"], capture_output=True, text=True, timeout=5
        )
        info["memory_raw"] = r.stdout.strip()[:500]
    except Exception:
        info["memory_raw"] = "N/A"

    try:
        # Tailscale 상태
        r = subprocess.run(["tailscale", "status", "--json"], capture_output=True, text=True, timeout=5)
        ts = json.loads(r.stdout)
        self_node = ts.get("Self", {})
        info["tailscale"] = {
            "ip": self_node.get("TailscaleIPs", ["N/A"])[0] if self_node.get("TailscaleIPs") else "N/A",
            "hostname": self_node.get("HostName", "N/A"),
            "online": self_node.get("Online", False),
            "os": self_node.get("OS", "N/A"),
            "peers": len(ts.get("Peer", {}))
        }
    except Exception:
        info["tailscale"] = {"ip": "N/A", "hostname": "N/A", "online": False}

    return info


def get_bot_logs(lines=50):
    """최근 봇 로그 가져오기"""
    if not LOG_DIR.exists():
        return "로그 디렉토리 없음"

    log_files = sorted(LOG_DIR.glob("*.log"), key=os.path.getmtime, reverse=True)
    if not log_files:
        return "로그 파일 없음"

    try:
        content = log_files[0].read_text()
        log_lines = content.strip().split("\n")
        return "\n".join(log_lines[-lines:])
    except Exception as e:
        return f"로그 읽기 오류: {e}"


def start_bot():
    """봇 시작"""
    pids = get_bot_pid()
    if pids:
        return {"ok": False, "msg": f"이미 실행 중 (PID: {pids})"}
    try:
        bot_path = BOT_DIR / BOT_SCRIPT
        if not bot_path.exists():
            return {"ok": False, "msg": f"봇 스크립트 없음: {bot_path}"}

        process = subprocess.Popen(
            [sys.executable, str(bot_path)],
            cwd=str(BOT_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        return {"ok": True, "msg": f"봇 시작됨 (PID: {process.pid})", "pid": process.pid}
    except Exception as e:
        return {"ok": False, "msg": f"시작 실패: {e}"}


def stop_bot():
    """봇 중지"""
    pids = get_bot_pid()
    if not pids:
        return {"ok": False, "msg": "실행 중인 봇 없음"}
    try:
        for pid in pids:
            os.kill(pid, signal.SIGTERM)
        return {"ok": True, "msg": f"봇 중지됨 (PID: {pids})"}
    except Exception as e:
        return {"ok": False, "msg": f"중지 실패: {e}"}


def restart_bot():
    """봇 재시작"""
    stop_result = stop_bot()
    import time
    time.sleep(2)
    start_result = start_bot()
    return {
        "ok": start_result["ok"],
        "msg": f"중지: {stop_result['msg']} → 시작: {start_result['msg']}"
    }


def run_dashboard_update():
    """대시보드 데이터 수동 업데이트"""
    try:
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "update_dashboard.py")],
            capture_output=True, text=True, timeout=30
        )
        return {"ok": result.returncode == 0, "msg": result.stdout.strip() or result.stderr.strip()}
    except Exception as e:
        return {"ok": False, "msg": f"업데이트 실패: {e}"}


# ─── HTTP 핸들러 ──────────────────────────────────────────
class ControlHandler(SimpleHTTPRequestHandler):
    """아이폰 제어용 HTTP API 핸들러"""

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        # API 라우팅
        api_routes = {
            "/api/status": lambda: get_bot_status(),
            "/api/system": lambda: get_system_info(),
            "/api/logs": lambda: {"logs": get_bot_logs(int(parse_qs(parsed.query).get("lines", [50])[0]))},
            "/api/dashboard": lambda: json.loads((BASE_DIR / "dashboard_data.json").read_text()) if (BASE_DIR / "dashboard_data.json").exists() else {},
        }

        if path in api_routes:
            self._json_response(api_routes[path]())
            return

        # 페이지 라우팅
        if path in ("", "/control"):
            self._serve_file(BASE_DIR / "control.html")
            return
        if path == "/dashboard":
            self._serve_file(BASE_DIR / "index.html")
            return

        # 정적 파일
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        post_routes = {
            "/api/bot/start": start_bot,
            "/api/bot/stop": stop_bot,
            "/api/bot/restart": restart_bot,
            "/api/update": run_dashboard_update,
        }

        if path in post_routes:
            self._json_response(post_routes[path]())
            return

        self._json_response({"ok": False, "msg": "Unknown endpoint"}, 404)

    def _json_response(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _serve_file(self, filepath):
        try:
            content = filepath.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", len(content))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self._json_response({"ok": False, "msg": "File not found"}, 404)

    def log_message(self, format, *args):
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {args[0]}")


# ─── 메인 ────────────────────────────────────────────────
def main():
    os.chdir(str(BASE_DIR))

    server = HTTPServer((HOST, PORT), ControlHandler)
    print(f"""
╔══════════════════════════════════════════════════╗
║  🦇 Alfred Trading — Remote Control Server      ║
╠══════════════════════════════════════════════════╣
║  http://0.0.0.0:{PORT}                           ║
║                                                  ║
║  아이폰에서 접속:                                  ║
║  http://<tailscale-ip>:{PORT}/control             ║
║                                                  ║
║  API:                                            ║
║  GET  /api/status    — 봇 상태                    ║
║  GET  /api/system    — 시스템 정보                 ║
║  GET  /api/logs      — 봇 로그                    ║
║  GET  /api/dashboard — 대시보드 데이터             ║
║  POST /api/bot/start — 봇 시작                    ║
║  POST /api/bot/stop  — 봇 중지                    ║
║  POST /api/bot/restart — 봇 재시작                ║
║  POST /api/update    — 대시보드 수동 업데이트       ║
╚══════════════════════════════════════════════════╝
""")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버 종료")
        server.shutdown()


if __name__ == "__main__":
    main()
