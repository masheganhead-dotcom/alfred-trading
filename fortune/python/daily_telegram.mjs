#!/usr/bin/env node
// 매일 텔레그램 발송 - GitHub Actions에서 실행
// 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { calculateSaju } from "../core/saju.js";
import { generateDailyStory } from "../core/daily_story.js";
import { sendTelegram } from "../core/telegram_send.js";

// === 사용자 사주 설정 ===
const USER = {
  name: "성훈",
  birth: { year: 1998, month: 11, day: 7, hour: 7, minute: 35, gender: "M", longitude: 127.0 },
};

const mySaju = calculateSaju(USER.birth);
const today = new Date();

// KST 보정
const kstOffset = 9 * 60;
const localOffset = today.getTimezoneOffset();
const kstDate = new Date(today.getTime() + (kstOffset + localOffset) * 60 * 1000);

const story = generateDailyStory({ mySaju, date: kstDate, userName: USER.name });

console.log("─".repeat(60));
console.log(story);
console.log("─".repeat(60));

const result = await sendTelegram(story);
if (result.ok) {
  console.log("✅ 텔레그램 발송 완료");
} else {
  console.error("❌ 발송 실패:", result.error || result.description);
  process.exit(1);
}
