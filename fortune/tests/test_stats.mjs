// 통계과학 결합 모듈 테스트
import { calculateSaju } from "../core/saju.js";
import { sajuToBig5, birthSeasonEffect, forerIndex, calculateZodiac, crossCompare } from "../core/statistical_science.js";

let pass = 0, fail = 0;
function check(name, cond, note = "") {
  const m = cond ? "✓" : "✗";
  const c = cond ? "\x1b[32m" : "\x1b[31m";
  console.log(`${c}${m}\x1b[0m ${name}${note ? "  ─ " + note : ""}`);
  if (cond) pass++; else fail++;
}

console.log("\n── Big5 OCEAN 매핑 테스트 ──");

const saju = calculateSaju({year:1990, month:5, day:15, hour:12, gender:"M"});
const big5 = sajuToBig5(saju);
check("Big5 5요인 모두 산출", ["O","C","E","A","N"].every(k => k in big5.scores));
check("Big5 점수 0~100 범위", Object.values(big5.scores).every(v => v >= 0 && v <= 100));
check("Big5 프로필 생성", typeof big5.profile === "string" && big5.profile.includes("+"));
check("Big5 해석문 생성", big5.interpretation.length > 0, big5.interpretation);

console.log("\n── 출생계절 효과 테스트 ──");

// 봄생 (3-5월)
const seasonSpring = birthSeasonEffect(1990, 4, 15, big5);
check("봄생 라벨", seasonSpring.season === "spring", seasonSpring.label);
check("봄생 질병 데이터 존재", Object.keys(seasonSpring.diseases).length > 0);
check("Big5 보정값 적용", typeof seasonSpring.big5_adjusted.O === "number");
check("논문 인용 명시", seasonSpring.citation.length > 0, seasonSpring.citation);

// 여름·가을·겨울
const seasonSummer = birthSeasonEffect(1990, 7, 15, big5);
const seasonAutumn = birthSeasonEffect(1990, 10, 15, big5);
const seasonWinter = birthSeasonEffect(1990, 1, 15, big5);
check("여름/가을/겨울 분류 정상",
  seasonSummer.season === "summer" &&
  seasonAutumn.season === "autumn" &&
  seasonWinter.season === "winter");

console.log("\n── Forer/Barnum 지수 테스트 ──");

const generalText = "당신은 때때로 외향적이지만 가끔은 내향적입니다. 사람들은 당신을 좋아합니다. 잠재력이 큽니다.";
const specificText = "당신의 일주는 丙午(병오)이며 양인살이 들어 있고, 천을귀인은 없으며 식신 1개·정관 2개입니다.";

const forerGen = forerIndex(generalText);
const forerSpec = forerIndex(specificText);

check("일반적 텍스트 → 높은 Forer 지수", forerGen.score >= forerSpec.score,
  `일반 ${forerGen.score} vs 구체 ${forerSpec.score}`);
check("Forer 지수 0~100", forerGen.score >= 0 && forerGen.score <= 100 && forerSpec.score >= 0 && forerSpec.score <= 100);
check("Forer 카운트 산출", "general" in forerGen.counts && "specific" in forerSpec.counts);
check("구체 텍스트의 specific 카운트 > 0", forerSpec.counts.specific > 0, `${forerSpec.counts.specific}개`);

console.log("\n── 황도12궁 천문 계산 테스트 ──");

// 알려진 케이스
const zod1 = calculateZodiac(1990, 5, 15);  // 황소자리 (4.20-5.20)
check("1990-05-15 → 황소자리", zod1.name === "황소자리", zod1.name);
check("황경 0~360", zod1.solarLongitude >= 0 && zod1.solarLongitude < 360, `${zod1.solarLongitude}°`);

const zod2 = calculateZodiac(1990, 7, 23);  // 사자자리 시작
check("1990-07-23 → 사자자리", zod2.name === "사자자리", zod2.name);

const zod3 = calculateZodiac(2000, 1, 1);  // 염소자리 (12.22-1.19)
check("2000-01-01 → 염소자리", zod3.name === "염소자리", zod3.name);

const zod4 = calculateZodiac(2024, 3, 21);  // 양자리 시작
check("2024-03-21 → 양자리", zod4.name === "양자리", zod4.name);

// 12별자리 전부 검증
const dates = [
  [4, 1, "양자리"], [5, 1, "황소자리"], [6, 1, "쌍둥이자리"],
  [7, 1, "게자리"], [8, 1, "사자자리"], [9, 1, "처녀자리"],
  [10, 1, "천칭자리"], [11, 1, "전갈자리"], [12, 1, "사수자리"],
  [1, 10, "염소자리"], [2, 1, "물병자리"], [3, 1, "물고기자리"]
];
let allMatch = true;
const mismatches = [];
for (const [m, d, expected] of dates) {
  const z = calculateZodiac(2024, m, d);
  if (z.name !== expected) { allMatch = false; mismatches.push(`${m}-${d}: ${z.name}(expected ${expected})`); }
}
check("12별자리 전부 정확", allMatch, mismatches.join(", ") || "all match");

console.log("\n── 사주↔별자리 교차검증 테스트 ──");

const cross = crossCompare(saju, zod1);
check("교차검증 결과 생성", "match" in cross && "sajuMainOhaeng" in cross);

console.log(`\n총 ${pass + fail}개 중 \x1b[32m${pass} PASS\x1b[0m / \x1b[${fail > 0 ? '31' : '90'}m${fail} FAIL\x1b[0m`);
process.exit(fail > 0 ? 1 : 0);
