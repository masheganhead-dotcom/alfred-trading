#!/usr/bin/env python3
"""
Alfred Quest - Web Push 알림 발송기

앱을 안 열어도 폰에 푸시 알림을 보내줍니다.

설치:
  pip install pywebpush py-vapid

사용법:
  # 1회 실행 (현재 시간에 맞는 알림 자동 발송)
  python3 push_sender.py

  # 특정 메시지 발송
  python3 push_sender.py --message "운동할 시간이에요! 💪"

  # 크론 등록 (매 15분마다 실행 - 시간대에 맞는 잔소리 자동 발송)
  crontab -e
  */15 7-23 * * * cd /path/to/alfred-trading && python3 push_sender.py >> push_log.txt 2>&1

설정:
  1. python3 generate_vapid_keys.py 실행
  2. 생성된 push_config.json 확인
  3. 앱에서 구독 후 push_subscription.json 생성
"""

import json
import os
import sys
import random
from datetime import datetime

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    print("❌ pywebpush 패키지가 필요합니다.")
    print("   설치: pip install pywebpush py-vapid")
    sys.exit(1)

# ===== 설정 파일 로드 =====
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_config():
    config_path = os.path.join(SCRIPT_DIR, 'push_config.json')
    if not os.path.exists(config_path):
        print("❌ push_config.json이 없습니다. generate_vapid_keys.py를 먼저 실행하세요.")
        sys.exit(1)
    with open(config_path) as f:
        return json.load(f)

def load_subscription():
    sub_path = os.path.join(SCRIPT_DIR, 'push_subscription.json')
    if not os.path.exists(sub_path):
        print("❌ push_subscription.json이 없습니다.")
        print("   앱을 열고 브라우저 콘솔에서 subscription을 복사하세요.")
        print("   콘솔에 '[Push] Subscription (copy to push_subscription.json):' 으로 표시됩니다.")
        sys.exit(1)
    with open(sub_path) as f:
        return json.load(f)

# ===== 시간대별 알림 메시지 =====
SCHEDULED_NOTIFICATIONS = {
    # (시, 분): {"title": ..., "body": ...}
    # 아침 루틴
    (7, 0):  {"title": "☀️ 기상 알림!", "body": "햇빛 보러 나가세요! 10분 산책 = 도파민 폭발 🏭", "tag": "morning-wake"},
    (7, 30): {"title": "🏋️ 코어 운동!", "body": "매트 깔고 10분만! 복근은 매일 만드는 거예요", "tag": "morning-core"},
    (9, 0):  {"title": "🎬 미드 공부 시간!", "body": "영어는 복리예요. 오늘 안 하면 내일 더 밀려요 📈", "tag": "morning-study"},
    (9, 45): {"title": "📖 독서 타임!", "body": "한 페이지가 뭐가 어렵다고! 책 펴면 이미 절반 성공", "tag": "morning-read"},

    # 작업실 루틴
    (13, 0):  {"title": "🎵 작업실 가야죠!", "body": "1시 넘었어요! 빨리 작업실 가세요!", "tag": "studio-go"},
    (13, 30): {"title": "📋 계획 + 레퍼런스!", "body": "30분이면 끝나는 계획, 방향부터 잡으세요!", "tag": "studio-plan"},
    (14, 30): {"title": "🎹 테마 스케치!", "body": "완벽주의 금지! DAW부터 켜세요! 느낌이 먼저예요", "tag": "studio-theme"},
    (16, 0):  {"title": "🎼 1절 스케치!", "body": "인트로→벌스→훅 흐름부터! 디테일은 나중에", "tag": "studio-verse"},
    (16, 30): {"title": "📱 릴스 촬영!", "body": "15초면 끝! 핑계보다 빠릅니다 📸", "tag": "studio-reels"},

    # 운동 루틴
    (17, 30): {"title": "🏋️ 웨이트 시간!", "body": "1시간 웨이트! 오늘 빠지면 근육이 줄어요 💪", "tag": "exercise-weight"},
    (18, 30): {"title": "🏃 유산소!", "body": "30분 유산소! 몸이 가벼워지는 마법 ✨", "tag": "exercise-cardio"},

    # 저녁 루틴
    (19, 0):  {"title": "🎯 목표 설정!", "body": "오늘의 성과 돌아보고 내일 계획 세우세요", "tag": "evening-goal"},
    (20, 0):  {"title": "🧪 창작 실험!", "body": "새로운 시도를 해볼 시간! 실패도 경험이에요", "tag": "evening-creative"},
    (22, 0):  {"title": "🚿 샤워 & 정리!", "body": "스킨케어까지! 잘 자야 내일 또 달립니다", "tag": "home-shower"},
    (22, 30): {"title": "🧠 AI 학습!", "body": "자기 전 30분 AI 공부! 미래를 준비하세요", "tag": "home-ai"},
}

# 시간대별 잔소리 (정해진 시간이 아닐 때 랜덤으로)
TIME_PERIOD_NAGS = {
    'morning': {
        'hours': (7, 10),
        'messages': [
            {"title": "😤 아직도요?", "body": "아침 루틴이 밀리고 있어요! 지금 시작하면 아직 늦지 않았어요"},
            {"title": "⏰ 시간이 없어요!", "body": "아침은 골든타임! 놓치면 하루가 흐물흐물해져요"},
            {"title": "🫵 이거 안 하셨죠?", "body": "아침 퀘스트 확인하세요. 알프레드가 다 보고 있어요 👀"},
        ]
    },
    'studio': {
        'hours': (10, 17),
        'messages': [
            {"title": "🎵 작업 중이세요?", "body": "작업실에서 집중하고 계시죠? 화이팅!"},
            {"title": "🔔 진행 상황 체크!", "body": "오늘 작업실 퀘스트 얼마나 하셨어요?"},
            {"title": "⚡ 집중 모드!", "body": "핸드폰 내려놓고 DAW에 집중! 1시간만 더!"},
        ]
    },
    'exercise': {
        'hours': (17, 19),
        'messages': [
            {"title": "💪 운동 갔어요?", "body": "헬스장이 기다리고 있어요! 몸이 자본입니다"},
            {"title": "🏃 움직이세요!", "body": "오늘 운동 안 하면 어제의 나보다 못한 거예요"},
        ]
    },
    'evening': {
        'hours': (19, 23),
        'messages': [
            {"title": "🌙 저녁 루틴!", "body": "하루 마무리 잘 하셨어요? 남은 퀘스트 체크!"},
            {"title": "📊 오늘의 성과는?", "body": "앱 열어서 오늘 얼마나 했는지 확인해보세요!"},
        ]
    }
}


def get_current_notification():
    """현재 시간에 맞는 알림 메시지 반환"""
    now = datetime.now()
    hh, mm = now.hour, now.minute

    # 1) 정각 스케줄 알림 체크 (±7분 이내)
    for (sh, sm), notif in SCHEDULED_NOTIFICATIONS.items():
        scheduled_mins = sh * 60 + sm
        now_mins = hh * 60 + mm
        if abs(now_mins - scheduled_mins) <= 7:
            return notif

    # 2) 시간대별 랜덤 잔소리
    for period, config in TIME_PERIOD_NAGS.items():
        start_h, end_h = config['hours']
        if start_h <= hh < end_h:
            return random.choice(config['messages'])

    # 3) 새벽/심야에는 알림 안 보냄
    return None


def send_push(subscription, config, payload):
    """Web Push 알림 발송"""
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=config['vapid_private_key'],
            vapid_claims={"sub": config['vapid_claims_email']}
        )
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] ✅ 푸시 발송 성공: {payload.get('title', 'N/A')}")
        return True
    except WebPushException as e:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] ❌ 푸시 발송 실패: {e}")
        if e.response and e.response.status_code == 410:
            print("   ⚠️ 구독이 만료되었습니다. 앱에서 다시 구독해주세요.")
        return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Alfred Quest Web Push 발송기')
    parser.add_argument('--message', '-m', help='커스텀 메시지')
    parser.add_argument('--title', '-t', help='알림 제목', default='🔔 알프레드 퀘스트')
    parser.add_argument('--dry-run', action='store_true', help='실제 발송 없이 메시지만 확인')
    args = parser.parse_args()

    config = load_config()
    subscription = load_subscription()

    if args.message:
        payload = {"title": args.title, "body": args.message, "tag": "manual-push"}
    else:
        payload = get_current_notification()
        if not payload:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"[{timestamp}] 😴 알림 시간이 아닙니다 (새벽/심야)")
            return

    if args.dry_run:
        print(f"[DRY RUN] 제목: {payload['title']}")
        print(f"[DRY RUN] 내용: {payload['body']}")
        return

    send_push(subscription, config, payload)


if __name__ == '__main__':
    main()
