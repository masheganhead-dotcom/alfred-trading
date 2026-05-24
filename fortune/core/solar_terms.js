// solar_terms.js
// 24절기(節氣) 계산 - 천문학적 방식
// Jean Meeus, "Astronomical Algorithms" (2nd ed.) Ch.27 기반
// 태양 황경(ecliptic longitude)이 특정 각도를 지나는 순간을 절입(節入)으로 정의
//
// 24절기 황경 (춘분 0°부터 15° 간격):
//   춘분 0°, 청명 15°, 곡우 30°, 입하 45°, 소만 60°, 망종 75°,
//   하지 90°, 소서 105°, 대서 120°, 입추 135°, 처서 150°, 백로 165°,
//   추분 180°, 한로 195°, 상강 210°, 입동 225°, 소설 240°, 대설 255°,
//   동지 270°, 소한 285°, 대한 300°, 입춘 315°, 우수 330°, 경칩 345°
//
// 사주에서 "월(月)" 경계가 되는 12절기(節)는 다음과 같다:
//   입춘(315°)=寅月, 경칩(345°)=卯月, 청명(15°)=辰月, 입하(45°)=巳月,
//   망종(75°)=午月, 소서(105°)=未月, 입추(135°)=申月, 백로(165°)=酉月,
//   한로(195°)=戌月, 입동(225°)=亥月, 대설(255°)=子月, 소한(285°)=丑月

export const SOLAR_TERMS = [
  {idx: 0,  name: "춘분", han: "春分", lon:   0},
  {idx: 1,  name: "청명", han: "清明", lon:  15, isJie: true, branch: 4},  // 辰
  {idx: 2,  name: "곡우", han: "穀雨", lon:  30},
  {idx: 3,  name: "입하", han: "立夏", lon:  45, isJie: true, branch: 5},  // 巳
  {idx: 4,  name: "소만", han: "小滿", lon:  60},
  {idx: 5,  name: "망종", han: "芒種", lon:  75, isJie: true, branch: 6},  // 午
  {idx: 6,  name: "하지", han: "夏至", lon:  90},
  {idx: 7,  name: "소서", han: "小暑", lon: 105, isJie: true, branch: 7},  // 未
  {idx: 8,  name: "대서", han: "大暑", lon: 120},
  {idx: 9,  name: "입추", han: "立秋", lon: 135, isJie: true, branch: 8},  // 申
  {idx: 10, name: "처서", han: "處暑", lon: 150},
  {idx: 11, name: "백로", han: "白露", lon: 165, isJie: true, branch: 9},  // 酉
  {idx: 12, name: "추분", han: "秋分", lon: 180},
  {idx: 13, name: "한로", han: "寒露", lon: 195, isJie: true, branch: 10}, // 戌
  {idx: 14, name: "상강", han: "霜降", lon: 210},
  {idx: 15, name: "입동", han: "立冬", lon: 225, isJie: true, branch: 11}, // 亥
  {idx: 16, name: "소설", han: "小雪", lon: 240},
  {idx: 17, name: "대설", han: "大雪", lon: 255, isJie: true, branch: 0},  // 子
  {idx: 18, name: "동지", han: "冬至", lon: 270},
  {idx: 19, name: "소한", han: "小寒", lon: 285, isJie: true, branch: 1},  // 丑
  {idx: 20, name: "대한", han: "大寒", lon: 300},
  {idx: 21, name: "입춘", han: "立春", lon: 315, isJie: true, branch: 2},  // 寅
  {idx: 22, name: "우수", han: "雨水", lon: 330},
  {idx: 23, name: "경칩", han: "驚蟄", lon: 345, isJie: true, branch: 3},  // 卯
];

// === 율리우스 일(Julian Day) 변환 ===
export function dateToJulian(date) {
  // date: JS Date (UTC). 분/초까지 포함.
  // Meeus formula. 1582-10-15 그레고리력 전환 처리.
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate() + (date.getUTCHours() + (date.getUTCMinutes() + date.getUTCSeconds()/60)/60) / 24;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

export function julianToDate(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = (jd + 0.5) - Z;
  let A;
  if (Z < 2299161) A = Z;
  else {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const dayFrac = B - D - Math.floor(30.6001 * E) + F;
  const day = Math.floor(dayFrac);
  const hourFrac = (dayFrac - day) * 24;
  const hour = Math.floor(hourFrac);
  const minFrac = (hourFrac - hour) * 60;
  const minute = Math.floor(minFrac);
  const second = Math.round((minFrac - minute) * 60);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  // UTC Date 생성
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

// === 태양 황경 (Apparent Solar Longitude) ===
// VSOP87 단순 근사 (Meeus Ch.25). 정확도 ~분 단위 (사주 계산에 충분).
function solarLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;  // J2000.0 기준 율리우스 세기
  // 평균황경
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  // 평균근점이각
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const Mrad = M * Math.PI / 180;
  // 지구 궤도 이심율
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  // 중심차 (equation of center)
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  // 진황경
  const trueLongitude = L0 + C;
  // 겉보기 황경 (장동 + 광행차 보정)
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
  return ((apparent % 360) + 360) % 360;
}

// === 절기 시각 계산 (이분법) ===
// 목표 황경(targetLon)에 도달하는 JD를 찾는다.
function findSolarTermJD(targetLon, jdStart, jdEnd) {
  // jdStart~jdEnd 사이에서 (lon(jd) - targetLon) % 360 의 부호가 바뀌는 지점 탐색
  const normalize = (x) => {
    let v = ((x - targetLon) % 360 + 540) % 360 - 180;
    return v;
  };
  let lo = jdStart, hi = jdEnd;
  let flo = normalize(solarLongitude(lo));
  let fhi = normalize(solarLongitude(hi));
  // flo 음수, fhi 양수가 되도록 보장
  if (flo > 0) { /* lo가 이미 지났음 */ }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fmid = normalize(solarLongitude(mid));
    if (Math.abs(fmid) < 1e-7 || (hi - lo) < 1e-6) return mid;
    if (Math.sign(fmid) === Math.sign(flo)) { lo = mid; flo = fmid; }
    else { hi = mid; fhi = fmid; }
  }
  return (lo + hi) / 2;
}

// 주어진 양력 연도의 24절기 시각 배열 (UTC Date) 반환
export function getSolarTermsForYear(year) {
  // 절기는 양력으로 거의 고정된 날짜에 발생 → 연도 시작 기준 근사 위치에서 탐색
  const out = [];
  // 절기는 동지(270°)부터 시작해 순환 — 하지만 우리는 0~23 idx 순서 (춘분~경칩) 유지
  // 각 절기의 대략적 양력 일자 (월/일) — Y2K 평균치
  const approxDates = [
    [3, 21], [4, 5], [4, 20], [5, 6], [5, 21], [6, 6],
    [6, 21], [7, 7], [7, 23], [8, 8], [8, 23], [9, 8],
    [9, 23], [10, 8], [10, 23], [11, 7], [11, 22], [12, 7],
    [12, 22], [1, 6], [1, 20], [2, 4], [2, 19], [3, 6],
  ];
  for (let i = 0; i < 24; i++) {
    const term = SOLAR_TERMS[i];
    const [m, d] = approxDates[i];
    // 동지(idx18) 이후 절기들 중 1·2월 것은 다음 해 소속
    const yr = (i >= 19) ? year : year;  // 동일 연도 기준
    const startJD = dateToJulian(new Date(Date.UTC(yr, m - 1, d - 2)));
    const endJD = dateToJulian(new Date(Date.UTC(yr, m - 1, d + 2)));
    const jd = findSolarTermJD(term.lon, startJD, endJD);
    out.push({...term, date: julianToDate(jd), jd});
  }
  return out;
}

// 주어진 UTC Date의 사주 월지(月支) 결정용 - 직전 "절(節)" 찾기
// returns {jieIndex, branch, year} (year는 입춘 기준)
export function getJieForDate(date) {
  const jd = dateToJulian(date);
  const Y = date.getUTCFullYear();
  // 전년도부터 다음해까지 모든 절(節) 시각을 시간순으로 정렬
  const allJie = [];
  for (const y of [Y - 1, Y, Y + 1]) {
    const terms = getSolarTermsForYear(y);
    for (const t of terms) {
      if (t.isJie) allJie.push({...t, year: y, jd: dateToJulian(t.date)});
    }
  }
  allJie.sort((a, b) => a.jd - b.jd);
  // 입력 시각 직전(또는 동일)의 절
  let last = null;
  for (const t of allJie) {
    if (t.jd <= jd + 1e-9) last = t;
    else break;
  }
  return last;
}
