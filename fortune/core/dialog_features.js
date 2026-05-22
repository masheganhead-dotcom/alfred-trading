// dialog_features.js - 대화 데이터에서 50+ 특징 자동 추출
//
// 출력: 화자별 정량 프로필 (메시지 통계 + 어휘 분류 + 감정 + 관계 패턴)
//
// 추출 카테고리:
//   1. 양적 통계 (메시지 수, 평균 길이, 응답 시간 등)
//   2. 어휘 분류 (지시·감정·자기언급·타인언급·욕설·이모티콘 등)
//   3. 감정 톤 (긍정/부정/중립 비율)
//   4. 시간 패턴 (활동 시간대·잠수 빈도)
//   5. 관계 시그널 (호칭·존댓말·반말 비율)

// 한국어 키워드 사전 (룰 기반)
const VOCAB = {
  // 지시/명령 (정관·편관 시그널)
  command: ["해", "하지마", "해야", "체크", "확인해", "보내", "보고해", "처리해", "해줘"],
  // 동의·긍정 (식신·정인)
  agree: ["좋아", "맞아", "그래", "ㅇㅇ", "네", "예", "응", "ㅇㅋ", "오케이", "굿", "최고"],
  // 반박·부정 (상관·편관)
  disagree: ["아니", "근데", "그게 아니", "ㄴㄴ", "노", "싫어", "별로", "아냐"],
  // 자기 언급 (비견·자기중심)
  self: ["내가", "나는", "내", "나도", "나만", "나한테", "나에게", "저는", "제가", "저도", "저한테"],
  // 타인 언급 (정인·관계 중심)
  other: ["너", "넌", "네", "너도", "네가", "당신", "그쪽", "형", "누나", "오빠", "언니"],
  // 욕설·분노 (귀문관·편관 신호)
  anger: ["ㅅㅂ", "씨발", "ㅈㄴ", "존나", "개", "ㅁㅊ", "미친", "짜증", "빡쳐", "헐", "와씨"],
  // 감정 단어 (화 기운)
  emotion_pos: ["사랑", "행복", "기뻐", "좋아해", "고마워", "감사", "재밌", "신나", "예쁘", "멋있", "최고", "대박"],
  emotion_neg: ["슬프", "우울", "외로", "힘들", "지쳐", "괴로", "아파", "무서", "두려", "불안"],
  // 이모티콘 / 웃음 (식상·표현)
  laugh: ["ㅋ", "ㅎ", "ㅠ", "ㅜ", "ㅡ", "😂", "🤣", "😊", "😘", "❤️", "🥰", "ㄷㄷ"],
  // 시간/약속 (정재·신용)
  schedule: ["언제", "몇 시", "약속", "만나", "갈게", "올게", "도착", "출발", "일정", "내일", "오늘", "주말"],
  // 돈 / 사업 (재성)
  money: ["돈", "비용", "예산", "수익", "투자", "사업", "회사", "급여", "월급", "벌어", "벌었", "받았", "송금"],
  // 음악 (작곡·창작 키워드 - 본 케이스 특화)
  music: ["곡", "노래", "음악", "비트", "녹음", "스튜디오", "믹싱", "마스터링", "MR", "악기", "보컬", "랩"],
  // 호칭 (관계 본질)
  honorific_high: ["선배님", "사장님", "대표님", "님", "씨"],
  honorific_low: ["형", "누나", "오빠", "언니", "야"],
  // 잠수·회피 시그널
  silence: ["나중에", "이따", "잠깐만", "기다려", "바쁘", "잠수", "스트레스", "쉬", "혼자"],
  // 권력·통제 (정관·괴강)
  authority: ["내 말 들어", "결정했어", "그렇게 해", "이게 맞아", "그건 아니야", "내가 책임", "그렇게 하자"],
  // 의존·약함 (극신약 시그널)
  weakness: ["몰라", "어떡해", "도와", "힘들어", "못하겠", "그만", "포기", "지쳤", "무리"],
};

// === 메시지 1개에 대한 어휘 분류 ===
export function classifyMessage(text) {
  const lower = text.toLowerCase();
  const result = {};
  for (const [cat, words] of Object.entries(VOCAB)) {
    let count = 0;
    for (const w of words) {
      const matches = lower.match(new RegExp(w, "g"));
      if (matches) count += matches.length;
    }
    result[cat] = count;
  }
  // 이모티콘 카운트
  const emojis = text.match(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|❤|♥/gu);
  result.emoji = emojis ? emojis.length : 0;
  // 길이
  result.length = text.length;
  result.has_question = /\?|\?|뭐|왜|어떻|언제|어디/.test(text);
  return result;
}

// === 화자별 종합 특징 추출 ===
export function extractSpeakerFeatures(messages, speakerId) {
  const myMsgs = messages.filter(m => (m.speakerId || m.speaker) === speakerId);
  if (myMsgs.length === 0) return null;

  // 1. 양적 통계
  const totalLen = myMsgs.reduce((s, m) => s + m.text.length, 0);
  const stats = {
    count: myMsgs.length,
    total_length: totalLen,
    avg_length: totalLen / myMsgs.length,
    first_message: myMsgs[0].ts,
    last_message: myMsgs[myMsgs.length - 1].ts,
  };

  // 2. 어휘 카테고리 집계
  const vocab = {};
  for (const cat of Object.keys(VOCAB)) vocab[cat] = 0;
  vocab.emoji = 0;
  let questionCount = 0;
  for (const m of myMsgs) {
    const c = classifyMessage(m.text);
    for (const k in c) {
      if (typeof c[k] === "number") vocab[k] = (vocab[k] || 0) + c[k];
    }
    if (c.has_question) questionCount++;
  }
  vocab.question = questionCount;

  // 3. 비율(정규화) - 메시지 수 대비
  const ratios = {};
  for (const k in vocab) ratios[k] = vocab[k] / myMsgs.length;

  // 4. 시간 패턴
  const hours = myMsgs.map(m => m.ts.getHours());
  const hourCounts = Array(24).fill(0);
  hours.forEach(h => hourCounts[h]++);
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const nightMsgs = hours.filter(h => h >= 22 || h < 6).length;
  const morningMsgs = hours.filter(h => h >= 6 && h < 12).length;

  // 5. 응답 속도 (전체 평균) - 같은 대화 흐름에서
  const responseTimes = [];
  for (let i = 1; i < messages.length; i++) {
    if ((messages[i].speakerId || messages[i].speaker) === speakerId &&
        (messages[i-1].speakerId || messages[i-1].speaker) !== speakerId) {
      const diff = (messages[i].ts - messages[i-1].ts) / 1000 / 60; // 분
      if (diff > 0 && diff < 1440) responseTimes.push(diff); // 24시간 이내만
    }
  }
  const avgResponseMin = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null;

  // 6. 정신상태 점수 (간이)
  const positivity = (vocab.agree + vocab.emotion_pos + vocab.laugh) /
                     (vocab.disagree + vocab.anger + vocab.emotion_neg + vocab.weakness + 1);
  const authoritativeness = (vocab.command + vocab.authority + vocab.disagree) / (vocab.count || myMsgs.length);
  const dependence = (vocab.weakness + vocab.silence) / myMsgs.length;
  const expressiveness = (vocab.emoji + vocab.laugh + vocab.emotion_pos + vocab.emotion_neg) / myMsgs.length;

  // 7. 호칭 분석 (상대를 어떻게 부르는가)
  const honorificScore = (vocab.honorific_high - vocab.honorific_low) / myMsgs.length;

  return {
    speakerId,
    stats,
    vocab_total: vocab,
    vocab_ratio: ratios,
    time: {
      peak_hour: peakHour,
      night_msg_count: nightMsgs,
      morning_msg_count: morningMsgs,
      night_ratio: nightMsgs / myMsgs.length,
    },
    response: {
      avg_minutes: avgResponseMin,
      sample_count: responseTimes.length,
    },
    inferred: {
      positivity: parseFloat(positivity.toFixed(2)),
      authoritativeness: parseFloat(authoritativeness.toFixed(3)),
      dependence: parseFloat(dependence.toFixed(3)),
      expressiveness: parseFloat(expressiveness.toFixed(3)),
      honorific_score: parseFloat(honorificScore.toFixed(3)),
    },
  };
}

// === 시기별 변화 추적 (월별 통계) ===
export function trackOverTime(messages, speakerId, period = "month") {
  const buckets = {};
  for (const m of messages) {
    if ((m.speakerId || m.speaker) !== speakerId) continue;
    let key;
    if (period === "month") key = `${m.ts.getFullYear()}-${String(m.ts.getMonth()+1).padStart(2,"0")}`;
    else if (period === "week") {
      const d = new Date(m.ts);
      d.setDate(d.getDate() - d.getDay());
      key = d.toISOString().slice(0, 10);
    } else key = m.ts.toISOString().slice(0, 10);
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(m);
  }
  const timeline = [];
  for (const [period, msgs] of Object.entries(buckets).sort()) {
    const c = { agree:0, disagree:0, anger:0, weakness:0, emotion_pos:0, emotion_neg:0 };
    for (const m of msgs) {
      const v = classifyMessage(m.text);
      for (const k in c) c[k] += v[k] || 0;
    }
    timeline.push({
      period,
      message_count: msgs.length,
      ...c,
      mood: c.emotion_pos + c.agree - c.emotion_neg - c.anger - c.weakness,
    });
  }
  return timeline;
}

// === 두 화자 간 상호작용 분석 (관계 진단) ===
export function analyzeInteraction(messages, speakerA, speakerB) {
  // A→B 메시지 (A가 보낸 메시지 중 B가 직전에 말했던 것)
  const aMsgs = messages.filter(m => (m.speakerId || m.speaker) === speakerA);
  const bMsgs = messages.filter(m => (m.speakerId || m.speaker) === speakerB);
  const aFeats = extractSpeakerFeatures(messages, speakerA);
  const bFeats = extractSpeakerFeatures(messages, speakerB);
  if (!aFeats || !bFeats) return null;

  // 메시지 비율 (누가 더 많이 보내는가)
  const ratio = aMsgs.length / (bMsgs.length || 1);
  // 응답 속도 비교
  const aResponse = aFeats.response.avg_minutes;
  const bResponse = bFeats.response.avg_minutes;

  // 호칭 패턴 (서로 어떻게 부르는가) - 간이
  return {
    messages_a: aMsgs.length,
    messages_b: bMsgs.length,
    ratio_a_to_b: parseFloat(ratio.toFixed(2)),
    avg_response_a: aResponse,
    avg_response_b: bResponse,
    a_more_authoritative: aFeats.inferred.authoritativeness > bFeats.inferred.authoritativeness,
    a_more_expressive: aFeats.inferred.expressiveness > bFeats.inferred.expressiveness,
    a_more_dependent: aFeats.inferred.dependence > bFeats.inferred.dependence,
    relationship_signals: [
      aFeats.inferred.authoritativeness > bFeats.inferred.authoritativeness * 1.5 ? "A가 지배적" : null,
      bFeats.inferred.dependence > aFeats.inferred.dependence * 1.5 ? "B가 의존적" : null,
      aFeats.inferred.expressiveness > bFeats.inferred.expressiveness * 1.5 ? "A가 표현적" : null,
      Math.abs(ratio - 1) < 0.2 ? "메시지 수 균형" : (ratio > 1 ? "A가 더 많이 보냄" : "B가 더 많이 보냄"),
    ].filter(Boolean),
  };
}
