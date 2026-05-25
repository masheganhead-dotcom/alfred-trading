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
const today = new Date();

// KST 보정
const kstOffset = 9 * 60;
const localOffset = today.getTimezoneOffset();
const kstDate = new Date(today.getTime() + (kstOffset + localOffset) * 60 * 1000);

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
