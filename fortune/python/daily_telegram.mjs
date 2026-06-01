#!/usr/bin/env node
// 매일 텔레그램 발송 - GitHub Actions에서 실행
// 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { calculateSaju } from "../core/saju.js";
import { generateDailyStory } from "../core/daily_story.js";
import { sendTelegram } from "../core/telegram_send.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const userContext = JSON.parse(
  readFileSync(join(__dirname, "../data/user_context.json"), "utf8")
);

const USER = userContext.user;
const mySaju = calculateSaju(USER.birth);

// === KST 정확 계산 (환경 독립) ===
// 이전 버그: (kstOffset + localOffset) 환경별 결과 달라짐 (KST 환경에서 0이 됨 → 메시지 -9h)
// 수정: Intl.DateTimeFormat으로 timezone 직접 지정 → 환경 무관 항상 정확한 KST
const now = new Date();
const kstParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false
}).formatToParts(now).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
// KST 시각을 ISO처럼 조립
const kstDateStr = `${kstParts.year}-${kstParts.month}-${kstParts.day}T${kstParts.hour}:${kstParts.minute}:${kstParts.second}+09:00`;
const kstDate = new Date(kstDateStr);

// 디버그 출력 (잘못 표시되면 즉시 발견)
console.error(`[debug] UTC: ${now.toISOString()}`);
console.error(`[debug] KST: ${kstDate.toISOString()} (표시용 ${kstParts.year}-${kstParts.month}-${kstParts.day} ${kstParts.hour}:${kstParts.minute} KST, 요일=${"일월화수목금토"[kstDate.getDay()]})`);

const story = generateDailyStory({
  mySaju,
  date: kstDate,
  userName: USER.name,
  userContext
});

console.log("─".repeat(60));
console.log(story);
console.log("─".repeat(60));
console.log(`[len] ${story.length} chars`);

if (process.argv.includes("--dry-run")) {
  console.log("✋ Dry run — 텔레그램 미발송");
  process.exit(0);
}

const result = await sendTelegram(story);
if (result.ok) {
  console.log("✅ 텔레그램 발송 완료");
} else {
  console.error("❌ 발송 실패:", result.error || result.description);
  process.exit(1);
}
