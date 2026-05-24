// 3인 사주 매트릭스: 최성훈·김건희·DAWN(이던/김효종)
import { calculateSaju, CHEONGAN, JIJI, CHEONGAN_KOR, JIJI_KOR, STEM_OHAENG, BRANCH_OHAENG, ANIMALS } from "../core/saju.js";
import { analyzeGunghap } from "../core/gunghap.js";
import { analyzeShinsal } from "../core/mudang.js";
import { determineYongsin } from "../core/yongsin.js";
import { determineGeokguk } from "../core/geokguk.js";
import { analyzeMonth, analyzeDay } from "../core/wol_il.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const ilju = JSON.parse(fs.readFileSync(root + "data/ilju60.json"));
const mudang = JSON.parse(fs.readFileSync(root + "data/korea_mudang.json"));
const ddi = JSON.parse(fs.readFileSync(root + "data/ddi_gunghap.json"));

// 세 사람
const seonghoon = calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });
const geonhee   = calculateSaju({ year:1995, month:6,  day:3,  hour:8, minute:30, gender:"M", longitude:127.0 });
// DAWN/이던 = 1994-06-01 시각 미상 → 정오
const dawn      = calculateSaju({ year:1994, month:6,  day:1,  hour:12, minute:0, gender:"M", useTrueSolarTime:false });

console.log("═".repeat(75));
console.log("  🎵 3인 사주 매트릭스 — 최성훈·김건희·DAWN(이던/김효종)");
console.log("═".repeat(75));

// === 1. 3인 사주 비교 ===
console.log("\n■ 3인 사주 비교");
console.log("                  년주   월주   일주   시주   일간   띠      신강/약        격국");
function print(name, s) {
  const ys = determineYongsin(s);
  const gk = determineGeokguk(s, ys.strength);
  console.log(`  ${name.padEnd(12)} ${s.pillars.year.gapja}  ${s.pillars.month.gapja}  ${s.pillars.day.gapja}  ${s.pillars.hour.gapja}  ${s.dayMaster.stemHan}(${s.dayMaster.stemKor})  ${s.animal.padEnd(4)}  ${ys.strength.score}점 ${ys.strength.grade.padEnd(8)} ${gk.name}`);
}
print("최성훈(나)", seonghoon);
print("김건희(형)", geonhee);
print("DAWN(이던)", dawn);

// === 2. DAWN 사주 풀이 ===
console.log("\n■ DAWN(김효종, 이던) 사주 풀이");
const dIlju = ilju.data[dawn.pillars.day.gapja];
console.log(`  일주: ${dawn.pillars.day.gapja}(${dIlju.kor}) - ${dIlju.animal}띠 일주`);
console.log(`  본성: ${dIlju.character}`);
console.log(`  연애: ${dIlju.love}`);
console.log(`  직업: ${dIlju.career}`);
console.log(`  재물: ${dIlju.money}`);
console.log(`  ※ 무당: ${dIlju.mudang}`);

const dYS = determineYongsin(dawn);
const dGK = determineGeokguk(dawn, dYS.strength);
console.log(`\n  격국: ${dGK.name}`);
console.log(`     → ${dGK.desc}`);
console.log(`     → 적성: ${dGK.career}`);
console.log(`\n  용신: ${dYS.primary.method} = ${dYS.primary.ohaeng}`);
console.log(`     처방: ${dYS.primary.prescription?.color || ""} / ${dYS.primary.prescription?.job || ""}`);
console.log(`     기신: ${dYS.gisin}`);

console.log(`\n  오행: ${Object.entries(dawn.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  충: ${dawn.relations.chung.join(", ") || "없음"}`);
console.log(`  합/삼합: ${[...dawn.relations.hap, ...dawn.relations.samhap].join(", ") || "없음"}`);

const dShinsal = analyzeShinsal(dawn);
console.log(`\n  신살 (${dShinsal.length}개):`);
dShinsal.forEach(s => console.log(`    · ${s.name} [${s.type}]`));

// === 3. 1:1 궁합 (3페어) ===
console.log("\n■ 1:1 궁합 매트릭스 (3페어)");
const pairs = [
  ["최성훈↔김건희(형)", seonghoon, geonhee, "S", "G"],
  ["최성훈↔DAWN(이던)", seonghoon, dawn, "S", "D"],
  ["김건희(형)↔DAWN(이던)", geonhee, dawn, "G", "D"],
];
const pairResults = {};
pairs.forEach(([label, a, b, ak, bk]) => {
  const g = analyzeGunghap(a, b);
  pairResults[ak+bk] = g;
  console.log(`\n  ▣ ${label}`);
  console.log(`     종합 ${g.total}점 / ${g.grade.grade}급 (${g.grade.text})`);
  console.log(`     · 일간 ${g.dayOhaeng.score}점: ${g.dayOhaeng.type} - ${g.dayOhaeng.desc}`);
  console.log(`     · 띠   ${g.yearBranch.score}점: ${g.yearBranch.type}`);
  console.log(`     · 일지 ${g.dayBranch.score}점: ${g.dayBranch.type}`);
  console.log(`     · 보완 ${g.complement.score}점`);
});

// === 4. 띠궁합 매트릭스 ===
console.log("\n■ 띠궁합");
const animals = { S: ANIMALS[seonghoon.pillars.year.branch], G: ANIMALS[geonhee.pillars.year.branch], D: ANIMALS[dawn.pillars.year.branch] };
console.log(`  최성훈=${animals.S}띠, 김건희=${animals.G}띠, DAWN=${animals.D}띠`);
for (const [a, b, label] of [[animals.S, animals.G, "나↔형"], [animals.S, animals.D, "나↔DAWN"], [animals.G, animals.D, "형↔DAWN"]]) {
  const m = ddi.matrix[a]?.[b];
  console.log(`  ${label}: ${a}↔${b} = ${m?.score}점 (${m?.type})`);
}

// === 5. 3인 오행 보완도 ===
console.log("\n■ 3인 오행 합산 (균형도 분석)");
const total3 = { 목:0, 화:0, 토:0, 금:0, 수:0 };
[seonghoon, geonhee, dawn].forEach(s => {
  for (const k in s.ohaengCount) total3[k] += s.ohaengCount[k];
});
console.log(`  최성훈:    ${Object.entries(seonghoon.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  김건희:    ${Object.entries(geonhee.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  DAWN:      ${Object.entries(dawn.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  3인 합계:  ${Object.entries(total3).map(([k,v])=>`${k}${v}`).join(" ")}`);
const avg = Object.values(total3).reduce((a,b)=>a+b,0) / 5;
console.log(`  평균 ${avg.toFixed(1)}/오행 → ${(Math.max(...Object.values(total3)) - Math.min(...Object.values(total3))) <= 4 ? "균형 좋음 ✓" : "편중 있음 ⚠"}`);

// === 6. 십신 관계 (DAWN이 본인·형에게 무엇인가) ===
function sipsinFromTo(myStem, otherStem) {
  const STEMS_OHAENG = ["목","목","화","화","토","토","금","금","수","수"];
  const myO = STEMS_OHAENG[myStem];
  const oO = STEMS_OHAENG[otherStem];
  const sameYY = (myStem % 2) === (otherStem % 2);
  const SHENG = {"목":"화","화":"토","토":"금","금":"수","수":"목"};
  const KE = {"목":"토","화":"금","토":"수","금":"목","수":"화"};
  if (myO === oO) return sameYY ? "비견" : "겁재";
  if (SHENG[myO] === oO) return sameYY ? "식신" : "상관";
  if (KE[myO] === oO) return sameYY ? "편재" : "정재";
  if (KE[oO] === myO) return sameYY ? "편관" : "정관";
  return sameYY ? "편인" : "정인";
}

console.log("\n■ 십신 관계 (서로에게 어떤 존재인가)");
const sipsinMap = {
  "비견":"동료·자립·경쟁","겁재":"라이벌·재물분탈","식신":"표현·창작 자극","상관":"재능 자극·반항",
  "편재":"유동재·사업","정재":"안정재·실무","편관":"권위·압박","정관":"멘토·체계",
  "편인":"비주류·영감","정인":"후원자·스승",
};
for (const [aName, a, bName, b] of [
  ["최성훈","S","→ 김건희","G"], ["김건희","G","→ 최성훈","S"],
  ["최성훈","S","→ DAWN","D"], ["DAWN","D","→ 최성훈","S"],
  ["김건희","G","→ DAWN","D"], ["DAWN","D","→ 김건희","G"],
]) {
  const persons = { S: seonghoon, G: geonhee, D: dawn };
  const sip = sipsinFromTo(persons[a].dayMaster.stem, persons[b].dayMaster.stem);
  console.log(`  ${aName.padEnd(8)} ${bName.padEnd(10)} ${sip.padEnd(4)}  (${sipsinMap[sip] || ""})`);
}

// === 7. 3인 공통 길일·흉일 ===
console.log("\n■ 2026년 3인 공통 길일·흉일 분석");
let bestDay = { score: -1 };
let worstDay = { score: 9999 };
const bestList = [];
const worstList = [];

for (let m = 1; m <= 12; m++) {
  const sMonth = analyzeMonth(seonghoon, 2026, m, "M");
  const gMonth = analyzeMonth(geonhee, 2026, m, "M");
  const dMonth = analyzeMonth(dawn, 2026, m, "M");
  sMonth.days.forEach((d, i) => {
    const total = d.score + gMonth.days[i].score + dMonth.days[i].score;
    if (total > bestDay.score) {
      bestDay = { score: total, date: d.date, weekday: d.weekday,
                  s: d.score, g: gMonth.days[i].score, dd: dMonth.days[i].score,
                  sDay: d.dayGapja, gDay: gMonth.days[i].dayGapja, dDay: dMonth.days[i].dayGapja };
    }
    if (total < worstDay.score) {
      worstDay = { score: total, date: d.date, weekday: d.weekday,
                   s: d.score, g: gMonth.days[i].score, dd: dMonth.days[i].score };
    }
    if (total >= 200) bestList.push({date:d.date, weekday:d.weekday, total, s:d.score, g:gMonth.days[i].score, dd:dMonth.days[i].score, sDay:d.dayGapja});
    if (total <= 130) worstList.push({date:d.date, weekday:d.weekday, total, s:d.score, g:gMonth.days[i].score, dd:dMonth.days[i].score});
  });
}

console.log(`\n■ 2026 3인 함께 최고의 날 (TOP 7)`);
bestList.sort((a,b)=>b.total-a.total).slice(0,7).forEach((d, i) => {
  console.log(`  ${i+1}. ${d.date}(${d.weekday}) 합${d.total}점 [나${d.s}+형${d.g}+던${d.dd}] 나일진:${d.sDay}`);
});

console.log(`\n■ 2026 3인 함께 절대 피해야 할 날 (TOP 7)`);
worstList.sort((a,b)=>a.total-b.total).slice(0,7).forEach((d, i) => {
  console.log(`  ${i+1}. ${d.date}(${d.weekday}) 합${d.total}점 [나${d.s}+형${d.g}+던${d.dd}]`);
});

console.log("\n" + "═".repeat(75));
