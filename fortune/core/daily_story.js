// daily_story.js - 매일 사주 + 일진 → 친근한 스토리 생성
//
// 페르소나: "오라클" - 본인 사주를 아는 친구 같은 무당
// 매일 다른 인트로·날씨·이모지·표현
// 본인 맞춤 (사주·시기·신살 활성도)
//
// 출력: 텔레그램 마크다운 메시지

import { calculateSaju, CHEONGAN, JIJI, ANIMALS } from "./saju.js";
import { analyzeDay } from "./wol_il.js";
import { analyzeYear } from "./sigi.js";

// 매일 다른 인트로
const INTROS = [
  "🌅 좋은 아침이야 형 / ", "☕ 오늘 하루도 시작이네 / ",
  "🌞 일어났어? / ", "✨ 오늘의 사주 한 잔 / ",
  "🌿 오늘 운세 살펴봤어 / ", "🪐 오늘 하루 미리 알려줄게 / ",
  "🌸 새 하루 새 기운 / ", "🔮 오늘 천기를 살피니 / ",
  "🌙 오늘은 이렇게 시작해보자 / ", "🍵 차 한 잔 하면서 들어봐 / ",
];

const CLOSINGS = [
  "오늘 하루도 화이팅 🔥", "마음 가볍게 보내 ✨",
  "한 발 한 발 잘 가고 있어 🌱", "오늘도 너야 너 💪",
  "별 거 없으면 됐어 🌙", "조심조심·살살살살 🍀",
  "오늘도 음악 한 곡 🎵", "쓴맛 차 한 잔 잊지마 ☕",
  "오늘 햇볕 한 번 쬐고 🌞", "내일은 더 좋을거야 ⭐",
];

// 점수별 톤
function moodTone(score) {
  if (score >= 75) return { emoji: "🌟", grade: "대길", lead: "오늘 진짜 좋은 날이야!" };
  if (score >= 60) return { emoji: "✨", grade: "길", lead: "오늘 흐름 괜찮아." };
  if (score >= 45) return { emoji: "🌤", grade: "평", lead: "오늘은 평이한 날." };
  if (score >= 30) return { emoji: "⚠", grade: "주의", lead: "오늘은 살짝 조심해야 돼." };
  return { emoji: "🛑", grade: "흉", lead: "오늘은 쉬어가는 날로 정해." };
}

// 십신별 오늘의 추천 활동 (친근한 톤)
const SIPSIN_ADVICE = {
  "비견": ["동료·친구랑 만나봐", "협업할 일 있으면 오늘이 좋아", "혼자보다 둘이 좋은 날"],
  "겁재": ["돈 빌려주지 마", "친구랑 의견 충돌 조심", "괜한 시비 피해"],
  "식신": ["맛있는 거 먹어. 사주가 먹복의 날이라", "창작 작업 적기", "여유롭게 즐겨"],
  "상관": ["오늘은 표현이 잘 돼. 작업·녹음·SNS 좋음", "재능 발휘하기", "다만 입조심"],
  "편재": ["돈 들어올 일 있을 수 있어", "투자·매매는 신중", "외부 활동 좋음"],
  "정재": ["꾸준한 일에 집중해", "계산·정리·돈 관련 일 OK", "약속 잘 지키기"],
  "편관": ["압박 받을 수 있어. 침착하게", "상사·권위자 만남 가능", "괜한 도전 X"],
  "정관": ["체계적인 일에 집중", "약속·계약·문서 좋음", "겸손이 약"],
  "편인": ["직감 발휘. 영감 잘 떠올라", "혼자 깊이 들어가는 시간", "공부·연구"],
  "정인": ["공부·문서·계약·자격 좋은 날", "엄마·멘토에게 연락", "차분히 정리"],
};

// 시간대별 추천 (본인 일지 기준 합·충)
function timeRecommend(daySaju, myDayBranch) {
  const chungPairs = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  const hapPairs = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  const samhapGroups = [[8,0,4],[5,9,1],[2,6,10],[11,3,7]];
  const branches = [
    {br:0, range:"23:30-01:30", name:"자시"},
    {br:1, range:"01:30-03:30", name:"축시"},
    {br:2, range:"03:30-05:30", name:"인시"},
    {br:3, range:"05:30-07:30", name:"묘시"},
    {br:4, range:"07:30-09:30", name:"진시"},
    {br:5, range:"09:30-11:30", name:"사시"},
    {br:6, range:"11:30-13:30", name:"오시"},
    {br:7, range:"13:30-15:30", name:"미시"},
    {br:8, range:"15:30-17:30", name:"신시"},
    {br:9, range:"17:30-19:30", name:"유시"},
    {br:10, range:"19:30-21:30", name:"술시"},
    {br:11, range:"21:30-23:30", name:"해시"},
  ];
  const best = [];
  const worst = [];
  for (const b of branches) {
    if (hapPairs.some(([x,y]) => (x===myDayBranch && y===b.br)||(y===myDayBranch && x===b.br))) {
      best.push({...b, type:"육합"});
    } else if (samhapGroups.some(t => t.includes(myDayBranch) && t.includes(b.br) && myDayBranch !== b.br)) {
      best.push({...b, type:"삼합"});
    } else if (chungPairs.some(([x,y]) => (x===myDayBranch && y===b.br)||(y===myDayBranch && x===b.br))) {
      worst.push({...b, type:"충"});
    }
  }
  return { best: best.slice(0, 2), worst: worst.slice(0, 1) };
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// === 메인: 오늘의 스토리 생성 ===
export function generateDailyStory({mySaju, date = new Date(), userName = "형"}) {
  const dayAnalysis = analyzeDay(mySaju, date, "M");
  const tone = moodTone(dayAnalysis.score);
  const dayStr = `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${"일월화수목금토"[date.getDay()]}요일`;

  // 한국식 요일·날짜
  const intro = pick(INTROS);
  const closing = pick(CLOSINGS);

  // 십신 조언
  const sipsin = dayAnalysis.stemSipsin;
  const sipsinAdvice = sipsin ? pick(SIPSIN_ADVICE[sipsin] || ["오늘 흐름 따라가봐"]) : "오늘 흐름 따라가봐";

  // 시간대 추천
  const times = timeRecommend(dayAnalysis, mySaju.pillars.day.branch);

  // 이벤트 정리
  const eventTypes = [...new Set(dayAnalysis.events.map(e => e.type))];
  const eventLines = dayAnalysis.events.slice(0, 3).map(e => `  · ${e.text}`).join("\n");

  // 스토리 빌드
  const lines = [];
  lines.push(`${intro}${userName} ${tone.emoji}`);
  lines.push(``);
  lines.push(`*${dayStr}*`);
  lines.push(`오늘 일진은 *${dayAnalysis.dayGapja}일* / 십신은 *${sipsin || "평이"}*`);
  lines.push(`사주 점수: *${dayAnalysis.score}점* (${tone.grade})`);
  lines.push(``);
  lines.push(`📖 *${tone.lead}*`);
  lines.push(`${sipsinAdvice}`);

  if (eventLines) {
    lines.push(``);
    lines.push(`🎯 오늘 신호들:`);
    lines.push(eventLines);
  }

  // 시간대
  if (times.best.length > 0 || times.worst.length > 0) {
    lines.push(``);
    lines.push(`⏰ 오늘의 시간:`);
    if (times.best.length > 0) {
      times.best.forEach(t => lines.push(`  🌟 ${t.range} (${t.name}) - ${t.type}, 가장 좋은 시간`));
    }
    if (times.worst.length > 0) {
      times.worst.forEach(t => lines.push(`  ⛔ ${t.range} (${t.name}) - ${t.type}, 피해`));
    }
  }

  // 다가오는 큰 날 알림
  const next4DDay = ["2026-05-29","2026-07-28","2026-09-26","2026-11-25"];
  const today = date.toISOString().slice(0,10);
  const upcoming = next4DDay.filter(d => d > today)[0];
  if (upcoming) {
    const days = Math.ceil((new Date(upcoming) - date) / (1000*60*60*24));
    if (days <= 14) {
      lines.push(``);
      lines.push(`📅 *D-${days}* : ${upcoming} (己巳일) ⭐ 인생급 길일이야! 잊지마`);
    }
  }

  // 처방 (간단)
  const tips = [
    "🔴 빨간색 옷·소품",
    "☕ 쓴맛 차·커피",
    "🏃 운동 30분",
    "🌅 새벽 7-9시 작업 최고",
    "🌙 22시 이후 작업 OFF",
  ];
  lines.push(``);
  lines.push(`💊 오늘의 처방: ${pick(tips)}`);

  lines.push(``);
  lines.push(`— ${closing}`);

  return lines.join("\n");
}

// === 텔레그램 발송용 (메시지만 반환) ===
export function buildTelegramMessage(mySaju, date = new Date(), userName = "형") {
  return generateDailyStory({ mySaju, date, userName });
}
