#!/usr/bin/env python3
"""
Alfred Quest - Daily Routine Data Manager
일일 루틴 데이터 관리 및 백업 스크립트
"""
import json
import os
import shutil
from datetime import datetime, timedelta

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'routine_data.json')
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'routine_backups')


def load_data():
    if not os.path.exists(DATA_FILE):
        return None
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def backup_data():
    """주간 백업 생성"""
    if not os.path.exists(DATA_FILE):
        return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    today = datetime.now().strftime('%Y-%m-%d')
    backup_file = os.path.join(BACKUP_DIR, f'routine_data_{today}.json')
    shutil.copy2(DATA_FILE, backup_file)

    # 30일 이상 된 백업 삭제
    cutoff = datetime.now() - timedelta(days=30)
    for f in os.listdir(BACKUP_DIR):
        fpath = os.path.join(BACKUP_DIR, f)
        if os.path.isfile(fpath):
            mtime = datetime.fromtimestamp(os.path.getmtime(fpath))
            if mtime < cutoff:
                os.remove(fpath)

    print(f"[{today}] 백업 완료: {backup_file}")


def check_streak(data):
    """스트릭 계산 및 업데이트"""
    today = datetime.now().strftime('%Y-%m-%d')
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    last_date = data['character'].get('last_completed_date')
    if not last_date:
        return

    if last_date == yesterday:
        # 연속 유지 중
        pass
    elif last_date < yesterday:
        # 스트릭 깨짐
        data['character']['streak'] = 0
        print(f"[{today}] 스트릭 리셋 (마지막 완료: {last_date})")


def print_stats(data):
    """현재 캐릭터 상태 출력"""
    c = data['character']
    today = datetime.now().strftime('%Y-%m-%d')

    print(f"\n{'='*40}")
    print(f"  ⚔️  Alfred Quest - 상태 보고서")
    print(f"  📅 {today}")
    print(f"{'='*40}")
    print(f"  레벨: Lv.{c['level']}  |  XP: {c['xp']}/{c['level']*100}")
    print(f"  연속 스트릭: {c['streak']}일  |  최고: {c['best_streak']}일")
    print(f"\n  📊 능력치:")
    stat_names = {'str':'체력','int':'지력','cre':'창의력','grt':'근성','chr':'매력','biz':'사업력'}
    for key, name in stat_names.items():
        val = c['stats'].get(key, 1)
        bar = '█' * min(val, 30) + '░' * max(0, 30 - val)
        print(f"    {name:>4}: {bar} {val}")

    # 오늘 히스토리
    today_hist = data.get('history', {}).get(today)
    if today_hist:
        completed = len(today_hist.get('completed', []))
        xp = today_hist.get('xp_earned', 0)
        print(f"\n  🎯 오늘: {completed}개 완료, +{xp} XP 획득")

    # 해금된 스킬
    unlocked = [s for s in c.get('skills', []) if s.get('unlocked')]
    if unlocked:
        print(f"\n  🔮 해금 스킬: {', '.join(s['name'] for s in unlocked)}")

    print(f"{'='*40}\n")


def clean_old_history(data, keep_days=90):
    """90일 이상 된 히스토리 정리"""
    cutoff = (datetime.now() - timedelta(days=keep_days)).strftime('%Y-%m-%d')
    history = data.get('history', {})
    removed = [k for k in history if k < cutoff]
    for k in removed:
        del history[k]
    if removed:
        print(f"오래된 히스토리 {len(removed)}건 정리됨")


if __name__ == '__main__':
    data = load_data()
    if not data:
        print("routine_data.json 파일을 찾을 수 없습니다.")
        exit(1)

    check_streak(data)
    clean_old_history(data)
    backup_data()
    save_data(data)
    print_stats(data)
