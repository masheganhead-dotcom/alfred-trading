#!/usr/bin/env node
// 매일 텔레그램 발송 - GitHub Actions에서 실행
// 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

// ⚠ 최상단 — 다른 import 전에 TZ 강제 (모듈 로드 시점에 반영되도록)
process.env.TZ = "Asia/Seoul";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DateTime } from "luxon";

import { calculateSaju } from "../core/saju.js";
import { generateDailyStory } from "../core/daily_story.js";
import { sendTelegram } from "../core/telegram_send.js";
import { UserContextSchema } from "../core/user_context_schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawContext = JSON.parse(
  readFileSync(join(__dirname, "../data/user_context.json"), "utf8")
);
const userContext = UserContextSchema.parse(rawContext);

const USER = userContext.user;
const mySaju = calculateSaju(USER.birth);

// TZ=Asia/Seoul 강제되었으므로 new Date()가 KST 로컬로 작동.
// date.getFullYear()/getMonth()/getDate()/getDay() 전부 KST 기준.
const kstDate = new Date();

// === 3중 검증 (환경별 시간대 어긋남 즉시 발견) ===
const luxonKst = DateTime.now().setZone("Asia/Seoul");
const localYmd = `${kstDate.getFullYear()}-${String(kstDate.getMonth()+1).padStart(2,"0")}-${String(kstDate.getDate()).padStart(2,"0")}`;
const luxonYmd = luxonKst.toFormat("yyyy-MM-dd");
console.error(`[debug] UTC (raw): ${new Date().toISOString()}`);
console.error(`[debug] KST (luxon 권위): ${luxonKst.toFormat("yyyy-MM-dd HH:mm:ss EEEE")}`);
console.error(`[debug] KST (new Date()+TZ): ${localYmd} ${String(kstDate.getHours()).padStart(2,"0")}:${String(kstDate.getMinutes()).padStart(2,"0")} ${"일월화수목금토"[kstDate.getDay()]}요일`);
console.error(`[debug] TZ env: ${process.env.TZ || "(unset)"}`);
if (localYmd !== luxonYmd) {
  console.error(`❌ 시간대 불일치! new Date()=${localYmd}, luxon=${luxonYmd}. TZ 환경변수 미적용 상태에서 실행됨.`);
  process.exit(2);
}

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
