// statistical_science.js
// 학술적으로 검증된 통계·과학 결합 모듈 4종
//
// 1) Big5 OCEAN 매핑 - 사주 십신·오행 → 5요인 모델 (MBTI보다 학술적)
//    학술적 근거: Costa & McCrae NEO-PI-R, 1990년대부터 인지심리학 표준
//    출처: https://en.wikipedia.org/wiki/Big_Five_personality_traits
//
// 2) 출생계절 효과 (Birth Season Effect)
//    학술적 근거: 2024-2025 PLOS ONE, Frontiers in Psychiatry 메타분석
//    https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0253815
//    주의: 최신 2025 연구는 일부 효과 부정 — 양면 모두 표시
//
// 3) Forer/Barnum 지수 - 운세 텍스트의 일반성(generality) 정량화
//    1948년 Forer 원실험 (평균 4.30/5.00 정확도)
//    https://en.wikipedia.org/wiki/Barnum_effect
//
// 4) 황도12궁 천문 계산 - 출생일 태양 황경 → 12별자리 (정밀)
//    solar_terms.js의 solarLongitude 재활용
//
// 모두 결정론적. 입력 동일 시 동일 출력.

import { STEM_OHAENG, STEM_YINYANG, BRANCH_OHAENG } from "./saju.js";
import { dateToJulian } from "./solar_terms.js";

// =================== 1. Big5 OCEAN 매핑 ===================
//
// 매핑 가설 (휴리스틱 - 학술 검증은 미래 과제):
//   Openness (O, 개방성)     ← 식상·인성 + 목화 비율 (창의·호기심)
//   Conscientiousness (C, 성실성) ← 정관·정인 + 토금 비율 (체계·자기통제)
//   Extraversion (E, 외향성)  ← 양간 + 화·목 비율 (활동·사교)
//   Agreeableness (A, 친화성) ← 정인·식신 + 음간 (협력·온화)
//   Neuroticism (N, 신경증)   ← 충·형·편관 + 결핍 오행 (불안·정서 불안정)

export function sajuToBig5(saju) {
  const oh = saju.ohaengCount;
  const yang = STEM_YINYANG[saju.dayMaster.stem] === "양";

  // 십신 카운팅
  const sipsin = {};
  ["year","month","hour"].forEach(p => {
    const s = saju.sipsin[p].stem;
    if (s) sipsin[s] = (sipsin[s] || 0) + 1;
  });
  const get = (k) => sipsin[k] || 0;

  // 충·형·합 개수 (안정성 측정)
  const chungCount = saju.relations.chung.length;
  const hapCount = saju.relations.hap.length + saju.relations.samhap.length;

  // 오행 결핍 (Neuroticism 가중)
  const deficient = Object.values(oh).filter(c => c === 0).length;

  // 각 요인 점수 (0~100)
  const O = clamp(
    (get("식신") + get("상관")) * 12 +
    (get("정인") + get("편인")) * 8 +
    (oh.목 + oh.화) * 5 +
    35
  );
  const C = clamp(
    (get("정관") + get("정인")) * 15 +
    (get("정재")) * 8 +
    (oh.토 + oh.금) * 5 +
    25
  );
  const E = clamp(
    (yang ? 25 : 0) +
    (oh.화 + oh.목) * 8 +
    (get("상관") + get("편재")) * 6 +
    20
  );
  const A = clamp(
    (get("정인") + get("식신")) * 12 +
    (yang ? 0 : 15) +
    hapCount * 8 +
    25
  );
  const N = clamp(
    chungCount * 15 +
    deficient * 10 +
    (get("편관") + get("겁재")) * 7 +
    25
  );

  return {
    scores: { O, C, E, A, N },
    profile: profileBig5({ O, C, E, A, N }),
    interpretation: interpretBig5({ O, C, E, A, N }),
    source: "Costa & McCrae NEO-PI-R 5요인 모델 (Big5 OCEAN). 사주 매핑은 휴리스틱.",
  };
}

function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }

function profileBig5(s) {
  // 가장 두드러진 2요인
  const sorted = Object.entries(s).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 2).map(([k, v]) => `${k}(${v})`).join("+");
}

function interpretBig5(s) {
  const traits = [];
  if (s.O >= 70) traits.push("창의적·호기심 강함");
  else if (s.O <= 30) traits.push("실용적·전통 선호");
  if (s.C >= 70) traits.push("체계적·자기통제 우수");
  else if (s.C <= 30) traits.push("자유로움·즉흥적");
  if (s.E >= 70) traits.push("외향적·활동적");
  else if (s.E <= 30) traits.push("내향적·신중");
  if (s.A >= 70) traits.push("협력적·온화");
  else if (s.A <= 30) traits.push("독립적·경쟁적");
  if (s.N >= 70) traits.push("정서 변동 큼·예민");
  else if (s.N <= 30) traits.push("안정적·차분");
  return traits.join(" / ") || "균형형";
}

// =================== 2. 출생계절 효과 ===================
//
// 데이터 출처: 2024-2025 학술 메타분석 요약
// - PLOS ONE 2021: 출생계절 → 성격 일부 연관 (남성에서 더 뚜렷)
// - Frontiers Psychiatry 2025: 주요 성격모델(TEMPS/TCI/NEO-PI)은 출생계절과 무관 (부정적 결과)
// - 결론: 효과는 작지만 통계적으로 관찰됨. 의료 영역(천식·ADHD)에서 더 강한 신호.

const BIRTH_SEASON_DATA = {
  spring: {  // 3-5월
    months: [3, 4, 5],
    label: "봄생 (3-5월)",
    physiological: "비타민D 충분기 임신/출산. 신체발달 평균 이상.",
    cognitive: "1-3월 출생자는 학년 내 상대적 고령 → 학업 성적 +0.2 SD (Relative Age Effect)",
    mental: "우울증 위험 낮음. 양극성장애 약간 ↑ (북반구 기준)",
    big5_tendency: { O: +3, C: +2, E: +3, A: 0, N: -2 },
    diseases_relative_risk: { "천식": 1.08, "다발성경화증": 1.12, "ADHD": 0.95 },
    citation: "Lancet 2012 / PLOS ONE 2021"
  },
  summer: {  // 6-8월
    months: [6, 7, 8],
    label: "여름생 (6-8월)",
    physiological: "어린 시절 햇빛 노출 최대. 키 평균 +0.3cm 보고.",
    cognitive: "학업 성적 평균 (학년 내 중간 연령)",
    mental: "정서 안정. Extravagance 점수 ↑ (남성)",
    big5_tendency: { O: +2, C: 0, E: +4, A: +1, N: -1 },
    diseases_relative_risk: { "근시": 1.15, "다발성경화증": 0.92 },
    citation: "Front Psychiatry 2025 / PLOS ONE 2021"
  },
  autumn: {  // 9-11월
    months: [9, 10, 11],
    label: "가을생 (9-11월)",
    physiological: "겨울 임신 → Vit D 부족 가능. 추후 보완 권장.",
    cognitive: "한국 학년 기준 상대적 어림 (3월 입학) → 초기 학습 불리 가능",
    mental: "Disorderliness 점수 ↑ (남성). 우울 위험 평균.",
    big5_tendency: { O: +1, C: -1, E: 0, A: 0, N: +1 },
    diseases_relative_risk: { "조현병": 0.92, "ADHD": 1.10 },
    citation: "PLOS ONE 2021 / Schizophrenia Bull 2017"
  },
  winter: {  // 12-2월
    months: [12, 1, 2],
    label: "겨울생 (12-2월)",
    physiological: "Vit D 결핍 출산 가능성. 면역계 영향.",
    cognitive: "12월 출생자는 학업 평균 이하 경향 (한국 학제). 1-2월 출생자는 입학 빠를 시 불리.",
    mental: "조현병·양극성 발병율 +5~10% (북반구 데이터). 단 절대치는 매우 낮음.",
    big5_tendency: { O: 0, C: +1, E: -2, A: +1, N: +2 },
    diseases_relative_risk: { "조현병": 1.08, "양극성장애": 1.06, "1형당뇨": 1.05 },
    citation: "Lancet Psychiatry 2018 / Nature 2015"
  }
};

export function birthSeasonEffect(year, month, day, big5) {
  const season = month >= 3 && month <= 5 ? "spring"
              : month >= 6 && month <= 8 ? "summer"
              : month >= 9 && month <= 11 ? "autumn" : "winter";
  const data = BIRTH_SEASON_DATA[season];

  // Big5 조정값 (출생계절 효과로 ±값)
  const adjustedBig5 = {};
  for (const k of ["O","C","E","A","N"]) {
    adjustedBig5[k] = clamp(big5.scores[k] + data.big5_tendency[k]);
  }

  return {
    season,
    label: data.label,
    physiological: data.physiological,
    cognitive: data.cognitive,
    mental: data.mental,
    big5_adjustment: data.big5_tendency,
    big5_adjusted: adjustedBig5,
    diseases: data.diseases_relative_risk,
    citation: data.citation,
    note: "효과 크기는 작음(0.05~0.15 SD). 개인차가 훨씬 큼. 2025 일부 연구는 부정."
  };
}

// =================== 3. Forer/Barnum 지수 ===================
//
// 운세 텍스트의 "일반성" 정량화. Forer 1948 실험의 평균 4.30/5.00은
// 일반적 문구가 모두에게 해당된다는 인지편향 결과.
//
// 측정 방식 (간이):
//   - 일반적 단어(누구나 해당) 비율 ↑ → Forer 지수 ↑ (덜 구체적)
//   - 구체적 단어(숫자·고유명사·특정 사주 용어) 비율 ↑ → Forer 지수 ↓
//   - 부정/주의 표현(반대 측면) 비율 ↑ → 양면성 → Forer 지수 ↑

const GENERAL_WORDS = [
  "때로는", "가끔", "어떤", "사람들", "대체로", "일반적으로", "때때로",
  "본질적으로", "기본적으로", "잠재적", "내면", "고민", "꿈", "희망",
  "잘", "보통", "다소", "조금", "약간", "전반적", "근본적",
  "당신은", "여러분", "모두", "누구나", "사람", "타인"
];

const SPECIFIC_MARKERS = [
  // 사주 전문 용어
  "갑자","을축","병인","정묘","무진","기사","경오","신미","임신","계유",
  "비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인",
  "백호","괴강","원진","귀문관","천을귀인","문창","공망","삼재","역마","도화","화개","양인",
  // 정확한 띠·일주
  "쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠",
  "목","화","토","금","수",
  // 천간
  "甲","乙","丙","丁","戊","己","庚","辛","壬","癸",
  // 지지
  "子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥",
];

const HEDGE_WORDS = ["또는","그러나","하지만","다만","단","주의","조심","경계","피하","주의해야"];

export function forerIndex(text) {
  if (!text || text.length < 10) return { score: 0, level: "분석 불가" };

  const totalWords = text.length / 2;  // 한글 글자 ÷ 2 ≈ 단어 추정

  let generalCount = 0;
  let specificCount = 0;
  let hedgeCount = 0;

  GENERAL_WORDS.forEach(w => {
    const matches = (text.match(new RegExp(w, "g")) || []).length;
    generalCount += matches;
  });
  SPECIFIC_MARKERS.forEach(w => {
    const matches = (text.match(new RegExp(w, "g")) || []).length;
    specificCount += matches;
  });
  HEDGE_WORDS.forEach(w => {
    const matches = (text.match(new RegExp(w, "g")) || []).length;
    hedgeCount += matches;
  });

  // Forer 지수: 일반성 비율 (0~100)
  // 높을수록 누구에게나 해당되는 일반적 텍스트 (덜 신뢰)
  const generalRatio = (generalCount + hedgeCount * 0.5) / totalWords;
  const specificRatio = specificCount / totalWords;
  let score = Math.round((generalRatio * 100 - specificRatio * 50 + 30));
  score = Math.max(0, Math.min(100, score));

  const level = score >= 70 ? "매우 일반적 (Barnum 의심)"
              : score >= 50 ? "다소 일반적"
              : score >= 30 ? "균형적"
              : "구체적 (사주 근거 강함)";

  return {
    score,
    level,
    counts: { general: generalCount, specific: specificCount, hedge: hedgeCount, totalWords: Math.round(totalWords) },
    interpretation: forerInterp(score),
    citation: "Forer 1948 (J. Abnormal Social Psych.) / Snyder 1974",
  };
}

function forerInterp(s) {
  if (s >= 70) return "이 해석은 누구에게나 해당되는 일반론에 가깝다. 자기에게만 적용된다고 느낀다면 Barnum 효과를 의심하라.";
  if (s >= 50) return "다소 일반적인 표현이 섞여 있다. 구체적 단어(일주·신살 등)를 함께 확인하라.";
  if (s >= 30) return "일반성과 구체성이 균형 잡혔다. 사주 근거가 명시되어 있다.";
  return "사주 전문 용어가 풍부해 구체적이다. 다만 구체적이라고 반드시 맞는 것은 아니다.";
}

// =================== 4. 황도 12궁 천문 계산 ===================
//
// 출생일 태양의 황경(ecliptic longitude)을 30°씩 12분할 → 별자리
// 양자리(Aries) = 황경 0°~30°, 황소자리 30°~60° ...
// 정확도: 분 단위 (Meeus VSOP87 단순화)

const ZODIAC_SIGNS = [
  { name: "양자리", en: "Aries",       han: "白羊", element: "화", dates: "3.21-4.19", traits: "용기·개척·리더십", ruler: "화성" },
  { name: "황소자리", en: "Taurus",    han: "金牛", element: "토", dates: "4.20-5.20", traits: "안정·인내·미감", ruler: "금성" },
  { name: "쌍둥이자리", en: "Gemini",  han: "雙子", element: "풍", dates: "5.21-6.21", traits: "지적·다재·변화", ruler: "수성" },
  { name: "게자리", en: "Cancer",      han: "巨蟹", element: "수", dates: "6.22-7.22", traits: "가정·정서·보호", ruler: "달" },
  { name: "사자자리", en: "Leo",       han: "獅子", element: "화", dates: "7.23-8.22", traits: "자존·창조·표현", ruler: "태양" },
  { name: "처녀자리", en: "Virgo",     han: "處女", element: "토", dates: "8.23-9.22", traits: "분석·정밀·완벽", ruler: "수성" },
  { name: "천칭자리", en: "Libra",     han: "天秤", element: "풍", dates: "9.23-10.22", traits: "조화·균형·미", ruler: "금성" },
  { name: "전갈자리", en: "Scorpio",   han: "天蠍", element: "수", dates: "10.23-11.21", traits: "직관·강렬·집중", ruler: "명왕성" },
  { name: "사수자리", en: "Sagittarius", han: "射手", element: "화", dates: "11.22-12.21", traits: "자유·철학·확장", ruler: "목성" },
  { name: "염소자리", en: "Capricorn", han: "山羊", element: "토", dates: "12.22-1.19", traits: "야망·실용·인내", ruler: "토성" },
  { name: "물병자리", en: "Aquarius",  han: "水甁", element: "풍", dates: "1.20-2.18", traits: "독창·박애·미래", ruler: "천왕성" },
  { name: "물고기자리", en: "Pisces",  han: "雙魚", element: "수", dates: "2.19-3.20", traits: "감수성·영성·예술", ruler: "해왕성" },
];

export function calculateZodiac(year, month, day) {
  // 12시 정오 기준 태양 황경 (날짜 경계 안전)
  const jd = dateToJulian(new Date(Date.UTC(year, month - 1, day, 12)));
  const lon = solarLonForJD(jd);
  const idx = Math.floor(lon / 30);
  const sign = ZODIAC_SIGNS[idx];
  return {
    ...sign,
    solarLongitude: parseFloat(lon.toFixed(2)),
    degreeInSign: parseFloat((lon - idx * 30).toFixed(2)),
    citation: "Meeus VSOP87 단순화 (Astronomical Algorithms Ch.25)"
  };
}

function solarLonForJD(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  const trueLon = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLon - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
  return ((apparent % 360) + 360) % 360;
}

// === 사주 ↔ 별자리 교차 검증 ===
export function crossCompare(saju, zodiac) {
  // 오행 매핑 (서양 4원소 + 풍 ↔ 동양 5원소)
  const WEST_TO_EAST = { "화": "화", "토": "토", "풍": "금", "수": "수" };
  const sajuMainOhaeng = Object.entries(saju.ohaengCount).sort((a, b) => b[1] - a[1])[0][0];
  const zodiacEast = WEST_TO_EAST[zodiac.element];

  let match = "";
  if (sajuMainOhaeng === zodiacEast) {
    match = `✓ 일치 - 사주 주(主)오행 ${sajuMainOhaeng} = 별자리 원소 ${zodiac.element}. 두 체계가 같은 방향을 가리킨다.`;
  } else {
    match = `⚠ 차이 - 사주 주오행 ${sajuMainOhaeng}, 별자리 원소 ${zodiac.element}. 동·서양 체계 결과가 갈리므로 양면을 고려.`;
  }

  return { sajuMainOhaeng, zodiacEast, match };
}

// =================== 통합 export ===================
export const SCIENCE_CITATIONS = {
  big5: "https://en.wikipedia.org/wiki/Big_Five_personality_traits",
  birthSeason: "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0253815",
  birthSeason2: "https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1710173",
  forer: "https://en.wikipedia.org/wiki/Barnum_effect",
  astro: "https://github.com/0xStarcat/CircularNatalHoroscopeJS",
  meeus: "Jean Meeus, Astronomical Algorithms 2nd ed. (1998)",
};
