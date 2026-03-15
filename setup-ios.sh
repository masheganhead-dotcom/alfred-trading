#!/bin/bash
# Alfred Quest - iOS 앱 빌드 스크립트
# Mac에서 실행하세요 (Xcode 필요)

set -e

echo "⚔️ Alfred Quest iOS 앱 빌드 시작..."
echo ""

# 1. Node.js 확인
if ! command -v node &> /dev/null; then
  echo "❌ Node.js가 필요합니다. https://nodejs.org 에서 설치하세요"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# 2. npm install
echo "📦 패키지 설치 중..."
npm install

# 3. www 폴더 생성 (웹 앱 복사)
echo "📁 웹 앱 복사 중..."
rm -rf www
mkdir -p www
cp *.html www/ 2>/dev/null || true
cp *.json www/ 2>/dev/null || true
cp *.png www/ 2>/dev/null || true
cp *.ics www/ 2>/dev/null || true
cp *.js www/ 2>/dev/null || true

# package.json은 www에 필요없음
rm -f www/package.json www/package-lock.json

# 4. Capacitor iOS 프로젝트 추가
if [ ! -d "ios" ]; then
  echo "📱 iOS 프로젝트 생성 중..."
  npx cap add ios
fi

# 5. Sync
echo "🔄 Capacitor 동기화 중..."
npx cap sync ios

echo ""
echo "✅ 빌드 준비 완료!"
echo ""
echo "다음 단계:"
echo "  1. npx cap open ios    → Xcode에서 프로젝트 열기"
echo "  2. Xcode에서 Signing & Capabilities → 본인 Apple ID 선택"
echo "  3. iPhone 연결 후 ▶ 버튼 클릭하여 실행"
echo ""
echo "💡 팁:"
echo "  - Apple 개발자 계정 없이도 본인 iPhone에 설치 가능 (7일 유효)"
echo "  - 유료 계정 ($99/년) 있으면 앱스토어 배포 + TestFlight 가능"
