// 대화 분석 데모 - 가상 카톡 데이터로 시스템 작동 검증
import { parseKakaoTalkPC } from "../core/dialog_parser.js";
import { extractSpeakerFeatures, analyzeInteraction, trackOverTime } from "../core/dialog_features.js";
import { predictDialogFeatures, normalizeObserved, matchScore, diagnose } from "../core/saju_dialog_match.js";
import { calculateSaju } from "../core/saju.js";

// === 가상 카톡 데이터 (실제 데이터 대용) ===
// 다양한 화자 성격을 반영해 데모용으로 작성
const SAMPLE_KAKAO = `2026년 5월 10일 토요일 오후 9:15, 최성훈 : 형 곡 완성됐어요 들어볼래요?
2026년 5월 10일 토요일 오후 9:18, 김건희 : 보내봐 체크해보자
2026년 5월 10일 토요일 오후 9:25, 김건희 : 후렴 부분이 좀 약한데 다시 작업해
2026년 5월 10일 토요일 오후 9:26, 김건희 : 이렇게는 발매 못해
2026년 5월 10일 토요일 오후 9:35, 최성훈 : 네 알겠습니다 형 의견 반영해서 다시 해볼게요
2026년 5월 11일 일요일 오전 11:20, 최성훈 : 형 수정본 보냈어요
2026년 5월 11일 일요일 오후 2:15, 김건희 : 이건 좋네 이 방향으로 가자
2026년 5월 12일 월요일 오후 11:45, DAWN : 야 성훈아 곡 들었어 미친 좋다 ㅋㅋㅋ
2026년 5월 12일 월요일 오후 11:46, DAWN : 우리 이걸로 5월 29일에 발매하자
2026년 5월 12일 월요일 오후 11:47, 최성훈 : 좋아 형 ㅋㅋ 같이 가자
2026년 5월 12일 월요일 오후 11:48, DAWN : 가사도 내가 손볼게 ㅋㅋ
2026년 5월 12일 월요일 오후 11:50, DAWN : 진짜 이번 곡이 인생곡 될 것 같아 😎
2026년 5월 13일 화요일 오후 3:00, JUNNY : 성훈이 곡 들었어. 후렴 멜로디가 인상적이네. 가사도 깊이가 있고. 다만 2절 브릿지 부분에서 약간 호흡 정리가 필요해 보여
2026년 5월 13일 화요일 오후 3:05, 최성훈 : 와 형님 디테일 진짜 감사합니다
2026년 5월 13일 화요일 오후 3:07, JUNNY : 음악 만드는 사람들은 이런 거 챙겨야지. 너 잘하고 있어
2026년 5월 15일 목요일 오전 2:30, Andnew : 성훈아 자?
2026년 5월 15일 목요일 오전 2:31, Andnew : 새벽에 미친 트랙 떠올랐는데 같이 작업하자
2026년 5월 15일 목요일 오전 2:35, Andnew : 빨리 와 스튜디오로
2026년 5월 15일 목요일 오전 2:36, Andnew : 내일 아침까지 끝낼 거야
2026년 5월 15일 목요일 오전 2:50, 최성훈 : 형 너무 늦었는데 ㅠ 내일 정오에 봐도 될까요
2026년 5월 15일 목요일 오전 2:52, Andnew : 지금 안 오면 나 혼자 한다 ㅡㅡ
2026년 5월 20일 화요일 오후 7:00, 김건희 : 5월 29일 발매 준비 어디까지 됐어
2026년 5월 20일 화요일 오후 7:02, 최성훈 : 마스터링까지 끝났어요 형
2026년 5월 20일 화요일 오후 7:03, 김건희 : 좋아 보도자료 내가 정리할게 너희는 SNS 준비해
2026년 5월 22일 목요일 오후 10:00, DAWN : 성훈아 무대 의상 같이 보러가자 ㅋㅋ
2026년 5월 22일 목요일 오후 10:01, 최성훈 : 좋아요 ㅋㅋ
2026년 5월 25일 일요일 오후 11:30, DAWN : 요즘 좀 힘드네 ㅠ
2026년 5월 25일 일요일 오후 11:32, 최성훈 : 형 무슨 일 있어요?
2026년 5월 25일 일요일 오후 11:35, DAWN : 그냥 머리 복잡해 잠수탈게 며칠
2026년 5월 25일 일요일 오후 11:36, 최성훈 : 네 형 잘 쉬어요 필요할 때 연락주세요
2026년 5월 29일 금요일 오후 6:00, 김건희 : 발매 축하한다 잘했어
2026년 5월 29일 금요일 오후 6:01, DAWN : 우리가 해냈다 ㅋㅋㅋㅋ
2026년 5월 29일 금요일 오후 6:02, JUNNY : 좋은 음악이야. 자랑스럽다
2026년 5월 29일 금요일 오후 6:03, Andnew : 다음 작업도 가자!
2026년 5월 29일 금요일 오후 6:05, 최성훈 : 다들 감사해요 진심으로 ㅠ`;

console.log("═".repeat(80));
console.log("  📱 대화 분석 데모 — 5인 카톡 데이터를 사주 시스템과 결합");
console.log("═".repeat(80));

// === 1. 파싱 ===
const messages = parseKakaoTalkPC(SAMPLE_KAKAO);
console.log(`\n[Step 1] 카톡 파싱: ${messages.length}개 메시지 추출`);
const speakers = [...new Set(messages.map(m => m.speaker))];
console.log(`  화자: ${speakers.join(", ")}`);

// === 2. 화자별 특징 추출 ===
console.log("\n[Step 2] 화자별 특징 추출");
const features = {};
for (const sp of speakers) {
  features[sp] = extractSpeakerFeatures(messages, sp);
  const f = features[sp];
  console.log(`\n  ▣ ${sp}`);
  console.log(`     메시지 ${f.stats.count}개 / 평균 ${f.stats.avg_length.toFixed(0)}자`);
  console.log(`     지배성 ${f.inferred.authoritativeness.toFixed(3)} / 표현력 ${f.inferred.expressiveness.toFixed(3)}`);
  console.log(`     긍정도 ${f.inferred.positivity.toFixed(2)} / 의존도 ${f.inferred.dependence.toFixed(3)}`);
  console.log(`     응답속도 ${f.response.avg_minutes !== null ? f.response.avg_minutes.toFixed(0) + "분" : "N/A"}`);
  console.log(`     주활동시간 ${f.time.peak_hour}시 / 야간비율 ${(f.time.night_ratio*100).toFixed(0)}%`);
  console.log(`     주요어휘: 동의=${f.vocab_total.agree} 지시=${f.vocab_total.command} 분노=${f.vocab_total.anger} 약함=${f.vocab_total.weakness} 이모티콘=${f.vocab_total.emoji}`);
}

// === 3. 사주 데이터와 매칭 ===
const sajus = {
  "최성훈": calculateSaju({ year:1998, month:11, day:7, hour:7, minute:35, gender:"M" }),
  "김건희": calculateSaju({ year:1995, month:6, day:3, hour:8, minute:30, gender:"M" }),
  "DAWN":  calculateSaju({ year:1994, month:6, day:1, hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
  "JUNNY": calculateSaju({ year:1996, month:4, day:6, hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
  "Andnew":calculateSaju({ year:1997, month:5, day:12, hour:12, minute:0, gender:"M", useTrueSolarTime:false }),
};

console.log("\n[Step 3] 사주 예측 vs 대화 실제 매칭 검증");
for (const [name, saju] of Object.entries(sajus)) {
  if (!features[name]) continue;
  const result = diagnose(saju, features[name], "M");
  console.log(`\n  ▣ ${name} - 매칭 정확도 ${result.match.accuracy}%`);
  console.log(`     ${result.match.interpretation}`);
  console.log(`     격국: ${result.saju_meta.geokguk} / 신살: ${result.saju_meta.shinsal.slice(0,3).join(", ")}`);
  // 주요 항목
  const top = Object.entries(result.match.detail)
    .map(([k,v]) => ({ k, ...v, score: 1 - v.diff }))
    .sort((a,b)=>b.score - a.score)
    .slice(0, 3);
  console.log(`     가장 일치한 항목:`);
  top.forEach(t => console.log(`       · ${t.k}: 예측${t.predicted} / 관찰${t.observed} ${t.match}`));
  if (result.surprises.length > 0) {
    console.log(`     예상 밖 발견:`);
    result.surprises.forEach(s => console.log(`       · ${s.note}`));
  }
  if (result.insights.length > 0) {
    console.log(`     인사이트:`);
    result.insights.forEach(i => console.log(`       · ${i}`));
  }
}

// === 4. 관계 진단 (본인 ↔ 4명) ===
console.log("\n[Step 4] 본인(최성훈) ↔ 4명 관계 진단");
for (const other of ["김건희", "DAWN", "JUNNY", "Andnew"]) {
  if (!features[other]) continue;
  const r = analyzeInteraction(messages, "최성훈", other);
  if (!r) continue;
  console.log(`\n  ▣ 최성훈 ↔ ${other}`);
  console.log(`     메시지 ${r.messages_a}:${r.messages_b}, 비율 ${r.ratio_a_to_b}`);
  console.log(`     응답속도 - 나:${r.avg_response_a !== null ? r.avg_response_a.toFixed(0) + "분" : "N/A"} / ${other}:${r.avg_response_b !== null ? r.avg_response_b.toFixed(0) + "분" : "N/A"}`);
  console.log(`     시그널: ${r.relationship_signals.join(" / ") || "없음"}`);
}

// === 5. 시기별 변화 ===
console.log("\n[Step 5] 화자별 월별 감정 추적 (DAWN 예시)");
const timeline = trackOverTime(messages, "DAWN", "week");
console.log(`  기간                     메시지수  분노  약함  긍정  부정  무드`);
timeline.forEach(t => {
  console.log(`  ${t.period}    ${String(t.message_count).padStart(2)}        ${t.anger}    ${t.weakness}    ${t.emotion_pos}    ${t.emotion_neg}    ${t.mood}`);
});

console.log("\n" + "═".repeat(80));
console.log("  ✅ 시스템 준비 완료 — 실제 카톡 export 받으면 즉시 분석 가능");
console.log("═".repeat(80));
