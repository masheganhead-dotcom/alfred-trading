// 2026-05-23 토요일 운세 정밀 분석
import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { analyzeDay, pickGoodDays } from "../core/wol_il.js";

const me = calculateSaju({year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0});

const tomorrow = new Date(2026, 4, 23);  // month=4 (0-indexed)
const r = analyzeDay(me, tomorrow, "M");

console.log("═".repeat(60));
console.log("  🔮 2026-05-23 토요일 운세 — 최성훈");
console.log("═".repeat(60));
console.log(`\n  일진: ${r.dayGapja} | 천간십신: ${r.stemSipsin}`);
console.log(`  점수: ${r.score}점 / 등급: ${r.grade}`);
console.log(`  요일: ${r.weekday}요일`);
console.log(`\n  연-월-일 갑자: ${r.yearGapja} 년 · ${r.monthGapja} 월 · ${r.dayGapja} 일\n`);

console.log("  📋 이벤트 신호:");
r.events.forEach(e => console.log(`     · [${e.type}] ${e.text}`));

// 활동별 추천
const activities = ["album_release", "contract", "marriage", "exam", "collaboration", "performance"];
console.log("\n  🎯 활동별 적합도 (이 날 기준):");
for (const a of activities) {
  const picks = pickGoodDays(me, 2026, 5, a, "M");
  const t = picks.monthAnalysis.days.find(d => d.date === "2026-05-23");
  const r2 = picks.top5.find(p => p.date === "2026-05-23");
  const rank = picks.top5.findIndex(p => p.date === "2026-05-23") + 1;
  console.log(`     ${a.padEnd(20)} ${r2 ? r2.activityScore : t.score}점 ${rank > 0 ? `(5월 ${rank}위)` : ''}`);
}

// 시간대별 분석
console.log("\n  ⏰ 시간대별 (오늘 자시·축시·인시 등 12시진):");
const hourBranches = [
  {br:0, han:"子", kor:"자", range:"23:30-01:30"},
  {br:1, han:"丑", kor:"축", range:"01:30-03:30"},
  {br:2, han:"寅", kor:"인", range:"03:30-05:30"},
  {br:3, han:"卯", kor:"묘", range:"05:30-07:30"},
  {br:4, han:"辰", kor:"진", range:"07:30-09:30"},
  {br:5, han:"巳", kor:"사", range:"09:30-11:30"},
  {br:6, han:"午", kor:"오", range:"11:30-13:30"},
  {br:7, han:"未", kor:"미", range:"13:30-15:30"},
  {br:8, han:"申", kor:"신", range:"15:30-17:30"},
  {br:9, han:"酉", kor:"유", range:"17:30-19:30"},
  {br:10, han:"戌", kor:"술", range:"19:30-21:30"},
  {br:11, han:"亥", kor:"해", range:"21:30-23:30"},
];

// 본인 일지(申)와의 합·충 관계
const myDayBranch = 8; // 申
const chungPairs = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const hapPairs = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const samhapGroups = [[8,0,4],[5,9,1],[2,6,10],[11,3,7]];

function checkChung(a, b) { return chungPairs.some(([x,y]) => (a===x&&b===y)||(a===y&&b===x)); }
function checkHap(a, b) { return hapPairs.some(([x,y]) => (a===x&&b===y)||(a===y&&b===x)); }
function checkSamhap(a, b) {
  for (const t of samhapGroups) if (t.includes(a) && t.includes(b) && a!==b) return true;
  return false;
}

for (const h of hourBranches) {
  let mark = " ";
  let note = "";
  if (checkChung(myDayBranch, h.br)) { mark = "⛔"; note = "일지충 - 충돌·다툼"; }
  else if (checkHap(myDayBranch, h.br)) { mark = "🌟"; note = "일지육합 - 최고 시간"; }
  else if (checkSamhap(myDayBranch, h.br)) { mark = "✨"; note = "일지삼합 - 좋은 시간"; }
  else if (h.br === myDayBranch) { mark = "·"; note = "본인 시간 (안정)"; }
  console.log(`     ${mark} ${h.range.padEnd(13)} ${h.han}(${h.kor})시  ${note}`);
}

console.log("\n" + "═".repeat(60));
