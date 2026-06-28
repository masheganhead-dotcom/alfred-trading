#!/usr/bin/env node
// 매일 텔레그램 발송 - GitHub Actions에서 실행
// 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DateTime } from "luxon";
import { z } from "zod";

import { calculateSaju } from "../core/saju.js";
import { generateDailyStory } from "../core/daily_story.js";
import { sendTelegram } from "../core/telegram_send.js";
import { UserContextSchema } from "../core/user_context_schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawContext = JSON.parse(
  readFileSync(join(__dirname, "../data/user_context.json"), "utf8")
);

// === zod 스키마 검증 (잘못된 데이터 즉시 발견) ===
const userContext = UserContextSchema.parse(rawContext);

const USER = userContext.user;
const mySaju = calculateSaju(USER.birth);

// === KST 정확 계산 (luxon — 환경 무관) ===
// 2026-06-02 사고 후 박힘: (kstOffset + localOffset) 패턴 절대 금지
const kstNow = DateTime.now().setZone("Asia/Seoul");
const kstDate = kstNow.toJSDate();  // generateDailyStory에 넘기는 표준 Date

// 디버그 출력 — 잘못 표시되면 즉시 발견
console.error(`[debug] UTC: ${DateTime.utc().toISO()}`);
console.error(`[debug] KST: ${kstNow.toFormat("yyyy-MM-dd HH:mm:ss EEEE")} (zone: ${kstNow.zoneName})`);

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
