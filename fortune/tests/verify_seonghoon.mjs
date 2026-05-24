// 최성훈 본인 사주 검증 - 양력/음력 + 카운트 방식별 비교
import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, HIDDEN_STEMS } from "../core/saju.js";

function printSaju(label, p) {
  const s = calculateSaju(p);
  console.log(`\n■ ${label}`);
  console.log(`   입력: ${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")} ${String(p.hour).padStart(2,"0")}:${String(p.minute||0).padStart(2,"0")}`);
  console.log(`   사주: ${s.pillars.year.gapja}  ${s.pillars.month.gapja}  ${s.pillars.day.gapja}  ${s.pillars.hour.gapja}`);
  console.log(`   일간: ${s.dayMaster.stemHan}(${s.dayMaster.stemKor})·${s.dayMaster.ohaeng}  | 띠: ${s.animal}`);

  // 4가지 오행 카운트 방식
  // 방식 A: 천간만 (4개)
  const a = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  ["year","month","day","hour"].forEach(p2 => {
    a[STEM_OHAENG[s.pillars[p2].stem]]++;
  });
  console.log(`   [방식A] 천간만(4개):       ${Object.entries(a).map(([k,v])=>`${k}${v}`).join(" ")}`);

  // 방식 B: 천간+지지본기 (8개) - 우리 시스템 기본
  console.log(`   [방식B] 천간+본기(8개)★:    ${Object.entries(s.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);

  // 방식 C: 지지장간 전부 포함
  const c = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  ["year","month","day","hour"].forEach(p2 => {
    c[STEM_OHAENG[s.pillars[p2].stem]]++;
    HIDDEN_STEMS[s.pillars[p2].branch].forEach(stemIdx => {
      c[STEM_OHAENG[stemIdx]]++;
    });
  });
  console.log(`   [방식C] 천간+장간전부(13~): ${Object.entries(c).map(([k,v])=>`${k}${v}`).join(" ")}`);

  // 방식 D: 본기 가중치 (본기 3, 중기 2, 여기 1)
  const d = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  ["year","month","day","hour"].forEach(p2 => {
    d[STEM_OHAENG[s.pillars[p2].stem]] += 2;
    HIDDEN_STEMS[s.pillars[p2].branch].forEach((stemIdx, i) => {
      d[STEM_OHAENG[stemIdx]] += (i === 0 ? 3 : i === 1 ? 2 : 1);
    });
  });
  console.log(`   [방식D] 가중점수:          ${Object.entries(d).map(([k,v])=>`${k}${v}`).join(" ")}`);
}

console.log("═".repeat(70));
console.log("  최성훈 본인 사주 검증");
console.log("═".repeat(70));

// 처음 알려준 양력 케이스
printSaju("케이스 1) 양력 1998-11-07 07:35 (입력대로)", { year:1998, month:11, day:7, hour:7, minute:35, gender:"M", longitude:127.0 });

// 음력 가정
printSaju("케이스 2) 음력 1998-11-07 = 양력 1998-12-25 07:35", { year:1998, month:12, day:25, hour:7, minute:35, gender:"M", longitude:127.0 });

// 진태양시 OFF
printSaju("케이스 3) 양력 1998-11-07 07:35 (진태양시 OFF)", { year:1998, month:11, day:7, hour:7, minute:35, gender:"M", useTrueSolarTime:false });

// 시각 ±30분
printSaju("케이스 4) 양력 1998-11-07 07:00", { year:1998, month:11, day:7, hour:7, minute:0, gender:"M", longitude:127.0 });
printSaju("케이스 5) 양력 1998-11-07 08:00", { year:1998, month:11, day:7, hour:8, minute:0, gender:"M", longitude:127.0 });

console.log("\n" + "═".repeat(70));
console.log("  해석 가이드:");
console.log("  · 형이 말한 '토 3개'가 [방식A 천간만] 또는 [방식C 장간] 어느 방식인지에 따라 다름");
console.log("  · 우리 시스템 기본은 [방식B]인데 토 4개로 산출됨");
console.log("  · 만세력 사이트마다 카운트 방식이 다른 게 가장 흔한 원인");
console.log("═".repeat(70));
