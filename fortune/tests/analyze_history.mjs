// 역사·시대·국가 사주 분석 실행
import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { analyzeHistoricalFigures, findCommonPatterns, compareTwoEras, find60YearCycles, yearToGapja, combinePersonalAndEra, GAPJA_ERA_KEYWORDS } from "../core/era.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const hist = JSON.parse(fs.readFileSync(root + "data/history_charts.json"));

console.log("═".repeat(75));
console.log("  역사·시대·국가 사주 인사이트 — 시스템 범위 확장 분석");
console.log("═".repeat(75));

// === 1. 한국 역사적 인물 사주 일괄 분석 ===
console.log("\n■ 한국 역사적 인물 사주 일괄");
const koreanAnalyzed = analyzeHistoricalFigures(hist.korean_figures);
console.log("  이름         양력생일        년주   월주   일주(일간) 띠     주오행");
koreanAnalyzed.forEach(f => {
  if (f.error) return;
  const topOhaeng = Object.entries(f.ohaeng).sort((a,b)=>b[1]-a[1])[0];
  const dateStr = `${f.year}-${String(f.month).padStart(2,"0")}-${String(f.day).padStart(2,"0")}`;
  console.log(`  ${f.name.padEnd(10)} ${dateStr}    ${f.gapja_year}  ${f.gapja_month}  ${f.gapja_day}(${f.dayMaster})    ${f.animal.padEnd(4)} ${topOhaeng[0]}${topOhaeng[1]}`);
});

// 공통 패턴
console.log("\n■ 한국 역사적 인물 공통 사주 패턴");
const koreanPattern = findCommonPatterns(koreanAnalyzed);
console.log(`  표본 ${koreanPattern.sample}명`);
console.log(`  일간 분포: ${koreanPattern.dayMasters.map(([k,v]) => `${k}=${v}`).join(", ")}`);
console.log(`  띠 분포:   ${koreanPattern.animals.slice(0, 5).map(([k,v]) => `${k}띠=${v}`).join(", ")}`);
console.log(`  오행 평균: ${Object.entries(koreanPattern.ohaengAvg).map(([k,v]) => `${k}${v}`).join(" ")}`);

// === 2. 국가 사주 ===
console.log("\n■ 국가·정부 건국일 사주");
const nations = analyzeHistoricalFigures(hist.nations);
nations.forEach(n => {
  if (n.error) return;
  console.log(`  ${n.name.padEnd(20)} ${n.year}-${String(n.month).padStart(2,"0")}-${String(n.day).padStart(2,"0")}  → ${n.gapja_year} / ${n.gapja_month} / ${n.gapja_day}(${n.dayMaster}일간)`);
});

// === 3. 대한민국 건국 사주 정밀 분석 (1948-08-15 11:00) ===
console.log("\n■ 대한민국 건국 사주 정밀");
const rok = calculateSaju({ year: 1948, month: 8, day: 15, hour: 11, gender: "M", useTrueSolarTime: false });
console.log(`  사주: ${rok.pillars.year.gapja} ${rok.pillars.month.gapja} ${rok.pillars.day.gapja} ${rok.pillars.hour.gapja}`);
console.log(`  일간(국가 본성): ${rok.dayMaster.stemHan}(${rok.dayMaster.stemKor}) - ${rok.dayMaster.ohaeng}·${rok.dayMaster.yinyang}`);
console.log(`  오행: ${Object.entries(rok.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  충: ${rok.relations.chung.join(", ") || "없음"}`);
console.log(`  합: ${rok.relations.hap.join(", ") || "없음"} / 삼합: ${rok.relations.samhap.join(", ") || "없음"}`);

// === 4. 60년 주기 시대 사이클 ===
console.log("\n■ 60년 주기 시대 사이클 — 2026년(병오) 기준");
const cycles = find60YearCycles(2026, 240);
console.log(`  같은 갑자(${cycles.targetGapja}) 반복 연도들과 그 시대 사건:`);
const cycleEvents = {
  1726: "영조 즉위 직후·실학 태동",
  1786: "정조 개혁기·미국 독립 이후",
  1846: "조선 후기·세도정치·서양 침입 시작",
  1906: "을사조약·국권 침탈 본격화",
  1966: "박정희 산업화·문화대혁명·베트남전",
  2026: "AI 대중화·미중 전환·생성형 AI 산업화 정점",
  2086: "(미래) 다음 사이클",
};
cycles.cycles.forEach(c => {
  const evt = cycleEvents[c.year] || "";
  console.log(`  ${c.year}년 (${c.gapja})  ${evt}`);
});

// === 5. 60갑자별 시대 키워드 ===
console.log(`\n■ 2026년 ${cycles.targetGapja}년 시대 키워드: "${GAPJA_ERA_KEYWORDS[cycles.targetGapja]}"`);
console.log(`   2027년 ${yearToGapja(2027).gapja}: "${GAPJA_ERA_KEYWORDS[yearToGapja(2027).gapja]}"`);
console.log(`   2028년 ${yearToGapja(2028).gapja}: "${GAPJA_ERA_KEYWORDS[yearToGapja(2028).gapja]}"`);
console.log(`   2029년 ${yearToGapja(2029).gapja}: "${GAPJA_ERA_KEYWORDS[yearToGapja(2029).gapja]}"`);
console.log(`   2030년 ${yearToGapja(2030).gapja}: "${GAPJA_ERA_KEYWORDS[yearToGapja(2030).gapja]}"`);

// === 6. 사용자(최성훈, 1998) 사주 ↔ 시대 결합 ===
console.log("\n■ 최성훈(1998생) 대운 ↔ 한국 시대 흐름 결합");
const userSaju = calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });
const combined = combinePersonalAndEra(userSaju, hist);
combined.forEach(c => {
  console.log(`  ${c.ageRange.padEnd(8)} ${c.yearRange.padEnd(11)} ${c.daewoonGapja}(${c.daewoonSipsin||"-"})  → 시대: ${c.eraName} (${c.eraNote})`);
});

// === 7. 한국 건국 사주의 현재 대운 ===
console.log("\n■ 대한민국(1948생) 본인 사주가 현재 어느 대운에 있는가?");
const rokDaewoon = rok.daewoon;
const now = 2026;
const ageNow = now - 1948;
const currentDaewoon = rokDaewoon.list.find(d => ageNow >= d.age && ageNow < d.age + 10);
console.log(`  국가 출생 1948년 → 2026년 현재 ${ageNow}세`);
console.log(`  대운 시작 ${rokDaewoon.startAge}세부터 ${rokDaewoon.forward?"순행":"역행"}`);
console.log(`  현재 대운: ${currentDaewoon ? currentDaewoon.gapja + " (" + (currentDaewoon.sipsinStem||"") + ")" : "범위 밖"}`);
console.log(`  대한민국은 ${currentDaewoon?.gapja || ""} 대운에 머물고 있어, 시대 키워드: "${GAPJA_ERA_KEYWORDS[currentDaewoon?.gapja] || ""}"`);

console.log("\n" + "═".repeat(75));
