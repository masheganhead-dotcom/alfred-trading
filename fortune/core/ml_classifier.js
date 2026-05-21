// ml_classifier.js - 사주 → 직업·성과 분류기 (Phase 2 룰 기반 + 통계)
//
// 학습 데이터: figures_dataset.json (158명 검증된 인물)
// 분류 대상: 14개 직업 카테고리
// 알고리즘: 룰 매칭 점수 + 일주·격국·신살·오행 분포 패턴 매칭
//
// 핵심: "이 사주를 가진 사람은 어떤 직업에 가까운가?"를 정량 산출

import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG, HIDDEN_STEMS } from "./saju.js";
import { determineYongsin } from "./yongsin.js";
import { determineGeokguk } from "./geokguk.js";
import { analyzeShinsal } from "./mudang.js";

// === 데이터셋에서 사주 패턴 → 직업 통계 학습 ===
export function learnFromDataset(figures, options = {}) {
  const useTST = options.useTST || false;
  // 카테고리별 사주 패턴 누적
  const stats = {
    byCategory: {},      // 카테고리 → {dayMasters, ohaeng_avg, geokguk, shinsal_count, ...}
    byDayMaster: {},     // 일간 → 어떤 직업이 많이 나오는가
    byIlju: {},          // 일주 60갑자 → 직업
    byOhaeng: {},        // 강한 오행 → 직업
    total: 0,
    skipped: 0,
  };

  figures.forEach(f => {
    if (!f.year || f.year < 100) { stats.skipped++; return; }  // BC 인물 skip
    try {
      const saju = calculateSaju({
        year: f.year, month: f.month, day: f.day,
        hour: f.hour !== null ? f.hour : 12,
        minute: f.minute || 0,
        gender: f.gender || "M",
        useTrueSolarTime: useTST,
        longitude: 127.0,
      });
      const dayMaster = saju.dayMaster.stemHan;
      const ilju = saju.pillars.day.gapja;
      const dominantOhaeng = Object.entries(saju.ohaengCount).sort((a,b)=>b[1]-a[1])[0][0];

      (f.category || []).forEach(cat => {
        // 카테고리 패턴 누적
        if (!stats.byCategory[cat]) {
          stats.byCategory[cat] = {
            count: 0,
            dayMasters: {},
            ohaeng_total: { 목:0, 화:0, 토:0, 금:0, 수:0 },
            iljus: {},
            tags: {},
            avg_fame: 0,
          };
        }
        const c = stats.byCategory[cat];
        c.count++;
        c.dayMasters[dayMaster] = (c.dayMasters[dayMaster] || 0) + 1;
        c.iljus[ilju] = (c.iljus[ilju] || 0) + 1;
        for (const k of Object.keys(saju.ohaengCount)) c.ohaeng_total[k] += saju.ohaengCount[k];
        c.avg_fame += (f.fame || 3);
        (f.tags || []).forEach(t => c.tags[t] = (c.tags[t] || 0) + 1);
      });

      // 일간별 직업
      if (!stats.byDayMaster[dayMaster]) stats.byDayMaster[dayMaster] = {};
      (f.category || []).forEach(cat => {
        stats.byDayMaster[dayMaster][cat] = (stats.byDayMaster[dayMaster][cat] || 0) + 1;
      });

      // 일주별 직업
      if (!stats.byIlju[ilju]) stats.byIlju[ilju] = [];
      stats.byIlju[ilju].push({ name: f.name, category: f.category, fame: f.fame });

      // 주오행별 직업
      if (!stats.byOhaeng[dominantOhaeng]) stats.byOhaeng[dominantOhaeng] = {};
      (f.category || []).forEach(cat => {
        stats.byOhaeng[dominantOhaeng][cat] = (stats.byOhaeng[dominantOhaeng][cat] || 0) + 1;
      });

      stats.total++;
    } catch(e) {
      stats.skipped++;
    }
  });

  // 평균·정규화
  for (const cat in stats.byCategory) {
    const c = stats.byCategory[cat];
    for (const o in c.ohaeng_total) c.ohaeng_total[o] = parseFloat((c.ohaeng_total[o] / c.count).toFixed(2));
    c.avg_fame = parseFloat((c.avg_fame / c.count).toFixed(2));
  }

  return stats;
}

// === 예측: 한 사주 → 가장 가능성 높은 직업 카테고리 ===
export function predictCategory(saju, learned) {
  const dayMaster = saju.dayMaster.stemHan;
  const ilju = saju.pillars.day.gapja;
  const dominantOhaeng = Object.entries(saju.ohaengCount).sort((a,b)=>b[1]-a[1])[0][0];

  const scores = {};

  // 카테고리별 매칭 점수 계산
  for (const cat in learned.byCategory) {
    const c = learned.byCategory[cat];
    let score = 0;

    // 1) 일간 매칭 (가중치 3)
    const dmRate = (c.dayMasters[dayMaster] || 0) / c.count;
    score += dmRate * 30;

    // 2) 일주 정확 매칭 (가중치 5)
    if (c.iljus[ilju]) score += (c.iljus[ilju] / c.count) * 50;

    // 3) 오행 코사인 유사도 (가중치 4)
    const myOh = Object.values(saju.ohaengCount);
    const catOh = ["목","화","토","금","수"].map(o => c.ohaeng_total[o]);
    score += cosineSim(myOh, catOh) * 40;

    // 4) 카테고리 인기도(데이터셋에서 흔할수록 점수 ↑ - 약하게)
    score += Math.log(c.count + 1) * 1;

    scores[cat] = parseFloat(score.toFixed(2));
  }

  // 정렬
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return {
    top: sorted.slice(0, 5),
    all: scores,
    matchInfo: {
      dayMaster, ilju, dominantOhaeng,
      similarPeople: (learned.byIlju[ilju] || []).slice(0, 5),
    }
  };
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

// === 룰 엔진: 사주에 명리학 룰 100개 적용 ===
export function applyRules(saju, gender, rulesData) {
  const yongsin = determineYongsin(saju);
  const geokguk = determineGeokguk(saju, yongsin.strength);
  const shinsal = analyzeShinsal(saju);
  const shinsalNames = shinsal.map(s => s.name.replace(/\(.+\)/g, "").trim());
  const sipsinList = [];
  for (const p of ["year","month","hour"]) {
    if (saju.sipsin[p].stem) sipsinList.push(saju.sipsin[p].stem);
  }

  const matched = [];
  for (const rule of rulesData.rules) {
    if (matchRule(rule, { saju, yongsin, geokguk, shinsal, shinsalNames, sipsinList, gender })) {
      matched.push(rule);
    }
  }

  // 집계
  const outcomeTagsAll = {};
  let avgScore = 0;
  const warnings = [];
  for (const m of matched) {
    (m.outcome_tags || []).forEach(t => outcomeTagsAll[t] = (outcomeTagsAll[t] || 0) + 1);
    avgScore += m.score || 50;
    if (m.warning) warnings.push(m.name);
  }
  avgScore = matched.length > 0 ? avgScore / matched.length : 50;

  const topTags = Object.entries(outcomeTagsAll).sort((a,b)=>b[1]-a[1]).slice(0, 10);

  return {
    matched: matched.length,
    matchedRules: matched.map(m => ({ id: m.id, name: m.name, score: m.score, then: m.then })),
    topTags,
    avgScore: Math.round(avgScore),
    warnings,
  };
}

function matchRule(rule, ctx) {
  const cond = rule.if;
  if (!cond) return false;

  if (cond.geokguk) {
    const target = Array.isArray(cond.geokguk) ? cond.geokguk : [cond.geokguk];
    if (!target.some(t => ctx.geokguk.name.includes(t))) return false;
  }

  if (cond.sipsin_has) {
    const target = Array.isArray(cond.sipsin_has) ? cond.sipsin_has : [cond.sipsin_has];
    if (!target.some(t => ctx.sipsinList.includes(t))) return false;
  }

  if (cond.strength) {
    const grade = ctx.yongsin.strength.grade;
    if (cond.strength === "신왕" && !grade.includes("신왕") && !grade.includes("신강")) return false;
    if (cond.strength === "신약" && !grade.includes("신약") && !grade.includes("극신약")) return false;
    if (cond.strength === "극신왕" && !grade.includes("신왕")) return false;
    if (cond.strength === "중화이상" && (grade.includes("신약") || grade.includes("극신약"))) return false;
  }

  if (cond.shinsal) {
    const target = Array.isArray(cond.shinsal) ? cond.shinsal : [cond.shinsal];
    if (!target.every(t => ctx.shinsalNames.some(s => s.includes(t)))) return false;
  }

  if (cond.gender && cond.gender !== ctx.gender) return false;

  if (cond.ohaeng_zero) {
    if (ctx.saju.ohaengCount[cond.ohaeng_zero] !== 0) return false;
  }

  if (cond.ohaeng_strong) {
    const max = Math.max(...Object.values(ctx.saju.ohaengCount));
    if (ctx.saju.ohaengCount[cond.ohaeng_strong] !== max) return false;
  }

  if (cond.ohaeng_excess) {
    if (ctx.saju.ohaengCount[cond.ohaeng_excess] < 3) return false;
  }

  if (cond.chung) {
    const chungs = ctx.saju.relations.chung || [];
    if (cond.chung === "일지" && !chungs.some(c => c.includes(JIJI[ctx.saju.pillars.day.branch]))) return false;
    if (cond.chung === "년지" && !chungs.some(c => c.includes(JIJI[ctx.saju.pillars.year.branch]))) return false;
    if (cond.chung === "월지" && !chungs.some(c => c.includes(JIJI[ctx.saju.pillars.month.branch]))) return false;
  }

  if (cond.day_gapja) {
    if (ctx.saju.pillars.day.gapja !== cond.day_gapja) return false;
  }

  if (cond.day_yinyang) {
    const dyy = ctx.saju.dayMaster.yinyang;
    if (dyy !== cond.day_yinyang) return false;
  }

  if (cond.sipsin_count) {
    for (const k in cond.sipsin_count) {
      const groups = {
        "비견겁재": ["비견","겁재"],
        "식신상관": ["식신","상관"],
        "정재편재": ["정재","편재"],
        "정관편관": ["정관","편관"],
        "정인편인": ["정인","편인"],
      };
      const targets = groups[k] || [k];
      const count = ctx.sipsinList.filter(s => targets.includes(s)).length;
      const condStr = cond.sipsin_count[k];
      if (typeof condStr === "string") {
        if (condStr.startsWith(">=") && count < parseInt(condStr.slice(2))) return false;
        if (condStr === "0" && count !== 0) return false;
      } else if (typeof condStr === "number") {
        if (count !== condStr) return false;
      }
    }
  }

  if (cond.sipsin_chain) {
    // 단순화: 두 십신이 모두 있으면 true
    if (!cond.sipsin_chain.every(s => ctx.sipsinList.includes(s))) return false;
  }

  return true;
}

// === 종합 분석: 분류기 + 룰엔진 통합 ===
export function comprehensiveAnalysis(saju, gender, learned, rulesData) {
  const prediction = predictCategory(saju, learned);
  const ruleResult = applyRules(saju, gender, rulesData);
  return {
    prediction,
    rules: ruleResult,
  };
}
