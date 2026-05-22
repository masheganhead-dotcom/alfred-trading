// 비트코인 + 이더리움 사주 분석 + 60년 거시 사이클
import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, ANIMALS } from "../core/saju.js";
import { yearToGapja, find60YearCycles, compareTwoEras, GAPJA_ERA_KEYWORDS } from "../core/era.js";
import { analyzeYear, predictNextYears } from "../core/sigi.js";
import { analyzeGunghap } from "../core/gunghap.js";

console.log("═".repeat(75));
console.log("  💰 비트코인·이더리움 60갑자 시대 사이클 분석");
console.log("═".repeat(75));

// === 1. 비트코인 사주 (2개 후보) ===
console.log("\n■ 비트코인 출생 사주 (2개 후보)");
const btc_whitepaper = calculateSaju({year:2008, month:10, day:31, hour:12, useTrueSolarTime:false});
const btc_genesis = calculateSaju({year:2009, month:1, day:3, hour:18, useTrueSolarTime:false}); // 제네시스 블록

console.log(`  [백서] 2008-10-31: ${btc_whitepaper.pillars.year.gapja} ${btc_whitepaper.pillars.month.gapja} ${btc_whitepaper.pillars.day.gapja} - 일간 ${btc_whitepaper.dayMaster.stemHan}(${btc_whitepaper.dayMaster.ohaeng})`);
console.log(`    오행: ${Object.entries(btc_whitepaper.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  [제네시스] 2009-01-03: ${btc_genesis.pillars.year.gapja} ${btc_genesis.pillars.month.gapja} ${btc_genesis.pillars.day.gapja} - 일간 ${btc_genesis.dayMaster.stemHan}(${btc_genesis.dayMaster.ohaeng})`);
console.log(`    오행: ${Object.entries(btc_genesis.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  → 둘 다 戊子년(2008) ← 입춘 전이라 동일. 본성: 토극수, 안정 속 재물 축적`);

// 비트코인을 戊子년 기준으로 가져가자 (제네시스 블록 기준)
const btc = btc_genesis;

// === 2. 이더리움 사주 ===
console.log("\n■ 이더리움 출생 사주 (메인넷 2015-07-30)");
const eth = calculateSaju({year:2015, month:7, day:30, hour:15, useTrueSolarTime:false});
console.log(`  ${eth.pillars.year.gapja} ${eth.pillars.month.gapja} ${eth.pillars.day.gapja} - 일간 ${eth.dayMaster.stemHan}(${eth.dayMaster.ohaeng})`);
console.log(`  오행: ${Object.entries(eth.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);

// === 3. 60년 거시 사이클 - 2026 병오년 = 어떤 시기 ===
console.log("\n■ 60년 시대 사이클 — 2026 丙午년 패턴 분석");
const cycles2026 = find60YearCycles(2026, 240);
const cycleEvents2026 = {
  1846: "산업혁명 정점·미멕 전쟁·금융 격동·아편전쟁 직후",
  1906: "을사조약 직후·금융 패닉(1907 미국)·러일전쟁 후폭풍",
  1966: "베트남전·문화대혁명·미국 신경제 정점·증시 사이클 정점 (1968 -36%)",
  2026: "AI 산업화 정점·미중 전환·암호화폐 사이클 후반",
};
cycles2026.cycles.filter(c => cycleEvents2026[c.year]).forEach(c => {
  console.log(`  ${c.year}년 ${c.gapja}: ${cycleEvents2026[c.year]}`);
});

console.log(`\n  💡 1966년 丙午년 → 1968 증시 -36%, 70년대 스태그플레이션 시작`);
console.log(`  💡 1906년 丙午년 → 1907 미국 금융 패닉 (50% 폭락)`);
console.log(`  💡 → 丙午년은 정점 직후·조정 진입 패턴 반복`);

// === 4. 비트코인 + 이더리움 향후 5년 ===
console.log("\n■ 비트코인 향후 5년 운세 (사주 관점)");
const btc_next = predictNextYears(btc, 2026, 5, "M");
btc_next.forEach(y => {
  const types = [...new Set(y.events.map(e=>e.type))].join(", ") || "평년";
  console.log(`  ${y.year} ${y.yearGapja} ${String(y.score).padStart(2)}점 - ${types}`);
});

console.log("\n■ 이더리움 향후 5년 운세");
const eth_next = predictNextYears(eth, 2026, 5, "M");
eth_next.forEach(y => {
  const types = [...new Set(y.events.map(e=>e.type))].join(", ") || "평년";
  console.log(`  ${y.year} ${y.yearGapja} ${String(y.score).padStart(2)}점 - ${types}`);
});

// === 5. 본인 사주 ↔ 비트코인 사주 궁합 ===
console.log("\n■ 최성훈(나) ↔ 비트코인 사주 궁합");
const me = calculateSaju({year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0});
const btcGung = analyzeGunghap(me, btc);
console.log(`  종합 ${btcGung.total}점 / ${btcGung.grade.grade}급 (${btcGung.grade.text})`);
console.log(`  · 일간(${me.dayMaster.stemHan}↔${btc.dayMaster.stemHan}): ${btcGung.dayOhaeng.type} - ${btcGung.dayOhaeng.desc}`);
console.log(`  · 띠(${ANIMALS[me.pillars.year.branch]}↔${ANIMALS[btc.pillars.year.branch]}): ${btcGung.yearBranch.type}`);
console.log(`  · 일지 관계: ${btcGung.dayBranch.type}`);
console.log(`  · 오행 보완: ${btcGung.complement.score}점`);

console.log("\n■ 최성훈(나) ↔ 이더리움 사주 궁합");
const ethGung = analyzeGunghap(me, eth);
console.log(`  종합 ${ethGung.total}점 / ${ethGung.grade.grade}급 (${ethGung.grade.text})`);
console.log(`  · 일간 관계: ${ethGung.dayOhaeng.type} - ${ethGung.dayOhaeng.desc}`);
console.log(`  · 띠(${ANIMALS[me.pillars.year.branch]}↔${ANIMALS[eth.pillars.year.branch]}): ${ethGung.yearBranch.type}`);
console.log(`  · 일지 관계: ${ethGung.dayBranch.type}`);

// === 6. 시장 사이클 키워드 분석 ===
console.log("\n■ 2026~2030 갑자별 시장 키워드");
const marketImpl = {
  "丙午": { meaning: "정점·발산·격변", market: "정점 후 조정 / 단기 격동·중기 하락", risk: "높음" },
  "丁未": { meaning: "예술·문화·종교", market: "감성 자산(미디어·콘텐츠)에 유리 / 가상자산 조정 지속", risk: "중간" },
  "戊申": { meaning: "안정·기술", market: "기술주·우량주 회복 / 코인 바닥 + 신규 자본 유입", risk: "중간" },
  "己酉": { meaning: "정밀·실용", market: "선별적 회복 / 옥석 가리기", risk: "중간" },
  "庚戌": { meaning: "권위·정의·강건", market: "규제 강화 / 우량 자산 차별화", risk: "중간" },
};
for (const y of [2026, 2027, 2028, 2029, 2030]) {
  const gj = yearToGapja(y).gapja;
  const m = marketImpl[gj];
  console.log(`  ${y} ${gj}: ${m.meaning} → ${m.market} [위험${m.risk}]`);
}

// === 7. 본인 사주와 결합한 결론 ===
console.log("\n■ 본인 사주 ↔ 코인 시장 결합 분석");
console.log(`  · 본인 사주: 편재격 + 극신약 + 재성공망 + 화 결핍`);
console.log(`  · 의미: "큰돈 보여도 잡으려 하면 새어나감" — 사주에 박힌 패턴`);
console.log(`  · 현재 대운 (乙丑, 2018~2027): 답답한 시기 - 큰 투자 불리`);
console.log(`  · 2028년부터 丙寅 대운 진입 - 화목 강해짐 - 본격 재산 형성기`);

console.log("\n" + "═".repeat(75));
console.log("  ⚠ 면책: 사주는 패턴 분석 도구이며 가격 예측이 아닙니다");
console.log("═".repeat(75));
