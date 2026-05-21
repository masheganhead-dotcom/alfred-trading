// science.js
// 사주 시스템에 결합하는 과학적 도구 4종 통합 모듈
//
// 1) MBTI 매핑 - 십신·오행 분포를 16유형으로 변환 (통계적 휴리스틱)
// 2) 베이지안 신뢰도 - "길/흉" 단언 대신 확률값 + 신뢰구간
// 3) 바이오리듬 - 생체(23일)·감정(28일)·지성(33일) 사인파
// 4) 수비학(Numerology) - Life Path Number (생년월일 자리수 합산)
//
// 모두 결정론적(같은 입력 → 같은 출력). 차트/통계 시각화는 UI에서 처리.

import { STEM_OHAENG, STEM_YINYANG } from "./saju.js";

// =================== 1. MBTI 매핑 ===================
// 휴리스틱 매핑:
//   E/I  ← 화(火)+목(木) 강도 vs 수(水)+금(金) 강도 (양적 vs 음적 에너지)
//   S/N  ← 토(土)+금(金) 비율 vs 목(木)+화(火) 비율 (현실 vs 직관)
//   T/F  ← 일간 양음 (양=T, 음=F) + 정관/편관 강도
//   J/P  ← 인성+관성 강도(체계) vs 식상+재성 강도(자유)
//
// 참고: 사주-MBTI 상관은 학술적 검증 안된 휴리스틱. 재미·참고용 표시 권장.

export function sajuToMBTI(saju) {
  const oh = saju.ohaengCount;  // {목,화,토,금,수}
  const yang = STEM_YINYANG[saju.dayMaster.stem] === "양";

  // 십신 카운팅
  const sipsin = {};
  ["year", "month", "hour"].forEach(p => {
    const s = saju.sipsin[p].stem;
    if (s) sipsin[s] = (sipsin[s] || 0) + 1;
  });

  const yangEnergy = (oh.목 + oh.화) * 1.0;
  const yinEnergy = (oh.수 + oh.금) * 1.0;
  const realisticEnergy = (oh.토 + oh.금) * 1.0;
  const intuitionEnergy = (oh.목 + oh.화) * 1.0;
  const officialPower = (sipsin.정관 || 0) + (sipsin.편관 || 0) + (sipsin.정인 || 0) + (sipsin.편인 || 0);
  const freedomPower = (sipsin.식신 || 0) + (sipsin.상관 || 0) + (sipsin.정재 || 0) + (sipsin.편재 || 0);

  const E_score = (yangEnergy - yinEnergy) / 8 * 50 + 50;  // 0~100
  const N_score = (intuitionEnergy - realisticEnergy) / 8 * 50 + 50;
  const F_score = (yang ? 0 : 20) + ((sipsin.정관 || 0) + (sipsin.정인 || 0)) * 5;  // 음간 + 정관/정인 → F
  const T_score = 100 - F_score;
  const J_score = officialPower * 15 + 30;  // 관·인 강할수록 J
  const P_score = 100 - J_score;

  const E = E_score >= 50;
  const N = N_score >= 50;
  const T = T_score >= 50;
  const J = J_score >= 50;

  const type = (E ? "E" : "I") + (N ? "N" : "S") + (T ? "T" : "F") + (J ? "J" : "P");

  return {
    type,
    scores: {
      E: Math.round(E_score), I: Math.round(100 - E_score),
      N: Math.round(N_score), S: Math.round(100 - N_score),
      T: Math.round(T_score), F: Math.round(F_score),
      J: Math.round(J_score), P: Math.round(P_score),
    },
    confidence: computeMBTIConfidence(E_score, N_score, T_score, J_score),
    description: MBTI_DESC[type] || "다재다능한 균형 유형",
    disclaimer: "사주-MBTI 매핑은 검증되지 않은 휴리스틱이며 참고용입니다.",
  };
}

function computeMBTIConfidence(...scores) {
  // 각 축의 50과의 거리 평균 → 0~100 신뢰도
  const distances = scores.map(s => Math.abs(s - 50));
  const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
  return Math.round(avg * 2);  // 0~100
}

const MBTI_DESC = {
  "INTJ":"전략가형. 사주의 인성(印星)이 강해 학자적 직관과 체계.",
  "INTP":"논리탐구가. 식상(食傷)과 인성의 조합으로 사고가 자유롭다.",
  "ENTJ":"통솔자형. 정관·편관이 강해 권위와 결단.",
  "ENTP":"변론가형. 상관(傷官)이 빛나 언변과 창의.",
  "INFJ":"옹호자형. 음간 + 정인의 깊은 통찰.",
  "INFP":"중재자형. 식신·정인의 조화로 이상주의.",
  "ENFJ":"선도자형. 정관 + 화기(火氣)의 카리스마.",
  "ENFP":"활동가형. 상관 + 식신 + 화기의 표현력.",
  "ISTJ":"청렴결백형. 정인·정관 + 토기(土氣)의 신뢰.",
  "ISFJ":"수호자형. 정인 + 음간의 헌신.",
  "ESTJ":"경영자형. 편관 + 정재 + 토금기(土金氣).",
  "ESFJ":"집정관형. 정관 + 식신의 사교성.",
  "ISTP":"장인형. 편재 + 금기(金氣)의 손재주.",
  "ISFP":"모험가형. 식신 + 음간의 예술성.",
  "ESTP":"사업가형. 편재·편관의 활동.",
  "ESFP":"연예인형. 상관 + 화기의 인기."
};

// =================== 2. 베이지안 신뢰도 ===================
// 운세 단언을 확률값으로. 형충회합·신살·대운 등 여러 시그널을 모은다.
// log-odds 누적 방식.

export function bayesianFortune(signals) {
  // signals: [{type:"positive"|"negative", weight:0~1, label}]
  let logOdds = 0;
  for (const s of signals) {
    const prior = s.weight * (s.type === "positive" ? 1 : -1);
    logOdds += prior;
  }
  // sigmoid
  const probGood = 1 / (1 + Math.exp(-logOdds));
  // 신뢰구간 (시그널 개수가 적으면 넓음)
  const n = signals.length || 1;
  const stdErr = 1 / Math.sqrt(n);
  const lower = Math.max(0, probGood - 1.96 * stdErr * 0.15);
  const upper = Math.min(1, probGood + 1.96 * stdErr * 0.15);

  return {
    probability: Math.round(probGood * 100),
    confidenceInterval: [Math.round(lower * 100), Math.round(upper * 100)],
    nSignals: signals.length,
    interpretation: interpretProb(probGood),
    signals,
  };
}

function interpretProb(p) {
  if (p >= 0.75) return "강한 길운 신호";
  if (p >= 0.6) return "긍정적 흐름";
  if (p >= 0.45) return "중립·균형";
  if (p >= 0.3) return "주의 필요";
  return "강한 흉운 신호";
}

// 사주에서 신호 추출 (자동)
export function extractSajuSignals(saju) {
  const signals = [];
  // 형충회합
  if (saju.relations.samhap.length > 0) signals.push({type:"positive", weight:0.8, label:"삼합"});
  if (saju.relations.hap.length > 0) signals.push({type:"positive", weight:0.5, label:"육합"});
  if (saju.relations.chung.length > 0) signals.push({type:"negative", weight:0.6, label:"충"});
  // 오행 균형
  const ohValues = Object.values(saju.ohaengCount);
  const max = Math.max(...ohValues);
  const min = Math.min(...ohValues);
  if (max - min <= 1) signals.push({type:"positive", weight:0.4, label:"오행 균형"});
  if (max >= 4) signals.push({type:"negative", weight:0.3, label:"오행 편중"});
  if (min === 0) signals.push({type:"negative", weight:0.3, label:"오행 결핍"});
  return signals;
}

// =================== 3. 바이오리듬 ===================
// 생체(23일)·감정(28일)·지성(33일) + 한국 추가: 직관(38일)
// 출생일 ~ 대상일까지의 일수 → sin 함수 위상

export function biorhythm(birthYear, birthMonth, birthDay, targetDate = new Date()) {
  const birth = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
  const target = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
  const days = Math.floor((target - birth) / (1000 * 60 * 60 * 24));

  const cycles = {
    physical: { period: 23, label: "신체(體)" },
    emotional: { period: 28, label: "감정(情)" },
    intellectual: { period: 33, label: "지성(知)" },
    intuitive: { period: 38, label: "직관(覺)" },  // 한국식 추가
  };

  const result = {};
  for (const [k, c] of Object.entries(cycles)) {
    const phase = (days % c.period) / c.period * 2 * Math.PI;
    const value = Math.sin(phase);  // -1 ~ 1
    result[k] = {
      label: c.label,
      value: parseFloat(value.toFixed(3)),
      percent: Math.round(value * 100),
      phase: classifyPhase(value),
      daysSinceBirth: days,
      period: c.period,
    };
  }

  // 다음 30일 추세 (차트용)
  const trend = [];
  for (let d = -7; d <= 30; d++) {
    const totalDays = days + d;
    trend.push({
      offset: d,
      physical: Math.sin((totalDays % 23) / 23 * 2 * Math.PI),
      emotional: Math.sin((totalDays % 28) / 28 * 2 * Math.PI),
      intellectual: Math.sin((totalDays % 33) / 33 * 2 * Math.PI),
      intuitive: Math.sin((totalDays % 38) / 38 * 2 * Math.PI),
    });
  }

  return { cycles: result, trend, targetDate: target.toISOString().slice(0, 10) };
}

function classifyPhase(v) {
  if (v >= 0.85) return "최고조";
  if (v >= 0.3) return "상승";
  if (v >= -0.3) return "전환점(주의)";
  if (v >= -0.85) return "하강";
  return "최저조(휴식 권장)";
}

// =================== 4. 수비학 (Life Path Number) ===================
// 생년월일 모든 자리수의 합 → 1자리 수가 될 때까지 반복 (단, 11/22/33은 마스터 넘버)

export function lifePathNumber(year, month, day) {
  const reduce = (n) => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split("").reduce((a, b) => a + parseInt(b), 0);
    }
    return n;
  };
  const y = reduce(year);
  const m = reduce(month);
  const d = reduce(day);
  const sum = y + m + d;
  const lifePath = reduce(sum);

  return {
    year: y, month: m, day: d,
    sum,
    lifePathNumber: lifePath,
    isMaster: [11, 22, 33].includes(lifePath),
    meaning: LIFE_PATH_MEANING[lifePath] || "조화로운 균형의 길",
  };
}

const LIFE_PATH_MEANING = {
  1: "개척자. 독립·리더십·창조. 새 길을 여는 운명.",
  2: "조화자. 협력·외교·균형. 함께 일하는 운명.",
  3: "표현자. 창의·소통·예술. 표현으로 빛나는 운명.",
  4: "건설자. 성실·체계·안정. 기반을 쌓는 운명.",
  5: "자유인. 변화·모험·자유. 다양함을 살피는 운명.",
  6: "양육자. 책임·사랑·치유. 돌보는 운명.",
  7: "탐구자. 지혜·영성·분석. 진리를 좇는 운명.",
  8: "성취자. 권력·재물·성과. 큰 결실의 운명.",
  9: "인도자. 박애·완성·헌신. 마무리와 봉사의 운명.",
  11: "직관자(마스터). 영적 통찰과 영감. 큰 깨달음.",
  22: "건축가(마스터). 큰 비전을 실현. 대업의 운명.",
  33: "스승(마스터). 사랑의 화신. 인류 봉사의 운명.",
};

// =================== 5. 통합 점수 (총평) ===================
// 위 모든 시그널을 종합한 0~100 종합 운세 점수

export function comprehensiveScore(saju, biorhythmResult, lifePath, bayesian) {
  const sajuBase = bayesian.probability;  // 0~100
  // 바이오리듬 평균 (현재값)
  const bioAvg = Object.values(biorhythmResult.cycles)
    .reduce((a, c) => a + c.percent, 0) / Object.values(biorhythmResult.cycles).length;
  const bioScore = bioAvg / 2 + 50;  // -100~100 → 0~100

  // 가중평균: 사주 60% + 바이오리듬 25% + 수비학 15%
  const lifePathBonus = lifePath.isMaster ? 80 : (lifePath.lifePathNumber * 7 + 30);
  const total = Math.round(sajuBase * 0.6 + bioScore * 0.25 + lifePathBonus * 0.15);

  return {
    total: Math.max(0, Math.min(100, total)),
    breakdown: {
      saju: sajuBase,
      bio: Math.round(bioScore),
      lifePath: lifePathBonus,
    },
    grade: total >= 80 ? "S" : total >= 70 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : "D",
  };
}
