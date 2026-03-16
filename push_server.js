#!/usr/bin/env node
/**
 * Alfred Quest - Push Notification Server
 *
 * 두 가지 역할:
 * 1. 브라우저에서 push_subscription.json 자동 저장
 * 2. 스케줄에 따라 푸시 알림 자동 발송 (push_scheduler 내장)
 *
 * 사용법:
 *   node push_server.js                # 포그라운드 실행
 *   pm2 start push_server.js           # PM2로 영구 실행 (권장)
 *
 * 필요:
 *   npm install web-push
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let webpush;
try {
  webpush = require('web-push');
} catch(e) {
  console.error('❌ web-push 패키지 필요: npm install web-push');
  process.exit(1);
}

const SCRIPT_DIR = __dirname;
const PORT = process.env.PUSH_PORT || 3456;

// ===== 설정 =====
function loadConfig() {
  const p = path.join(SCRIPT_DIR, 'push_config.json');
  if (!fs.existsSync(p)) { console.error('❌ push_config.json 없음'); process.exit(1); }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadSubscription() {
  const p = path.join(SCRIPT_DIR, 'push_subscription.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ===== HTTP 서버 (구독 저장용) =====
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save_subscription') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const sub = JSON.parse(body);
        if (!sub.endpoint || !sub.keys) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid subscription' }));
          return;
        }
        fs.writeFileSync(
          path.join(SCRIPT_DIR, 'push_subscription.json'),
          JSON.stringify(sub, null, 2)
        );
        const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        console.log(`[${ts}] ✅ 구독 정보 저장 완료`);
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true }));
      } catch(e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    const sub = loadSubscription();
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'running',
      hasSubscription: !!sub,
      time: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }));
    return;
  }

  // Manual push trigger
  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const sub = loadSubscription();
      if (!sub) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'No subscription' }));
        return;
      }
      try {
        const payload = JSON.parse(body);
        sendPush(sub, payload).then(() => {
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        }).catch(err => {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        });
      } catch(e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ===== 푸시 발송 =====
const config = loadConfig();
webpush.setVapidDetails(config.vapid_claims_email, config.vapid_public_key, config.vapid_private_key);

function sendPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload))
    .then(() => {
      const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      console.log(`[${ts}] ✅ ${payload.title || 'push sent'}`);
    })
    .catch(err => {
      const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      console.error(`[${ts}] ❌ 발송 실패: ${err.statusCode || err.message}`);
      throw err;
    });
}

// ===== 스케줄 알림 (push_scheduler 내장) =====
const SCHEDULED = {
  '07:00': { title: '☀️ 기상 알림!', body: '햇빛 보러 나가세요! 10분 산책 = 도파민 폭발 🏭' },
  '07:30': { title: '🏋️ 코어 운동!', body: '매트 깔고 10분만! 복근은 매일 만드는 거예요' },
  '09:00': { title: '🎬 미드 공부 시간!', body: '영어는 복리예요. 오늘 안 하면 내일 더 밀려요 📈' },
  '09:45': { title: '📖 독서 타임!', body: '한 페이지가 뭐가 어렵다고! 책 펴면 이미 절반 성공' },
  '13:00': { title: '🎵 작업실 가야죠!', body: '1시 넘었어요! 빨리 작업실 가세요!' },
  '13:30': { title: '📋 계획 + 레퍼런스!', body: '30분이면 끝나는 계획, 방향부터 잡으세요!' },
  '14:30': { title: '🎹 테마 스케치!', body: '완벽주의 금지! DAW부터 켜세요!' },
  '16:00': { title: '🎼 1절 스케치!', body: '인트로→벌스→훅 흐름부터! 디테일은 나중에' },
  '16:30': { title: '📱 릴스 촬영!', body: '15초면 끝! 핑계보다 빠릅니다 📸' },
  '17:30': { title: '🏋️ 웨이트 시간!', body: '1시간 웨이트! 오늘 빠지면 근육이 줄어요 💪' },
  '18:30': { title: '🏃 유산소!', body: '30분 유산소! 몸이 가벼워지는 마법 ✨' },
  '19:00': { title: '🎯 목표 설정!', body: '오늘의 성과 돌아보고 내일 계획 세우세요' },
  '20:00': { title: '🧪 창작 실험!', body: '새로운 시도를 해볼 시간! 실패도 경험이에요' },
  '22:00': { title: '🚿 샤워 & 정리!', body: '잘 자야 내일 또 달립니다' },
  '22:30': { title: '🧠 AI 학습!', body: '자기 전 30분 AI 공부! 미래를 준비하세요' },
};

const NAGS = {
  morning:  { hours: [7, 10],  msgs: [
    { title: '😤 아직도요?', body: '아침 루틴 밀리고 있어요!' },
    { title: '🫵 이거 안 하셨죠?', body: '알프레드가 다 보고 있어요 👀' },
  ]},
  studio:   { hours: [10, 17], msgs: [
    { title: '🎵 작업 중이세요?', body: '화이팅!' },
    { title: '⚡ 집중 모드!', body: '핸드폰 내려놓고 DAW에 집중!' },
  ]},
  exercise: { hours: [17, 19], msgs: [
    { title: '💪 운동 갔어요?', body: '몸이 자본입니다' },
  ]},
  evening:  { hours: [19, 23], msgs: [
    { title: '🌙 저녁 루틴!', body: '남은 퀘스트 체크!' },
    { title: '📊 오늘의 성과는?', body: '앱 열어서 확인해보세요!' },
  ]},
};

const sentToday = new Set();
let lastNag = 0;

setInterval(() => {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();

  // 자정 리셋
  if (hh === 0 && mm === 0) { sentToday.clear(); lastNag = 0; }

  const sub = loadSubscription();
  if (!sub) return;

  const nowMins = hh * 60 + mm;
  const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  // 스케줄 알림
  for (const [t, notif] of Object.entries(SCHEDULED)) {
    if (sentToday.has(t)) continue;
    const [sh, sm] = t.split(':').map(Number);
    if (Math.abs(nowMins - (sh * 60 + sm)) <= 2) {
      sentToday.add(t);
      sendPush(sub, { ...notif, tag: `sched-${t}` }).catch(() => {});
      return;
    }
  }

  // 잔소리 (15분 간격)
  if (Date.now() - lastNag < 15 * 60 * 1000) return;
  for (const [, p] of Object.entries(NAGS)) {
    if (hh >= p.hours[0] && hh < p.hours[1]) {
      const msg = p.msgs[Math.floor(Math.random() * p.msgs.length)];
      lastNag = Date.now();
      sendPush(sub, { ...msg, tag: 'nag' }).catch(() => {});
      return;
    }
  }
}, 60 * 1000); // 매 1분마다 체크

// ===== 서버 시작 =====
server.listen(PORT, () => {
  const ts = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  console.log(`🚀 Alfred Push Server 시작 [${ts}]`);
  console.log(`   📡 http://localhost:${PORT}`);
  console.log(`   POST /save_subscription - 구독 저장`);
  console.log(`   POST /send - 수동 푸시 발송`);
  console.log(`   GET  /health - 상태 확인`);
  console.log(`   ⏰ 내장 스케줄러 작동 중 (매 1분 체크)`);
  const sub = loadSubscription();
  if (sub) {
    console.log(`   ✅ 구독 정보 있음: ${sub.endpoint.slice(0, 50)}...`);
  } else {
    console.log(`   ⚠️ 구독 정보 없음 - 앱에서 알림 허용 후 자동 저장됩니다`);
  }
});
