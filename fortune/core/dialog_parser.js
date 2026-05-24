// dialog_parser.js - 한국 카카오톡 export + 통화 전사 파서
//
// 지원 포맷:
//   1. 카카오톡 PC export (.txt) - 한국어 표준 포맷
//      예: "2024년 5월 29일 오후 7:35, 최성훈 : 메시지 내용"
//   2. 카카오톡 모바일 export (.csv) - Date,User,Message
//   3. 통화 전사 JSON - {timestamp, speaker, text, duration}
//   4. 일반 채팅 JSON 배열
//
// 출력: 통일된 메시지 배열
//   [{ ts: Date, speaker: string, text: string, meta?: {} }, ...]

// === 카카오톡 PC TXT 파서 ===
export function parseKakaoTalkPC(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];
  // 헤더 정보 추출
  // "2024년 5월 29일 토요일 오후 7:35, 최성훈 : 안녕"
  // 또는 "2024.5.29 19:35:00, 최성훈 : 안녕"
  const re1 = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(?:[가-힣]+요일)?\s*(오전|오후)\s*(\d{1,2}):(\d{2})\s*,\s*([^:]+?)\s*:\s*(.*)$/;
  const re2 = /^(\d{4})[\.\-/](\d{1,2})[\.\-/](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*,\s*([^:]+?)\s*:\s*(.*)$/;

  let pendingMultiline = null;

  for (const line of lines) {
    let m = re1.exec(line) || re2.exec(line);
    if (m) {
      // 이전 메시지가 다중 행이었으면 마무리
      if (pendingMultiline) {
        messages.push(pendingMultiline);
        pendingMultiline = null;
      }
      let year, month, day, hour, minute, second = 0, speaker, text;
      if (re1.test(line)) {
        const m2 = re1.exec(line);
        year = +m2[1]; month = +m2[2]; day = +m2[3];
        const ampm = m2[4]; hour = +m2[5]; minute = +m2[6];
        if (ampm === "오후" && hour < 12) hour += 12;
        if (ampm === "오전" && hour === 12) hour = 0;
        speaker = m2[7].trim();
        text = m2[8];
      } else {
        const m2 = re2.exec(line);
        year = +m2[1]; month = +m2[2]; day = +m2[3];
        hour = +m2[4]; minute = +m2[5]; second = +(m2[6]||0);
        speaker = m2[7].trim();
        text = m2[8];
      }
      const ts = new Date(year, month-1, day, hour, minute, second);
      pendingMultiline = { ts, speaker, text };
    } else if (pendingMultiline && line.trim()) {
      // 다중 행 메시지 (개행 포함) - 이전 메시지 본문에 추가
      pendingMultiline.text += "\n" + line;
    }
  }
  if (pendingMultiline) messages.push(pendingMultiline);

  return messages;
}

// === 카카오톡 모바일 CSV 파서 ===
export function parseKakaoTalkCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  // 첫 줄 헤더 가정: "Date,User,Message"
  const messages = [];
  for (let i = 1; i < lines.length; i++) {
    // 간단 CSV 파싱 (메시지에 쉼표 있을 수 있으니 첫 2개 쉼표만 split)
    const parts = lines[i].match(/^([^,]+),([^,]+),(.*)$/);
    if (!parts) continue;
    const ts = new Date(parts[1]);
    if (isNaN(ts)) continue;
    messages.push({ ts, speaker: parts[2].trim(), text: parts[3] });
  }
  return messages;
}

// === 통화 전사 JSON 파서 ===
export function parseTranscript(jsonArr) {
  return jsonArr.map(item => ({
    ts: new Date(item.timestamp || item.ts || item.time),
    speaker: item.speaker || item.user || item.name,
    text: item.text || item.content || item.transcript || "",
    meta: { duration: item.duration, type: "voice" }
  })).filter(m => m.text && !isNaN(m.ts));
}

// === 통일 인터페이스: 자동 형식 감지 ===
export function parseAny(data, format = "auto") {
  if (format === "auto") {
    if (typeof data === "string") {
      if (data.startsWith("Date,") || data.startsWith("date,")) format = "csv";
      else format = "kakao_pc";
    } else if (Array.isArray(data)) {
      format = "transcript";
    }
  }
  switch (format) {
    case "kakao_pc": return parseKakaoTalkPC(data);
    case "csv": return parseKakaoTalkCSV(data);
    case "transcript": return parseTranscript(data);
    default: throw new Error(`Unknown format: ${format}`);
  }
}

// === 화자 매핑 (카톡 닉네임 → 사주 키) ===
// 예: { "최성훈": "seonghoon", "김건희": "geonhee", "DAWN": "dawn", ... }
export function mapSpeakers(messages, mapping) {
  return messages.map(m => ({ ...m, speakerId: mapping[m.speaker] || m.speaker }));
}

// === 메시지 청크 (시간대별 / 화자별 그룹화) ===
export function groupByDate(messages, granularity = "day") {
  const groups = {};
  for (const m of messages) {
    let key;
    if (granularity === "day") key = m.ts.toISOString().slice(0, 10);
    else if (granularity === "week") {
      const d = new Date(m.ts);
      d.setDate(d.getDate() - d.getDay());
      key = d.toISOString().slice(0, 10);
    } else if (granularity === "month") key = m.ts.toISOString().slice(0, 7);
    else if (granularity === "year") key = m.ts.toISOString().slice(0, 4);
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return groups;
}

export function groupBySpeaker(messages) {
  const groups = {};
  for (const m of messages) {
    if (!groups[m.speakerId || m.speaker]) groups[m.speakerId || m.speaker] = [];
    groups[m.speakerId || m.speaker].push(m);
  }
  return groups;
}
