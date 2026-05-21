// 김건희 형 사주 검증 - 양력 vs 음력 + 장간 포함 오행 분포
import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, HIDDEN_STEMS } from "../core/saju.js";

function printSaju(label, p) {
  const s = calculateSaju(p);
  console.log(`\n■ ${label}`);
  console.log(`   입력: ${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")} ${String(p.hour).padStart(2,"0")}:${String(p.minute||0).padStart(2,"0")}`);
  console.log(`   사주: ${s.pillars.year.gapja}  ${s.pillars.month.gapja}  ${s.pillars.day.gapja}  ${s.pillars.hour.gapja}`);
  console.log(`   일간: ${s.dayMaster.stemHan}(${s.dayMaster.stemKor})·${s.dayMaster.ohaeng}  | 띠: ${s.animal}`);

  // 천간 + 지지 본기만 (우리 시스템 기본)
  console.log(`   오행 [천간+본기]: ${Object.entries(s.ohaengCount).map(([k,v])=>`${k}${v}`).join(" ")}`);

  // 지지 장간 전부 포함한 오행 분포 (일부 만세력 방식)
  const fullCount = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  // 천간 4개
  ["year","month","day","hour"].forEach(p2 => {
    fullCount[STEM_OHAENG[s.pillars[p2].stem]]++;
  });
  // 지지 장간 전부
  ["year","month","day","hour"].forEach(p2 => {
    const hidden = HIDDEN_STEMS[s.pillars[p2].branch];
    hidden.forEach(stemIdx => {
      fullCount[STEM_OHAENG[stemIdx]]++;
    });
  });
  console.log(`   오행 [천간+장간전부]: ${Object.entries(fullCount).map(([k,v])=>`${k}${v}`).join(" ")}  ← 일부 만세력 방식`);

  // 지지 장간 본기만 가중 (또 다른 방식: 본기 3, 중기 2, 여기 1)
  const weighted = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  ["year","month","day","hour"].forEach(p2 => {
    weighted[STEM_OHAENG[s.pillars[p2].stem]] += 2; // 천간 가중치
    const hidden = HIDDEN_STEMS[s.pillars[p2].branch];
    hidden.forEach((stemIdx, i) => {
      const w = i === 0 ? 3 : i === 1 ? 2 : 1;  // 본기/중기/여기
      weighted[STEM_OHAENG[stemIdx]] += w;
    });
  });
  console.log(`   오행 [가중 점수]: ${Object.entries(weighted).map(([k,v])=>`${k}${v}`).join(" ")}  ← 또 다른 방식`);
}

console.log("═".repeat(70));
console.log("  김건희 형 사주 검증 — 입력 케이스별 비교");
console.log("═".repeat(70));

// 케이스 1: 양력 1995-06-03 08:30 (사용자가 처음 알려준 그대로)
printSaju("케이스 1) 양력 1995-06-03 08:30", { year:1995, month:6, day:3, hour:8, minute:30, gender:"M", longitude:127.0 });

// 케이스 2: 음력 1995-06-03 = 양력 1995-06-30 환산
printSaju("케이스 2) 음력 1995-06-03 = 양력 1995-06-30 08:30", { year:1995, month:6, day:30, hour:8, minute:30, gender:"M", longitude:127.0 });

// 케이스 3: 음력 1995-06-03 윤8월 가능성 (1995년은 음력 8월이 윤월) - 동일 케이스 2
// 1995년 윤달은 음력 8월이므로 6월에는 영향 없음

// 케이스 4: 진태양시 보정 OFF (서울 표준시 그대로)
printSaju("케이스 3) 양력 1995-06-03 08:30 (진태양시 OFF)", { year:1995, month:6, day:3, hour:8, minute:30, gender:"M", useTrueSolarTime:false });

// 케이스 5: 시각 차이 - 8:00 또는 9:00
printSaju("케이스 4) 양력 1995-06-03 08:00", { year:1995, month:6, day:3, hour:8, minute:0, gender:"M", longitude:127.0 });
printSaju("케이스 5) 양력 1995-06-03 09:00", { year:1995, month:6, day:3, hour:9, minute:0, gender:"M", longitude:127.0 });

console.log("\n" + "═".repeat(70));
console.log("  해석:");
console.log("  · '토 4개' 결과가 나오려면 음력 1995-06-03(양력 6/30) 가능성이 높음");
console.log("  · 또는 만세력이 '천간+장간전부' 또는 '가중치 방식'으로 카운트하는 경우");
console.log("═".repeat(70));
