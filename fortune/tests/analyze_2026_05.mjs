// 최성훈님 2026년 5월 정밀 분석
import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { analyzeYear } from "../core/sigi.js";
import { analyzeMonth, pickGoodDays, ACTIVITY_LABELS, analyzeDay } from "../core/wol_il.js";

const INPUT = { year: 1998, month: 11, day: 7, hour: 7, minute: 35, gender: "M", longitude: 127.0 };
const saju = calculateSaju(INPUT);

console.log("═".repeat(70));
console.log("  최성훈님 — 2026년 5월 정밀 시기 분석");
console.log("  본명 사주: 戊寅 / 壬戌 / 甲申 / 戊辰 (갑신 일주, 호랑이띠)");
console.log("═".repeat(70));

// === 2026년 전체 흐름 ===
const year2026 = analyzeYear(saju, 2026, "M");
console.log("\n■ 2026년 전체 흐름");
console.log(`   세운: ${year2026.yearGapja} (병오년, 말띠 해) | ${year2026.score}점 (${year2026.score >= 65 ? "길운" : year2026.score >= 45 ? "양호" : "주의"})`);
console.log(`   세운 천간 ${year2026.yearGapja[0]} = 일간(甲) 기준 십신: ${year2026.stemSipsin}`);
year2026.events.forEach(e => console.log(`   · ${e.type}: ${e.desc}`));

// === 5월 월건 + 전체 분석 ===
const may = analyzeMonth(saju, 2026, 5, "M");
console.log(`\n■ 2026년 5월 월건: ${may.monthGapja} (월령)`);
console.log(`   월 평균 점수: ${may.avgScore}점 / 100`);
console.log(`   해석: ${may.avgScore >= 60 ? "전반적 길운의 달" : may.avgScore >= 45 ? "평이한 흐름" : "주의 필요한 달"}`);

// === 최성훈님 음악 활동 - 앨범 발매 최적일 ===
console.log("\n" + "─".repeat(70));
console.log("  🎵 앨범·곡 발매에 최적인 날 (2026년 5월)");
console.log("─".repeat(70));
const albumPicks = pickGoodDays(saju, 2026, 5, "album_release", "M");
console.log("\n【 TOP 5 길일 】");
albumPicks.top5.forEach((d, i) => {
  console.log(`\n  ${i + 1}. ${d.date} (${d.weekday}요일) — ${d.activityScore}점 / ${d.grade}`);
  console.log(`     일진: ${d.dayGapja} | 십신: ${d.stemSipsin}`);
  d.events.slice(0, 3).forEach(e => console.log(`     · ${e.text}`));
});
console.log("\n【 피해야 할 날 】");
albumPicks.avoid.forEach((d, i) => {
  console.log(`\n  · ${d.date} (${d.weekday}) — ${d.activityScore}점 / ${d.grade}`);
  console.log(`    일진: ${d.dayGapja} | ${d.events.map(e => e.text).slice(0, 2).join(" / ")}`);
});

// === 공연·발표용 ===
console.log("\n" + "─".repeat(70));
console.log("  🎤 공연·발표·라이브에 최적인 날");
console.log("─".repeat(70));
const perfPicks = pickGoodDays(saju, 2026, 5, "performance", "M");
console.log("\n【 TOP 3 】");
perfPicks.top5.slice(0, 3).forEach((d, i) => {
  console.log(`  ${i + 1}. ${d.date} (${d.weekday}) — ${d.activityScore}점 [${d.dayGapja}/${d.stemSipsin}]`);
});

// === 협업·미팅 ===
console.log("\n" + "─".repeat(70));
console.log("  🤝 미팅·협업·송라이팅 캠프에 최적인 날");
console.log("─".repeat(70));
const collabPicks = pickGoodDays(saju, 2026, 5, "collaboration", "M");
console.log("\n【 TOP 3 】");
collabPicks.top5.slice(0, 3).forEach((d, i) => {
  console.log(`  ${i + 1}. ${d.date} (${d.weekday}) — ${d.activityScore}점 [${d.dayGapja}/${d.stemSipsin}]`);
});

// === 계약 ===
console.log("\n" + "─".repeat(70));
console.log("  📝 계약 체결·서명에 최적인 날 (레이블·퍼블리싱 등)");
console.log("─".repeat(70));
const contractPicks = pickGoodDays(saju, 2026, 5, "contract", "M");
console.log("\n【 TOP 3 】");
contractPicks.top5.slice(0, 3).forEach((d, i) => {
  console.log(`  ${i + 1}. ${d.date} (${d.weekday}) — ${d.activityScore}점 [${d.dayGapja}/${d.stemSipsin}]`);
});

// === 5월 전체 일별 표 ===
console.log("\n" + "─".repeat(70));
console.log("  📅 2026년 5월 전일 운세 매트릭스");
console.log("─".repeat(70));
console.log("  일자       요일  일진    십신    점수  등급  주요 이벤트");
may.days.forEach(d => {
  const types = [...new Set(d.events.map(e => e.type))].slice(0, 2).join(",");
  const marker = d.score >= 70 ? "★" : d.score >= 60 ? "·" : d.score < 35 ? "✗" : " ";
  console.log(`  ${marker} ${d.date}  ${d.weekday}    ${d.dayGapja}  ${(d.stemSipsin||"-").padEnd(4)}  ${String(d.score).padStart(3)}점  ${d.grade.padEnd(3)}  ${types}`);
});

console.log("\n" + "═".repeat(70));
