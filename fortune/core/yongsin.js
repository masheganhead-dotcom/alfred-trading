// yongsin.js - 용신(用神) 4종 자동 판별 + 신강/신약 정밀 점수
//
// 정통 명리학에서 "잘 맞춘다"의 핵심:
//   "이 사람의 진짜 도움이 되는 오행이 무엇인가?"
//   = 직업·색·방향·음식·인연 처방의 기준
//
// 4용신:
//   1. 억부용신(抑扶用神) - 가장 보편적. 신강→억제, 신약→부조.
//   2. 조후용신(調候用神) - 사주가 너무 차거나 더우면 균형.
//   3. 통관용신(通關用神) - 대립하는 두 세력 사이를 잇는 오행.
//   4. 병약용신(病藥用神) - 사주의 병(특정 흉성)을 제거하는 약.

import { STEM_OHAENG, BRANCH_OHAENG, STEM_YINYANG } from "./saju.js";

const OHAENG_LIST = ["목","화","토","금","수"];
const SHENG = { "목":"화","화":"토","토":"금","금":"수","수":"목" };  // 상생
const KE = { "목":"토","화":"금","토":"수","금":"목","수":"화" };    // 상극

// === 신강/신약 정밀 점수 ===
// 일간을 기준으로 사주 내 같은 오행(비겁) + 나를 생하는 오행(인성)의 세력 측정
// 득령(月支)·득지(日支)·득세(기타) 가중

export function calculateStrength(saju) {
  const dayOhaeng = saju.dayMaster.ohaeng;
  const sameOhaeng = dayOhaeng;
  const supportOhaeng = Object.entries(SHENG).find(([k, v]) => v === dayOhaeng)?.[0];

  let score = 0;
  const details = [];

  // 월지 점수 (가장 큼, 30점)
  const monthBranch = BRANCH_OHAENG[saju.pillars.month.branch];
  if (monthBranch === sameOhaeng) {
    score += 30; details.push("득령(月支 비겁) +30");
  } else if (monthBranch === supportOhaeng) {
    score += 25; details.push("득령(月支 인성) +25");
  }

  // 일지 점수 (15점)
  const dayBranch = BRANCH_OHAENG[saju.pillars.day.branch];
  if (dayBranch === sameOhaeng) {
    score += 15; details.push("득지(日支 비겁) +15");
  } else if (dayBranch === supportOhaeng) {
    score += 12; details.push("득지(日支 인성) +12");
  }

  // 년/시 천간 점수 (각 8점)
  for (const p of ["year","hour"]) {
    const stemO = STEM_OHAENG[saju.pillars[p].stem];
    if (stemO === sameOhaeng) {
      score += 8; details.push(`${p}干 비겁 +8`);
    } else if (stemO === supportOhaeng) {
      score += 7; details.push(`${p}干 인성 +7`);
    }
  }

  // 년/시 지지 점수 (각 6점)
  for (const p of ["year","hour"]) {
    const branchO = BRANCH_OHAENG[saju.pillars[p].branch];
    if (branchO === sameOhaeng) {
      score += 6; details.push(`${p}支 비겁 +6`);
    } else if (branchO === supportOhaeng) {
      score += 5; details.push(`${p}支 인성 +5`);
    }
  }

  // 월간 점수 (10점)
  const monthStem = STEM_OHAENG[saju.pillars.month.stem];
  if (monthStem === sameOhaeng) {
    score += 10; details.push("월간 비겁 +10");
  } else if (monthStem === supportOhaeng) {
    score += 8; details.push("월간 인성 +8");
  }

  const grade = score >= 60 ? "신왕(身旺)"
              : score >= 45 ? "신강(身強)"
              : score >= 30 ? "중화(中和)"
              : score >= 15 ? "신약(身弱)"
              : "극신약(極身弱)";

  return { score, grade, details, isStrong: score >= 45, isWeak: score < 30 };
}

// === 1. 억부용신 ===
// 신강 → 식상·재성·관성 중 가장 효과적인 것
// 신약 → 인성·비겁 중 가장 효과적인 것
export function chooseEokbu(saju, strength) {
  const dayOhaeng = saju.dayMaster.ohaeng;
  const generates = SHENG[dayOhaeng];           // 식상 (내가 생함)
  const controls = KE[dayOhaeng];                // 재성 (내가 극함)
  const controlledBy = Object.entries(KE).find(([k, v]) => v === dayOhaeng)?.[0]; // 관성
  const supportedBy = Object.entries(SHENG).find(([k, v]) => v === dayOhaeng)?.[0]; // 인성

  let candidates;
  if (strength.isStrong) {
    candidates = [
      { ohaeng: generates, role: "식상(설기)", reason: "신강한 일간의 기운을 빼냄" },
      { ohaeng: controls, role: "재성(억제)", reason: "신강함을 재로 분산" },
      { ohaeng: controlledBy, role: "관성(제어)", reason: "신강을 강제로 누름" },
    ];
  } else if (strength.isWeak) {
    candidates = [
      { ohaeng: supportedBy, role: "인성(생부)", reason: "신약한 일간을 생함" },
      { ohaeng: dayOhaeng, role: "비겁(조력)", reason: "동지로 힘을 보탬" },
    ];
  } else {
    // 중화 - 가장 부족한 오행
    const minOh = Object.entries(saju.ohaengCount).sort((a, b) => a[1] - b[1])[0][0];
    candidates = [{ ohaeng: minOh, role: "조정(중화)", reason: "균형 유지" }];
  }

  // 사주 내 부족할수록 더 효과적 (이미 강하면 약효 떨어짐)
  candidates.forEach(c => {
    c.amount = saju.ohaengCount[c.ohaeng] || 0;
    c.priority = c.amount <= 1 ? 3 : c.amount === 2 ? 2 : 1;
  });
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates[0];
}

// === 2. 조후용신 ===
// 사주의 한난조습(寒暖燥濕)을 본다. 월령(月支) + 화·수 비율
export function chooseJohu(saju) {
  const oh = saju.ohaengCount;
  const fireQty = oh.화;
  const waterQty = oh.수;
  const monthBranch = saju.pillars.month.branch;

  // 월지로 계절 판단
  const winterMonths = [11, 0, 1];  // 亥子丑
  const summerMonths = [5, 6, 7];   // 巳午未
  const springMonths = [2, 3, 4];   // 寅卯辰
  const autumnMonths = [8, 9, 10];  // 申酉戌

  let need, reason;
  if (winterMonths.includes(monthBranch) && fireQty <= 1) {
    need = "화"; reason = "한겨울 출생인데 화기가 부족 → 따뜻함이 절실";
  } else if (summerMonths.includes(monthBranch) && waterQty <= 1) {
    need = "수"; reason = "한여름 출생인데 수기가 부족 → 시원함이 절실";
  } else if (springMonths.includes(monthBranch) && fireQty === 0) {
    need = "화"; reason = "이른 봄 출생 → 햇볕이 필요";
  } else if (autumnMonths.includes(monthBranch) && fireQty === 0) {
    need = "화"; reason = "가을 출생 → 따뜻함 보완";
  } else {
    return { need: null, reason: "조후 균형 OK" };
  }

  return { need, reason };
}

// === 3. 통관용신 ===
// 가장 강한 오행과 그것이 극하는 오행 사이를 잇는 오행
export function chooseTongkwan(saju) {
  const oh = saju.ohaengCount;
  const sorted = Object.entries(oh).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];

  if (strongest[1] < 3) return { need: null, reason: "통관 불필요 (편중 없음)" };

  const victim = KE[strongest[0]];
  const victimQty = oh[victim];

  if (victimQty === 0) return { need: null, reason: "극당하는 오행이 없어 통관 불필요" };

  // 강자와 약자 사이를 잇는 오행 (강자가 생하는 것 = 약자를 생하는 것)
  const bridge = SHENG[strongest[0]];

  return {
    need: bridge,
    reason: `${strongest[0]}(${strongest[1]}개)이 ${victim}(${victimQty}개)을 극함 → ${bridge}이 다리`,
  };
}

// === 4. 병약용신 ===
// 사주의 병이 되는 흉성을 제거하는 약
// 양인·편관·상관 등이 과다하면 그것을 제어하는 것이 약
export function chooseByeongyak(saju) {
  const sipsinCount = {};
  for (const p of ["year","month","hour"]) {
    const s = saju.sipsin[p].stem;
    if (s) sipsinCount[s] = (sipsinCount[s] || 0) + 1;
  }

  const dayOhaeng = saju.dayMaster.ohaeng;

  // 편관 2개 이상 → 정인이 약 (살인상생)
  if ((sipsinCount.편관 || 0) >= 2) {
    const cure = Object.entries(SHENG).find(([k, v]) => v === dayOhaeng)?.[0];
    return { need: cure, reason: "편관(살) 과다 → 인성으로 살인상생", disease: "편관 과다" };
  }
  // 상관 2개 이상 → 인성이 약 (상관패인)
  if ((sipsinCount.상관 || 0) >= 2) {
    const cure = Object.entries(SHENG).find(([k, v]) => v === dayOhaeng)?.[0];
    return { need: cure, reason: "상관 과다 → 인성으로 제어", disease: "상관 과다" };
  }
  // 겁재 2개 이상 → 정관이 약 (겁재 제압)
  if ((sipsinCount.겁재 || 0) >= 2) {
    const cure = Object.entries(KE).find(([k, v]) => v === dayOhaeng)?.[0];
    return { need: cure, reason: "겁재 과다 → 관성으로 제압", disease: "겁재 과다" };
  }
  return { need: null, reason: "특별한 병이 없음", disease: null };
}

// === 종합: 가장 강력한 용신 선택 ===
export function determineYongsin(saju) {
  const strength = calculateStrength(saju);
  const eokbu = chooseEokbu(saju, strength);
  const johu = chooseJohu(saju);
  const tongkwan = chooseTongkwan(saju);
  const byeongyak = chooseByeongyak(saju);

  // 우선순위: 병약 > 조후 > 통관 > 억부 (병이 있으면 병약이 우선)
  let primary = null;
  if (byeongyak.need) {
    primary = { method: "병약(病藥)", ohaeng: byeongyak.need, reason: byeongyak.reason };
  } else if (johu.need) {
    primary = { method: "조후(調候)", ohaeng: johu.need, reason: johu.reason };
  } else if (tongkwan.need) {
    primary = { method: "통관(通關)", ohaeng: tongkwan.need, reason: tongkwan.reason };
  } else {
    primary = { method: "억부(抑扶)", ohaeng: eokbu.ohaeng, reason: eokbu.reason, role: eokbu.role };
  }

  // 처방 (직업·색·방향·음식)
  primary.prescription = getPrescription(primary.ohaeng);

  return {
    strength,
    primary,
    eokbu, johu, tongkwan, byeongyak,
    // 기신(忌神) - 용신을 극하는 오행 = 피해야 할 것
    gisin: primary.ohaeng ? KE[primary.ohaeng] : null,
  };
}

function getPrescription(ohaeng) {
  if (!ohaeng) return null;
  const map = {
    "목": {
      color: "청록색·녹색",
      direction: "동쪽",
      job: "교육·출판·목재·섬유·인테리어·생명공학",
      food: "신맛 (식초·매실·자몽·신김치)",
      activity: "산책·등산·식물 키우기·독서",
      number: "3, 8",
    },
    "화": {
      color: "빨강·분홍·자주색",
      direction: "남쪽",
      job: "방송·연예·요식·미용·전기·IT·예술",
      food: "쓴맛 (커피·녹차·도라지·쑥)",
      activity: "운동·요리·발표·사교",
      number: "2, 7",
    },
    "토": {
      color: "노랑·황토·갈색",
      direction: "중앙",
      job: "부동산·건설·농업·중개·교육·종교·서비스",
      food: "단맛 (꿀·고구마·호박·대추)",
      activity: "도자기·정원·중재·봉사",
      number: "5, 10",
    },
    "금": {
      color: "흰색·은색·금색",
      direction: "서쪽",
      job: "법조·금융·의료(외과)·기계·군경·세공",
      food: "매운맛 (마늘·생강·고추·양파)",
      activity: "악기·세공·운동·정리정돈",
      number: "4, 9",
    },
    "수": {
      color: "검정·짙은 파랑",
      direction: "북쪽",
      job: "유통·해외·수산·연구·학문·여행·음악",
      food: "짠맛 (해조류·콩·소금·생선)",
      activity: "수영·여행·연구·명상",
      number: "1, 6",
    },
  };
  return map[ohaeng];
}
