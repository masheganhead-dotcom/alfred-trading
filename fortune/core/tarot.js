// tarot.js
// 타로 78장 셔플 + 스프레드
// 데이터: data/tarot78.json (Rider-Waite-Smith, Public Domain)

export const SUITS = ["wands", "cups", "swords", "pentacles"];
export const SUIT_KOR = { wands: "완드", cups: "컵", swords: "소드", pentacles: "펜타클" };
export const RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "page", "knight", "queen", "king"];

// 78장 덱 빌드
export function buildDeck() {
  const deck = [];
  for (let i = 0; i < 22; i++) deck.push({ type: "major", n: i });
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ type: "minor", suit, rank });
    }
  }
  return deck;
}

// Fisher-Yates shuffle (양호한 PRNG 사용 시 cryptographically random)
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const r = Math.floor(((typeof crypto !== "undefined" && crypto.getRandomValues)
      ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF
      : Math.random()) * (i + 1));
    [a[i], a[r]] = [a[r], a[i]];
  }
  return a;
}

// 스프레드별 카드 뽑기 (정역 50/50)
export function drawSpread(spreadCardCount) {
  const deck = shuffleArr(buildDeck());
  const drawn = deck.slice(0, spreadCardCount);
  return drawn.map(card => {
    const reversed = Math.random() < 0.5;
    return { ...card, reversed };
  });
}

// 카드 ID 생성 (해석 lookup용)
export function cardKey(card) {
  if (card.type === "major") return `major_${card.n}`;
  return `${card.suit}_${card.rank}`;
}

// 해석 lookup 함수 (tarot78.json 로드 후 사용)
export function interpretCard(card, tarotData) {
  if (card.type === "major") {
    const m = tarotData.major[card.n];
    return {
      name: m.name,
      kor: m.kor,
      text: card.reversed ? m.reversed : m.upright,
      orientation: card.reversed ? "역방향" : "정방향",
    };
  } else {
    const key = `${card.suit}_${card.rank}`;
    const interp = tarotData.minor.interpretations[key];
    const suitKor = tarotData.minor.suits[card.suit].kor;
    const rankInfo = tarotData.minor.ranks.find(r => r.r === card.rank);
    return {
      name: `${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)} ${card.rank.charAt(0).toUpperCase() + card.rank.slice(1)}`,
      kor: `${suitKor} ${rankInfo.kor}`,
      text: card.reversed ? interp.r : interp.u,
      orientation: card.reversed ? "역방향" : "정방향",
    };
  }
}
