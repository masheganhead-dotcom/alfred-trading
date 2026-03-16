const CACHE_NAME = 'alfred-quest-v2.2';
const ASSETS = [
  './routine.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// ===== BACKGROUND NOTIFICATION SCHEDULE =====
let questSchedule = [];   // [{id, name, icon, desc, start, hour, minute}]
let smartNags = [];        // [{questId, after, msg, group}]
let completedToday = [];   // quest IDs completed today
let lastNagShown = 0;      // timestamp of last nag notification

let shownAlarms = {};   // { questId: timestamp } - alarms shown today
let lastCheckTime = 0;  // prevent flood on SW wake

// Store schedule in IndexedDB for persistence across SW restarts
const DB_NAME = 'alfred-sw-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('schedule')) {
        db.createObjectStore('schedule', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveScheduleData() {
  try {
    const db = await openDB();
    const tx = db.transaction('schedule', 'readwrite');
    const store = tx.objectStore('schedule');
    store.put({ key: 'questSchedule', value: questSchedule });
    store.put({ key: 'smartNags', value: smartNags });
    store.put({ key: 'completedToday', value: completedToday });
    store.put({ key: 'lastNagShown', value: lastNagShown });
    store.put({ key: 'shownAlarms', value: shownAlarms });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
    db.close();
  } catch(e) {
    console.log('[SW] IndexedDB save error:', e);
  }
}

async function loadScheduleData() {
  try {
    const db = await openDB();
    const tx = db.transaction('schedule', 'readonly');
    const store = tx.objectStore('schedule');
    const getVal = (key) => new Promise((resolve) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value);
      req.onerror = () => resolve(undefined);
    });
    questSchedule = (await getVal('questSchedule')) || [];
    smartNags = (await getVal('smartNags')) || [];
    completedToday = (await getVal('completedToday')) || [];
    lastNagShown = (await getVal('lastNagShown')) || 0;
    shownAlarms = (await getVal('shownAlarms')) || {};
    db.close();
  } catch(e) {
    console.log('[SW] IndexedDB load error:', e);
  }
}

// ===== BACKGROUND NOTIFICATION CHECKER =====
async function checkAndNotify() {
  const now = Date.now();

  // Prevent notification flood: minimum 60s between checks
  if (now - lastCheckTime < 60 * 1000) return;
  lastCheckTime = now;

  await loadScheduleData();

  const d = new Date();
  const hh = d.getHours();
  const mm = d.getMinutes();
  const nowMins = hh * 60 + mm;
  const nowStr = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  const todayStr = d.toISOString().slice(0, 10);

  // Reset shown alarms at midnight
  if (shownAlarms._date !== todayStr) {
    shownAlarms = { _date: todayStr };
  }

  // 1) Quest alarm notifications (2 min before ~ 3 min after)
  //    Only show ONCE per quest per day, max 1 quest alarm per check
  let shownQuestAlarm = false;
  for (const q of questSchedule) {
    if (completedToday.includes(q.id)) continue;
    if (shownAlarms[q.id]) continue; // Already shown today
    const questMins = q.hour * 60 + q.minute;
    if (nowMins >= questMins - 2 && nowMins <= questMins + 3) {
      shownAlarms[q.id] = now;
      await self.registration.showNotification(`⏰ ${q.icon} ${q.name}`, {
        body: q.start || q.desc || '루틴을 시작할 시간이에요!',
        icon: './icon-192.png',
        tag: `quest-alarm-${q.id}`,
        renotify: true,
        data: { type: 'quest-alarm', questId: q.id }
      });
      shownQuestAlarm = true;
      break; // Only 1 alarm per check cycle
    }
  }

  // Save shown alarms state
  await saveScheduleData();

  // 2) Smart nag notifications (every 15 min max, skip if quest alarm just shown)
  if (shownQuestAlarm) return;
  if (now - lastNagShown < 15 * 60 * 1000) return;

  let nagGroups = [];
  if (hh >= 7 && hh < 10) nagGroups.push('morning');
  if (hh >= 10 && hh < 16) nagGroups.push('studio');
  if (hh >= 16 && hh < 19) nagGroups.push('exercise');
  if (hh >= 18 && hh < 23) nagGroups.push('evening');
  if (hh >= 22 && hh < 24) nagGroups.push('home');
  if (hh >= 10 && hh < 12) nagGroups.push('morning');
  if (hh >= 19 && hh < 20) nagGroups.push('exercise');
  const uniqueGroups = [...new Set(nagGroups)];

  const applicableNags = [];
  for (const nag of smartNags) {
    if (!uniqueGroups.includes(nag.group)) continue;
    if (nowStr < nag.after) continue;
    if (nag.questId && completedToday.includes(nag.questId)) continue;
    applicableNags.push(nag);
  }

  if (applicableNags.length > 0) {
    const nag = applicableNags[Math.floor(Math.random() * applicableNags.length)];
    const nagTitles = [
      '📢 잔소리 타임!', '🔔 알프레드가 한마디', '⚡ 루틴 경고!',
      '🫵 이거 안 하셨죠?', '😤 다 보고 있어요', '🚨 루틴 미완료!',
      '💪 지금이에요!', '👀 혹시 까먹으셨어요?'
    ];
    const title = nagTitles[Math.floor(Math.random() * nagTitles.length)];

    await self.registration.showNotification(title, {
      body: nag.msg,
      icon: './icon-192.png',
      tag: 'smart-nag',
      renotify: true,
      data: { type: 'smart-nag' }
    });

    lastNagShown = now;
    await saveScheduleData();
  }
}

// ===== SERVICE WORKER EVENTS =====

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only cache same-origin requests (not CORS proxy, Firebase, etc.)
  if (url.origin !== self.location.origin) return;

  // Network first, fallback to cache (for offline support)
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// ===== MESSAGE HANDLER: Receive schedule from main app =====
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'UPDATE_SCHEDULE') {
    questSchedule = e.data.questSchedule || [];
    smartNags = e.data.smartNags || [];
    completedToday = e.data.completedToday || [];
    saveScheduleData();
    console.log(`[SW] Schedule updated: ${questSchedule.length} quests, ${smartNags.length} nags`);
  }

  if (e.data && e.data.type === 'UPDATE_COMPLETED') {
    completedToday = e.data.completedToday || [];
    saveScheduleData();
  }

  // Force an immediate check (useful for testing)
  if (e.data && e.data.type === 'CHECK_NOW') {
    checkAndNotify();
  }
});

// ===== PERIODIC BACKGROUND SYNC =====
// This fires even when the app is closed (Chrome/Edge support)
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'routine-nag-check') {
    e.waitUntil(checkAndNotify());
  }
});

// ===== NOTIFICATION CLICK: Open app when notification is tapped =====
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  // Handle "dismiss" action - just close
  if (e.action === 'dismiss') return;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('routine.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      const url = e.notification.data?.url || './routine.html';
      return clients.openWindow(url);
    })
  );
});

// ===== WEB PUSH EVENT HANDLER =====
// This is the KEY to background notifications - fires even when app is closed
self.addEventListener('push', (e) => {
  let data = { title: '🔔 알프레드 퀘스트', body: '루틴을 확인하세요!', type: 'push-reminder' };

  if (e.data) {
    try {
      data = { ...data, ...e.data.json() };
    } catch(err) {
      try {
        data.body = e.data.text();
      } catch(err2) {}
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.tag || 'push-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: { type: data.type || 'push-reminder', url: './routine.html' },
    actions: [
      { action: 'open', title: '열기' },
      { action: 'dismiss', title: '나중에' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle push subscription change (auto-resubscribe)
self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe(e.oldSubscription.options)
      .then(subscription => {
        // Notify all clients about new subscription
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PUSH_SUBSCRIPTION_CHANGED',
              subscription: subscription.toJSON()
            });
          });
        });
      })
  );
});

// ===== FALLBACK: Use setTimeout loop when periodic sync is not available =====
// This runs as long as the service worker is alive
let bgCheckTimer = null;
function startBackgroundCheckLoop() {
  if (bgCheckTimer) return;
  const runCheck = () => {
    checkAndNotify().catch(() => {});
    bgCheckTimer = setTimeout(runCheck, 3 * 60 * 1000); // Every 3 minutes
  };
  bgCheckTimer = setTimeout(runCheck, 60 * 1000); // First check after 1 minute
}
startBackgroundCheckLoop();

// ===== KEEP-ALIVE: Extend SW lifetime with self-ping =====
// When the app page is open, it pings the SW to keep it alive
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'KEEP_ALIVE') {
    // Just respond to keep the SW active
    if (e.source) {
      e.source.postMessage({ type: 'KEEP_ALIVE_ACK' });
    }
  }
});

// On activate, trigger an immediate check
self.addEventListener('activate', () => {
  checkAndNotify().catch(() => {});
});
