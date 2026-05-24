// 김건희 ↔ 최성훈 궁합 + 월별 협업 운세
import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, ANIMALS } from "../core/saju.js";
import { analyzeGunghap } from "../core/gunghap.js";
import { analyzeShinsal } from "../core/mudang.js";
import { determineYongsin } from "../core/yongsin.js";
import { determineGeokguk } from "../core/geokguk.js";
import { analyzeDay, analyzeMonth, pickGoodDays } from "../core/wol_il.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const ilju = JSON.parse(fs.readFileSync(root + "data/ilju60.json"));
const mudang = JSON.parse(fs.readFileSync(root + "data/korea_mudang.json"));
const ddi = JSON.parse(fs.readFileSync(root + "data/ddi_gunghap.json"));

// 두 사람 사주
const seonghoon = calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });
const geonhee   = calculateSaju({ year:1995, month:6,  day:3,  hour:8, minute:30, gender:"M", longitude:127.0 });

console.log("═".repeat(75));
console.log("  🎵 김건희(형) ↔ 최성훈(나) — 음악 동료 궁합 + 월별 협업 분석");
console.log("═".repeat(75));

// === 1. 두 사람 사주 비교 ===
console.log("\n■ 두 사주 비교");
console.log("                    년주   월주   일주   시주   일간    띠      극신약/강");
function print(name, s) {
  const ys = determineYongsin(s);
  console.log(`  ${name.padEnd(8)} → ${s.pillars.year.gapja}  ${s.pillars.month.gapja}  ${s.pillars.day.gapja}  ${s.pillars.hour.gapja}  ${s.dayMaster.stemHan}(${s.dayMaster.stemKor})  ${s.animal.padEnd(4)}  ${ys.strength.score}점 ${ys.strength.grade}`);
}
print("최성훈(나)", seonghoon);
print("김건희(형)", geonhee);

// === 2. 김건희 사주 풀이 ===
console.log("\n■ 김건희 사주 풀이");
const gIlju = ilju.data[geonhee.pillars.day.gapja];
console.log(`  일주: ${geonhee.pillars.day.gapja}(${gIlju.kor}) - ${gIlju.animal}띠 일주`);
console.log(`  본성: ${gIlju.character}`);
console.log(`  직업: ${gIlju.career}`);
console.log(`  ※ 무당: ${gIlju.mudang}`);

const gYongsin = determineYongsin(geonhee);
const gGeokguk = determineGeokguk(geonhee, gYongsin.strength);
console.log(`\n  격국: ${gGeokguk.name} [${gGeokguk.type}]`);
console.log(`     → ${gGeokguk.desc}`);
console.log(`     → 적성: ${gGeokguk.career}`);
console.log(`\n  용신: ${gYongsin.primary.method} = ${gYongsin.primary.ohaeng}`);
console.log(`     처방색: ${gYongsin.primary.prescription?.color || "-"}`);
console.log(`     기신: ${gYongsin.gisin}`);

console.log(`\n  오행: ${Object.entries(geonhee.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);
console.log(`  형충: ${geonhee.relations.chung.join(", ") || "없음"}`);
console.log(`  합:   ${geonhee.relations.hap.join(", ") || "없음"}`);

const gShinsal = analyzeShinsal(geonhee);
console.log(`\n  신살 (${gShinsal.length}개):`);
gShinsal.forEach(s => console.log(`    · ${s.name} [${s.type}]`));

// 십신
console.log(`\n  십신 분포:`);
for (const p of ["year","month","day","hour"]) {
  const pn = {year:"년",month:"월",day:"일",hour:"시"}[p];
  console.log(`    ${pn}주: ${geonhee.sipsin[p].stem || "(나)"}`);
}

// === 3. 궁합 분석 ===
console.log("\n■ 종합 궁합 (최성훈 기준)");
const gunghap = analyzeGunghap(seonghoon, geonhee);
console.log(`  종합 점수: ${gunghap.total}점 / ${gunghap.grade.grade}급 (${gunghap.grade.text})`);
console.log(`\n  ▣ 일간 관계 (${gunghap.dayOhaeng.score}점)`);
console.log(`     ${gunghap.dayOhaeng.type}: ${gunghap.dayOhaeng.desc}`);
console.log(`\n  ▣ 띠 관계 (${gunghap.yearBranch.score}점)`);
console.log(`     ${gunghap.yearBranch.type}: ${gunghap.yearBranch.desc}`);
console.log(`\n  ▣ 일지(친밀) 관계 (${gunghap.dayBranch.score}점)`);
console.log(`     ${gunghap.dayBranch.type}: ${gunghap.dayBranch.desc}`);
console.log(`\n  ▣ 오행 보완도 (${gunghap.complement.score}점)`);
console.log(`     ${gunghap.complement.desc}`);
console.log(`\n  ▣ 종합: ${gunghap.summary}`);

// === 4. 띠궁합 매트릭스 ===
const sAnimal = ANIMALS[seonghoon.pillars.year.branch];
const gAnimal = ANIMALS[geonhee.pillars.year.branch];
const ddiCompat = ddi.matrix[sAnimal]?.[gAnimal];
console.log(`\n■ 띠궁합 (${sAnimal}↔${gAnimal})`);
console.log(`   ${ddiCompat?.score}점 - ${ddiCompat?.type} - ${ddiCompat?.desc || ""}`);
if (ddiCompat?.mudang) console.log(`   ※ ${ddiCompat.mudang}`);

// === 5. 음악 동료로서의 분석 ===
console.log("\n■ 음악 동료·동업자로서의 사주 분석");

// 김건희의 일간이 최성훈에게 어떤 십신인지 (이 사람이 나에게 무엇인가)
const sToG_sipsin = sipsinFromTo(seonghoon.dayMaster.stem, geonhee.dayMaster.stem);
const gToS_sipsin = sipsinFromTo(geonhee.dayMaster.stem, seonghoon.dayMaster.stem);
console.log(`  · 김건희 일간(${geonhee.dayMaster.stemHan})이 최성훈(${seonghoon.dayMaster.stemHan})에게: ${sToG_sipsin}`);
console.log(`     → ${sipsinMeaningForCollab(sToG_sipsin)}`);
console.log(`  · 최성훈이 김건희에게: ${gToS_sipsin}`);
console.log(`     → ${sipsinMeaningForCollab(gToS_sipsin)}`);

// 오행 보완
console.log("\n  · 오행 결핍 보완 (서로 채워주는가)");
for (const oh of ["목","화","토","금","수"]) {
  const sQ = seonghoon.ohaengCount[oh];
  const gQ = geonhee.ohaengCount[oh];
  let note = "";
  if (sQ === 0 && gQ >= 2) note = "✓ 김건희가 최성훈 결핍 보완";
  if (gQ === 0 && sQ >= 2) note = "✓ 최성훈이 김건희 결핍 보완";
  if (sQ >= 4 && gQ <= 1) note = "⚠ 최성훈 과다 → 김건희가 부담";
  if (gQ >= 4 && sQ <= 1) note = "⚠ 김건희 과다 → 최성훈이 부담";
  console.log(`     ${oh}: 최성훈 ${sQ}개 / 김건희 ${gQ}개  ${note}`);
}

// === 6. 향후 12개월 (2026년) 월별 협업 운세 ===
console.log("\n■ 2026년 월별 함께 활동 운세 (1월~12월)");
console.log("  ────────────────────────────────────────────────────────────────");
console.log("  월   월건    최성훈 길일 TOP1                  김건희 길일 TOP1                두사람 공통 길일");
console.log("  ────────────────────────────────────────────────────────────────");

for (let m = 1; m <= 12; m++) {
  const sMonth = analyzeMonth(seonghoon, 2026, m, "M");
  const gMonth = analyzeMonth(geonhee, 2026, m, "M");
  const sTop = sMonth.bestDays[0];
  const gTop = gMonth.bestDays[0];

  // 공통 길일 (두 사람 다 점수 60 이상인 날)
  const commonGood = sMonth.days
    .map((d, i) => ({ s: d, g: gMonth.days[i] }))
    .filter(x => x.s.score >= 60 && x.g.score >= 60)
    .sort((a, b) => (b.s.score + b.g.score) - (a.s.score + a.g.score))
    .slice(0, 2);

  const commonStr = commonGood.length > 0
    ? commonGood.map(x => `${x.s.date.slice(-2)}일(나${x.s.score}/형${x.g.score})`).join(", ")
    : "(공통 길일 없음)";

  console.log(`  ${String(m).padStart(2)}  ${sMonth.monthGapja}  나:${sTop.date.slice(-2)}일(${sTop.dayGapja}/${sTop.score}점)  형:${gTop.date.slice(-2)}일(${gTop.dayGapja}/${gTop.score}점)  공통:${commonStr}`);
}

// === 7. 협업 위험일 (두 사람 다 흉한 날) ===
console.log("\n■ 2026년 협업 절대 피해야 할 날 TOP 10 (두 사람 다 흉)");
const allBadDays = [];
for (let m = 1; m <= 12; m++) {
  const sMonth = analyzeMonth(seonghoon, 2026, m, "M");
  const gMonth = analyzeMonth(geonhee, 2026, m, "M");
  sMonth.days.forEach((d, i) => {
    const gd = gMonth.days[i];
    const combined = d.score + gd.score;
    if (combined < 95) {  // 평균 47.5 미만
      allBadDays.push({ date: d.date, sScore: d.score, gScore: gd.score, sumScore: combined, sDay: d.dayGapja, gDay: gd.dayGapja });
    }
  });
}
allBadDays.sort((a, b) => a.sumScore - b.sumScore).slice(0, 10).forEach(d => {
  console.log(`  ${d.date} | 나 ${d.sScore}점 / 형 ${d.gScore}점 (합 ${d.sumScore}) | 나일진 ${d.sDay} 형일진 ${d.gDay}`);
});

// === 8. 협업 절대 길일 TOP 10 ===
console.log("\n■ 2026년 함께 일하기 절대 길일 TOP 10");
const allGoodDays = [];
for (let m = 1; m <= 12; m++) {
  const sMonth = analyzeMonth(seonghoon, 2026, m, "M");
  const gMonth = analyzeMonth(geonhee, 2026, m, "M");
  sMonth.days.forEach((d, i) => {
    const gd = gMonth.days[i];
    const combined = d.score + gd.score;
    if (combined >= 130) {  // 평균 65 이상
      allGoodDays.push({ date: d.date, weekday: d.weekday, sScore: d.score, gScore: gd.score, sumScore: combined, sDay: d.dayGapja, gDay: gd.dayGapja, sSipsin: d.stemSipsin, gSipsin: gd.stemSipsin });
    }
  });
}
allGoodDays.sort((a, b) => b.sumScore - a.sumScore).slice(0, 10).forEach(d => {
  console.log(`  ${d.date}(${d.weekday}) | 나 ${d.sScore}점/${d.sSipsin} / 형 ${d.gScore}점/${d.gSipsin} | 합 ${d.sumScore}`);
});

// === Helper functions ===
function sipsinFromTo(myStem, otherStem) {
  const myOhaeng = STEM_OHAENG[myStem];
  const oOhaeng = STEM_OHAENG[otherStem];
  const myYY = (myStem % 2 === 0) ? "양" : "음";
  const oYY = (otherStem % 2 === 0) ? "양" : "음";
  const sameYY = myYY === oYY;
  const SHENG = {"목":"화","화":"토","토":"금","금":"수","수":"목"};
  const KE = {"목":"토","화":"금","토":"수","금":"목","수":"화"};
  if (myOhaeng === oOhaeng) return sameYY ? "비견" : "겁재";
  if (SHENG[myOhaeng] === oOhaeng) return sameYY ? "식신" : "상관";
  if (KE[myOhaeng] === oOhaeng) return sameYY ? "편재" : "정재";
  if (KE[oOhaeng] === myOhaeng) return sameYY ? "편관" : "정관";
  return sameYY ? "편인" : "정인";
}

function sipsinMeaningForCollab(s) {
  const map = {
    "비견": "같은 동료. 협력하나 주도권 다툼 가능. 50:50 동업",
    "겁재": "경쟁자·라이벌. 재물 분탈 주의. 명확한 분배 약속 필수",
    "식신": "내 작업의 결과물. 표현·창작을 함께 만드는 동료",
    "상관": "내 재능을 펼치게 하는 자극제. 단 과하면 명예 손상",
    "편재": "유동 재물·사업 인연. 함께 큰돈 만들 가능. 변동",
    "정재": "안정 수입. 꾸준한 협업. 회계·관리 적합",
    "편관": "압박·도전을 주는 인물. 시키는 일에 따라가면 큰 성과",
    "정관": "권위·체계를 주는 인물. 멘토·상사형",
    "편인": "비주류·창의의 자극. 직관·영감을 주는 동료",
    "정인": "후원자·스승·학문. 보호받는 관계. 형님 정통",
  };
  return map[s] || s;
}

console.log("\n" + "═".repeat(75));
