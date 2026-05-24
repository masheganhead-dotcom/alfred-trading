// saju.js
// 사주팔자(四柱八字) 계산 엔진
//
// 참고 오픈소스 (검증):
//   - urstory/manseryeok-js : 진태양시 보정 + 절기 기반 월주
//   - yhj1024/manseryeok    : 한국형 60갑자
//   - tommitoan/bazica      : 1900-2100 일주 인덱스
//   - cantian-ai/bazi-mcp   : 십신·대운·길흉신 출력 스키마
//   - alvamind/bazi-calculator : 호환성 분석
//
// 핵심 알고리즘:
//   1. 양력 입력 → 진태양시 보정 (경도-135° 기준 ×4분/°)
//   2. 일주 = (보정일자 - 기준일) % 60 갑자
//   3. 월주 = 직전 절(節)의 지지 + 오호둔(年干→寅月干)으로 계산
//   4. 년주 = 입춘 기준 60갑자
//   5. 시주 = 시지(2시간) + 오자둔(日干→子時干)
//   6. 십신 = 일간(日干) 기준 다른 천간/지지장간의 관계
//   7. 대운 = 양남음녀 순행 / 음남양녀 역행, 대운수 = 절기까지 일수/3

import { dateToJulian, getJieForDate, getSolarTermsForYear } from "./solar_terms.js";

export const CHEONGAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
export const CHEONGAN_KOR = ["갑","을","병","정","무","기","경","신","임","계"];
export const JIJI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
export const JIJI_KOR = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
export const ANIMALS = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];

// 천간/지지 → 오행
export const STEM_OHAENG = ["목","목","화","화","토","토","금","금","수","수"];
export const STEM_YINYANG = ["양","음","양","음","양","음","양","음","양","음"];
export const BRANCH_OHAENG = ["수","토","목","목","토","화","화","토","금","금","토","수"];
export const BRANCH_YINYANG = ["양","음","양","음","양","음","양","음","양","음","양","음"];

// 지지장간 (地支藏干) - 본기/중기/여기
export const HIDDEN_STEMS = [
  [9],          // 子: 癸
  [5, 9, 7],    // 丑: 己 癸 辛
  [0, 2, 4],    // 寅: 甲 丙 戊
  [1],          // 卯: 乙
  [4, 1, 9],    // 辰: 戊 乙 癸
  [2, 4, 6],    // 巳: 丙 戊 庚
  [3, 5],       // 午: 丁 己
  [5, 3, 1],    // 未: 己 丁 乙
  [6, 8, 4],    // 申: 庚 壬 戊
  [7],          // 酉: 辛
  [4, 7, 3],    // 戌: 戊 辛 丁
  [8, 0],       // 亥: 壬 甲
];

// 오호둔 (五虎遁): 年干 → 寅月 천간
// 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
const OHO_DUN = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];

// 오자둔 (五子遁): 日干 → 子時 천간
// 甲己→甲(0), 乙庚→丙(2), 丙辛→戊(4), 丁壬→庚(6), 戊癸→壬(8)
const OJA_DUN = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];

// === Gapja(60갑자) 인덱스 → {간, 지} ===
export function gapja(n) {
  const i = ((n % 60) + 60) % 60;
  return { stem: i % 10, branch: i % 12, idx: i };
}

export function gapjaName(n) {
  const g = gapja(n);
  return CHEONGAN[g.stem] + JIJI[g.branch];
}

export function gapjaKor(n) {
  const g = gapja(n);
  return CHEONGAN_KOR[g.stem] + JIJI_KOR[g.branch];
}

// === 진태양시 보정 ===
// 한국 표준시(KST, UTC+9)는 동경 135° 기준. 경도 lng일 때 (lng-135)×4분 보정.
// 서울 ~127° → -32분, 부산 ~129° → -24분.
export function correctToSolarTime(date, longitude = 127.0) {
  const offsetMinutes = (longitude - 135) * 4;
  return new Date(date.getTime() + offsetMinutes * 60 * 1000);
}

// === 일주 계산 ===
// 기준: 1900-01-01 00:00 KST = 庚子日(36번 갑자, 0-base)
// (검증: urstory/manseryeok-js, bazica 동일 결과)
// 율리우스일 차이로 60갑자 인덱스 계산
const REF_JD = dateToJulian(new Date(Date.UTC(1900, 0, 1, 0, 0, 0)));  // KST midnight = UTC 15:00 of 1899-12-31, but we use noon convention
const REF_GAPJA = 36;  // 庚子

export function getDayGapja(date) {
  // 자시(子時, 23:00~) 처리: 23시 이후는 다음 날로 간주
  let d = new Date(date.getTime());
  if (d.getHours() >= 23) d = new Date(d.getTime() + 60*60*1000);  // 1시간 더해서 다음날로
  const jd = dateToJulian(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)));  // 정오 기준
  const refJd = dateToJulian(new Date(Date.UTC(1900, 0, 1, 12, 0, 0)));
  const dayDiff = Math.round(jd - refJd);
  return gapja(REF_GAPJA + dayDiff);
}

// === 년주 계산 (입춘 기준) ===
export function getYearGapja(date) {
  // 입춘(立春, 황경 315°) 이전이면 전년 사주
  const jie = getJieForDate(date);
  // jie.year는 절기 발생 연도, 입춘부터 다음 입춘 전까지가 사주의 1년
  // 입춘 이후 첫 절(2월~)이면 그 절의 year가 사주의 해
  // 입춘 자체도 isJie=true. 입춘 이전이면 jie는 전년 12월 소한·대설 등이 될 수 있음
  const Y = date.getUTCFullYear();
  // 올해 입춘 시각
  const thisYearTerms = getSolarTermsForYear(Y);
  const lichun = thisYearTerms.find(t => t.han === "立春");
  const sajuYear = date.getTime() < lichun.date.getTime() ? Y - 1 : Y;
  // 갑자년 기준: 서기 4년 = 갑자년 (甲子年, idx 0)
  const yearIdx = ((sajuYear - 4) % 60 + 60) % 60;
  return { ...gapja(yearIdx), sajuYear };
}

// === 월주 계산 ===
export function getMonthGapja(date, yearStem) {
  const jie = getJieForDate(date);
  const branchIdx = jie.branch;  // 절기의 branch 필드 = 월지
  // 오호둔: 년간(0~9) → 寅月 천간
  const inMonthStem = OHO_DUN[yearStem];
  // 寅(2)부터 시작해서 branchIdx까지 거리만큼 천간 진행
  const dist = (branchIdx - 2 + 12) % 12;
  const stem = (inMonthStem + dist) % 10;
  return { stem, branch: branchIdx, idx: -1 };
}

// === 시주 계산 ===
export function getHourGapja(date, dayStem) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  // 子(자)시 = 23:00~00:59, 丑(축)시 = 1:00~2:59 ...
  // 정확히는 23:30 기준 분할도 있으나 일반적 23시 기준 사용
  const totalMin = hour * 60 + minute;
  // 23:00 = 1380분, 그 이후 또는 1:00 미만 → 자시
  let branchIdx;
  if (totalMin >= 23 * 60 || totalMin < 1 * 60) branchIdx = 0;  // 子
  else branchIdx = Math.floor((totalMin - 60) / 120) + 1;  // 1~11
  // 오자둔: 일간 → 子時 천간
  const jaStemBase = OJA_DUN[dayStem];
  const stem = (jaStemBase + branchIdx) % 10;
  return { stem, branch: branchIdx, idx: -1 };
}

// === 십신 계산 ===
// 일간 기준 다른 천간의 관계
// 같은 오행 + 같은 음양 = 비견 / 같은 오행 + 다른 음양 = 겁재
// 내가 생하는 (목→화) + 같은 음양 = 식신 / 다른 음양 = 상관
// 내가 극하는 (목→토) + 같은 음양 = 편재 / 다른 음양 = 정재
// 나를 극하는 (금→목) + 같은 음양 = 편관 / 다른 음양 = 정관
// 나를 생하는 (수→목) + 같은 음양 = 편인 / 다른 음양 = 정인
const OHAENG_ORDER = ["목","화","토","금","수"];
function ohaengRel(a, b) {
  // a 기준 b가 무엇인가
  const ia = OHAENG_ORDER.indexOf(a);
  const ib = OHAENG_ORDER.indexOf(b);
  if (ia === ib) return "동(비겁)";
  if ((ia + 1) % 5 === ib) return "내가생함(식상)";
  if ((ia + 2) % 5 === ib) return "내가극함(재성)";
  if ((ia + 3) % 5 === ib) return "나를극함(관성)";
  if ((ia + 4) % 5 === ib) return "나를생함(인성)";
}

export function sipsinForStem(dayStem, otherStem) {
  if (otherStem === null || otherStem === undefined) return null;
  const dayE = STEM_OHAENG[dayStem];
  const dayY = STEM_YINYANG[dayStem];
  const othE = STEM_OHAENG[otherStem];
  const othY = STEM_YINYANG[otherStem];
  const sameYY = (dayY === othY);
  const rel = ohaengRel(dayE, othE);
  switch (rel) {
    case "동(비겁)": return sameYY ? "비견" : "겁재";
    case "내가생함(식상)": return sameYY ? "식신" : "상관";
    case "내가극함(재성)": return sameYY ? "편재" : "정재";
    case "나를극함(관성)": return sameYY ? "편관" : "정관";
    case "나를생함(인성)": return sameYY ? "편인" : "정인";
  }
}

export function sipsinForBranch(dayStem, branchIdx) {
  // 지지장간의 본기로 십신 매핑
  const hidden = HIDDEN_STEMS[branchIdx];
  return hidden.map(s => sipsinForStem(dayStem, s));
}

// === 대운 계산 ===
// 양남/음녀 → 순행, 음남/양녀 → 역행
// 대운수 = 출생일과 다음(순행)/이전(역행) 절기까지의 일수 / 3
export function getDaewoon(date, yearStem, gender, monthGapja) {
  const yangStem = STEM_YINYANG[yearStem] === "양";
  const male = (gender === "M" || gender === "m" || gender === "남");
  // 순행 조건: (양남) or (음녀)
  const forward = (yangStem && male) || (!yangStem && !male);
  const jie = getJieForDate(date);
  // 다음 절(順) 또는 이전 절(逆) 까지의 일수
  const Y = date.getUTCFullYear();
  const allJie = [];
  for (const y of [Y - 1, Y, Y + 1]) {
    const terms = getSolarTermsForYear(y);
    for (const t of terms) if (t.isJie) allJie.push(t);
  }
  allJie.sort((a, b) => a.date - b.date);
  let nextJie = null, prevJie = null;
  for (const t of allJie) {
    if (t.date.getTime() > date.getTime() && !nextJie) nextJie = t;
    if (t.date.getTime() <= date.getTime()) prevJie = t;
  }
  const targetJie = forward ? nextJie : prevJie;
  const diffMs = Math.abs(targetJie.date.getTime() - date.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  // 3일 = 1대운(1년) 환산
  const daewoonStart = diffDays / 3;
  // 대운 10년 단위로 10개 산출
  const daewoonList = [];
  const monthIdx = monthGapja.stem * 12 + monthGapja.branch; // 임시
  // 월주의 60갑자 인덱스 (간지 조합으로 역계산)
  let baseIdx = -1;
  for (let i = 0; i < 60; i++) {
    const g = gapja(i);
    if (g.stem === monthGapja.stem && g.branch === monthGapja.branch) { baseIdx = i; break; }
  }
  for (let i = 1; i <= 10; i++) {
    const idx = forward ? (baseIdx + i) : (baseIdx - i);
    const g = gapja(idx);
    daewoonList.push({
      age: Math.round(daewoonStart + (i - 1) * 10),
      stem: g.stem,
      branch: g.branch,
      gapja: CHEONGAN[g.stem] + JIJI[g.branch],
      sipsinStem: sipsinForStem(yearStem, g.stem),
    });
  }
  return { forward, startAge: parseFloat(daewoonStart.toFixed(2)), list: daewoonList };
}

// === 형충회합 ===
const CHUNG_PAIRS = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];  // 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥
const YUKHAP = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];        // 子丑, 寅亥, 卯戌, 辰酉, 巳申, 午未
const SAMHAP = [[8,0,4],[5,9,1],[2,6,10],[11,3,7]];            // 申子辰, 巳酉丑, 寅午戌, 亥卯未

export function analyzeRelations(branches) {
  // branches: [yBr, mBr, dBr, hBr]
  const result = { chung: [], hap: [], samhap: [], hyeong: [], hae: [] };
  for (const [a, b] of CHUNG_PAIRS) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          result.chung.push(JIJI[branches[i]] + JIJI[branches[j]] + "충");
        }
      }
    }
  }
  for (const [a, b] of YUKHAP) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          result.hap.push(JIJI[branches[i]] + JIJI[branches[j]] + "합");
        }
      }
    }
  }
  for (const triple of SAMHAP) {
    const has = triple.filter(t => branches.includes(t));
    if (has.length === 3) result.samhap.push(triple.map(t => JIJI[t]).join("") + "삼합");
  }
  return result;
}

// === 메인: 사주 전체 계산 ===
export function calculateSaju({year, month, day, hour, minute = 0, gender = "M", longitude = 127.0, useTrueSolarTime = true, calendar = "solar"}) {
  // calendar: "solar" 또는 "lunar". lunar는 별도 변환 필요 (lunar.js)
  if (calendar !== "solar") {
    throw new Error("음력 입력은 lunar.js의 lunarToSolar로 먼저 변환 필요");
  }
  // 입력은 한국 KST 기준 local time
  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  // KST→UTC: -9시간 빼면 진짜 UTC. 하지만 모든 계산을 "KST 시각이지만 UTC 메서드로 읽기" 패턴으로 통일.
  const date = useTrueSolarTime ? correctToSolarTime(localDate, longitude) : localDate;
  // (date는 보정된 진태양시. UTC 메서드로 읽으면 KST의 "시계 시각"임)

  const yearG = getYearGapja(date);
  const monthG = getMonthGapja(date, yearG.stem);
  const dayG = getDayGapja(date);
  const hourG = getHourGapja(date, dayG.stem);

  const pillars = {
    year:  { stem: yearG.stem, branch: yearG.branch, gapja: CHEONGAN[yearG.stem] + JIJI[yearG.branch], kor: CHEONGAN_KOR[yearG.stem] + JIJI_KOR[yearG.branch] },
    month: { stem: monthG.stem, branch: monthG.branch, gapja: CHEONGAN[monthG.stem] + JIJI[monthG.branch], kor: CHEONGAN_KOR[monthG.stem] + JIJI_KOR[monthG.branch] },
    day:   { stem: dayG.stem, branch: dayG.branch, gapja: CHEONGAN[dayG.stem] + JIJI[dayG.branch], kor: CHEONGAN_KOR[dayG.stem] + JIJI_KOR[dayG.branch] },
    hour:  { stem: hourG.stem, branch: hourG.branch, gapja: CHEONGAN[hourG.stem] + JIJI[hourG.branch], kor: CHEONGAN_KOR[hourG.stem] + JIJI_KOR[hourG.branch] },
  };

  const dayStem = dayG.stem;

  // 십신 (일간 제외)
  const sipsin = {
    year:  { stem: sipsinForStem(dayStem, yearG.stem),  branch: sipsinForBranch(dayStem, yearG.branch) },
    month: { stem: sipsinForStem(dayStem, monthG.stem), branch: sipsinForBranch(dayStem, monthG.branch) },
    day:   { stem: "일간(나)",                              branch: sipsinForBranch(dayStem, dayG.branch) },
    hour:  { stem: sipsinForStem(dayStem, hourG.stem),  branch: sipsinForBranch(dayStem, hourG.branch) },
  };

  // 오행 분포
  const ohaengCount = {목:0, 화:0, 토:0, 금:0, 수:0};
  [yearG, monthG, dayG, hourG].forEach(g => {
    ohaengCount[STEM_OHAENG[g.stem]]++;
    ohaengCount[BRANCH_OHAENG[g.branch]]++;
  });

  // 형충회합
  const relations = analyzeRelations([yearG.branch, monthG.branch, dayG.branch, hourG.branch]);

  // 대운
  const daewoon = getDaewoon(date, yearG.stem, gender, monthG);

  // 띠
  const animal = ANIMALS[yearG.branch];

  return {
    input: { year, month, day, hour, minute, gender, longitude, useTrueSolarTime },
    correctedDate: date.toISOString(),
    sajuYear: yearG.sajuYear,
    pillars,
    dayMaster: {
      stem: dayStem,
      stemHan: CHEONGAN[dayStem],
      stemKor: CHEONGAN_KOR[dayStem],
      ohaeng: STEM_OHAENG[dayStem],
      yinyang: STEM_YINYANG[dayStem],
    },
    sipsin,
    ohaengCount,
    relations,
    animal,
    daewoon,
  };
}
