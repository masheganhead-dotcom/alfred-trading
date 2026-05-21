// 5인 사주 매트릭스: 최성훈·김건희·DAWN·JUNNY·Andnew
import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, ANIMALS } from "../core/saju.js";
import { analyzeGunghap } from "../core/gunghap.js";
import { analyzeShinsal } from "../core/mudang.js";
import { determineYongsin } from "../core/yongsin.js";
import { determineGeokguk } from "../core/geokguk.js";
import { analyzeMonth } from "../core/wol_il.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const ilju = JSON.parse(fs.readFileSync(root + "data/ilju60.json"));
const ddi = JSON.parse(fs.readFileSync(root + "data/ddi_gunghap.json"));

const people = {
  "최성훈(나)":  calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 }),
  "김건희(형)":  calculateSaju({ year:1995, month:6,  day:3,  hour:8, minute:30, gender:"M", longitude:127.0 }),
  "DAWN(이던)": calculateSaju({ year:1994, month:6,  day:1,  hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
  "JUNNY":     calculateSaju({ year:1996, month:4,  day:6,  hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
  "Andnew":    calculateSaju({ year:1997, month:5,  day:12, hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
};

const me = people["최성훈(나)"];

console.log("═".repeat(80));
console.log("  🎵 5인 사주 매트릭스 — 최성훈·김건희·DAWN·JUNNY·Andnew");
console.log("═".repeat(80));

// === 1. 5인 사주 비교 ===
console.log("\n■ 5인 사주 비교");
console.log("                   년주    월주    일주    시주    일간    띠       신강/약        격국");
for (const [name, s] of Object.entries(people)) {
  const ys = determineYongsin(s);
  const gk = determineGeokguk(s, ys.strength);
  console.log(`  ${name.padEnd(12)} ${s.pillars.year.gapja}  ${s.pillars.month.gapja}  ${s.pillars.day.gapja}  ${s.pillars.hour.gapja}  ${s.dayMaster.stemHan}(${s.dayMaster.stemKor})  ${s.animal.padEnd(4)}  ${String(ys.strength.score).padStart(2)}점 ${ys.strength.grade.padEnd(8)} ${gk.name}`);
}

// === 2. JUNNY & Andnew 사주 풀이 ===
console.log("\n■ JUNNY (김형준, 1996-04-06) 사주 풀이");
const j = people["JUNNY"];
const jIlju = ilju.data[j.pillars.day.gapja];
const jYS = determineYongsin(j);
const jGK = determineGeokguk(j, jYS.strength);
console.log(`  일주: ${j.pillars.day.gapja}(${jIlju.kor}) - ${jIlju.animal}띠 일주`);
console.log(`  본성: ${jIlju.character}`);
console.log(`  직업: ${jIlju.career}`);
console.log(`  ※ 무당: ${jIlju.mudang}`);
console.log(`  격국: ${jGK.name} → ${jGK.career}`);
console.log(`  용신: ${jYS.primary.method}=${jYS.primary.ohaeng} / 기신: ${jYS.gisin}`);
console.log(`  처방: ${jYS.primary.prescription?.color||""} / ${jYS.primary.prescription?.job||""}`);
console.log(`  오행: ${Object.entries(j.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  형충: ${j.relations.chung.join(", ")||"없음"} / 합: ${[...j.relations.hap, ...j.relations.samhap].join(", ")||"없음"}`);
const jShinsal = analyzeShinsal(j);
console.log(`  신살: ${jShinsal.map(s=>s.name.replace(/\(.+\)/g,"")).join(", ") || "없음"}`);

console.log("\n■ Andnew (정창윤, 1997-05-12) 사주 풀이");
const a = people["Andnew"];
const aIlju = ilju.data[a.pillars.day.gapja];
const aYS = determineYongsin(a);
const aGK = determineGeokguk(a, aYS.strength);
console.log(`  일주: ${a.pillars.day.gapja}(${aIlju.kor}) - ${aIlju.animal}띠 일주`);
console.log(`  본성: ${aIlju.character}`);
console.log(`  직업: ${aIlju.career}`);
console.log(`  ※ 무당: ${aIlju.mudang}`);
console.log(`  격국: ${aGK.name} → ${aGK.career}`);
console.log(`  용신: ${aYS.primary.method}=${aYS.primary.ohaeng} / 기신: ${aYS.gisin}`);
console.log(`  처방: ${aYS.primary.prescription?.color||""} / ${aYS.primary.prescription?.job||""}`);
console.log(`  오행: ${Object.entries(a.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  형충: ${a.relations.chung.join(", ")||"없음"} / 합: ${[...a.relations.hap, ...a.relations.samhap].join(", ")||"없음"}`);
const aShinsal = analyzeShinsal(a);
console.log(`  신살: ${aShinsal.map(s=>s.name.replace(/\(.+\)/g,"")).join(", ") || "없음"}`);

// === 3. 본인 vs 다른 4명 궁합 ===
console.log("\n■ 최성훈(나) 기준 1:1 궁합 매트릭스");
console.log("  상대            종합  등급   일간(점)/관계         띠(점)/타입         일지(점)   보완");
for (const [name, s] of Object.entries(people)) {
  if (name === "최성훈(나)") continue;
  const g = analyzeGunghap(me, s);
  console.log(`  ${name.padEnd(12)} ${String(g.total).padStart(3)}점 ${g.grade.grade.padEnd(2)}급  ${String(g.dayOhaeng.score).padStart(2)}점/${g.dayOhaeng.type.padEnd(8)}  ${String(g.yearBranch.score).padStart(2)}점/${g.yearBranch.type.padEnd(5)}  ${String(g.dayBranch.score).padStart(2)}점/${g.dayBranch.type.padEnd(5)}  ${String(g.complement.score).padStart(2)}점`);
}

// === 4. 십신 관계 ===
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

console.log("\n■ 최성훈 ↔ 4명 십신 관계");
const sipsinMap = {
  "비견":"동료·자립·경쟁","겁재":"라이벌·재물분탈","식신":"표현·먹복·연구","상관":"재능·반항·자극",
  "편재":"유동재·사업","정재":"안정재·실무·신뢰","편관":"권위·압박·시련","정관":"멘토·체계·규범",
  "편인":"비주류·영감·종교","정인":"후원자·스승·학문",
};
for (const [name, s] of Object.entries(people)) {
  if (name === "최성훈(나)") continue;
  const meToOther = sipsinFromTo(me.dayMaster.stem, s.dayMaster.stem);
  const otherToMe = sipsinFromTo(s.dayMaster.stem, me.dayMaster.stem);
  console.log(`  ${name.padEnd(12)} 나→상대: ${meToOther.padEnd(4)} (${sipsinMap[meToOther]||""})  /  상대→나: ${otherToMe.padEnd(4)} (${sipsinMap[otherToMe]||""})`);
}

// === 5. 띠궁합 ===
console.log("\n■ 띠궁합");
const meAnimal = ANIMALS[me.pillars.year.branch];
for (const [name, s] of Object.entries(people)) {
  if (name === "최성훈(나)") continue;
  const otherAnimal = ANIMALS[s.pillars.year.branch];
  const m = ddi.matrix[meAnimal]?.[otherAnimal];
  console.log(`  나(${meAnimal})↔${name}(${otherAnimal}) = ${m?.score}점 (${m?.type}) ${m?.desc||""}`);
}

// === 6. 5인 오행 합산 ===
console.log("\n■ 5인 오행 합산 + 보완 분석");
const total = { 목:0, 화:0, 토:0, 금:0, 수:0 };
for (const [name, s] of Object.entries(people)) {
  console.log(`  ${name.padEnd(12)} ${Object.entries(s.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
  for (const k in s.ohaengCount) total[k] += s.ohaengCount[k];
}
console.log(`  ${"합계(5인)".padEnd(12)} ${Object.entries(total).map(([k,v])=>`${k}${v}`).join(" ")}`);

// === 7. 본인+한 명 컴비별 2026 5/29 점수 ===
console.log("\n■ 본인 + 1명 컴비별 2026/5/29(금) 시너지 점수");
const may = analyzeMonth(me, 2026, 5, "M");
const myMay29 = may.days.find(d => d.date === "2026-05-29");
console.log(`  최성훈 단독 5/29 점수: ${myMay29.score}점`);
for (const [name, s] of Object.entries(people)) {
  if (name === "최성훈(나)") continue;
  const oMay = analyzeMonth(s, 2026, 5, "M");
  const o29 = oMay.days.find(d => d.date === "2026-05-29");
  const sum = myMay29.score + o29.score;
  console.log(`  + ${name.padEnd(12)} = ${name} ${o29.score}점, 합 ${sum}점 ${sum>=140?"🌟":sum>=120?"✓":"·"}`);
}

// === 8. 각 컴비별 일간 색 매핑 ===
console.log("\n■ 본인이 각자에게 줄 수 있는 사주적 자원 (오행 강점)");
for (const [name, s] of Object.entries(people)) {
  if (name === "최성훈(나)") continue;
  const myOh = me.ohaengCount;
  const otherOh = s.ohaengCount;
  const giveable = [];
  for (const k of ["목","화","토","금","수"]) {
    if (myOh[k] >= 2 && otherOh[k] <= 1) giveable.push(`${k}(나${myOh[k]}→상대${otherOh[k]})`);
  }
  const receivable = [];
  for (const k of ["목","화","토","금","수"]) {
    if (otherOh[k] >= 2 && myOh[k] <= 1) receivable.push(`${k}(상대${otherOh[k]}→나${myOh[k]})`);
  }
  console.log(`  ${name}`);
  console.log(`    내가 줄 수 있음: ${giveable.join(", ")||"(없음)"}`);
  console.log(`    내가 받을 수 있음: ${receivable.join(", ")||"(없음)"}`);
}

console.log("\n" + "═".repeat(80));
