// 매일 텔레그램 스토리 데모 — 오늘+내일+5/29 D-DAY 미리보기
import { calculateSaju } from "../core/saju.js";
import { generateDailyStory } from "../core/daily_story.js";

const me = calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });

const dates = [
  { label: "오늘 (5/22 금)", d: new Date(2026, 4, 22) },
  { label: "내일 (5/23 토)", d: new Date(2026, 4, 23) },
  { label: "D-DAY (5/29 금)", d: new Date(2026, 4, 29) },
];

for (const {label, d} of dates) {
  console.log("\n" + "═".repeat(60));
  console.log(`  📱 ${label} 텔레그램 메시지 미리보기`);
  console.log("═".repeat(60));
  console.log(generateDailyStory({ mySaju: me, date: d, userName: "성훈" }));
}
