// gunghap.js
// 사주 궁합(宮合) 분석
//
// 도입 참고:
//   - alvamind/bazi-calculator : 호환성 분석 (Bazi compatibility)
//   - cantian-ai/bazi-mcp     : 십신 기반 관계 해석
//
// 분석 차원:
//   1. 일간 오행 상생/상극 (가장 중요)
//   2. 띠 (年支) 합·충·형·해·파
//   3. 일지 (日支) 합·충
//   4. 오행 보완도 (서로 부족한 오행을 채워주는가)
//   5. 십신 관계 (정관·정재 등 안정 vs 편관·편재 격동)

import { CHEONGAN_KOR, JIJI_KOR, STEM_OHAENG, BRANCH_OHAENG, sipsinForStem } from "./saju.js";

const OHAENG_ORDER = ["목", "화", "토", "금", "수"];

function ohaengRelation(a, b) {
  // 0: 같음(비화), 1: a→b 생, 2: a→b 극, 3: a←b 생, 4: a←b 극
  const ia = OHAENG_ORDER.indexOf(a);
  const ib = OHAENG_ORDER.indexOf(b);
  if (ia === ib) return { type: "비화", desc: "동일 오행 - 친밀하나 경쟁심", score: 60 };
  if ((ia + 1) % 5 === ib) return { type: "내가生", desc: "나의 기운을 상대에게 줌 (헌신적)", score: 75 };
  if ((ia + 4) % 5 === ib) return { type: "내가被生", desc: "상대가 나를 도와줌 (보호받음)", score: 90 };
  if ((ia + 2) % 5 === ib) return { type: "내가剋", desc: "내가 상대를 통제 (주도권)", score: 55 };
  if ((ia + 3) % 5 === ib) return { type: "내가被剋", desc: "상대가 나를 제어 (스트레스)", score: 40 };
}

// 띠 합충
const ZODIAC_HARMONY = {
  // 삼합(三合) - 최고
  "申子辰": "수국 삼합", "巳酉丑": "금국 삼합", "寅午戌": "화국 삼합", "亥卯未": "목국 삼합",
  // 육합(六合) - 좋음
  "子丑": "토합", "寅亥": "목합", "卯戌": "화합", "辰酉": "금합", "巳申": "수합", "午未": "토합",
};
const ZODIAC_CONFLICT = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];  // 충
const ZODIAC_PUNISH = ["寅巳", "巳申", "申寅", "丑戌", "戌未", "未丑"];   // 삼형 (간략)
const ZODIAC_HARM = ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"];     // 해

function checkZodiacRelation(b1, b2) {
  const ji1 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][b1];
  const ji2 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][b2];
  const pair1 = ji1 + ji2;
  const pair2 = ji2 + ji1;
  // 삼합 부분 매칭
  for (const triple of ["申子辰", "巳酉丑", "寅午戌", "亥卯未"]) {
    if (triple.includes(ji1) && triple.includes(ji2)) return { type: "반합", desc: "삼합의 일부 - 좋은 인연", score: 85 };
  }
  for (const [k, v] of Object.entries(ZODIAC_HARMONY)) {
    if (k.length === 2 && (k === pair1 || k === pair2)) return { type: "육합", desc: `${v} - 잘 맞음`, score: 80 };
  }
  if (ZODIAC_CONFLICT.includes(pair1) || ZODIAC_CONFLICT.includes(pair2)) {
    return { type: "충", desc: "정면 대립 - 잦은 다툼·이별 위험", score: 30 };
  }
  if (ZODIAC_HARM.includes(pair1) || ZODIAC_HARM.includes(pair2)) {
    return { type: "해", desc: "은근한 갈등 - 답답함", score: 45 };
  }
  return { type: "보통", desc: "특별한 합충 없음", score: 60 };
}

export function analyzeGunghap(sajuA, sajuB) {
  // 일간 오행 관계
  const dayE_A = STEM_OHAENG[sajuA.dayMaster.stem];
  const dayE_B = STEM_OHAENG[sajuB.dayMaster.stem];
  const dayOhaeng = ohaengRelation(dayE_A, dayE_B);

  // 띠 (년지) 관계
  const yearBranch = checkZodiacRelation(sajuA.pillars.year.branch, sajuB.pillars.year.branch);

  // 일지(日支) 관계 - 부부궁
  const dayBranch = checkZodiacRelation(sajuA.pillars.day.branch, sajuB.pillars.day.branch);

  // 오행 보완도: 서로 부족한 오행이 상대에게 풍부한가
  const complement = computeComplement(sajuA.ohaengCount, sajuB.ohaengCount);

  // 종합 점수 (가중평균)
  const total = Math.round(
    dayOhaeng.score * 0.35 +
    yearBranch.score * 0.15 +
    dayBranch.score * 0.35 +
    complement.score * 0.15
  );

  return {
    dayOhaeng,
    yearBranch,
    dayBranch,
    complement,
    total,
    grade: gradeFromScore(total),
    summary: makeSummary(total, dayOhaeng, dayBranch),
  };
}

function computeComplement(ohaengA, ohaengB) {
  let complementScore = 0;
  let count = 0;
  for (const e of OHAENG_ORDER) {
    const lackA = Math.max(0, 1 - ohaengA[e]);  // A에 부족한 정도
    const supplyB = Math.max(0, ohaengB[e] - 1);  // B가 줄 수 있는 양
    complementScore += Math.min(lackA, supplyB) * 30;
    // 반대 방향도
    const lackB = Math.max(0, 1 - ohaengB[e]);
    const supplyA = Math.max(0, ohaengA[e] - 1);
    complementScore += Math.min(lackB, supplyA) * 30;
    count++;
  }
  const score = Math.min(100, 50 + complementScore);
  return { score: Math.round(score), desc: complementScore > 50 ? "부족한 오행을 잘 채워줌" : "오행 보완 보통" };
}

function gradeFromScore(score) {
  if (score >= 85) return { grade: "S", text: "천생연분", color: "#00e676" };
  if (score >= 75) return { grade: "A", text: "매우 좋음", color: "#76ff03" };
  if (score >= 65) return { grade: "B", text: "좋음", color: "#ffeb3b" };
  if (score >= 55) return { grade: "C", text: "보통", color: "#ffa726" };
  if (score >= 45) return { grade: "D", text: "주의 필요", color: "#ff7043" };
  return { grade: "E", text: "노력 필요", color: "#ff5252" };
}

function makeSummary(total, dayO, dayB) {
  const parts = [];
  if (total >= 80) parts.push("두 사람의 기운이 매우 잘 어우러지는 사주입니다.");
  else if (total >= 65) parts.push("기본적으로 호흡이 잘 맞는 인연입니다.");
  else if (total >= 50) parts.push("노력으로 좋은 관계를 만들 수 있는 사이입니다.");
  else parts.push("서로의 다름을 이해하려는 노력이 필요한 관계입니다.");

  if (dayO.type === "내가被生") parts.push("상대가 당신을 정신적으로 지원해주는 관계입니다.");
  if (dayO.type === "내가被剋") parts.push("상대의 영향력이 강해 스트레스를 느낄 수 있으니 자기 영역을 지키세요.");
  if (dayB.type === "충") parts.push("일지가 충하므로 동거 시 의견 충돌이 잦을 수 있습니다.");
  if (dayB.type === "육합" || dayB.type === "반합") parts.push("일지의 합으로 부부의 정이 깊습니다.");
  return parts.join(" ");
}
