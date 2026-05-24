// saju_dialog_match.js - 사주 예측 ↔ 카톡/전사 실제 데이터 자동 매칭
//
// 핵심 아이디어: 사주가 예측한 성격/패턴을 실제 대화 데이터로 검증
//   예: "정관격 + 괴강살" → "authoritativeness 높을 것" 예측 → 실제 대화 검증
//
// 매칭 규칙 50+
//   각 규칙은 (사주조건, 대화특징 기대값, 가중치) 형태

import { determineYongsin } from "./yongsin.js";
import { determineGeokguk } from "./geokguk.js";
import { analyzeShinsal } from "./mudang.js";

// === 사주 → 기대 대화 특징 예측 ===
export function predictDialogFeatures(saju, gender = "M") {
  const yongsin = determineYongsin(saju);
  const geokguk = determineGeokguk(saju, yongsin.strength);
  const shinsal = analyzeShinsal(saju);
  const shinsalNames = shinsal.map(s => s.name.replace(/\(.+\)/g, "").trim());
  const sipsinList = [];
  for (const p of ["year","month","hour"]) {
    if (saju.sipsin[p].stem) sipsinList.push(saju.sipsin[p].stem);
  }
  const ohaeng = saju.ohaengCount;

  // 예측치 (0~1 스케일)
  const expected = {
    authoritativeness: 0.5,   // 지배·통제 성향
    expressiveness: 0.5,      // 표현·감정 표출
    positivity: 0.5,          // 긍정 vs 부정 톤
    dependence: 0.5,          // 의존·약함 표출
    talkativeness: 0.5,       // 말 많음
    night_activity: 0.5,      // 야간 활동
    response_speed: 0.5,      // 빠른 응답 (높을수록 즉답)
    emotion_volatility: 0.5,  // 감정 기복 (귀문관·원진)
    schedule_focus: 0.5,      // 시간·약속 언급
    money_focus: 0.5,         // 돈·사업 언급
  };

  // === 격국 기반 예측 ===
  if (geokguk.name.includes("정관")) {
    expected.authoritativeness += 0.2;
    expected.schedule_focus += 0.15;
    expected.expressiveness -= 0.1;
  }
  if (geokguk.name.includes("편관") || geokguk.name.includes("七殺")) {
    expected.authoritativeness += 0.25;
    expected.emotion_volatility += 0.2;
  }
  if (geokguk.name.includes("정인")) {
    expected.expressiveness -= 0.05;
    expected.talkativeness -= 0.1;
  }
  if (geokguk.name.includes("편인")) {
    expected.expressiveness -= 0.1;
    expected.night_activity += 0.15;
  }
  if (geokguk.name.includes("식신")) {
    expected.expressiveness += 0.15;
    expected.positivity += 0.15;
  }
  if (geokguk.name.includes("상관")) {
    expected.expressiveness += 0.25;
    expected.authoritativeness -= 0.1;
    expected.talkativeness += 0.15;
  }
  if (geokguk.name.includes("정재")) {
    expected.schedule_focus += 0.2;
    expected.money_focus += 0.2;
  }
  if (geokguk.name.includes("편재")) {
    expected.talkativeness += 0.1;
    expected.money_focus += 0.25;
  }
  if (geokguk.name.includes("양인")) {
    expected.authoritativeness += 0.2;
    expected.emotion_volatility += 0.15;
  }
  if (geokguk.name.includes("건록")) {
    expected.authoritativeness += 0.1;
  }

  // === 신살 기반 ===
  if (shinsalNames.includes("羊刃殺")) {
    expected.authoritativeness += 0.15;
    expected.emotion_volatility += 0.1;
  }
  if (shinsalNames.includes("白虎大殺")) {
    expected.emotion_volatility += 0.15;
  }
  if (shinsalNames.includes("魁罡殺")) {
    expected.authoritativeness += 0.2;
  }
  if (shinsalNames.includes("怨嗔殺")) {
    expected.emotion_volatility += 0.15;
    expected.expressiveness -= 0.1;
  }
  if (shinsalNames.includes("鬼門關殺")) {
    expected.emotion_volatility += 0.25;
    expected.night_activity += 0.1;
  }
  if (shinsalNames.includes("桃花殺")) {
    expected.expressiveness += 0.1;
    expected.positivity += 0.05;
  }
  if (shinsalNames.includes("驛馬殺")) {
    expected.talkativeness += 0.1;
  }
  if (shinsalNames.includes("華蓋殺")) {
    expected.night_activity += 0.15;
    expected.expressiveness -= 0.05;
  }
  if (shinsalNames.includes("공망") || shinsalNames.includes("空亡")) {
    expected.response_speed -= 0.15;
  }

  // === 신강신약 ===
  if (yongsin.strength.isStrong) {
    expected.authoritativeness += 0.1;
    expected.dependence -= 0.15;
  }
  if (yongsin.strength.isWeak) {
    expected.dependence += 0.15;
    expected.authoritativeness -= 0.1;
  }

  // === 오행 분포 ===
  if (ohaeng.화 >= 3) {
    expected.expressiveness += 0.15;
    expected.positivity += 0.1;
  }
  if (ohaeng.화 === 0) {
    expected.expressiveness -= 0.2;
    expected.positivity -= 0.1;
  }
  if (ohaeng.수 >= 3) {
    expected.night_activity += 0.15;
  }
  if (ohaeng.금 >= 3) {
    expected.authoritativeness += 0.1;
    expected.expressiveness -= 0.1;
  }
  if (ohaeng.토 >= 3) {
    expected.schedule_focus += 0.1;
  }

  // 클램프 0~1
  for (const k in expected) expected[k] = Math.max(0, Math.min(1, expected[k]));

  return {
    expected,
    saju_meta: {
      geokguk: geokguk.name,
      strength: yongsin.strength.grade,
      shinsal: shinsalNames,
      dominant_ohaeng: Object.entries(ohaeng).sort((a,b)=>b[1]-a[1])[0][0],
    }
  };
}

// === 실제 대화 특징 → 정규화된 측정값 ===
export function normalizeObserved(features) {
  const obs = features.inferred;
  // 정규화 (0~1)
  return {
    authoritativeness: Math.min(1, obs.authoritativeness * 10),  // 0~0.1 → 0~1
    expressiveness: Math.min(1, obs.expressiveness * 2),         // 0~0.5 → 0~1
    positivity: Math.min(1, obs.positivity / 5),                 // 0~5+ → 0~1
    dependence: Math.min(1, obs.dependence * 20),                // 0~0.05 → 0~1
    talkativeness: Math.min(1, features.stats.avg_length / 30),  // 0~30 → 0~1
    night_activity: features.time.night_ratio,                    // 0~1
    response_speed: features.response.avg_minutes
      ? Math.max(0, 1 - features.response.avg_minutes / 60) : 0.5,  // 빠를수록 1
    emotion_volatility: Math.min(1,
      (features.vocab_ratio.anger + features.vocab_ratio.emotion_neg + features.vocab_ratio.weakness) * 5),
    schedule_focus: Math.min(1, features.vocab_ratio.schedule * 5),
    money_focus: Math.min(1, features.vocab_ratio.money * 5),
  };
}

// === 매칭 점수: 사주 예측 vs 실제 관찰 ===
export function matchScore(predicted, observed) {
  const keys = Object.keys(predicted.expected);
  let totalDiff = 0;
  const detail = {};
  for (const k of keys) {
    const diff = Math.abs(predicted.expected[k] - observed[k]);
    detail[k] = {
      predicted: parseFloat(predicted.expected[k].toFixed(2)),
      observed: parseFloat(observed[k].toFixed(2)),
      diff: parseFloat(diff.toFixed(2)),
      match: diff < 0.2 ? "✓" : diff < 0.4 ? "~" : "✗",
    };
    totalDiff += diff;
  }
  const avgDiff = totalDiff / keys.length;
  const accuracy = Math.max(0, Math.min(100, (1 - avgDiff) * 100));
  return {
    accuracy: Math.round(accuracy),
    avg_diff: parseFloat(avgDiff.toFixed(2)),
    detail,
    interpretation: accuracy >= 70 ? "사주 예측 정확" :
                    accuracy >= 50 ? "사주 예측 부분 일치" :
                    "사주 예측 크게 빗나감 (다른 요인 강함)",
  };
}

// === 종합 진단: 사주 + 대화 데이터 결합 ===
export function diagnose(saju, dialogFeatures, gender = "M") {
  const predicted = predictDialogFeatures(saju, gender);
  const observed = normalizeObserved(dialogFeatures);
  const match = matchScore(predicted, observed);
  // 차이가 큰 항목 = 사주가 예측 못한 부분 (환경·관계·시기 요인)
  const surprises = [];
  for (const k of Object.keys(match.detail)) {
    if (match.detail[k].diff >= 0.4) {
      surprises.push({
        feature: k,
        predicted: match.detail[k].predicted,
        observed: match.detail[k].observed,
        note: match.detail[k].observed > match.detail[k].predicted
          ? `${k} 사주 예측보다 높음 (외부 자극 가능)`
          : `${k} 사주 예측보다 낮음 (의식적 자제 또는 환경 영향)`,
      });
    }
  }
  return {
    saju_meta: predicted.saju_meta,
    match,
    surprises,
    insights: generateInsights(predicted, observed, match),
  };
}

function generateInsights(predicted, observed, match) {
  const insights = [];
  if (observed.emotion_volatility > 0.7) {
    insights.push("⚠ 감정 기복 큼 - 귀문관·원진살 활성 또는 외부 스트레스 강함");
  }
  if (observed.dependence > 0.6 && predicted.expected.dependence < 0.4) {
    insights.push("📉 의존 시그널이 사주보다 강함 - 일시적 약화 상태 (대운/세운 흉성)");
  }
  if (observed.authoritativeness > 0.7) {
    insights.push("👑 지배적 톤 - 양인·괴강·정관 활성");
  }
  if (observed.night_activity > 0.4) {
    insights.push("🌙 야간 활동 비중 높음 - 화개·편인 활성");
  }
  if (observed.expressiveness < 0.2) {
    insights.push("🤐 표현 적음 - 화 결핍 + 외부 위축");
  }
  if (observed.money_focus > 0.3) {
    insights.push("💰 돈/사업 언급 많음 - 재성 활성기");
  }
  return insights;
}
