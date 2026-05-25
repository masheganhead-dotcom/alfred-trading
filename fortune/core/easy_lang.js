// easy_lang.js — 사주·신살·오행 한자/전문어를 일상어로 변환
// 비개발자·비전공자(성훈)가 한눈에 이해할 수 있게.

export const SIPSIN_EASY = {
  "비견": { short: "나랑 같은 결의 사람", long: "친구·동료·형제 같은 사람. 같이 하면 잘 풀리는 날.", color: "🟢" },
  "겁재": { short: "친한 척 뺏어가는 사람", long: "겉은 친구인데 속은 경쟁자. 돈·기회 빼앗길 수 있음.", color: "🟠" },
  "식신": { short: "내가 키우는 것 · 먹복", long: "맛있는 거 먹기·창작·여유. 자기표현이 잘 되는 날.", color: "🟢" },
  "상관": { short: "내 재능·표현", long: "끼·말빨·표현이 잘 되는 날. 단 입조심.", color: "🟢" },
  "편재": { short: "큰 돈·외부 자원·기회", long: "외부에서 돈·기회 들어옴. 단 변동 큼.", color: "🟢" },
  "정재": { short: "꾸준한 돈·고정 인연", long: "약속·계약·정기 수입에 길. 결혼·동업에도 OK.", color: "🟢" },
  "편관": { short: "압박·시련·도전", long: "윗사람·시험·압박 들어옴. 침착하면 큰 보상.", color: "🟠" },
  "정관": { short: "체계·약속·공식", long: "계약·문서·자격증 잘 풀림. 겸손이 약.", color: "🟢" },
  "편인": { short: "직감·예술 영감", long: "직감 발휘. 혼자 깊이 들어가는 시간 좋음.", color: "🟢" },
  "정인": { short: "엄마·문서·공부", long: "공부·문서·자격·멘토 만남 좋음. 차분히 정리.", color: "🟢" }
};

export const OHAENG_EASY = {
  "목": { name: "나무", color: "초록", direction: "동쪽", season: "봄", time: "새벽", organ: "간·눈" },
  "화": { name: "불", color: "빨강·주황", direction: "남쪽", season: "여름", time: "한낮", organ: "심장·혀" },
  "토": { name: "땅", color: "노랑·갈색", direction: "중앙", season: "환절기", time: "오후", organ: "위·입" },
  "금": { name: "쇠", color: "흰색·금속", direction: "서쪽", season: "가을", time: "저녁", organ: "폐·코" },
  "수": { name: "물", color: "검정·짙은 파랑", direction: "북쪽", season: "겨울", time: "밤", organ: "신장·귀" }
};

export const SHINSAL_EASY = {
  "백호살": "거친 사건·사고운. 잠잠하면 다행.",
  "역마살": "이동·여행·이주. 자주 움직이는 운.",
  "화개살": "예술·종교·고독. 작업·창작에 길.",
  "괴강살": "카리스마·강한 의지. 부부일은 피해.",
  "도화살": "인기·이성운. 외모·매력 부각.",
  "원진살": "신경 예민·짜증. 사람 멀리하기.",
  "귀문관살": "예민·신경증. 직감 강함.",
  "공망": "비어있음. 결과 헛수고 가능.",
  "천을귀인": "최고 길신. 위기에 귀인 등장.",
  "문창귀인": "공부·시험·문서 길신.",
  "삼합": "큰 인연·동맹. 셋이 모이면 시너지.",
  "육합": "둘이 만나는 합. 만남·계약 길.",
  "충": "부딪힘·변동. 큰 결정 피함.",
  "형": "처벌·갈등. 법적 다툼 조심.",
  "파": "깨짐·이별. 관계 균열.",
  "해": "방해·장애. 일 지연."
};

export const SAMHAP_GROUPS = [
  { branches: ["申", "子", "辰"], ohaeng: "수", name: "신자진 삼합", note: "큰 물의 흐름" },
  { branches: ["巳", "酉", "丑"], ohaeng: "금", name: "사유축 삼합", note: "금속의 결정" },
  { branches: ["寅", "午", "戌"], ohaeng: "화", name: "인오술 삼합", note: "불의 폭발" },
  { branches: ["亥", "卯", "未"], ohaeng: "목", name: "해묘미 삼합", note: "나무의 번성" }
];

export const YUKHAP_PAIRS = [
  { pair: ["子", "丑"], meaning: "토 (땅)" },
  { pair: ["寅", "亥"], meaning: "목 (나무)" },
  { pair: ["卯", "戌"], meaning: "화 (불)" },
  { pair: ["辰", "酉"], meaning: "금 (쇠)" },
  { pair: ["巳", "申"], meaning: "수 (물)" },
  { pair: ["午", "未"], meaning: "토 (땅)" }
];

export const CHUNG_PAIRS = [
  ["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]
];

// 천간합
export const STEM_HAP = [
  { pair: ["甲", "己"], become: "토" },
  { pair: ["乙", "庚"], become: "금" },
  { pair: ["丙", "辛"], become: "수" },
  { pair: ["丁", "壬"], become: "목" },
  { pair: ["戊", "癸"], become: "화" }
];

// 천간충
export const STEM_CHUNG = [["甲", "庚"], ["乙", "辛"], ["丙", "壬"], ["丁", "癸"]];

// === 오늘 일진과 한 사람의 일주 관계 분석 ===
// 결과: { signal: "🟢|🟡|🟠|🔵", strength: 0~10, reasons: [...], advice: "..." }
export function dayRelation(todayStem, todayBranch, personStem, personBranch) {
  const reasons = [];
  let signal = "🔵";
  let strength = 5;

  // 천간 관계
  const stemHap = STEM_HAP.find(h => h.pair.includes(todayStem) && h.pair.includes(personStem) && todayStem !== personStem);
  const stemChung = STEM_CHUNG.some(c => c.includes(todayStem) && c.includes(personStem) && todayStem !== personStem);
  if (stemHap) {
    reasons.push(`천간합(${todayStem}${personStem}→${stemHap.become}) — 마음 통함`);
    signal = "🟢"; strength += 2;
  }
  if (stemChung) {
    reasons.push(`천간충(${todayStem}${personStem}) — 충돌·언쟁 주의`);
    signal = "🟠"; strength -= 2;
  }
  if (!stemHap && !stemChung && todayStem === personStem) {
    reasons.push(`같은 천간(${todayStem}) — 비슷한 기운, 동료감`);
    strength += 1;
  }

  // 지지 관계
  const yukhap = YUKHAP_PAIRS.find(p => p.pair.includes(todayBranch) && p.pair.includes(personBranch) && todayBranch !== personBranch);
  const chung = CHUNG_PAIRS.some(c => c.includes(todayBranch) && c.includes(personBranch) && todayBranch !== personBranch);
  const samhap = SAMHAP_GROUPS.find(g => g.branches.includes(todayBranch) && g.branches.includes(personBranch) && todayBranch !== personBranch);

  if (yukhap) {
    reasons.push(`지지육합(${todayBranch}${personBranch}→${yukhap.meaning}) — 만남·계약 길`);
    signal = signal === "🟠" ? "🟡" : "🟢"; strength += 2;
  }
  if (samhap) {
    reasons.push(`삼합 일부(${samhap.name} — ${samhap.note}) — 큰 인연 신호`);
    signal = signal === "🟠" ? "🟡" : "🟢"; strength += 2;
  }
  if (chung) {
    reasons.push(`지지충(${todayBranch}${personBranch}) — 변동·다툼 주의`);
    signal = "🟠"; strength -= 3;
  }

  if (reasons.length === 0) {
    reasons.push("특별한 합·충 없음 — 평이한 흐름");
  }

  // advice
  let advice;
  if (strength >= 9) advice = "오늘 꼭 만나·연락. 큰 결정 같이 해도 OK.";
  else if (strength >= 7) advice = "만나면 시너지. 가벼운 약속 OK.";
  else if (strength >= 5) advice = "평이. 굳이 오늘일 필요 없음.";
  else if (strength >= 3) advice = "오늘은 거리 두기. 톡 짧게.";
  else advice = "오늘은 피해. 다른 날에.";

  return { signal, strength, reasons, advice };
}

// === 점수를 사람 말로 ===
export function scoreToHuman(score) {
  if (score >= 85) return { word: "엄청 좋은 날", level: "★★★ 인생급", emoji: "🌟" };
  if (score >= 75) return { word: "아주 좋은 날", level: "★★ 대길", emoji: "✨" };
  if (score >= 60) return { word: "괜찮은 날", level: "★ 길", emoji: "🌤" };
  if (score >= 45) return { word: "평범한 날", level: "평", emoji: "🌥" };
  if (score >= 30) return { word: "살짝 조심할 날", level: "주의", emoji: "⚠️" };
  return { word: "쉬어야 할 날", level: "흉", emoji: "🛑" };
}

// === 주역 64괘 중 오늘 1괘 결정적 매핑 (일진 60갑자 → 64괘) ===
// 매일 같은 날엔 같은 괘 (신뢰성). gapja index 0~59를 64로 매핑.
export function pickHexagram(gapjaIdx, hexagrams) {
  const n = Math.floor((gapjaIdx * 64) / 60) % 64;
  return hexagrams[n] || hexagrams[0];
}

// === D-DAY 카운트 ===
export function daysBetween(from, to) {
  const f = new Date(from); const t = new Date(to);
  return Math.ceil((t - f) / (1000 * 60 * 60 * 24));
}

// === 안전한 랜덤 (seed 기반, 같은 날 같은 결과) ===
export function seedRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function seedPick(arr, seed) {
  const rng = seedRandom(seed);
  return arr[Math.floor(rng() * arr.length)];
}
