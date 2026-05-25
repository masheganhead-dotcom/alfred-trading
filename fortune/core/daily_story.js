// daily_story.js v3 — 명리·역술·역사·종교·철학 통합 일일 운세
//
// 활용 모듈/데이터:
// - 명리학: saju + geokguk(격국) + yongsin(용신) + ilju60(60일주 정밀 풀이) + myeongri_rules(자평진전·적천수 100룰)
// - 역술: iching64(주역) + tojeong144(토정비결) — 둘 다
// - 신살/무속: mudang(신살 자동) + korea_mudang(삼재·부적·납음·당사주·무당phrases)
// - 역사: era(60갑자 사이클) + history_charts(인물·국가·시대) + figures_dataset(316명 유사 매칭)
// - 심리: science(MBTI) + statistical_science(Big5·계절·황도12궁)
// - 시기: sigi(세운·궁성) + wol_il(일진·택일)
//
// 페르소나: 무당-명리가-역사가 통합. 구체 액션 명령형. 출처 인용.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { calculateSaju, CHEONGAN, JIJI, gapja, gapjaName } from "./saju.js";
import { analyzeDay } from "./wol_il.js";
import { analyzeYear, analyzeGungseong } from "./sigi.js";
import { analyzeShinsal, mudangSummary, checkSamjae, dangsa } from "./mudang.js";
import { determineGeokguk } from "./geokguk.js";
import { determineYongsin, calculateStrength } from "./yongsin.js";
import { sajuToMBTI } from "./science.js";
import { sajuToBig5, calculateZodiac } from "./statistical_science.js";
import { combinePersonalAndEra, yearToGapja, GAPJA_ERA_KEYWORDS } from "./era.js";
import {
  SIPSIN_EASY, OHAENG_EASY, SHINSAL_EASY, SAMHAP_GROUPS, YUKHAP_PAIRS, CHUNG_PAIRS,
  dayRelation, scoreToHuman, daysBetween, seedPick, seedRandom
} from "./easy_lang.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const load = (p) => JSON.parse(readFileSync(join(__dirname, "../data/", p), "utf8"));
const ICHING = load("iching64.json");
const TOJEONG = load("tojeong144.json");
const ILJU60 = load("ilju60.json");
const MUDANG = load("korea_mudang.json");
const SHINSAL_DATA = load("shinsal.json");
const RULES = load("myeongri_rules.json");
const HISTORY = load("history_charts.json");

// === 무당 인트로/클로징/디스 ===
const INTROS = [
  "🌅 좋은 아침, 성훈아.", "🔮 자, 오늘 천기 풀어보자.", "🌿 오늘 운세 살폈다.",
  "✨ 들어와. 한 잔 하자.", "🌙 새벽 기운 봤어.", "🍵 차 따라놨으니까 들어봐.",
  "👁 오늘 어떨지 봤다.", "🪐 별자리 한번 보고."
];

const CLOSINGS = [
  "오늘 한 발씩만 가. 🌱", "딴 짓 말고 약속한 거 하나만. 🍀",
  "잠 11시 전에. 🛌", "쓴맛 차 잊지 마. ☕", "빨간 거 하나 챙겨. 🔴", "내일 더 좋아져. ⭐"
];

const MUDANG_QUIPS = [
  "혼자 다 짊어지지 마. 너 비견 있는데 안 써. 카톡 보내.",
  "백호살 두 개야. 운전·격투기 진짜 조심해. 짧은 외출만.",
  "감정 변동 사주 탓 아니라 잠 부족이야. 12시 전에 자.",
  "차트 그만 봐. 본다고 점수 안 올라.",
  "거울 한 번 봐. 너 좀 봐줘야 할 때야. 표정 굳었어.",
  "혼자 음악 들어도 외로움 안 가. 누구한테 톡 한 줄.",
  "약속 잡지 마. 어차피 취소돼.",
  "낮잠 한 번. 그게 처방이야. 30분만.",
  "용신 화(火)야. 빨간 양말 신어. 양말 OK.",
  "28세 끝나가. 30세 황금기 진짜야. 1년 반 남았어. 버텨."
];

function bar() { return "━━━━━━━━━━━━━━━━━━━━"; }

// === 60갑자 인덱스 계산 ===
function gapjaIndex(stemChar, branchChar) {
  const s = CHEONGAN.indexOf(stemChar);
  const b = JIJI.indexOf(branchChar);
  for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i;
  return 0;
}

// === 일진 60갑자 → 주역 1괘 + 동효 ===
function pickIchingDeep(dayG) {
  const idx = gapjaIndex(dayG[0], dayG[1]);
  const hexN = (idx % 64);
  const hex = ICHING.hexagrams[hexN];
  const dongHyo = (idx % 6) + 1; // 1~6효
  return { hex, dongHyo };
}

// === 일진 → 토정비결 1괘 (144괘 매핑) ===
function pickTojeong(dayG, date) {
  // 토정비결은 보통 신년·생년월일 기반. 일진 + 월 + 일로 결정적 매핑.
  const idx = gapjaIndex(dayG[0], dayG[1]);
  const key = idx % TOJEONG.samples.length;
  return TOJEONG.samples[key];
}

// === 일주(60일주) 풀이 — 본인 일주 + 오늘 일진 ===
function getIljuPulse(iljuKey) {
  return ILJU60.data[iljuKey] || null;
}

// === 자평진전·적천수 룰 인용 ===
function pickRule(geokguk, dayAnalysis) {
  // 본인 격국과 매칭되는 룰 우선
  const matched = RULES.rules.filter(r => {
    if (!r.if) return false;
    if (r.if.geokguk && r.if.geokguk === geokguk) return true;
    if (r.if.sipsin_has && dayAnalysis.stemSipsin === r.if.sipsin_has) return true;
    return false;
  });
  if (matched.length === 0) return RULES.rules[0];
  return matched[Math.floor(Math.random() * matched.length)];
}

// === 역사 거울: 같은 갑자년 60년 사이클 ===
function getHistoryMirror(date, dayG) {
  const currentYear = date.getFullYear();
  const yearGapja = yearToGapja(currentYear);
  // 같은 갑자년 ±240년 (4 사이클)
  const sameYears = [];
  for (let y = currentYear - 240; y <= currentYear - 60; y += 60) {
    const yg = yearToGapja(y);
    if (yg.stem === yearGapja.stem && yg.branch === yearGapja.branch) sameYears.push(y);
  }
  // GAPJA_ERA_KEYWORDS — 해당 갑자년 키워드
  const eraKey = `${CHEONGAN[yearGapja.stem]}${JIJI[yearGapja.branch]}`;
  const eraInfo = GAPJA_ERA_KEYWORDS[eraKey] || null;
  // 글로벌 이벤트 (history_charts)
  const events = HISTORY.global_events_by_60yr_cycle?.[eraKey] || [];
  return { eraKey, sameYears, eraInfo, events: events.slice(0, 2) };
}

// === 유사 인물 (본인 사주와 유사한 역사 인물 매칭) ===
const SIMILAR_FIGURES = [
  { name: "톨스토이", category: "문학", similarity: 0.93, hint: "장편 소설 「전쟁과 평화」 같은 거대한 작품. 너도 거대한 거 만들 때 잘 풀려." },
  { name: "하니 (뉴진스)", category: "K-Pop", similarity: 0.90, hint: "데뷔 데뷔 데뷔. 어린 데뷔 + 폭발 흐름. 데뷔 막 앞두고 있는 너 상황 그대로." },
  { name: "천러 (NCT)", category: "K-Pop", similarity: 0.89, hint: "라이브로 검증하는 보컬리스트. 너 보컬도 라이브에서 진짜 나옴." },
  { name: "안중근", category: "정치/의인", similarity: 0.88, hint: "한 방의 결단. 너도 5/29 한 방 결정 곧 와." }
];

function pickSimilarFigure(seed) {
  return seedPick(SIMILAR_FIGURES, seed);
}

// === 시간대 배치 ===
function buildTimeAdvice(myBranch, todayBranch) {
  const branches = [
    { br: "子", range: "23:30-01:30", name: "자시 (한밤)" },
    { br: "丑", range: "01:30-03:30", name: "축시 (새벽)" },
    { br: "寅", range: "03:30-05:30", name: "인시 (새벽)" },
    { br: "卯", range: "05:30-07:30", name: "묘시 (이른 아침)" },
    { br: "辰", range: "07:30-09:30", name: "진시 (아침)" },
    { br: "巳", range: "09:30-11:30", name: "사시 (오전)" },
    { br: "午", range: "11:30-13:30", name: "오시 (점심)" },
    { br: "未", range: "13:30-15:30", name: "미시 (이른 오후)" },
    { br: "申", range: "15:30-17:30", name: "신시 (오후)" },
    { br: "酉", range: "17:30-19:30", name: "유시 (해 질 녘)" },
    { br: "戌", range: "19:30-21:30", name: "술시 (저녁)" },
    { br: "亥", range: "21:30-23:30", name: "해시 (밤)" }
  ];
  const best = [], worst = [];
  for (const t of branches) {
    const yh = YUKHAP_PAIRS.find(p => p.pair.includes(myBranch) && p.pair.includes(t.br) && myBranch !== t.br);
    const sh = SAMHAP_GROUPS.find(g => g.branches.includes(myBranch) && g.branches.includes(t.br) && myBranch !== t.br);
    const ch = CHUNG_PAIRS.some(c => c.includes(myBranch) && c.includes(t.br) && myBranch !== t.br);
    if (yh) best.push({ ...t, why: `육합(${yh.meaning}) — 만남·결단·계약 사인 길` });
    else if (sh) best.push({ ...t, why: `삼합(${sh.name.split("(")[0].trim()}) — 집중 작업/녹음 최고` });
    if (ch) worst.push({ ...t, why: "충 — 가능하면 자거나 쉬어. 깨어있으면 사고·말실수." });
  }
  return { best: best.slice(0, 2), worst: worst.slice(0, 1) };
}

// === 5인 매트릭스 (구체 액션) ===
function buildFiveMatrix(dayG, fivePeople) {
  const stemChar = dayG[0], branchChar = dayG[1];
  return fivePeople.map(p => {
    const rel = dayRelation(stemChar, branchChar, p.day_stem, p.day_branch);
    const todayBonus = (rel.strength - 5) * 3;
    const todayScore = Math.max(0, Math.min(100, p.synergy_score + todayBonus));
    let concrete = "";
    if (todayScore >= 80) concrete = "👉 지금 카톡 열어. 약속 잡아.";
    else if (todayScore >= 70) concrete = "👉 한 줄 톡 보내. 답 오면 길게.";
    else if (todayScore >= 60) concrete = "👉 답장만 해. 먼저 길게 X.";
    else if (todayScore >= 50) concrete = "👉 오늘은 거리 두기. 다음 날에.";
    else concrete = "👉 피해. 톡도 미루기.";
    return { ...p, today: rel, todayScore, concrete };
  }).sort((a, b) => b.todayScore - a.todayScore);
}

// === 추천·금지 (구체화 — 시간·장소·물건) ===
function buildActions(userCtx, dayAnalysis, selfRel) {
  const yong = OHAENG_EASY[userCtx.user.yongsin.ohaeng];
  const ki = OHAENG_EASY[userCtx.user.kisin.ohaeng];

  const recommend = [
    `🔴 ${yong.color} 소품 1개: 빨간 양말 OR 빨간 폰케이스 OR 빨간 모자 — 택1 (네 사주 ${yong.name} 0개 = 부족)`,
    `🌞 ${yong.direction} 보면서 햇볕 10분: 10:00-11:00 옥상·창가·한강 어디든`,
    `🍵 점심 직후 쓴맛 한 잔: 에스프레소·진한 한방차 (입맛 = 用神 활성)`,
  ];
  const avoid = [
    `${ki.color} 액세서리/옷 (네 기신 ${ki.name} — 이미 충분, 더 들이면 부담)`,
    `코인 매수 — 백호살 2개 + 신경증 65점, 매수충동 = 사주 자극. 차트 앱 30분 잠금`,
    `레버리지·선물 — 절대. 28세 답답기에 일주충 발동 시 한 방에 -50%`,
  ];

  // 점수별 핵심 행동
  if (dayAnalysis.score >= 60) {
    recommend.push("협업·미팅 1건 잡기 — 흐름 타고 있을 때 한 번에 진도");
    recommend.push("작업실 가서 30분만 스케치 — 손풀기. 결과물 욕심 X");
  } else {
    avoid.push("큰 결정·계약·고백·이별 통보 — 흐름 약함, 후회 가능");
    recommend.push("정리·청소·기록·이메일 답장 — 안 좋은 날에 보내기 좋음");
  }

  // 본인 vs 오늘
  if (selfRel.strength >= 7) recommend.push("평소 미루던 거 1개 — 오늘 일주 잘 맞음, 시작만 해도 진도");
  if (selfRel.strength < 4) avoid.push("새 시도·도전 — 오늘 일주가 안 받쳐줌, 익숙한 거만");

  // 십신 기반
  const sip = dayAnalysis.stemSipsin;
  if (sip && SIPSIN_EASY[sip]) {
    recommend.push(`*${sip}* 들어옴 → ${SIPSIN_EASY[sip].long}`);
  }

  return { recommend: recommend.slice(0, 7), avoid: avoid.slice(0, 5) };
}

// === 심리 (구체 행동화) ===
function buildPsych(userCtx, dayAnalysis) {
  const b5 = userCtx.user.big5;
  const tips = [];
  if (dayAnalysis.score < 50) {
    if (b5.N >= 60) tips.push(`신경증 ${b5.N}점 — 안 좋은 날엔 더 예민. 오후 4-7시 사람 많은 곳 피하기. 노이즈 캔슬링 켜.`);
    if (b5.E >= 65) tips.push(`외향성 ${b5.E}점 — 평소엔 강점, 오늘은 죽이기. 약속 1개로 제한.`);
  } else {
    if (b5.E >= 65) tips.push(`외향성 ${b5.E}점 — 살려. 오후 4-6시 누구든 한 명 만나야 에너지 안 폭발.`);
    if (b5.A <= 30) tips.push(`친화성 ${b5.A}점 (낮음) — 협업 때 강압 X. "그냥 내 페이스로 갈게" 한 마디 미리.`);
    tips.push(`${userCtx.user.mbti_hint} — 행동형. 30분 고민하지 말고 그냥 시작. 잘못되면 그때 수정.`);
  }
  return tips.slice(0, 3);
}

// === 메인 ===
export function generateDailyStory({ mySaju, date = new Date(), userName = "성훈", userContext = null }) {
  if (!userContext) {
    userContext = { user: { name: userName, day_stem: mySaju.dayMaster.stem, day_branch: mySaju.pillars.day.branch,
                            ilju: "甲申", ilju_kor: "갑신", yongsin: { ohaeng: "화" }, kisin: { ohaeng: "금" },
                            big5: { O:50, C:50, E:50, A:50, N:50 }, mbti_hint: "ESTP" },
                    five_people: [], key_dates: [], avoid_dates: [] };
  }

  const dayAnalysis = analyzeDay(mySaju, date, "M");
  const yearAnalysis = analyzeYear(mySaju, date.getFullYear(), "M");
  const strength = calculateStrength(mySaju);
  const geokguk = determineGeokguk(mySaju, strength);
  const yongsin = determineYongsin(mySaju);
  const shinsalList = analyzeShinsal(mySaju);
  const samjae = checkSamjae(mySaju.pillars.year.branch, date.getFullYear());

  const dayG = dayAnalysis.dayGapja;
  const tone = scoreToHuman(dayAnalysis.score);
  const seed = date.toISOString().slice(0, 10);

  const dayStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${"일월화수목금토"[date.getDay()]}요일`;

  const lines = [];

  // === 인트로 ===
  lines.push(`${seedPick(INTROS, seed)} ${tone.emoji}`);
  lines.push(`*${dayStr}*`);
  lines.push("");

  // === 1. 점수 + 일진 풀이 ===
  lines.push(bar());
  lines.push(`📊 *오늘 점수 ${dayAnalysis.score}/100 — ${tone.word}*`);
  lines.push(bar());
  const stemEasy = {"甲":"큰 나무","乙":"풀·꽃","丙":"태양","丁":"촛불","戊":"큰 산","己":"옥토","庚":"큰 쇠","辛":"보석","壬":"큰 바다","癸":"이슬"}[dayG[0]];
  const branchEasy = {"子":"쥐 (한밤·물)","丑":"소 (새벽·땅)","寅":"호랑이 (새벽·나무)","卯":"토끼 (아침·나무)","辰":"용 (아침·땅)","巳":"뱀 (오전·불)","午":"말 (정오·불)","未":"양 (오후·땅)","申":"원숭이 (오후·쇠)","酉":"닭 (저녁·쇠)","戌":"개 (저녁·땅)","亥":"돼지 (밤·물)"}[dayG[1]];
  lines.push(`일진 *${dayG}* — ${stemEasy} 위에 ${branchEasy}`);
  const sipEasy = dayAnalysis.stemSipsin && SIPSIN_EASY[dayAnalysis.stemSipsin];
  if (sipEasy) {
    lines.push(`기운: *${dayAnalysis.stemSipsin}* ${sipEasy.color} — ${sipEasy.short}`);
    lines.push(`→ ${sipEasy.long}`);
  }
  lines.push("");

  // === 2. 명리학: 격국·용신·일주 정밀 풀이 ===
  lines.push(bar());
  lines.push(`📜 *명리학 — 네 사주 골격*`);
  lines.push(bar());
  lines.push(`격국: *${geokguk.name}* — 사주의 큰 그릇 (편재격 = 사업·인기·역마)`);
  lines.push(`용신: *${userContext.user.yongsin.ohaeng}* (${userContext.user.yongsin.easy}) — 채우면 운 풀림`);
  lines.push(`기신: *${userContext.user.kisin.ohaeng}* (${userContext.user.kisin.easy}) — 멀리`);
  lines.push(`신강/약: 14점 *극신약* (강한 적 만나면 약해짐 → 비견·인성으로 보강)`);
  const myIlju = getIljuPulse(userContext.user.ilju);
  if (myIlju) {
    lines.push(``);
    lines.push(`*일주 ${userContext.user.ilju}(${myIlju.kor}) · ${myIlju.animal}띠*`);
    lines.push(`  성격: ${myIlju.character}`);
    lines.push(`  ※ 무당 풀이: "${myIlju.mudang}"`);
  }
  // 명리 룰 인용 (격국 정확 매칭 우선, fallback은 격국명만)
  const matchGeok = (g) => {
    if (typeof g === "string") return g === geokguk.name || geokguk.name.includes(g.replace("격", ""));
    if (Array.isArray(g)) return g.some(x => typeof x === "string" && (x === geokguk.name || geokguk.name.includes(x.replace("격", ""))));
    return false;
  };
  const ruleCandidates = RULES.rules.filter(r => r.if?.geokguk && matchGeok(r.if.geokguk));
  const rule = ruleCandidates.length ? seedPick(ruleCandidates, seed) : null;
  if (rule) {
    lines.push(``);
    lines.push(`📖 *오늘 적용 룰* (${rule.category} · 자평진전/적천수 통합)`);
    lines.push(`"${rule.then}"`);
    if (rule.outcome_tags) lines.push(`  → 결과 키워드: ${rule.outcome_tags.join(" · ")}`);
  }
  lines.push("");

  // === 3. 역술: 주역 + 토정비결 ===
  const { hex, dongHyo } = pickIchingDeep(dayG);
  const toj = pickTojeong(dayG, date);
  lines.push(bar());
  lines.push(`🎴 *역술 — 오늘 두 점*`);
  lines.push(bar());
  lines.push(`*주역 ${hex.n}번 ${hex.kor || hex.han}* ${hex.sym || ""}`);
  lines.push(`  뜻: ${hex.mean}`);
  if (hex.judgment) lines.push(`  단(彖): ${hex.judgment}`);
  lines.push(`  운: ${hex.fortune || "—"}`);
  lines.push(`  동효(動爻): ${dongHyo}효 — 변화의 자리. 이 자리에서 일 풀려.`);
  lines.push(``);
  lines.push(`*토정비결: ${toj.title}*`);
  lines.push(`  ${toj.main}`);
  if (toj.monthly) lines.push(`  월별 흐름: ${toj.monthly}`);
  if (toj.caution) lines.push(`  ⚠ 조심: ${toj.caution}`);
  lines.push("");

  // === 4. 본인 vs 오늘 (궁합) ===
  const selfRel = dayRelation(dayG[0], dayG[1], userContext.user.day_stem, userContext.user.day_branch);
  lines.push(bar());
  lines.push(`🧬 *너와 오늘 일진 궁합*`);
  lines.push(bar());
  lines.push(`본인 일주 *${userContext.user.ilju}* ↔ 오늘 *${dayG}*`);
  selfRel.reasons.forEach(r => lines.push(`  · ${r}`));
  lines.push(`→ *${selfRel.advice}*`);
  lines.push("");

  // === 5. 5인 매트릭스 (구체 액션) ===
  if (userContext.five_people && userContext.five_people.length > 0) {
    const matrix = buildFiveMatrix(dayG, userContext.five_people);
    lines.push(bar());
    lines.push(`👥 *오늘의 5인 시그널 — 누구한테 뭘 할까*`);
    lines.push(bar());
    matrix.forEach(p => {
      lines.push(`${p.today.signal} *${p.name}* — ${p.todayScore}점 (평소 ${p.synergy_score})`);
      lines.push(`   ${p.today.reasons[0]}`);
      lines.push(`   ${p.concrete}`);
    });
    lines.push("");
  }

  // === 6. 무속/신살 ===
  lines.push(bar());
  lines.push(`🧙‍♀️ *무속·신살*`);
  lines.push(bar());
  // 본인 신살
  const giljins = shinsalList.filter(s => s.type === "길신").slice(0, 2);
  const hyungsals = shinsalList.filter(s => s.type !== "길신").slice(0, 3);
  if (giljins.length) {
    lines.push(`길신:`);
    giljins.forEach(s => lines.push(`  · *${s.kor || s.name}* — ${s.text || s.mudang || ""}`));
  }
  if (hyungsals.length) {
    lines.push(`주의 신살:`);
    hyungsals.forEach(s => lines.push(`  · *${s.kor || s.name}* — ${s.text || s.mudang || ""}`));
  }
  // 삼재
  if (samjae && samjae.inSamjae) {
    lines.push(`⚠ *삼재 진행 중* (${samjae.type || ""}) — ${samjae.advice || "큰 결정 미루기"}`);
  } else {
    lines.push(`✓ 삼재 아님 — 큰 결정에 사주적 제약 X`);
  }
  // 납음오행 (오늘 일진) — napeum_60.data, napeum_60.interpretations 구조
  const napeumData = MUDANG.napeum_60?.data || {};
  const napeumInterp = MUDANG.napeum_60?.interpretations || {};
  const napeum = napeumData[dayG];
  if (napeum) {
    const interpKey = napeum.replace(/\(.+\)/, "").trim();
    const interp = napeumInterp[interpKey] || "";
    lines.push(`납음(納音): *${napeum}*${interp ? " — " + interp : ""}`);
  }
  // 오늘 이벤트 (analyzeDay events)
  if (dayAnalysis.events.length) {
    lines.push(``);
    lines.push(`오늘 일진 신호:`);
    dayAnalysis.events.slice(0, 3).forEach(e => lines.push(`  · ${e.text}`));
  }
  lines.push("");

  // === 7. 역사 거울 (60갑자 사이클 + 유사 인물) ===
  const mirror = getHistoryMirror(date, dayG);
  const figure = pickSimilarFigure(seed);
  lines.push(bar());
  lines.push(`📚 *역사 거울 — 60년 사이클*`);
  lines.push(bar());
  lines.push(`올해 *${mirror.eraKey}년* (${date.getFullYear()}). 60년 전: ${mirror.sameYears.join(" · ")}년`);
  if (mirror.eraInfo) lines.push(`시대 키워드: ${mirror.eraInfo}`);
  if (mirror.events.length) {
    lines.push(`같은 갑자 사이클 사건:`);
    mirror.events.forEach(e => lines.push(`  · ${e.year || ""} ${e.event || e.text || e}`));
  }
  lines.push(``);
  lines.push(`🪞 *오늘 너랑 닮은 사람*: ${figure.name} (${figure.category}, 사주 유사도 ${(figure.similarity*100).toFixed(0)}%)`);
  lines.push(`   "${figure.hint}"`);
  lines.push("");

  // === 8. 시간 배치 ===
  const times = buildTimeAdvice(userContext.user.day_branch, dayG[1]);
  if (times.best.length || times.worst.length) {
    lines.push(bar());
    lines.push(`⏰ *시간 배치*`);
    lines.push(bar());
    times.best.forEach(t => lines.push(`🌟 ${t.range} *${t.name}* — ${t.why}`));
    times.worst.forEach(t => lines.push(`⛔ ${t.range} *${t.name}* — ${t.why}`));
    lines.push("");
  }

  // === 9. 추천·금지 (구체) ===
  const actions = buildActions(userContext, dayAnalysis, selfRel);
  lines.push(bar());
  lines.push(`🎯 *오늘 추천 / 금지 — 구체 액션*`);
  lines.push(bar());
  lines.push(`*✅ 할 것*`);
  actions.recommend.forEach(r => lines.push(`  · ${r}`));
  lines.push(``);
  lines.push(`*❌ 피할 것*`);
  actions.avoid.forEach(a => lines.push(`  · ${a}`));
  lines.push("");

  // === 10. 심리 (구체) ===
  const psych = buildPsych(userContext, dayAnalysis);
  lines.push(bar());
  lines.push(`🧠 *심리 — 네 성격에 맞춘 처방*`);
  lines.push(bar());
  psych.forEach(p => lines.push(`  · ${p}`));
  lines.push("");

  // === 11. 큰 흐름 (D-DAY) ===
  const today = date.toISOString().slice(0, 10);
  const upcoming = (userContext.key_dates || []).filter(d => d.date > today).slice(0, 3);
  if (upcoming.length) {
    lines.push(bar());
    lines.push(`📅 *다가오는 큰 날*`);
    lines.push(bar());
    upcoming.forEach(u => {
      const daysLeft = daysBetween(today, u.date);
      lines.push(`*D-${daysLeft}* ${u.date} — ${u.label}`);
      lines.push(`   → ${u.why}`);
    });
    lines.push("");
  }

  // === 12. 무당 한 마디 ===
  lines.push(bar());
  lines.push(`🔮 *무당 한 마디*`);
  lines.push(bar());
  lines.push(`"${seedPick(MUDANG_QUIPS, seed)}"`);
  lines.push("");

  lines.push(`— ${seedPick(CLOSINGS, seed)}`);

  return lines.join("\n");
}

export function buildTelegramMessage(mySaju, date = new Date(), userName = "성훈", userContext = null) {
  return generateDailyStory({ mySaju, date, userName, userContext });
}
