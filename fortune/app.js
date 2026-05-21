// app.js - 메인 UI 컨트롤러
import { calculateSaju, CHEONGAN, CHEONGAN_KOR, JIJI, JIJI_KOR, STEM_OHAENG, BRANCH_OHAENG, ANIMALS } from "./core/saju.js";
import { interpretSaju } from "./core/interpret.js";
import { coinDivination, yarrowDivination, LINE_POSITIONS } from "./core/iching.js";
import { drawSpread, interpretCard, cardKey } from "./core/tarot.js";
import { analyzeGunghap } from "./core/gunghap.js";
import { calculateTojeong, lookupTojeong } from "./core/tojeong.js";
import { analyzeShinsal, checkSamjae, mudangSummary, dangsa } from "./core/mudang.js";
import { sajuToMBTI, bayesianFortune, extractSajuSignals, biorhythm, lifePathNumber, comprehensiveScore } from "./core/science.js";

// === 데이터 로드 ===
let DATA = {};
async function loadData() {
  const [basic, iching, tarot, tojeong, ilju, mudang, ddi] = await Promise.all([
    fetch("./data/saju_basic.json").then(r => r.json()),
    fetch("./data/iching64.json").then(r => r.json()),
    fetch("./data/tarot78.json").then(r => r.json()),
    fetch("./data/tojeong144.json").then(r => r.json()),
    fetch("./data/ilju60.json").then(r => r.json()),
    fetch("./data/korea_mudang.json").then(r => r.json()),
    fetch("./data/ddi_gunghap.json").then(r => r.json()),
  ]);
  DATA = { basic, iching, tarot, tojeong, ilju, mudang, ddi };
  // 오늘 날짜로 기본값 설정
  const today = new Date().toISOString().slice(0, 10);
  const tgt = document.getElementById("sc-target");
  if (tgt) tgt.value = today;
}
loadData();

// === 탭 ===
window.setTab = function(btn) {
  document.querySelectorAll(".tabbtn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
  document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
};

// === 오행 색상 클래스 ===
function ohaengClass(o) {
  return {"목":"mok","화":"hwa","토":"to","금":"geum","수":"su"}[o] || "";
}
function ohaengColor(o) {
  return {"목":"#22c55e","화":"#ef4444","토":"#eab308","금":"#e5e7eb","수":"#3b82f6"}[o];
}

// === 사주 계산 + 렌더링 ===
window.calcSaju = function() {
  const year = parseInt(document.getElementById("s-year").value);
  const month = parseInt(document.getElementById("s-month").value);
  const day = parseInt(document.getElementById("s-day").value);
  const hour = parseInt(document.getElementById("s-hour").value);
  const minute = parseInt(document.getElementById("s-min").value);
  const gender = document.getElementById("s-gender").value;
  const longitude = parseFloat(document.getElementById("s-lng").value);
  const useTrueSolarTime = document.getElementById("s-tst").value === "true";

  const wrap = document.getElementById("saju-result");
  wrap.innerHTML = '<div class="section"><div class="loading"><div class="spinner"></div><br>천기를 살피는 중...</div></div>';

  setTimeout(() => {
    try {
      const saju = calculateSaju({year, month, day, hour, minute, gender, longitude, useTrueSolarTime});
      const interp = interpretSaju(saju);
      wrap.innerHTML = renderSaju(saju, interp);
    } catch (e) {
      wrap.innerHTML = `<div class="section"><div class="result-text danger">오류: ${e.message}</div></div>`;
      console.error(e);
    }
  }, 50);
};

function renderSaju(s, interp) {
  const pillarOrder = ["year","month","day","hour"];
  const pillarLabels = {year:"년주", month:"월주", day:"일주(나)", hour:"시주"};
  const pillarsHtml = pillarOrder.map(p => {
    const pl = s.pillars[p];
    const sipsin = s.sipsin[p];
    const stemKor = CHEONGAN_KOR[pl.stem];
    const branchKor = JIJI_KOR[pl.branch];
    const stemHan = CHEONGAN[pl.stem];
    const branchHan = JIJI[pl.branch];
    const stemO = STEM_OHAENG[pl.stem];
    const branchO = BRANCH_OHAENG[pl.branch];
    return `
      <div class="pillar ${p==='day'?'day':''}">
        <div class="pillar-lab">${pillarLabels[p]}</div>
        <div class="pillar-stem ${ohaengClass(stemO)}">${stemHan}</div>
        <div class="pillar-branch ${ohaengClass(branchO)}">${branchHan}</div>
        <div class="pillar-sub">${stemKor}${branchKor}</div>
        <div class="pillar-sub" style="margin-top:2px;color:var(--gold2)">${sipsin.stem || "-"}</div>
      </div>`;
  }).join("");

  const ohMax = Math.max(...Object.values(s.ohaengCount), 1);
  const ohBarsHtml = ["목","화","토","금","수"].map(o => {
    const c = s.ohaengCount[o];
    const h = Math.max(6, (c / ohMax) * 36);
    return `<div class="oh-bar">
      <div class="oh-name">${o}</div>
      <div class="oh-fill" style="height:${h}px;background:${ohaengColor(o)};opacity:${c===0?'0.3':'1'}">${c}</div>
    </div>`;
  }).join("");

  // 형충회합 badges
  const badgesHtml = [
    ...s.relations.chung.map(r => `<span class="badge badge-chung">${r}</span>`),
    ...s.relations.hap.map(r => `<span class="badge badge-hap">${r}</span>`),
    ...s.relations.samhap.map(r => `<span class="badge badge-samhap">${r}</span>`),
  ].join("") || '<span style="color:var(--dim);font-size:12px">특별한 합충 없음</span>';

  // 대운 표
  const currentYear = new Date().getFullYear();
  const birthYear = s.input.year;
  const ageNow = currentYear - birthYear;
  const daewoonHtml = `
    <table class="daewoon-table">
      <thead><tr><th>나이</th><th>갑자</th><th>오행</th><th>십신</th></tr></thead>
      <tbody>
        ${s.daewoon.list.map(d => {
          const cur = (ageNow >= d.age && ageNow < d.age + 10) ? "daewoon-current" : "";
          return `<tr class="${cur}">
            <td>${d.age}~${d.age+9}</td>
            <td class="han">${d.gapja}</td>
            <td>${STEM_OHAENG[d.stem]}/${BRANCH_OHAENG[d.branch]}</td>
            <td>${d.sipsinStem||""}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;

  return `
    <div class="section">
      <div class="section-title">🌟 사주 원국 (${s.sajuYear}년 ${s.animal}띠)</div>
      <div class="pillars">${pillarsHtml}</div>
      <div style="font-size:11px;color:var(--dim);text-align:center;margin-top:6px">
        일간: <span class="han" style="color:var(--gold2);font-size:14px">${s.dayMaster.stemHan}(${s.dayMaster.stemKor})</span> · ${s.dayMaster.ohaeng} · ${s.dayMaster.yinyang}
      </div>
    </div>

    <div class="section">
      <div class="section-title">⚖ 오행 분포</div>
      <div class="ohaeng-bars">${ohBarsHtml}</div>
    </div>

    <div class="section">
      <div class="section-title">🔗 형충회합</div>
      <div class="badges">${badgesHtml}</div>
    </div>

    <div class="section">
      <div class="section-title">🌊 대운 (10년 주기)</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:8px">
        ${s.daewoon.startAge}세부터 ${s.daewoon.forward ? "순행" : "역행"} · 현재 ${ageNow}세
      </div>
      ${daewoonHtml}
    </div>

    <div class="section">
      <div class="section-title">📖 종합 해석</div>
      <div class="result-text">${interp.summary}</div>
    </div>
  `;
}

// === 주역 ===
window.castIching = function(method) {
  const q = document.getElementById("ic-q").value.trim();
  const wrap = document.getElementById("iching-result");
  wrap.innerHTML = '<div class="section"><div class="loading"><div class="spinner"></div><br>괘를 뽑는 중...</div></div>';
  setTimeout(() => {
    const res = method === "coin" ? coinDivination() : yarrowDivination();
    wrap.innerHTML = renderIching(res, q, method);
  }, 300);
};

function renderHexagramLines(lines) {
  // lines 위→아래로 표시 (상효가 위)
  return lines.slice().reverse().map(l => {
    if (l === 7) return '<div class="hex-line"></div>';
    if (l === 8) return '<div class="hex-line broken-old"></div>';
    if (l === 9) return '<div class="hex-line solid-old moving"></div>';
    if (l === 6) return '<div class="hex-line broken-old moving" style="background:var(--gold)"></div>';
    return '';
  }).join("");
}

function renderIching(res, question, method) {
  const hex = DATA.iching.hexagrams.find(h => h.n === res.primary.number);
  const sec = res.secondary ? DATA.iching.hexagrams.find(h => h.n === res.secondary.number) : null;

  const movingNote = res.movingLines.length > 0
    ? `<div style="margin-top:10px;color:var(--gold2);font-size:13px">⭐ 동효(動爻): ${res.movingLines.map(p => LINE_POSITIONS[p-1].name).join(", ")}</div>`
    : '<div style="margin-top:10px;color:var(--dim);font-size:12px">동효 없음 - 본괘로 해석</div>';

  return `
    <div class="section">
      <div class="section-title">📜 점법: ${method === 'coin' ? '동전점' : '시초점'}</div>
      ${question ? `<div style="font-size:13px;color:var(--dim);margin-bottom:6px">질문: <span style="color:var(--text)">${question}</span></div>` : ''}
      <div class="hexagram-row">
        <div class="hexagram-figure">
          ${renderHexagramLines(res.lines)}
          <div class="hex-symbol">${hex.sym}</div>
        </div>
      </div>
      <div class="hex-info">
        <div class="hex-name">${hex.han} (${hex.kor})</div>
        <div class="hex-num">제 ${hex.n}괘 · ${hex.upper}/${hex.lower}</div>
        <div class="hex-mean">${hex.mean}</div>
        <div class="hex-judgment">『 ${hex.judgment} 』</div>
        <div class="hex-fortune">${hex.fortune}</div>
      </div>
      ${movingNote}
    </div>

    ${sec ? `
    <div class="section">
      <div class="section-title">🔄 변괘 (변화의 방향)</div>
      <div class="hex-info">
        <div style="font-size:50px;color:var(--gold)">${sec.sym}</div>
        <div class="hex-name">${sec.han} (${sec.kor})</div>
        <div class="hex-num">제 ${sec.n}괘</div>
        <div class="hex-mean">${sec.mean}</div>
        <div class="hex-judgment">『 ${sec.judgment} 』</div>
        <div style="margin-top:8px;font-size:12px;color:var(--dim)">→ 본괘의 기운이 변괘 방향으로 흘러갑니다</div>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">💡 해석 가이드</div>
      <div class="result-text">${interpretIchingText(hex, sec, res)}</div>
    </div>
  `;
}

function interpretIchingText(hex, sec, res) {
  const parts = [];
  parts.push(`▣ ${hex.han}(${hex.kor})은 ${hex.mean}`);
  parts.push(`괘사(卦辭): ${hex.judgment}`);
  parts.push(`운세: ${hex.fortune}`);
  if (res.movingLines.length > 0) {
    parts.push(`\n▣ 동효 ${res.movingLines.length}개 - 변화의 시기`);
    res.movingLines.forEach(p => {
      const li = LINE_POSITIONS[p - 1];
      parts.push(`  · ${li.name}: ${li.role}`);
    });
  }
  if (sec) {
    parts.push(`\n▣ 변괘 ${sec.han}(${sec.kor})로 향함`);
    parts.push(`  ${sec.mean}`);
    parts.push(`  최종 흐름: ${sec.fortune}`);
  } else {
    parts.push(`\n▣ 동효 없으니 현재의 괘가 그대로 답.`);
  }
  return parts.join("\n");
}

// === 타로 ===
window.drawTarot = function() {
  const q = document.getElementById("t-q").value.trim();
  const spreadId = document.getElementById("t-spread").value;
  const spread = DATA.tarot.spreads.find(s => s.id === spreadId);
  const cards = drawSpread(spread.cards);

  const wrap = document.getElementById("tarot-result");
  const cardsHtml = cards.map((c, i) => {
    const interp = interpretCard(c, DATA.tarot);
    return `
      <div class="tarot-card ${c.reversed ? 'reversed' : ''}">
        <div class="tarot-pos">${spread.positions[i]}</div>
        <div class="tarot-name">${interp.name}</div>
        <div class="tarot-kor">${interp.kor}</div>
        <div class="tarot-text">${interp.text}</div>
        <span class="tarot-orient">${interp.orientation}</span>
      </div>
    `;
  }).join("");

  wrap.innerHTML = `
    <div class="section">
      <div class="section-title">🎴 ${spread.name}</div>
      ${q ? `<div style="font-size:13px;color:var(--dim);margin-bottom:10px">질문: <span style="color:var(--text)">${q}</span></div>` : ''}
      <div class="tarot-grid">${cardsHtml}</div>
      <div style="margin-top:14px;font-size:11px;color:var(--dim);text-align:center">
        💎 정방향 ${cards.filter(c => !c.reversed).length}장 · 역방향 ${cards.filter(c => c.reversed).length}장
      </div>
    </div>
  `;
};

// === 궁합 ===
window.calcGunghap = function() {
  const ga = {
    year: +document.getElementById("ga-y").value,
    month: +document.getElementById("ga-m").value,
    day: +document.getElementById("ga-d").value,
    hour: +document.getElementById("ga-h").value,
    gender: document.getElementById("ga-g").value,
  };
  const gb = {
    year: +document.getElementById("gb-y").value,
    month: +document.getElementById("gb-m").value,
    day: +document.getElementById("gb-d").value,
    hour: +document.getElementById("gb-h").value,
    gender: document.getElementById("gb-g").value,
  };

  const wrap = document.getElementById("gunghap-result");
  wrap.innerHTML = '<div class="section"><div class="loading"><div class="spinner"></div><br>두 사람의 인연을 살피는 중...</div></div>';

  setTimeout(() => {
    try {
      const sajuA = calculateSaju({...ga, minute: 0});
      const sajuB = calculateSaju({...gb, minute: 0});
      const result = analyzeGunghap(sajuA, sajuB);
      wrap.innerHTML = renderGunghap(sajuA, sajuB, result);
    } catch (e) {
      wrap.innerHTML = `<div class="section"><div class="result-text danger">${e.message}</div></div>`;
    }
  }, 50);
};

function renderGunghap(a, b, r) {
  return `
    <div class="section">
      <div class="section-title">💞 궁합 점수</div>
      <div class="compat-score">${r.total}점</div>
      <div class="compat-grade" style="color:${r.grade.color}">${r.grade.grade}급 - ${r.grade.text}</div>
      <div class="result-text" style="margin-top:14px">${r.summary}</div>
    </div>

    <div class="section">
      <div class="section-title">🔍 세부 분석</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        <div style="background:var(--card2);padding:12px;border-radius:9px">
          <div style="font-size:11px;color:var(--dim)">A 일간</div>
          <div class="han" style="font-size:22px;color:${ohaengColor(a.dayMaster.ohaeng)}">${a.dayMaster.stemHan}</div>
          <div style="font-size:11px;color:var(--dim)">${a.dayMaster.ohaeng}/${a.dayMaster.yinyang}</div>
        </div>
        <div style="background:var(--card2);padding:12px;border-radius:9px">
          <div style="font-size:11px;color:var(--dim)">B 일간</div>
          <div class="han" style="font-size:22px;color:${ohaengColor(b.dayMaster.ohaeng)}">${b.dayMaster.stemHan}</div>
          <div style="font-size:11px;color:var(--dim)">${b.dayMaster.ohaeng}/${b.dayMaster.yinyang}</div>
        </div>
      </div>
      <div class="result-text">▣ 일간 관계 (${r.dayOhaeng.score}점)
  ${r.dayOhaeng.type}: ${r.dayOhaeng.desc}

▣ 띠 관계 (${r.yearBranch.score}점)
  ${r.yearBranch.type}: ${r.yearBranch.desc}

▣ 일지(부부궁) 관계 (${r.dayBranch.score}점)
  ${r.dayBranch.type}: ${r.dayBranch.desc}

▣ 오행 보완도 (${r.complement.score}점)
  ${r.complement.desc}</div>
    </div>
  `;
}

// =========================================================
// === 무당점 (한국식 종합 해석) ===
// =========================================================
window.castMudang = function() {
  const year = +document.getElementById("m-year").value;
  const month = +document.getElementById("m-month").value;
  const day = +document.getElementById("m-day").value;
  const hour = +document.getElementById("m-hour").value;
  const gender = document.getElementById("m-gender").value;
  const longitude = +document.getElementById("m-lng").value;

  const wrap = document.getElementById("mudang-result");
  wrap.innerHTML = '<div class="section"><div class="loading"><div class="spinner"></div><br>신령님께 여쭙는 중...</div></div>';

  setTimeout(() => {
    try {
      const saju = calculateSaju({year, month, day, hour, gender, longitude});
      const shinsal = analyzeShinsal(saju);
      const currentYear = new Date().getFullYear();
      const samjae = checkSamjae(saju.pillars.year.branch, currentYear);
      const summary = mudangSummary(saju, shinsal, samjae, DATA.ilju, DATA.mudang, DATA.mudang.napeum_60);
      const dangsaResult = dangsa(saju, DATA.mudang);

      wrap.innerHTML = renderMudang(saju, shinsal, samjae, summary, dangsaResult);
    } catch (e) {
      wrap.innerHTML = `<div class="section"><div class="result-text danger">${e.message}</div></div>`;
      console.error(e);
    }
  }, 80);
};

function renderMudang(saju, shinsal, samjae, summary, dangsaResult) {
  // 신살 배지
  const shinsalBadges = shinsal.map(s => {
    const color = s.type === "길신" ? "#00e676" :
                  s.type === "흉살" ? "#ff5252" :
                  s.type === "길흉양면" ? "#ffd740" :
                  s.type === "관계살" ? "#ff7043" : "#8a7fa3";
    return `<span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${s.name}</span>`;
  }).join("") || '<span style="color:var(--dim);font-size:12px">특이 신살 없음 (평이한 사주)</span>';

  // 당사주
  const dangsaHtml = dangsaResult.map(d => `
    <div style="background:var(--card2);padding:10px;border-radius:8px;margin-bottom:6px">
      <div style="font-size:12px;color:var(--gold2);font-weight:600">${d.stage} (${d.ageRange})</div>
      <div class="han" style="font-size:14px;margin-top:2px">${d.starHan} · ${d.star}</div>
      <div style="font-size:12px;color:var(--dim);margin-top:2px">${d.desc}</div>
      <div style="font-size:12px;margin-top:4px">${d.fortune}</div>
    </div>
  `).join("");

  // 삼재 박스
  const samjaeBox = samjae.inSamjae ? `
    <div class="section" style="border-color:var(--red);background:rgba(255,82,82,.06)">
      <div class="section-title" style="color:var(--red)">⚠ 삼재 진행 중</div>
      <div style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:6px">${samjae.phase} (${samjae.startYear}~${samjae.endYear})</div>
      <div class="result-text">${DATA.mudang.samjae_relief[samjae.phase].mudang}</div>
    </div>
  ` : `
    <div class="section">
      <div class="section-title" style="color:var(--green)">✓ 삼재 없음</div>
      <div style="font-size:12px;color:var(--dim)">현재 삼재기가 아닙니다. 평안한 운기.</div>
    </div>
  `;

  return `
    <div class="section">
      <div class="section-title">🪔 ${saju.pillars.day.gapja} 일주 · ${saju.animal}띠</div>
      <div style="font-size:11px;color:var(--dim);text-align:center;margin-bottom:8px">납음: ${DATA.mudang.napeum_60.data[saju.pillars.day.gapja] || "-"}</div>
      <div class="result-text" style="white-space:pre-wrap">${summary}</div>
    </div>

    <div class="section">
      <div class="section-title">⭐ 신살(神煞) 자동 판별</div>
      <div class="badges">${shinsalBadges}</div>
    </div>

    ${samjaeBox}

    <div class="section">
      <div class="section-title">🎭 당사주 4단계 운세</div>
      ${dangsaHtml}
    </div>
  `;
}

// =========================================================
// === 삼재 체크 ===
// =========================================================
window.checkSamjaeFn = function() {
  const animal = +document.getElementById("sj-animal").value;
  const animalKor = ANIMALS[animal];
  const wrap = document.getElementById("samjae-result");
  const curYear = new Date().getFullYear();
  const years = [];
  for (let y = curYear - 1; y <= curYear + 5; y++) {
    const sj = checkSamjae(animal, y);
    years.push({year: y, ...sj});
  }
  const rows = years.map(y => {
    const isCur = y.year === curYear;
    let label = "-", color = "var(--dim)";
    if (y.inSamjae) {
      label = y.phase;
      color = y.phase === "중삼재" ? "#ff5252" : y.phase === "들삼재" ? "#ff9800" : "#ffd740";
    } else {
      label = "평년";
      color = "#00e676";
    }
    return `
      <div style="display:flex;justify-content:space-between;padding:10px;background:${isCur?'rgba(212,175,55,.1)':'var(--card2)'};border-radius:8px;margin-bottom:6px;${isCur?'border:1px solid var(--gold)':''}">
        <div style="font-weight:${isCur?'700':'500'}">${y.year}년 ${isCur?'(올해)':''}</div>
        <div style="color:${color};font-weight:700">${label}</div>
      </div>
    `;
  }).join("");

  // 액땜 처방
  const curSamjae = years.find(y => y.year === curYear);
  let prescription = "";
  if (curSamjae.inSamjae) {
    const relief = DATA.mudang.samjae_relief[curSamjae.phase];
    prescription = `
      <div class="section" style="border-color:var(--red);background:rgba(255,82,82,.06)">
        <div class="section-title" style="color:var(--red)">⚠ ${curSamjae.phase} 처방</div>
        <div class="result-text">▣ 기운: ${relief.energy}

▣ 주의사항:
${relief.caution.map(c => "  · " + c).join("\n")}

▣ 추천 부적: ${relief.bujeok.join(", ")}

▣ 조언:
${relief.advice}

▣ 무당 풀이:
${relief.mudang}</div>
      </div>
    `;
  }

  wrap.innerHTML = `
    <div class="section">
      <div class="section-title">${animalKor}띠 - ${curYear}년 기준 삼재 흐름</div>
      ${rows}
    </div>
    ${prescription}
  `;
};

// =========================================================
// === 과학 결합 분석 ===
// =========================================================
window.calcScience = function() {
  const year = +document.getElementById("sc-year").value;
  const month = +document.getElementById("sc-month").value;
  const day = +document.getElementById("sc-day").value;
  const hour = +document.getElementById("sc-hour").value;
  const gender = document.getElementById("sc-gender").value;
  const targetStr = document.getElementById("sc-target").value;
  const target = targetStr ? new Date(targetStr) : new Date();

  const wrap = document.getElementById("science-result");
  wrap.innerHTML = '<div class="section"><div class="loading"><div class="spinner"></div><br>과학적 분석 중...</div></div>';

  setTimeout(() => {
    try {
      const saju = calculateSaju({year, month, day, hour, gender});
      const mbti = sajuToMBTI(saju);
      const bio = biorhythm(year, month, day, target);
      const lp = lifePathNumber(year, month, day);
      const signals = extractSajuSignals(saju);
      const bayes = bayesianFortune(signals);
      const total = comprehensiveScore(saju, bio, lp, bayes);

      wrap.innerHTML = renderScience(saju, mbti, bio, lp, bayes, total);
      drawBioChart(bio);
    } catch (e) {
      wrap.innerHTML = `<div class="section"><div class="result-text danger">${e.message}</div></div>`;
      console.error(e);
    }
  }, 80);
};

function renderScience(saju, mbti, bio, lp, bayes, total) {
  // MBTI 게이지
  const mbtiBars = [
    ["E", "I"], ["N", "S"], ["T", "F"], ["J", "P"]
  ].map(([a, b]) => {
    const aVal = mbti.scores[a];
    return `
      <div style="margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
          <span>${a} ${aVal}%</span><span>${100 - aVal}% ${b}</span>
        </div>
        <div style="height:6px;background:var(--card2);border-radius:3px;overflow:hidden">
          <div style="width:${aVal}%;height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></div>
        </div>
      </div>
    `;
  }).join("");

  // 바이오리듬
  const bioBars = Object.entries(bio.cycles).map(([k, c]) => {
    const color = c.percent > 30 ? "#00e676" : c.percent < -30 ? "#ff5252" : "#ffd740";
    const w = Math.abs(c.percent);
    return `
      <div style="margin:8px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span>${c.label} (${c.period}일 주기)</span>
          <span style="color:${color};font-weight:700">${c.percent}% · ${c.phase}</span>
        </div>
        <div style="height:8px;background:var(--card2);border-radius:4px;position:relative;overflow:hidden">
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border)"></div>
          <div style="position:absolute;top:0;bottom:0;${c.percent>=0?'left:50%':'right:50%'};width:${w/2}%;background:${color};opacity:.7"></div>
        </div>
      </div>
    `;
  }).join("");

  // 베이지안
  const signalsHtml = bayes.signals.map(s => {
    const c = s.type === "positive" ? "#00e676" : "#ff5252";
    const sign = s.type === "positive" ? "+" : "−";
    return `<span class="badge" style="background:${c}22;color:${c}">${sign} ${s.label}</span>`;
  }).join("") || '<span style="color:var(--dim);font-size:12px">시그널 없음</span>';

  return `
    <div class="section">
      <div class="section-title">🧬 종합 점수</div>
      <div class="compat-score">${total.total}점</div>
      <div class="compat-grade" style="color:var(--gold2)">${total.grade}급</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;font-size:11px;text-align:center">
        <div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--dim)">사주</div><div style="font-size:18px;font-weight:700">${total.breakdown.saju}</div></div>
        <div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--dim)">바이오</div><div style="font-size:18px;font-weight:700">${total.breakdown.bio}</div></div>
        <div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--dim)">수비학</div><div style="font-size:18px;font-weight:700">${total.breakdown.lifePath}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🧠 사주 ⊕ MBTI 매핑</div>
      <div style="text-align:center;font-size:32px;font-weight:800;color:var(--gold2);margin:4px 0">${mbti.type}</div>
      <div style="text-align:center;font-size:12px;color:var(--dim);margin-bottom:10px">신뢰도 ${mbti.confidence}%</div>
      ${mbtiBars}
      <div style="font-size:12px;margin-top:10px;color:var(--text)">${mbti.description}</div>
      <div style="font-size:10px;color:var(--dim);margin-top:8px;font-style:italic">⚠ ${mbti.disclaimer}</div>
    </div>

    <div class="section">
      <div class="section-title">📊 베이지안 운세 확률</div>
      <div style="text-align:center;margin:8px 0">
        <div style="font-size:36px;font-weight:800;color:${bayes.probability >= 50 ? 'var(--green)' : 'var(--red)'}">
          ${bayes.probability}%
        </div>
        <div style="font-size:11px;color:var(--dim)">신뢰구간 ${bayes.confidenceInterval[0]}% ~ ${bayes.confidenceInterval[1]}%</div>
        <div style="font-size:13px;margin-top:6px;color:var(--gold2);font-weight:600">${bayes.interpretation}</div>
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--dim);margin-bottom:6px">검출 시그널 (${bayes.nSignals}개):</div>
      <div class="badges">${signalsHtml}</div>
    </div>

    <div class="section">
      <div class="section-title">🌊 바이오리듬 (${bio.targetDate} 기준)</div>
      ${bioBars}
      <canvas id="bio-chart" style="width:100%;height:120px;margin-top:14px"></canvas>
    </div>

    <div class="section">
      <div class="section-title">🔢 수비학 (Life Path Number)</div>
      <div style="text-align:center;font-size:48px;font-weight:800;color:var(--gold2);margin:10px 0">
        ${lp.lifePathNumber}${lp.isMaster ? ' ✨' : ''}
      </div>
      ${lp.isMaster ? '<div style="text-align:center;color:var(--gold);font-size:12px;margin-bottom:8px">★ 마스터 넘버 ★</div>' : ''}
      <div style="font-size:11px;color:var(--dim);text-align:center;margin-bottom:8px">
        ${lp.year} + ${lp.month} + ${lp.day} = ${lp.sum} → ${lp.lifePathNumber}
      </div>
      <div class="result-text">${lp.meaning}</div>
    </div>
  `;
}

function drawBioChart(bio) {
  const c = document.getElementById("bio-chart");
  if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const W = c.parentElement.clientWidth - 32;
  const H = 120;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + "px"; c.style.height = H + "px";
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // 0선
  const mid = H / 2;
  ctx.strokeStyle = "#2a2240";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
  ctx.setLineDash([]);

  // 오늘(offset=0) 선
  const todayX = (7 / 37) * W;
  ctx.strokeStyle = "rgba(212,175,55,.5)";
  ctx.beginPath();
  ctx.moveTo(todayX, 0); ctx.lineTo(todayX, H); ctx.stroke();

  // 4개 사이클
  const colors = { physical: "#ef4444", emotional: "#3b82f6", intellectual: "#22c55e", intuitive: "#d4af37" };
  for (const [k, col] of Object.entries(colors)) {
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    bio.trend.forEach((p, i) => {
      const x = (i / (bio.trend.length - 1)) * W;
      const y = mid - p[k] * (H / 2 - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

// === 토정비결 ===
window.calcTojeong = function() {
  const lunarYear = +document.getElementById("tj-y").value;
  const lunarMonth = +document.getElementById("tj-m").value;
  const lunarDay = +document.getElementById("tj-d").value;
  const age = +document.getElementById("tj-age").value;
  const isLeapMonth = document.getElementById("tj-leap").value === "true";

  const result = calculateTojeong({lunarYear, lunarMonth, lunarDay, isLeapMonth, age});
  const lookup = lookupTojeong(result, DATA.tojeong);

  const wrap = document.getElementById("tojeong-result");
  wrap.innerHTML = `
    <div class="section">
      <div class="section-title">📿 ${lookup.title}</div>
      <div style="font-size:11px;color:var(--dim);text-align:center;margin-bottom:14px">
        괘번호 ${result.hexNumber} (상괘 ${result.sang} · 중괘 ${result.jung} · 하괘 ${result.ha})
      </div>
      <div class="result-text">▣ 총운
${lookup.main}

▣ 월별 흐름
${lookup.monthly}

▣ 주의사항
${lookup.caution}</div>
    </div>
  `;
};
