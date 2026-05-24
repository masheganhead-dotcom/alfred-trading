// wol_il.js - 월운(月運) + 일진(日辰) + 택일(擇日)
//
// 정통 명리학의 "사주 + 대운 + 세운 + 월운 + 일진" 5중 결합으로
// 특정 날짜의 길흉을 알고리즘으로 산출.
//
// 활동별 길일 판별:
//   - 앨범 발매·런칭: 식상(표현) + 재성(인기) 들어오는 날
//   - 계약 체결: 정관(약속) + 정인(문서)
//   - 결혼: 일지합 + 관성/재성
//   - 이사: 역마 + 충 없음
//   - 시험·자격: 정인 + 정관
//   - 수술·치료: 일지충·백호살 든 날 피함
//   - 미팅·협업: 식신 + 인성

import { CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, sipsinForStem, gapja } from "./saju.js";
import { getJieForDate, dateToJulian } from "./solar_terms.js";

// === 월건(月建) 계산 - 절기 기반 ===
// 입력 날짜의 직전 절(節)을 찾고, 그 절의 지지를 월지로
// 월간은 오호둔(年干 → 寅月干)

const OHO_DUN = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];

export function getMonthPillar(date, yearStem) {
  const jie = getJieForDate(date);
  const branchIdx = jie.branch;
  const inMonthStem = OHO_DUN[yearStem];
  const dist = (branchIdx - 2 + 12) % 12;
  const stem = (inMonthStem + dist) % 10;
  return { stem, branch: branchIdx };
}

// === 일진(日辰) 계산 - 60갑자 ===
const REF_GAPJA = 36;  // 1900-01-01 = 庚子日

export function getDayPillar(date) {
  const target = dateToJulian(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)));
  const ref = dateToJulian(new Date(Date.UTC(1900, 0, 1, 12)));
  const dayDiff = Math.round(target - ref);
  return gapja(REF_GAPJA + dayDiff);
}

// === 충 / 합 검사 ===
function isBranchChung(a, b) {
  const pairs = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}
function isBranchHap(a, b) {
  const pairs = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}
function isBranchSamhap(a, b) {
  const samhaps = [[8,0,4],[5,9,1],[2,6,10],[11,3,7]];
  for (const trio of samhaps) {
    if (trio.includes(a) && trio.includes(b) && a !== b) return true;
  }
  return false;
}
function isStemChung(a, b) {
  const pairs = [[0,6],[1,7],[2,8],[3,9]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}
function isStemHap(a, b) {
  const pairs = [[0,5],[1,6],[2,7],[3,8],[4,9]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// === 특정 날짜의 사주 작용 분석 ===
export function analyzeDay(saju, date, gender = "M") {
  const dayStem = saju.dayMaster.stem;
  const yearPillar = saju.pillars.year;
  const monthPillar = saju.pillars.month;
  const myDayPillar = saju.pillars.day;
  const myHourPillar = saju.pillars.hour;

  // 세운 (해당 연도)
  const sajuYear = date.getFullYear();
  const yearIdx = ((sajuYear - 4) % 60 + 60) % 60;
  const yearG = gapja(yearIdx);

  // 월운
  const monthG = getMonthPillar(date, yearG.stem);

  // 일진
  const dayG = getDayPillar(date);

  // 일진의 천간·지지가 본인 사주에 작용
  const stemSipsin = sipsinForStem(dayStem, dayG.stem);
  const events = [];
  let score = 50;

  // 일간과 일진 천간
  if (isStemChung(dayStem, dayG.stem)) {
    events.push({ type: "변동", level: 2, text: "일간충 - 결정·변화의 날" });
    score -= 8;
  }
  if (isStemHap(dayStem, dayG.stem)) {
    events.push({ type: "결합", level: 1, text: "일간합 - 만남·계약 신호" });
    score += 6;
  }

  // 일지와 일진 지지
  if (isBranchChung(myDayPillar.branch, dayG.branch)) {
    events.push({ type: "충", level: 3, text: "일지충 - 가정·부부 변동. 중요 결정 피하기" });
    score -= 12;
  }
  if (isBranchHap(myDayPillar.branch, dayG.branch)) {
    events.push({ type: "육합", level: 2, text: "일지합 - 만남·계약·결혼에 길" });
    score += 12;
  }
  if (isBranchSamhap(myDayPillar.branch, dayG.branch)) {
    events.push({ type: "삼합", level: 2, text: "일지삼합 - 큰 인연·동맹" });
    score += 10;
  }

  // 십신 영향
  if (stemSipsin === "정재" || stemSipsin === "편재") {
    events.push({ type: "재물", level: 2, text: `${stemSipsin} - 재물 활동·계약·인기 길` });
    score += 8;
  }
  if (stemSipsin === "정관" || stemSipsin === "편관") {
    events.push({ type: "직장", level: 2, text: `${stemSipsin} - 계약·승진·자격에 길` });
    score += 6;
  }
  if (stemSipsin === "정인" || stemSipsin === "편인") {
    events.push({ type: "문서", level: 2, text: `${stemSipsin} - 문서·자격·학업에 길` });
    score += 6;
  }
  if (stemSipsin === "식신" || stemSipsin === "상관") {
    events.push({ type: "표현", level: 2, text: `${stemSipsin} - 발표·작품 발표·창작 길` });
    score += 8;
  }
  if (stemSipsin === "비견") {
    events.push({ type: "동료", level: 1, text: "비견 - 협업·미팅 길" });
    score += 3;
  }
  if (stemSipsin === "겁재") {
    events.push({ type: "경쟁", level: 1, text: "겁재 - 손재·다툼 주의. 중요 계약 피함" });
    score -= 6;
  }

  // 월운과의 관계 (월지 합·충)
  const myMonthBranch = monthPillar.branch;
  if (isBranchChung(myMonthBranch, monthG.branch)) {
    events.push({ type: "월충", level: 1, text: "월충 - 환경 변동" });
    score -= 3;
  }

  // 백호살 / 괴강살 일진 (피해야 할 날)
  const dayGapjaStr = CHEONGAN[dayG.stem] + JIJI[dayG.branch];
  const BAEKHO = ["甲辰","戊辰","丙戌","壬戌","丁丑","癸丑","乙未"];
  const GOEGANG = ["庚辰","庚戌","壬辰","壬戌","戊戌"];
  if (BAEKHO.includes(dayGapjaStr)) {
    events.push({ type: "백호", level: 2, text: "백호살 일진 - 수술·격렬한 활동 외 피하기" });
    score -= 5;
  }
  if (GOEGANG.includes(dayGapjaStr)) {
    events.push({ type: "괴강", level: 1, text: "괴강살 일진 - 카리스마 발현. 부부 일은 피함" });
  }

  // 점수 정규화
  score = Math.max(0, Math.min(100, score));

  return {
    date: date.toISOString().slice(0, 10),
    weekday: ["일","월","화","수","목","금","토"][date.getDay()],
    yearGapja: CHEONGAN[yearG.stem] + JIJI[yearG.branch],
    monthGapja: CHEONGAN[monthG.stem] + JIJI[monthG.branch],
    dayGapja: dayGapjaStr,
    stemSipsin,
    events,
    score,
    grade: score >= 75 ? "★대길" : score >= 60 ? "길" : score >= 45 ? "평" : score >= 30 ? "주의" : "흉",
  };
}

// === 한 달 전체 일진 매트릭스 ===
export function analyzeMonth(saju, year, month, gender = "M") {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    days.push(analyzeDay(saju, date, gender));
  }

  // 통계
  const avgScore = days.reduce((a, b) => a + b.score, 0) / days.length;
  const bestDays = [...days].sort((a, b) => b.score - a.score).slice(0, 5);
  const worstDays = [...days].sort((a, b) => a.score - b.score).slice(0, 3);

  return {
    year, month,
    daysInMonth,
    days,
    avgScore: Math.round(avgScore),
    bestDays,
    worstDays,
    monthGapja: days[Math.floor(days.length / 2)].monthGapja,  // 중순 기준 월건
  };
}

// === 택일(擇日) - 특정 활동에 가장 좋은 날 찾기 ===
// 활동별 가중치
const ACTIVITY_WEIGHTS = {
  album_release: {  // 앨범 발매·런칭
    "식신": 3, "상관": 3, "정재": 2, "편재": 3,
    "일지합": 2, "일지삼합": 2,
    "겁재": -2, "백호": -1,
  },
  contract: {       // 계약 체결
    "정관": 3, "정인": 3, "정재": 2,
    "일지합": 2,
    "겁재": -3, "충": -3, "공망": -2,
  },
  marriage: {       // 결혼
    "정관": 3, "정재": 3, "정인": 2,
    "일지합": 3, "일지삼합": 3,
    "충": -3, "원진": -3, "백호": -2,
  },
  move: {           // 이사
    "역마": 3, "정재": 1, "정인": 1,
    "충": -2, "삼형": -3,
  },
  exam: {           // 시험·자격
    "정인": 3, "편인": 2, "정관": 2, "식신": 1,
    "상관": -2, "겁재": -2,
  },
  collaboration: {  // 미팅·협업
    "식신": 2, "정인": 2, "비견": 1, "정관": 1,
    "일지합": 2, "겁재": -2,
  },
  performance: {    // 공연·발표
    "상관": 3, "식신": 2, "정재": 2, "편재": 2,
    "도화": 2, "충": -2,
  },
};

export function pickGoodDays(saju, year, month, activity = "album_release", gender = "M") {
  const weights = ACTIVITY_WEIGHTS[activity] || ACTIVITY_WEIGHTS.album_release;
  const monthAnalysis = analyzeMonth(saju, year, month, gender);

  const scored = monthAnalysis.days.map(d => {
    let activityScore = d.score;  // 기본 점수
    for (const e of d.events) {
      // 십신 가중치
      const w = weights[d.stemSipsin] || 0;
      activityScore += w * 3;
      // 이벤트 타입 가중치
      const typeMap = { "육합": "일지합", "삼합": "일지삼합", "충": "충", "백호": "백호" };
      const mappedKey = typeMap[e.type] || e.type;
      const w2 = weights[mappedKey] || 0;
      activityScore += w2 * 2;
    }
    return { ...d, activityScore: Math.max(0, Math.min(100, activityScore)) };
  });

  scored.sort((a, b) => b.activityScore - a.activityScore);
  return {
    activity,
    top5: scored.slice(0, 5),
    avoid: scored.slice(-3).reverse(),
    monthAnalysis,
  };
}

// 활동 라벨
export const ACTIVITY_LABELS = {
  album_release: "🎵 앨범·곡 발매",
  contract: "📝 계약 체결",
  marriage: "💍 결혼·약혼",
  move: "🚚 이사·이동",
  exam: "📚 시험·자격",
  collaboration: "🤝 미팅·협업",
  performance: "🎤 공연·발표",
};
