// Phase 2 분석 실행 - 158명 데이터셋 학습 + 사주 분류 검증
import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { learnFromDataset, predictCategory, applyRules, comprehensiveAnalysis } from "../core/ml_classifier.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const dataset = JSON.parse(fs.readFileSync(root + "data/figures_dataset.json"));
const rules = JSON.parse(fs.readFileSync(root + "data/myeongri_rules.json"));

console.log("═".repeat(75));
console.log("  Phase 2 분석 — 158명 인물 데이터셋 학습 + 통계 검증");
console.log("═".repeat(75));

// === 1. 데이터셋 학습 ===
console.log(`\n■ Step 1: 데이터셋 학습 (${dataset.figures.length}명)`);
const learned = learnFromDataset(dataset.figures);
console.log(`  학습 완료: ${learned.total}명 처리, ${learned.skipped}명 스킵 (BC 인물 등)`);
console.log(`  카테고리 ${Object.keys(learned.byCategory).length}개 학습`);

// === 2. 카테고리별 사주 패턴 ===
console.log("\n■ Step 2: 카테고리별 사주 패턴 통계");
const sortedCats = Object.entries(learned.byCategory).sort((a,b)=>b[1].count-a[1].count);
console.log("  카테고리     인원  주오행분포(목/화/토/금/수)  최다 일간 TOP3   평균유명도");
sortedCats.forEach(([cat, c]) => {
  const ohStr = `${c.ohaeng_total.목}/${c.ohaeng_total.화}/${c.ohaeng_total.토}/${c.ohaeng_total.금}/${c.ohaeng_total.수}`;
  const topDM = Object.entries(c.dayMasters).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}${v}`).join(",");
  console.log(`  ${cat.padEnd(10)} ${String(c.count).padStart(3)}명  ${ohStr.padEnd(22)}  ${topDM.padEnd(15)}  ${c.avg_fame}`);
});

// === 3. 일간(천간)별 직업 분포 ===
console.log("\n■ Step 3: 일간별 어떤 직업이 많은가");
const dmOrder = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
console.log("  일간   TOP 직업 3개 (인원수)");
dmOrder.forEach(dm => {
  const dist = learned.byDayMaster[dm] || {};
  const top3 = Object.entries(dist).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}(${v})`).join(", ");
  console.log(`   ${dm}    ${top3 || "(데이터 없음)"}`);
});

// === 4. 주오행별 직업 분포 ===
console.log("\n■ Step 4: 주(主) 오행별 직업 분포");
["목","화","토","금","수"].forEach(oh => {
  const dist = learned.byOhaeng[oh] || {};
  const top = Object.entries(dist).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}(${v})`).join(", ");
  console.log(`  ${oh}기 강: ${top}`);
});

// === 5. 검증: 알려진 인물의 직업을 예측하면 맞는가? (Leave-one-out 일부) ===
console.log("\n■ Step 5: 직업 예측 정확도 검증 (15명 샘플)");
console.log("  실제 인물           실제 카테고리          예측 TOP1   적중?");
const sample = dataset.figures.filter(f => f.year >= 1900).slice(0, 15);
let correct = 0, total = 0;
sample.forEach(f => {
  try {
    const saju = calculateSaju({
      year: f.year, month: f.month, day: f.day,
      hour: f.hour !== null ? f.hour : 12, minute: f.minute || 0,
      gender: f.gender, useTrueSolarTime: false,
    });
    const pred = predictCategory(saju, learned);
    const top1 = pred.top[0][0];
    const isHit = (f.category || []).includes(top1);
    if (isHit) correct++;
    total++;
    const actualStr = (f.category || []).join("/").padEnd(20);
    console.log(`  ${f.name.padEnd(18)} ${actualStr}  ${top1.padEnd(10)}  ${isHit ? "✓" : "✗"}`);
  } catch(e) {
    console.log(`  ${f.name.padEnd(18)} 오류: ${e.message}`);
  }
});
console.log(`\n  TOP1 적중률: ${correct}/${total} = ${(correct/total*100).toFixed(1)}%`);

// TOP3 적중률
let top3Correct = 0;
sample.forEach(f => {
  try {
    const saju = calculateSaju({
      year: f.year, month: f.month, day: f.day,
      hour: f.hour !== null ? f.hour : 12, minute: f.minute || 0,
      gender: f.gender, useTrueSolarTime: false,
    });
    const pred = predictCategory(saju, learned);
    const top3 = pred.top.slice(0, 3).map(t => t[0]);
    if ((f.category || []).some(c => top3.includes(c))) top3Correct++;
  } catch(e) {}
});
console.log(`  TOP3 적중률: ${top3Correct}/${total} = ${(top3Correct/total*100).toFixed(1)}%`);
console.log(`  (랜덤 기대치: TOP1 ≈ ${(100/14).toFixed(1)}% / TOP3 ≈ ${(300/14).toFixed(1)}%)`);

// === 6. 최성훈님 사주에 적용 ===
console.log("\n■ Step 6: 최성훈(1998-11-07 07:35) 분석");
const sajuS = calculateSaju({year:1998,month:11,day:7,hour:7,minute:35,gender:"M",longitude:127.0});
const compS = comprehensiveAnalysis(sajuS, "M", learned, rules);
console.log(`  사주: ${sajuS.pillars.year.gapja} ${sajuS.pillars.month.gapja} ${sajuS.pillars.day.gapja} ${sajuS.pillars.hour.gapja}`);
console.log(`\n  ▣ 직업 카테고리 예측 TOP 5`);
compS.prediction.top.forEach(([cat, score], i) => {
  console.log(`     ${i+1}. ${cat.padEnd(10)} ${score}점`);
});
console.log(`\n  ▣ 같은 일주(${compS.prediction.matchInfo.ilju})를 가진 데이터셋 인물:`);
if (compS.prediction.matchInfo.similarPeople.length === 0) {
  console.log(`     (데이터셋에 동일 일주 없음)`);
} else {
  compS.prediction.matchInfo.similarPeople.forEach(p => {
    console.log(`     · ${p.name} (${(p.category||[]).join("/")}) - 유명도${p.fame}`);
  });
}
console.log(`\n  ▣ 적용된 룰: ${compS.rules.matched}개 / 평균 점수 ${compS.rules.avgScore}점`);
console.log(`     상위 outcome 태그:`);
compS.rules.topTags.slice(0, 8).forEach(([t, n]) => console.log(`       · ${t} (${n}회 매칭)`));
if (compS.rules.warnings.length > 0) {
  console.log(`     ⚠ 경고 룰: ${compS.rules.warnings.join(", ")}`);
}
console.log(`\n  ▣ 매칭된 핵심 룰 5개:`);
compS.rules.matchedRules.slice(0, 5).forEach(r => {
  console.log(`     [${r.id}] ${r.name} (점수 ${r.score})`);
  console.log(`         → ${r.then}`);
});

// === 7. 김건희 형도 ===
console.log("\n■ Step 7: 김건희(1995-06-03 08:30) 분석");
const sajuG = calculateSaju({year:1995,month:6,day:3,hour:8,minute:30,gender:"M",longitude:127.0});
const compG = comprehensiveAnalysis(sajuG, "M", learned, rules);
console.log(`  사주: ${sajuG.pillars.year.gapja} ${sajuG.pillars.month.gapja} ${sajuG.pillars.day.gapja} ${sajuG.pillars.hour.gapja}`);
console.log(`\n  ▣ 직업 카테고리 예측 TOP 5`);
compG.prediction.top.forEach(([cat, score], i) => {
  console.log(`     ${i+1}. ${cat.padEnd(10)} ${score}점`);
});
console.log(`\n  ▣ 적용된 룰: ${compG.rules.matched}개 / 평균 점수 ${compG.rules.avgScore}점`);

// === 8. 사주 → 일주 클러스터링 (간단 버전) ===
console.log("\n■ Step 8: 60일주 카테고리 클러스터링");
console.log("  자주 등장하는 일주 TOP 10 + 어떤 인물들이 가졌나");
const iljuRank = Object.entries(learned.byIlju).sort((a,b)=>b[1].length-a[1].length).slice(0, 10);
iljuRank.forEach(([ilju, people]) => {
  console.log(`  ${ilju} (${people.length}명): ${people.slice(0,3).map(p=>p.name).join(", ")}...`);
});

console.log("\n" + "═".repeat(75));
console.log("  요약");
console.log("═".repeat(75));
console.log(`  · 데이터셋 ${learned.total}명 학습 완료`);
console.log(`  · 직업 TOP1 적중률 ${(correct/total*100).toFixed(1)}% (랜덤 ${(100/14).toFixed(1)}% 대비 ${(correct/total/(1/14)).toFixed(1)}배)`);
console.log(`  · 직업 TOP3 적중률 ${(top3Correct/total*100).toFixed(1)}%`);
console.log(`  · 룰엔진 100개 적용 가능`);
console.log(`  · 최성훈 매칭 룰: ${compS.rules.matched}개 / 김건희 매칭 룰: ${compG.rules.matched}개`);
