// app.js - 메인 UI 컨트롤러
import { calculateSaju, CHEONGAN, CHEONGAN_KOR, JIJI, JIJI_KOR, STEM_OHAENG, BRANCH_OHAENG } from "./core/saju.js";
import { interpretSaju } from "./core/interpret.js";
import { coinDivination, yarrowDivination, LINE_POSITIONS } from "./core/iching.js";
import { drawSpread, interpretCard, cardKey } from "./core/tarot.js";
import { analyzeGunghap } from "./core/gunghap.js";
import { calculateTojeong, lookupTojeong } from "./core/tojeong.js";

// === 데이터 로드 ===
let DATA = {};
async function loadData() {
  const [basic, iching, tarot, tojeong] = await Promise.all([
    fetch("./data/saju_basic.json").then(r => r.json()),
    fetch("./data/iching64.json").then(r => r.json()),
    fetch("./data/tarot78.json").then(r => r.json()),
    fetch("./data/tojeong144.json").then(r => r.json()),
  ]);
  DATA = { basic, iching, tarot, tojeong };
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
