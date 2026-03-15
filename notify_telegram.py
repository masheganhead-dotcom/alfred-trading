#!/usr/bin/env python3
"""
Alfred Quest - Telegram Notification Script
Usage: python3 notify_telegram.py --token BOT_TOKEN --chat CHAT_ID [--message "custom message"]

To set up:
1. Create a Telegram bot via @BotFather
2. Get your chat ID by messaging @userinfobot
3. Run: python3 notify_telegram.py --token YOUR_BOT_TOKEN --chat YOUR_CHAT_ID
"""
import argparse
import json
import urllib.request
import urllib.error

def send_telegram(token, chat_id, message, parse_mode='HTML'):
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = json.dumps({
        'chat_id': chat_id,
        'text': message,
        'parse_mode': parse_mode
    }).encode()

    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            if result.get('ok'):
                print(f'Message sent successfully!')
                return True
            else:
                print(f'Telegram API error: {result}')
                return False
    except urllib.error.URLError as e:
        print(f'Network error: {e}')
        return False

def get_default_report():
    return """
<b>Alfred Quest v3.0 업그레이드 완료!</b>

<b>새로운 기능들:</b>

<b>캐릭터 진화 시스템</b>
👶→🧒→👦→🧑→👨→🤵→🎩→👑→🏆→💎→🌟
레벨업하면 아기에서 시작해 점점 성장하여
양복 입은 CEO, 왕관의 거물, 레전드까지 진화!

<b>듀오링고 스타일 게임화</b>
• 🟢 듀오링고 스타일 XP 바 (초록색, 빛나는 효과)
• 🔥 스트릭 불꽃 애니메이션
• 💥 콤보 시스템 (연속 완료 시 2x→3x→5x 보너스)
• 🎵 사운드 이펙트 (완료/레벨업/업적 달성)
• ✨ 파티클 폭발 효과
• 🏆 "NICE!" "PERFECT!" "LEGENDARY!" 칭찬 텍스트

<b>업적 시스템 (16개)</b>
🌱 첫 발걸음, 🔥 3일 연속, ⚔️ 일주일 전사
🏅 한 달의 기적, 📈 성장의 시작, 🎯 두 자릿수
💫 천 경험치, ⭐ 만렙을 향해, ☀️ 아침형 인간
💯 퍼펙트 데이, 🎵 작곡가, 💪 능력치 마스터
🧠 몰입의 달인, 🌅 새벽 전사, 🦉 올빼미 장인

<b>데일리 챌린지</b>
• 매일 다른 챌린지 자동 생성
• 챌린지 완료 시 보너스 XP
• 자정까지 카운트다운

<b>리그 시스템</b>
🥉 브론즈 → 🥈 실버 → 🥇 골드 → 🏆 다이아 → 💎 마스터

<b>추가 기능</b>
• 📊 오늘의 배틀 스탯 (XP/퀘스트/스탯/집중시간)
• 🎯 주간 XP 목표 (레벨에 따라 목표 증가)
• 💬 일일 동기부여 명언
• 🌅 시간대별 배경 그라데이션
• 💚 화면 플래시 이펙트 (완료 시 녹색, 5x 콤보 시 금색)
• 🎊 레벨업 시 confetti + 캐릭터 진화 표시
• 📈 원형 진행률 링 (SVG 애니메이션)
• 🏆 업적 그리드 + 캐릭터 성장 타임라인

<b>기존 기능 유지</b>
• ⚔️ 퀘스트 체크리스트
• 🍅 포커스 타이머 (포모도로/플로우/자유)
• 📅 iCloud 캘린더 연동
• 🎵 곡 작업 트래커
• 📝 음성 메모 + 텍스트 노트
• 🎙️ Plaud Note 연동
• ☁️ Firebase 실시간 동기화
• 📱 PWA + iOS 네이티브 앱 지원

사이트: https://masheganhead-dotcom.github.io/alfred-trading/routine.html
"""

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Send Alfred Quest report via Telegram')
    parser.add_argument('--token', required=True, help='Telegram Bot Token')
    parser.add_argument('--chat', required=True, help='Telegram Chat ID')
    parser.add_argument('--message', default=None, help='Custom message (default: full feature report)')
    args = parser.parse_args()

    message = args.message or get_default_report()
    send_telegram(args.token, args.chat, message)
