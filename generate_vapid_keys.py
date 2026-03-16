#!/usr/bin/env python3
"""
VAPID 키 생성기 - Web Push 알림을 위한 키 쌍 생성

사용법:
  pip install py-vapid
  python3 generate_vapid_keys.py

생성된 키:
  - VAPID_PUBLIC_KEY: routine.html의 localStorage에 저장
  - VAPID_PRIVATE_KEY: push_sender.py에 설정
  - push_subscription.json: 브라우저에서 구독 후 자동 생성
"""

import json
import os
import base64

try:
    from py_vapid import Vapid
except ImportError:
    print("❌ py-vapid 패키지가 필요합니다.")
    print("   설치: pip install py-vapid pywebpush")
    exit(1)

def generate_keys():
    vapid = Vapid()
    vapid.generate_keys()

    # Extract raw keys
    raw_priv = vapid.private_key.private_numbers().private_value
    raw_pub = vapid.public_key.public_bytes(
        encoding=__import__('cryptography').hazmat.primitives.serialization.Encoding.X962,
        format=__import__('cryptography').hazmat.primitives.serialization.PublicFormat.UncompressedPoint
    )

    # URL-safe base64 encode
    priv_b64 = base64.urlsafe_b64encode(raw_priv.to_bytes(32, 'big')).decode().rstrip('=')
    pub_b64 = base64.urlsafe_b64encode(raw_pub).decode().rstrip('=')

    print("=" * 60)
    print("🔑 VAPID 키 생성 완료!")
    print("=" * 60)
    print()
    print("📋 PUBLIC KEY (브라우저 콘솔에서 실행):")
    print(f"   localStorage.setItem('alfred_vapid_public_key', '{pub_b64}')")
    print()
    print("🔐 PRIVATE KEY (push_sender.py에 설정):")
    print(f"   VAPID_PRIVATE_KEY = '{priv_b64}'")
    print()
    print("📧 VAPID_CLAIMS_EMAIL (push_sender.py에 설정):")
    print("   VAPID_CLAIMS_EMAIL = 'mailto:your-email@example.com'")
    print()

    # Save to config file
    config = {
        "vapid_public_key": pub_b64,
        "vapid_private_key": priv_b64,
        "vapid_claims_email": "mailto:your-email@example.com"
    }

    config_path = os.path.join(os.path.dirname(__file__), 'push_config.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"💾 설정 파일 저장됨: {config_path}")
    print()
    print("=" * 60)
    print("📱 설정 순서:")
    print("  1. 위의 localStorage 명령어를 브라우저 콘솔에서 실행")
    print("  2. 앱을 새로고침하면 Push 구독이 자동 생성됨")
    print("  3. 콘솔에 표시된 subscription을 push_subscription.json에 저장")
    print("  4. push_sender.py를 크론에 등록")
    print("=" * 60)

if __name__ == '__main__':
    generate_keys()
