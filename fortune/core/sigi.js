// sigi.js - 시기 예측(時機論)
//
// 명리학의 "잘 맞춘다"의 본질:
//   - 사주 원국 = 타고난 설계도 (변하지 않음)
//   - 대운(10년) = 큰 환경
//   - 세운(1년) = 그 해의 구체적 흐름
//   - 월운(1달) = 실제 시점
//
// 3중 결합으로 결혼·재물·이직·이사·시험·자녀·건강의 발생 시점 예측
//
// 핵심 패턴 (정통 명리학 전승):
//   - 결혼: 관성(여)/재성(남) + 일지합 들어오는 해
//   - 재물대운: 재성·식상 들어오는 해
//   - 이직/사업: 식상·재성·역마 들어오는 해
//   - 시험·자격: 인성·정관 들어오는 해
//   - 자녀: 식상(여)·관성(남) 들어오는 해
//   - 큰 변동: 천간충·지지충 들어오는 해
//   - 위기: 기신(忌神) + 형충 들어오는 해

import { CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, sipsinForStem, gapja, ANIMALS } from "./saju.js";

// 60갑자 인덱스 ↔ 연도
function yearToGapjaIdx(year) {
  // 서기 4년 = 갑자(0)
  return ((year - 4) % 60 + 60) % 60;
}

function getYearPillar(year) {
  const idx = yearToGapjaIdx(year);
  return gapja(idx);
}

// 천간충: 갑↔경, 을↔신, 병↔임, 정↔계, 무↔갑(드물게)
// 본 코드는 일반적 5충 사용
function isStemChung(a, b) {
  const pairs = [[0,6],[1,7],[2,8],[3,9],[4,6]];  // 甲庚 乙辛 丙壬 丁癸 戊甲(특수)
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// 지지충
function isBranchChung(a, b) {
  const pairs = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// 지지육합
function isBranchHap(a, b) {
  const pairs = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// 삼합 부분
function isBranchSamhap(a, b) {
  const samhaps = [[8,0,4],[5,9,1],[2,6,10],[11,3,7]];
  for (const trio of samhaps) {
    if (trio.includes(a) && trio.includes(b) && a !== b) return true;
  }
  return false;
}

// === 한 해의 사주 영향 분석 ===
export function analyzeYear(saju, year, gender = "M") {
  const yearPillar = getYearPillar(year);
  const dayStem = saju.dayMaster.stem;

  // 세운 천간·지지의 십신
  const stemSipsin = sipsinForStem(dayStem, yearPillar.stem);
  const branchSipsin = sipsinForStem(dayStem, yearPillar.branch < 12
    ? [9, 7, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8][yearPillar.branch]  // 지지 본기 매핑
    : null);

  // 일주 천간/지지와의 충·합 분석
  const events = [];

  // 천간충
  if (isStemChung(dayStem, yearPillar.stem)) {
    events.push({ type: "변동", code: "stem_chung", level: 3, desc: `일간(${CHEONGAN[dayStem]})↔세운간(${CHEONGAN[yearPillar.stem]}) 천간충 - 큰 결정·이동` });
  }

  // 일지 ↔ 세운지 관계
  const dayBranch = saju.pillars.day.branch;
  if (isBranchChung(dayBranch, yearPillar.branch)) {
    events.push({ type: "변동", code: "day_chung", level: 3, desc: `일지(${JIJI[dayBranch]})↔세운지(${JIJI[yearPillar.branch]}) 충 - 부부·가정 변동, 이사, 이별 가능` });
  }
  if (isBranchHap(dayBranch, yearPillar.branch)) {
    events.push({ type: "결합", code: "day_hap", level: 2, desc: `일지 ↔ 세운지 육합 - 결혼·동거·새 인연 가능` });
  }
  if (isBranchSamhap(dayBranch, yearPillar.branch)) {
    events.push({ type: "결합", code: "day_samhap", level: 2, desc: `일지 ↔ 세운지 삼합 - 큰 결실·인연` });
  }

  // 결혼 시그널
  const marriageStar = gender === "M" ? ["정재","편재"] : ["정관","편관"];
  if (marriageStar.includes(stemSipsin)) {
    events.push({ type: "결혼", code: "marriage_star", level: 2, desc: `${stemSipsin} 들어옴 - ${gender==="M"?"이성":"남자"} 인연 활성화` });
  }

  // 재물 시그널
  if (["정재","편재"].includes(stemSipsin)) {
    events.push({ type: "재물", code: "wealth", level: 2, desc: `${stemSipsin} 운 - 재물 활동 시기` });
  }
  if (stemSipsin === "식신" || stemSipsin === "상관") {
    events.push({ type: "재물", code: "food_to_wealth", level: 1, desc: `${stemSipsin} 운 - 식신생재 가능 (사업·창작)` });
  }

  // 직장·승진·시험
  if (["정관","편관"].includes(stemSipsin)) {
    events.push({ type: "직장", code: "official", level: 2, desc: `${stemSipsin} 운 - 직장·승진·자격 시기` });
  }
  if (["정인","편인"].includes(stemSipsin)) {
    events.push({ type: "학업", code: "study", level: 2, desc: `${stemSipsin} 운 - 학업·문서·자격증 시기` });
  }

  // 위기 (편관 + 일지충 = 큰 시련)
  if (stemSipsin === "편관" && isBranchChung(dayBranch, yearPillar.branch)) {
    events.push({ type: "위기", code: "danger", level: 3, desc: `편관 + 일지충 - 송사·사고·건강 주의` });
  }

  // 손재 (비겁 + 재충)
  if (["비견","겁재"].includes(stemSipsin)) {
    events.push({ type: "손재", code: "loss", level: 2, desc: `${stemSipsin} 운 - 동료 분쟁·재물 분탈 가능 (군겁쟁재)` });
  }

  // 점수 계산: 길흉 점수
  let score = 50;
  events.forEach(e => {
    if (["결혼","재물","직장","학업","결합"].includes(e.type)) score += e.level * 5;
    if (["위기","손재","변동"].includes(e.type)) score -= e.level * 5;
  });
  score = Math.max(0, Math.min(100, score));

  return {
    year,
    yearGapja: CHEONGAN[yearPillar.stem] + JIJI[yearPillar.branch],
    animal: ANIMALS[yearPillar.branch],
    stemSipsin,
    events,
    score,
    summary: makeYearSummary(year, events, score),
  };
}

function makeYearSummary(year, events, score) {
  if (events.length === 0) return `${year}년: 평이한 흐름. 큰 변동 없음.`;
  const types = [...new Set(events.map(e => e.type))];
  const sentiment = score >= 65 ? "길운(吉運)"
                 : score >= 55 ? "양호"
                 : score >= 45 ? "평년"
                 : score >= 35 ? "주의"
                 : "흉운(凶運)";
  return `${year}년: ${sentiment} (${score}점). 주요 키워드: ${types.join(", ")}`;
}

// === 향후 10년 시기 예측 ===
export function predictNextYears(saju, fromYear, count = 10, gender = "M") {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(analyzeYear(saju, fromYear + i, gender));
  }
  return results;
}

// === 인생 이벤트 시기 예측 (결혼·재물·이직 등 가장 가까운 해) ===
export function predictLifeEvents(saju, fromYear, gender = "M") {
  const yearsAhead = 20;
  const found = {
    marriage: null,
    wealth: null,
    promotion: null,
    study: null,
    danger: null,
  };
  for (let i = 0; i < yearsAhead; i++) {
    const year = fromYear + i;
    const result = analyzeYear(saju, year, gender);
    for (const e of result.events) {
      if (e.type === "결혼" && !found.marriage) found.marriage = { year, desc: e.desc };
      if (e.type === "재물" && !found.wealth && e.level >= 2) found.wealth = { year, desc: e.desc };
      if (e.type === "직장" && !found.promotion) found.promotion = { year, desc: e.desc };
      if (e.type === "학업" && !found.study) found.study = { year, desc: e.desc };
      if (e.type === "위기" && !found.danger) found.danger = { year, desc: e.desc };
    }
    if (Object.values(found).every(v => v !== null)) break;
  }
  return found;
}

// === 궁성·육친 분석 ===
//   년주(年柱) = 부모궁·조상궁 (~25세 운)
//   월주(月柱) = 형제궁·직업궁·청년기 (25~40세)
//   일주(日柱) = 부부궁·자신 (40~55세)
//   시주(時柱) = 자녀궁·말년 (55세~)
export function analyzeGungseong(saju) {
  const dayStem = saju.dayMaster.stem;
  return {
    year:  { palace: "부모궁·조상궁", age: "~25세", sipsin: saju.sipsin.year, pillar: saju.pillars.year, advice: gungAdvice("year", saju) },
    month: { palace: "형제궁·직업궁", age: "25~40세", sipsin: saju.sipsin.month, pillar: saju.pillars.month, advice: gungAdvice("month", saju) },
    day:   { palace: "부부궁·자신",   age: "40~55세", sipsin: saju.sipsin.day, pillar: saju.pillars.day, advice: gungAdvice("day", saju) },
    hour:  { palace: "자녀궁·말년",   age: "55세~",   sipsin: saju.sipsin.hour, pillar: saju.pillars.hour, advice: gungAdvice("hour", saju) },
  };
}

function gungAdvice(pos, saju) {
  const sipsin = saju.sipsin[pos].stem;
  const advices = {
    year: {
      "정인":"부모 인덕 좋고 조상 음덕 두텁다. 학자 가문 가능성.",
      "편인":"모친 영향 크나 다소 외로운 어린 시절.",
      "정관":"안정된 가정·전통적 부모.",
      "편관":"엄격한 부모·시련의 어린 시절.",
      "정재":"성실한 부모·중산층 가정.",
      "편재":"활동적 부모·풍족하나 변동.",
      "식신":"여유로운 어린 시절·먹복.",
      "상관":"재능 일찍 드러남·반항기.",
      "비견":"형제 많음·자기 길.",
      "겁재":"경쟁 환경·갈등 어린 시절.",
    },
    month: {
      "정관":"안정직·공직·대기업 인연.",
      "편관":"권력·전문직·격렬한 직업.",
      "정인":"학문·교육·연구의 직업.",
      "편인":"비주류 학문·예술·종교.",
      "정재":"안정 수입·꾸준한 일.",
      "편재":"사업·유통·인기 직업.",
      "식신":"창작·요리·연구의 길.",
      "상관":"방송·예술·표현의 길.",
      "비견":"동업·전문직.",
      "겁재":"경쟁 직업·도전적 분야.",
    },
    day: {
      "정인":"배우자가 어머니 같음·따뜻함.",
      "편인":"부부 인연 늦거나 외로움.",
      "정관":"여성: 가정적 남편 / 남성: 자식 인연 깊음.",
      "편관":"여성: 강한 남편 / 남성: 자식과의 갈등.",
      "정재":"남성: 정처 인연 / 여성: 가정 안정.",
      "편재":"남성: 인기 / 여성: 시댁 영향.",
      "식신":"부부 사이 정겹고 자식복.",
      "상관":"여성: 자식에 헌신 / 부부 갈등 가능.",
      "비견":"부부 동등하나 경쟁.",
      "겁재":"부부 다툼·재혼 가능성.",
    },
    hour: {
      "정관":"자녀 효성·노후 안정.",
      "편관":"자녀 강하나 갈등.",
      "정인":"노년 학문·후학 양성.",
      "편인":"종교·고독한 노년.",
      "정재":"노년 안정 재물.",
      "편재":"노년 활동·재미.",
      "식신":"자녀와 화목·먹복.",
      "상관":"자녀와 정 깊으나 부담.",
      "비견":"형제 같은 친구·동료.",
      "겁재":"노년 손재 주의.",
    },
  };
  return advices[pos][sipsin] || "다양한 가능성";
}
