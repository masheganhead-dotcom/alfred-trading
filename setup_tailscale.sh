#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Alfred Trading — Tailscale + iPhone 원격 제어 셋업 스크립트
#  서버 맥북(OpenClaw)에서 실행하세요
# ═══════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🦇 Alfred Trading — Tailscale 셋업"
echo "═══════════════════════════════════════════════════"
echo ""

# ─── 1. Tailscale 설치 확인 ──────────────────────────
echo -e "${BOLD}[1/5] Tailscale 설치 확인${NC}"

if command -v tailscale &> /dev/null; then
    echo -e "  ${GREEN}✓ Tailscale 이미 설치됨${NC}"
    tailscale version
else
    echo -e "  ${YELLOW}⚠ Tailscale 미설치 — 설치를 시작합니다${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "  Homebrew로 Tailscale 설치 중..."
            brew install --cask tailscale
        else
            echo -e "  ${RED}✗ Homebrew가 필요합니다${NC}"
            echo "    1. https://brew.sh 에서 Homebrew 설치"
            echo "    2. 또는 https://tailscale.com/download/mac 에서 직접 다운로드"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://tailscale.com/install.sh | sh
    else
        echo -e "  ${RED}✗ 지원하지 않는 OS${NC}"
        exit 1
    fi
fi
echo ""

# ─── 2. Tailscale 로그인 상태 확인 ──────────────────
echo -e "${BOLD}[2/5] Tailscale 연결 상태 확인${NC}"

TS_STATUS=$(tailscale status --json 2>/dev/null || echo '{}')
TS_IP=$(echo "$TS_STATUS" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    ips=d.get('Self',{}).get('TailscaleIPs',[])
    print(ips[0] if ips else '')
except: print('')
" 2>/dev/null)

if [ -n "$TS_IP" ]; then
    echo -e "  ${GREEN}✓ Tailscale 연결됨${NC}"
    echo -e "  IP: ${BOLD}${TS_IP}${NC}"
else
    echo -e "  ${YELLOW}⚠ Tailscale에 로그인되지 않음${NC}"
    echo ""
    echo "  다음 명령어로 로그인하세요:"
    echo -e "  ${BOLD}sudo tailscale up${NC}"
    echo ""
    echo "  브라우저에서 로그인 후 다시 이 스크립트를 실행하세요."
    exit 1
fi
echo ""

# ─── 3. Python 의존성 확인 ──────────────────────────
echo -e "${BOLD}[3/5] Python 환경 확인${NC}"

if command -v python3 &> /dev/null; then
    PY_VER=$(python3 --version)
    echo -e "  ${GREEN}✓ ${PY_VER}${NC}"
else
    echo -e "  ${RED}✗ Python3가 필요합니다${NC}"
    exit 1
fi

# requests 모듈 확인
python3 -c "import requests" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ requests 모듈 설치됨${NC}"
else
    echo "  requests 모듈 설치 중..."
    pip3 install requests
fi
echo ""

# ─── 4. 방화벽 설정 안내 ────────────────────────────
echo -e "${BOLD}[4/5] 네트워크 설정${NC}"
echo "  컨트롤 서버 포트: 7777"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  macOS 방화벽은 기본적으로 Tailscale 트래픽을 허용합니다."
    echo "  문제가 있으면 시스템 설정 > 네트워크 > 방화벽에서 확인하세요."
else
    echo "  Linux 방화벽 설정:"
    echo "  sudo ufw allow in on tailscale0 to any port 7777"
fi
echo ""

# ─── 5. 서버 시작 테스트 ────────────────────────────
echo -e "${BOLD}[5/5] 셋업 완료!${NC}"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}${BOLD}셋업 완료!${NC} 이제 다음 단계를 진행하세요:"
echo ""
echo -e "  ${BOLD}1. 서버 맥북에서 컨트롤 서버 시작:${NC}"
echo -e "     python3 control_server.py"
echo ""
echo -e "  ${BOLD}2. 아이폰에서 Tailscale 앱 설치:${NC}"
echo "     App Store에서 'Tailscale' 검색 후 설치"
echo "     같은 계정으로 로그인"
echo ""
echo -e "  ${BOLD}3. 아이폰 Safari에서 접속:${NC}"
echo -e "     ${GREEN}http://${TS_IP}:7777${NC}"
echo ""
echo -e "  ${BOLD}페이지 설명:${NC}"
echo "     /          → 컨트롤 패널 (봇 시작/중지/로그)"
echo "     /dashboard → 트레이딩 대시보드"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# 자동 시작 설정 (macOS LaunchAgent)
read -p "  서버 자동 시작을 설정할까요? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    PLIST_DIR="$HOME/Library/LaunchAgents"
    PLIST_FILE="$PLIST_DIR/com.alfred.control.plist"
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

    mkdir -p "$PLIST_DIR"

    cat > "$PLIST_FILE" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.alfred.control</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>${SCRIPT_DIR}/control_server.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${SCRIPT_DIR}/control_server.log</string>
    <key>StandardErrorPath</key>
    <string>${SCRIPT_DIR}/control_server.log</string>
</dict>
</plist>
PLIST

    launchctl load "$PLIST_FILE" 2>/dev/null || true
    echo -e "  ${GREEN}✓ 자동 시작 설정 완료${NC}"
    echo "  맥북 부팅 시 자동으로 컨트롤 서버가 시작됩니다."
    echo ""
    echo "  관리 명령어:"
    echo "    시작: launchctl load $PLIST_FILE"
    echo "    중지: launchctl unload $PLIST_FILE"
else
    echo "  수동으로 시작하려면: python3 control_server.py"
fi

echo ""
echo "  Done! 🦇"
