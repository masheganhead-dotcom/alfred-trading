#!/usr/bin/env node
/**
 * Alfred Quest - Background Push Notification Scheduler
 *
 * 앱을 안 열어도 서버에서 자동으로 푸시 알림을 보냅니다.
 *
 * 사용법:
 *   node push_scheduler.js              # 포그라운드 실행
 *   node push_scheduler.js &            # 백그라운드 실행
 *   nohup node push_scheduler.js &      # 터미널 종료 후에도 실행
 *   pm2 start push_scheduler.js         # PM2로 영구 실행 (권장)
 *
 * 필요:
 *   npm install web-push
 *   push_config.json (VAPID 키)
 *   push_subscription.json (브라우저 구독 정보)
 */

const fs = require('fs');
const path = require('path');

let webpush;
try {
  webpush = require('web-push');
} catch(e) {
  console.error('❌ web-push 패키지가 필요합니다.');
  console.error('   설치: npm install web-push');
  process.exit(1);
}

const SCRIPT_DIR = __dirname;

// ===== 설정 로드 =====
function loadConfig() {
  const configPath = path.join(SCRIPT_DIR, 'push_config.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ push_config.json이 없습니다.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function loadSubscription() {
  const subPath = path.join(SCRIPT_DIR, 'push_subscription.json');
  if (!fs.existsSync(subPath)) {
    console.error('❌ push_subscription.json이 없습니다.');
    console.error('   앱에서 알림 허용 후 구독 정보를 다운로드하세요.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(subPath, 'utf8'));
}

// ===== 시간대별 스케줄 알림 =====
const SCHEDULED_NOTIFICATIONS = {
  '07:00': { title: '☀️ 기상 알림!', body: '햇빛 보러 나가세요! 10분 산책 = 도파민 폭발 🏭', tag: 'morning-wake' },
  '07:30': { title: '🏋️ 코어 운동!', body: '매트 깔고 10분만! 복근은 매일 만드는 거예요', tag: 'morning-core' },
  '09:00': { title: '🎬 미드 공부 시간!', body: '영어는 복리예요. 오늘 안 하면 내일 더 밀려요 📈', tag: 'morning-study' },
  '09:45': { title: '📖 독서 타임!', body: '한 페이지가 뭐가 어렵다고! 책 펴면 이미 절반 성공', tag: 'morning-read' },
  '13:00': { title: '🎵 작업실 가야죠!', body: '1시 넘었어요! 빨리 작업실 가세요!', tag: 'studio-go' },
  '13:30': { title: '📋 계획 + 레퍼런스!', body: '30분이면 끝나는 계획, 방향부터 잡으세요!', tag: 'studio-plan' },
  '14:30': { title: '🎹 테마 스케치!', body: '완벽주의 금지! DAW부터 켜세요! 느낌이 먼저예요', tag: 'studio-theme' },
  '16:00': { title: '🎼 1절 스케치!', body: '인트로→벌스→훅 흐름부터! 디테일은 나중에', tag: 'studio-verse' },
  '16:30': { title: '📱 릴스 촬영!', body: '15초면 끝! 핑계보다 빠릅니다 📸', tag: 'studio-reels' },
  '17:30': { title: '🏋️ 웨이트 시간!', body: '1시간 웨이트! 오늘 빠지면 근육이 줄어요 💪', tag: 'exercise-weight' },
  '18:30': { title: '🏃 유산소!', body: '30분 유산소! 몸이 가벼워지는 마법 ✨', tag: 'exercise-cardio' },
  '19:00': { title: '🎯 목표 설정!', body: '오늘의 성과 돌아보고 내일 계획 세우세요', tag: 'evening-goal' },
  '20:00': { title: '🧪 창작 실험!', body: '새로운 시도를 해볼 시간! 실패도 경험이에요', tag: 'evening-creative' },
  '22:00': { title: '🚿 샤워 & 정리!', body: '스킨케어까지! 잘 자야 내일 또 달립니다', tag: 'home-shower' },
  '22:30': { title: '🧠 AI 학습!', body: '자기 전 30분 AI 공부! 미래를 준비하세요', tag: 'home-ai' },
};

// 시간대별 잔소리 (랜덤)
const TIME_PERIOD_NAGS = {
  morning:   { hours: [7, 10],  messages: [
    { title: '😤 아직도요?', body: '아침 루틴이 밀리고 있어요! 지금 시작하면 아직 늦지 않았어요' },
    { title: '⏰ 시간이 없어요!', body: '아침은 골든타임! 놓치면 하루가 흐물흐물해져요' },
    { title: '🫵 이거 안 하셨죠?', body: '아침 퀘스트 확인하세요. 알프레드가 다 보고 있어요 👀' },
  ]},
  studio:    { hours: [10, 17], messages: [
    { title: '🎵 작업 중이세요?', body: '작업실에서 집중하고 계시죠? 화이팅!' },
    { title: '🔔 진행 상황 체크!', body: '오늘 작업실 퀘스트 얼마나 하셨어요?' },
    { title: '⚡ 집중 모드!', body: '핸드폰 내려놓고 DAW에 집중! 1시간만 더!' },
  ]},
  exercise:  { hours: [17, 19], messages: [
    { title: '💪 운동 갔어요?', body: '헬스장이 기다리고 있어요! 몸이 자본입니다' },
    { title: '🏃 움직이세요!', body: '오늘 운동 안 하면 어제의 나보다 못한 거예요' },
  ]},
  evening:   { hours: [19, 23], messages: [
    { title: '🌙 저녁 루틴!', body: '하루 마무리 잘 하셨어요? 남은 퀘스트 체크!' },
    { title: '📊 오늘의 성과는?', body: '앱 열어서 오늘 얼마나 했는지 확인해보세요!' },
  ]},
};

// ===== 푸시 발송 =====
function sendPush(subscription, config, payload) {
  webpush.setVapidDetails(
    config.vapid_claims_email,
    config.vapid_public_key,
    config.vapid_private_key
  );

  return webpush.sendNotification(subscription, JSON.stringify(payload))
    .then(() => {
      const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      console.log(`[${ts}] ✅ ${payload.title}`);
    })
    .catch(err => {
      const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      console.error(`[${ts}] ❌ 발송 실패:`, err.statusCode || err.message);
      if (err.statusCode === 410) {
        console.error('   ⚠️ 구독 만료됨. 앱에서 다시 구독해주세요.');
      }
    });
}

// ===== 스케줄 체크 =====
let lastNagTime = 0;
const sentScheduled = new Set(); // 오늘 이미 보낸 스케줄 알림

function resetDailyTracking() {
  sentScheduled.clear();
  lastNagTime = 0;
}

function checkAndSend(subscription, config) {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  const nowMins = hh * 60 + mm;

  // 자정에 리셋
  if (hh === 0 && mm === 0) resetDailyTracking();

  // 1) 스케줄 알림 (±3분 이내, 1회만)
  for (const [schedTime, notif] of Object.entries(SCHEDULED_NOTIFICATIONS)) {
    if (sentScheduled.has(schedTime)) continue;
    const [sh, sm] = schedTime.split(':').map(Number);
    const schedMins = sh * 60 + sm;
    if (Math.abs(nowMins - schedMins) <= 3) {
      sentScheduled.add(schedTime);
      sendPush(subscription, config, notif);
      return; // 한 번에 하나만
    }
  }

  // 2) 잔소리 (15분 간격)
  if (Date.now() - lastNagTime < 15 * 60 * 1000) return;

  for (const [, period] of Object.entries(TIME_PERIOD_NAGS)) {
    const [startH, endH] = period.hours;
    if (hh >= startH && hh < endH) {
      const nag = period.messages[Math.floor(Math.random() * period.messages.length)];
      lastNagTime = Date.now();
      sendPush(subscription, config, { ...nag, tag: 'smart-nag' });
      return;
    }
  }
}

// ===== 메인 루프 =====
function main() {
  console.log('🚀 Alfred Push Scheduler 시작');
  console.log('   Ctrl+C로 종료 | pm2 start push_scheduler.js 로 영구 실행');
  console.log('');

  const config = loadConfig();
  const subscription = loadSubscription();

  // VAPID 설정
  webpush.setVapidDetails(
    config.vapid_claims_email,
    config.vapid_public_key,
    config.vapid_private_key
  );

  console.log(`✅ 설정 완료. 구독 endpoint: ${subscription.endpoint.slice(0, 60)}...`);
  console.log('⏰ 매 1분마다 스케줄 체크 중...\n');

  // 즉시 한번 체크
  checkAndSend(subscription, config);

  // 매 1분마다 체크
  setInterval(() => {
    // 구독 파일 변경 감지 (hot-reload)
    try {
      const freshSub = loadSubscription();
      Object.assign(subscription, freshSub);
    } catch(e) {}

    checkAndSend(subscription, config);
  }, 60 * 1000);
}

main();
