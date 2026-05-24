// interpret.js
// 사주 결과 → 한국어 종합 해석 엔진
//
// 도입 참고:
//   - cantian-ai/bazi-mcp : 십신·길흉신·대운 해석 구조
//   - 사주 고전: 자평진전, 적천수, 궁통보감

import { CHEONGAN_KOR, JIJI_KOR, STEM_OHAENG, BRANCH_OHAENG } from "./saju.js";

// 일간 성격 (60갑자 일간 기준 키워드)
const DAY_MASTER_PROFILES = {
  "갑": "큰 나무처럼 강직하고 리더십이 있으며 위로 뻗어가려는 성향. 정직·자존심·우직함. 단점은 융통성 부족·고집.",
  "을": "화초·덩굴 같은 유연함. 실속·끈기·생활력. 부드러움 속 강함. 단점은 의존성·우유부단.",
  "병": "태양처럼 밝고 열정적·표현력 풍부. 사교성·낙천성. 단점은 변덕·과시·말 많음.",
  "정": "촛불·등불 같은 섬세함과 집중력. 예술성·신중함·정신적 깊이. 단점은 예민·자기연민.",
  "무": "큰 산·대지의 중후함. 신뢰·포용·중재자 기질. 단점은 둔감·고집·움직임 적음.",
  "기": "전답의 자애로움. 실용·조화·꾸준함·이타심. 단점은 우유부단·소심.",
  "경": "원광석·도끼의 강건함. 의리·결단·개혁성. 단점은 무뚝뚝·공격적·고집.",
  "신": "보석의 정제됨. 예민·미적 감각·자존심·완벽주의. 단점은 까칠·자기중심.",
  "임": "큰 강·바다의 포용. 지혜·총명·유동성·도량. 단점은 산만·게으름·변덕.",
  "계": "이슬의 청순. 직관·감수성·예지력·세심. 단점은 우울·비관·소심.",
};

// 십신별 운명 키워드
const SIPSIN_LIFE = {
  "비견": "독립적이며 형제·동료가 많음. 동업·경쟁 분야 적합.",
  "겁재": "추진력 강하나 재물 분탈 주의. 승부사 기질.",
  "식신": "여유롭고 표현력 좋음. 먹복·연구·예술에 길.",
  "상관": "재능·언변 출중하나 명예 손상 주의. 자유로운 직업.",
  "편재": "유동재·사업·인기 운. 큰돈을 만지나 새기 쉬움.",
  "정재": "근면·정직·신용. 안정된 수입·결혼 운 좋음.",
  "편관": "권력·압박·시련. 카리스마. 무관·법조·격투 분야.",
  "정관": "명예·관직·책임. 공직·대기업·정통 직업에 길.",
  "편인": "직관·종교·신비. 비주류 학문·예술·역술.",
  "정인": "학문·자격·후원. 인덕 좋고 모친 도움. 교육·연구.",
};

// 오행 부족·과다 조언
function analyzeOhaengBalance(count) {
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const avg = total / 5;
  const findings = [];
  const colors = { "목": "청록색", "화": "붉은색", "토": "노란색·황토색", "금": "흰색", "수": "검정·짙은 파랑" };
  const dirs = { "목": "동쪽", "화": "남쪽", "토": "중앙", "금": "서쪽", "수": "북쪽" };
  for (const [e, c] of Object.entries(count)) {
    if (c === 0) findings.push({type: "결핍", ohaeng: e, text: `${e}이 전혀 없음 - ${colors[e]} 옷·소품, ${dirs[e]} 방향이 도움.`});
    else if (c >= 4) findings.push({type: "과다", ohaeng: e, text: `${e}이 과다 (${c}개) - 반대 오행으로 균형 필요.`});
  }
  return findings;
}

export function interpretSaju(saju) {
  const dayKor = saju.dayMaster.stemKor;
  const profile = DAY_MASTER_PROFILES[dayKor];
  const ohaengBalance = analyzeOhaengBalance(saju.ohaengCount);

  // 십신 카운팅
  const sipsinCount = {};
  for (const p of ["year","month","hour"]) {
    const s = saju.sipsin[p].stem;
    if (s && SIPSIN_LIFE[s]) sipsinCount[s] = (sipsinCount[s] || 0) + 1;
  }
  // 가장 두드러진 십신
  const topSipsin = Object.entries(sipsinCount).sort((a, b) => b[1] - a[1])[0];

  // 종합 해석 문장
  const summary = [];
  summary.push(`▣ 일간 ${saju.dayMaster.stemHan}(${dayKor}) - ${saju.dayMaster.ohaeng}/${saju.dayMaster.yinyang}`);
  summary.push(profile);

  if (topSipsin) {
    summary.push(`\n▣ 가장 두드러진 십신: ${topSipsin[0]} (${topSipsin[1]}개)`);
    summary.push(SIPSIN_LIFE[topSipsin[0]]);
  }

  summary.push(`\n▣ 오행 분포: ${Object.entries(saju.ohaengCount).map(([k,v]) => `${k}${v}`).join(" / ")}`);
  for (const f of ohaengBalance) summary.push(`  · ${f.text}`);

  // 형충회합
  if (saju.relations.chung.length > 0) summary.push(`\n▣ 충(沖): ${saju.relations.chung.join(", ")} - 변동·격동·이별의 기운`);
  if (saju.relations.hap.length > 0) summary.push(`▣ 합(合): ${saju.relations.hap.join(", ")} - 화합·결속의 기운`);
  if (saju.relations.samhap.length > 0) summary.push(`▣ 삼합(三合): ${saju.relations.samhap.join(", ")} - 큰 세력의 결집`);

  // 띠
  summary.push(`\n▣ 띠: ${saju.animal}띠 (${JIJI_KOR[saju.pillars.year.branch]}년생)`);

  // 대운 흐름 요약
  summary.push(`\n▣ 대운 시작: ${saju.daewoon.startAge}세부터 ${saju.daewoon.forward ? "순행" : "역행"}`);
  summary.push(`  현재 30년 추세: ${saju.daewoon.list.slice(0, 3).map(d => `${d.age}세[${d.gapja}]`).join(" → ")}`);

  return {
    profile,
    topSipsin: topSipsin ? topSipsin[0] : null,
    ohaengBalance,
    summary: summary.join("\n"),
  };
}
