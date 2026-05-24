// 2026년 남은 달 (5월 22일 ~ 12월 31일) 전체 분석
import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { analyzeMonth, pickGoodDays, analyzeDay } from "../core/wol_il.js";
import { analyzeYear } from "../core/sigi.js";

const me = calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });

console.log("═".repeat(75));
console.log("  📅 최성훈 — 2026년 남은 달 전체 분석 (5/22 ~ 12/31)");
console.log("═".repeat(75));

// === 2026년 전체 큰 흐름 ===
const year = analyzeYear(me, 2026, "M");
console.log(`\n■ 2026년 큰 흐름: ${year.yearGapja}년 (병오·말띠 해)`);
console.log(`  세운 십신: ${year.stemSipsin} - 표현·창작의 해`);
console.log(`  세운 점수: ${year.score}점`);
console.log(`  키워드: ${[...new Set(year.events.map(e=>e.type))].join(", ")}`);

// === 월별 상세 ===
console.log("\n■ 월별 상세 분석");
for (let m = 5; m <= 12; m++) {
  const month = analyzeMonth(me, 2026, m, "M");
  const top3 = month.bestDays.slice(0, 3);
  const worst2 = month.worstDays.slice(0, 2);

  // 키워드 집계
  const eventTypes = {};
  month.days.forEach(d => {
    d.events.forEach(e => {
      if (["결혼","재물","직장","학업","표현","변동","손재","위기","결합"].includes(e.type)) {
        eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
      }
    });
  });
  const topKeywords = Object.entries(eventTypes).sort((a,b)=>b[1]-a[1]).slice(0,3);

  // 활동별 추천
  const albumPicks = pickGoodDays(me, 2026, m, "album_release", "M").top5.slice(0,2);
  const collabPicks = pickGoodDays(me, 2026, m, "collaboration", "M").top5.slice(0,2);

  console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  📅 ${m}월 (월건: ${month.monthGapja}월) - 평균 ${month.avgScore}점`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  주요 키워드: ${topKeywords.map(([k,v])=>`${k}(${v}일)`).join(", ")}`);

  console.log(`\n  🌟 길일 TOP 3:`);
  top3.forEach((d, i) => {
    const eventStr = [...new Set(d.events.map(e=>e.type))].slice(0,2).join(",");
    console.log(`     ${i+1}. ${d.date}(${d.weekday}) ${d.score}점 [${d.dayGapja}/${d.stemSipsin}] ${eventStr}`);
  });

  console.log(`\n  ⛔ 피해야 할 날:`);
  worst2.forEach(d => {
    const eventStr = [...new Set(d.events.map(e=>e.type))].slice(0,2).join(",");
    console.log(`     · ${d.date}(${d.weekday}) ${d.score}점 [${d.dayGapja}] ${eventStr}`);
  });

  console.log(`\n  🎵 발매 적기: ${albumPicks.map(d=>d.date.slice(-5)+"("+d.weekday+")").join(", ")}`);
  console.log(`  🤝 미팅·협업 적기: ${collabPicks.map(d=>d.date.slice(-5)+"("+d.weekday+")").join(", ")}`);
}

// === 7개월 종합 ===
console.log("\n\n" + "═".repeat(75));
console.log("  📊 5월 남은 9일 + 6~12월 종합");
console.log("═".repeat(75));

let allDays = [];
// 5월 22일 이후만
const may = analyzeMonth(me, 2026, 5, "M");
allDays.push(...may.days.filter(d => parseInt(d.date.slice(8)) >= 22));
for (let m = 6; m <= 12; m++) {
  const mo = analyzeMonth(me, 2026, m, "M");
  allDays.push(...mo.days);
}

const sorted = [...allDays].sort((a,b)=>b.score - a.score);
console.log(`\n■ 7개월 + 9일 중 최고의 날 TOP 10`);
sorted.slice(0,10).forEach((d,i) => {
  const eventStr = [...new Set(d.events.map(e=>e.type))].slice(0,2).join(",");
  console.log(`  ${String(i+1).padStart(2)}. ${d.date}(${d.weekday}) ${d.score}점 [${d.dayGapja}/${d.stemSipsin}] ${eventStr}`);
});

console.log(`\n■ 7개월 중 절대 피해야 할 날 TOP 10`);
sorted.slice(-10).reverse().forEach((d,i) => {
  const eventStr = [...new Set(d.events.map(e=>e.type))].slice(0,2).join(",");
  console.log(`  ${String(i+1).padStart(2)}. ${d.date}(${d.weekday}) ${d.score}점 [${d.dayGapja}] ${eventStr}`);
});

// 평균 점수 비교
const monthAvg = {};
for (let m = 5; m <= 12; m++) {
  const days = m === 5 ? allDays.filter(d => d.date.startsWith("2026-05"))
                       : allDays.filter(d => d.date.startsWith(`2026-${String(m).padStart(2,"0")}`));
  if (days.length > 0) {
    monthAvg[m] = Math.round(days.reduce((a,b)=>a+b.score,0)/days.length);
  }
}
console.log(`\n■ 월별 평균 점수 비교 (높을수록 좋은 달)`);
const sortedMonths = Object.entries(monthAvg).sort((a,b)=>b[1]-a[1]);
sortedMonths.forEach(([m, avg]) => {
  const bars = "█".repeat(Math.floor(avg/3));
  const star = avg >= 60 ? " ⭐" : avg >= 55 ? " ✓" : avg < 50 ? " ⚠" : "";
  console.log(`  ${m}월: ${avg}점 ${bars}${star}`);
});

console.log("\n" + "═".repeat(75));
