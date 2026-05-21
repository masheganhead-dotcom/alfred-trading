// iching.js
// 주역(周易) 64괘 점법
//
// 도입 참고 (MIT 라이선스):
//   - Brianfit/I-Ching : Yarrow stalk(시초점) 알고리즘
//
// 점법:
//   1. 시초점(蓍草占, yarrow): 전통 50개 시초로 6효 산출. 확률: 노음 1/16, 소양 5/16, 소음 7/16, 노양 3/16
//   2. 동전점(三錢占, coin): 3개 동전 6회. 확률 균등 (노음 2/16, 소양 6/16, 소음 6/16, 노양 2/16)
//
// 효(爻) 코드:
//   6 = 노음 (--× : 변효, 양으로 변함)
//   7 = 소양 (—)
//   8 = 소음 (- -)
//   9 = 노양 (—○ : 변효, 음으로 변함)

// 8괘 binary (아래→위): 0=음(--), 1=양(—)
const TRIGRAM_NAMES = {
  "111": {idx:0, han:"乾", kor:"건", nature:"천"},
  "011": {idx:1, han:"兌", kor:"태", nature:"택"},
  "101": {idx:2, han:"離", kor:"리", nature:"화"},
  "001": {idx:3, han:"震", kor:"진", nature:"뢰"},
  "110": {idx:4, han:"巽", kor:"손", nature:"풍"},
  "010": {idx:5, han:"坎", kor:"감", nature:"수"},
  "100": {idx:6, han:"艮", kor:"간", nature:"산"},
  "000": {idx:7, han:"坤", kor:"곤", nature:"지"},
};

// King Wen 순서 64괘 번호 (상괘·하괘 → 괘번호)
// 표 출처: 정통 주역 King Wen sequence
const KING_WEN = {
  // 상괘 인덱스 0~7 (乾兌離震巽坎艮坤) x 하괘 인덱스 0~7 → 괘번호 (1-64)
  "0_0":1,  "0_7":11, "0_5":5,  "0_6":26, "0_4":9,  "0_2":14, "0_3":34, "0_1":43,
  "7_0":12, "7_7":2,  "7_5":8,  "7_6":23, "7_4":20, "7_2":35, "7_3":16, "7_1":45,
  "5_0":6,  "5_7":7,  "5_5":29, "5_6":4,  "5_4":59, "5_2":64, "5_3":40, "5_1":47,
  "6_0":33, "6_7":15, "6_5":39, "6_6":52, "6_4":53, "6_2":56, "6_3":62, "6_1":31,
  "4_0":44, "4_7":46, "4_5":48, "4_6":18, "4_4":57, "4_2":50, "4_3":32, "4_1":28,
  "2_0":13, "2_7":36, "2_5":63, "2_6":22, "2_4":37, "2_2":30, "2_3":55, "2_1":49,
  "3_0":25, "3_7":24, "3_5":3,  "3_6":27, "3_4":42, "3_2":21, "3_3":51, "3_1":17,
  "1_0":10, "1_7":19, "1_5":60, "1_6":41, "1_4":61, "1_2":38, "1_3":54, "1_1":58,
};

function lineToBit(v) { return (v === 7 || v === 9) ? 1 : 0; }

// 6효 → 괘번호 (효는 아래→위 순서)
export function linesToHexagram(lines) {
  // lines[0]=초효(맨아래), lines[5]=상효(맨위)
  const lower = `${lineToBit(lines[2])}${lineToBit(lines[1])}${lineToBit(lines[0])}`;
  const upper = `${lineToBit(lines[5])}${lineToBit(lines[4])}${lineToBit(lines[3])}`;
  const lowerInfo = TRIGRAM_NAMES[lower];
  const upperInfo = TRIGRAM_NAMES[upper];
  const key = `${upperInfo.idx}_${lowerInfo.idx}`;
  return { number: KING_WEN[key], upper: upperInfo, lower: lowerInfo };
}

// === 시초점 (Yarrow Stalk Method) ===
// Brianfit/I-Ching 알고리즘 기반 - 50개 시초로 1효 만들기를 6회 반복
function castYarrowLine() {
  // 1단계: 50개 중 1개 제거 (太極), 49개로 시작
  let stalks = 49;
  let sumOfPiles = 0;
  for (let round = 0; round < 3; round++) {
    // 49 또는 그 이하 stalks를 두 더미로 무작위 분할
    const leftPile = 1 + Math.floor(Math.random() * (stalks - 1));
    let rightPile = stalks - leftPile;
    // 오른쪽에서 1개 제거 (왼손 검지 사이)
    rightPile -= 1;
    // 왼쪽 4개씩 묶음 후 나머지 (1~4)
    const leftRem = ((leftPile - 1) % 4) + 1;
    // 오른쪽 4개씩 묶음 후 나머지 (1~4)
    const rightRem = ((rightPile - 1) % 4) + 1;
    const removed = 1 + leftRem + rightRem;  // 1(검지) + 나머지들
    stalks = stalks - removed;
    sumOfPiles += (round === 0 ? (removed === 9 ? 2 : 3) : (removed === 8 ? 2 : 3));
    // 첫 번째: 9→2(소), 5→3(다)
    // 둘째·셋째: 8→2(소), 4→3(다)
  }
  // sumOfPiles 합 → 효
  // 6 = 노음, 7 = 소양, 8 = 소음, 9 = 노양
  return sumOfPiles;
}

export function yarrowDivination() {
  const lines = [];
  for (let i = 0; i < 6; i++) lines.push(castYarrowLine());
  return processLines(lines);
}

// === 동전점 (3 Coins Method) ===
export function coinDivination() {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    // 3개 동전. 앞=3, 뒤=2. 합: 6(노음), 7(소양), 8(소음), 9(노양)
    let sum = 0;
    for (let c = 0; c < 3; c++) sum += (Math.random() < 0.5 ? 2 : 3);
    lines.push(sum);
  }
  return processLines(lines);
}

function processLines(lines) {
  const primary = linesToHexagram(lines);
  // 변효(6 또는 9)가 있으면 변괘 산출
  const changedLines = lines.map(l => l === 6 ? 7 : (l === 9 ? 8 : l));
  const hasChange = lines.some(l => l === 6 || l === 9);
  const secondary = hasChange ? linesToHexagram(changedLines) : null;
  const movingLines = lines.map((l, i) => (l === 6 || l === 9) ? i + 1 : null).filter(v => v !== null);
  return {
    lines,             // [초효, 2효, ..., 상효]
    primary,           // 본괘
    secondary,         // 변괘 (변효 있을 때만)
    movingLines,       // 동효 위치 [1~6]
  };
}

// 효 위치별 해석 가이드
export const LINE_POSITIONS = [
  { pos: 1, name: "초효(初)", role: "발단·시작·기초·잠재" },
  { pos: 2, name: "이효(二)", role: "내괘 중심·신하·실무자" },
  { pos: 3, name: "삼효(三)", role: "내괘 끝·과도기·위태" },
  { pos: 4, name: "사효(四)", role: "외괘 시작·근신·측근" },
  { pos: 5, name: "오효(五)", role: "외괘 중심·군주·핵심" },
  { pos: 6, name: "상효(上)", role: "극·과도·은퇴·반전" },
];
