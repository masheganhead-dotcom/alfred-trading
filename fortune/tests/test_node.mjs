// test_node.mjs - Node.js 환경에서 JS 엔진 직접 테스트
// 실행: node tests/test_node.mjs

import { calculateSaju, CHEONGAN, JIJI } from "../core/saju.js";
import { coinDivination, linesToHexagram } from "../core/iching.js";
import { drawSpread, buildDeck } from "../core/tarot.js";
import { analyzeGunghap } from "../core/gunghap.js";
import { calculateTojeong } from "../core/tojeong.js";

let pass = 0, fail = 0;

function check(name, cond, note = "") {
  const mark = cond ? "✓ PASS" : "✗ FAIL";
  const color = cond ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${mark}\x1b[0m ${name}${note ? "  ─ " + note : ""}`);
  if (cond) pass++; else fail++;
}

// ===== 사주 =====
console.log("\n── 사주 엔진 테스트 ──");

let s = calculateSaju({year: 2024, month: 1, day: 1, hour: 12, useTrueSolarTime: false});
check("2024-01-01 12:00 → 계묘년 (입춘 전)",
  s.pillars.year.gapja === "癸卯" && s.sajuYear === 2023,
  `${s.pillars.year.gapja} / ${s.sajuYear}`);

s = calculateSaju({year: 2024, month: 2, day: 5, hour: 12, useTrueSolarTime: false});
check("2024-02-05 12:00 → 갑진년 (입춘 후)",
  s.pillars.year.gapja === "甲辰",
  s.pillars.year.gapja);

s = calculateSaju({year: 1990, month: 5, day: 15, hour: 12, gender: "M"});
const four = s.pillars.year.gapja + s.pillars.month.gapja + s.pillars.day.gapja + s.pillars.hour.gapja;
check("1990-05-15 12:00 진태양시 → 庚午辛巳丙午甲午",
  four === "庚午辛巳丙午甲午", four);

s = calculateSaju({year: 2024, month: 6, day: 15, hour: 23, minute: 30, useTrueSolarTime: false});
check("자시 처리: 23:30 → 자시", s.pillars.hour.branch === 0,
  `시지=${JIJI[s.pillars.hour.branch]}`);

s = calculateSaju({year: 1990, month: 5, day: 15, hour: 12, useTrueSolarTime: false});
const ohTotal = Object.values(s.ohaengCount).reduce((a, b) => a + b, 0);
check("오행 분포 합계 = 8", ohTotal === 8, `${ohTotal} (${JSON.stringify(s.ohaengCount)})`);

s = calculateSaju({year: 1990, month: 5, day: 15, hour: 12, gender: "M"});
check("대운 10개 산출",
  s.daewoon.list.length === 10,
  `시작 ${s.daewoon.startAge}세, ${s.daewoon.forward?"순행":"역행"}`);

// 양남 갑년 → 순행
s = calculateSaju({year: 1984, month: 6, day: 1, hour: 12, gender: "M", useTrueSolarTime: false});
check("양남 1984(甲子)년 → 대운 순행", s.daewoon.forward, `forward=${s.daewoon.forward}`);

// 음녀 신년 → 순행 (양남·음녀 순행 규칙)
s = calculateSaju({year: 1971, month: 6, day: 1, hour: 12, gender: "F", useTrueSolarTime: false});
check("음녀 1971(辛亥)년 → 대운 순행", s.daewoon.forward, `forward=${s.daewoon.forward}`);

// 양녀 갑년 → 역행
s = calculateSaju({year: 1984, month: 6, day: 1, hour: 12, gender: "F", useTrueSolarTime: false});
check("양녀 1984(甲子)년 → 대운 역행", !s.daewoon.forward, `forward=${s.daewoon.forward}`);

// 음남 신년 → 역행
s = calculateSaju({year: 1971, month: 6, day: 1, hour: 12, gender: "M", useTrueSolarTime: false});
check("음남 1971(辛亥)년 → 대운 역행", !s.daewoon.forward, `forward=${s.daewoon.forward}`);

// ===== 주역 =====
console.log("\n── 주역 엔진 테스트 ──");
const ich = coinDivination();
check("동전점 6효 산출", ich.lines.length === 6);
check("괘번호 1~64 범위", ich.primary.number >= 1 && ich.primary.number <= 64,
  `n=${ich.primary.number}`);
check("효 값 6/7/8/9 중 하나",
  ich.lines.every(l => [6,7,8,9].includes(l)),
  ich.lines.join(","));

// 알려진 괘 검증: 모두 양효(7) → 1번 乾爲天
const r1 = linesToHexagram([7,7,7,7,7,7]);
check("6효 모두 양 → 1번 건위천", r1.number === 1, `n=${r1.number}`);
const r2 = linesToHexagram([8,8,8,8,8,8]);
check("6효 모두 음 → 2번 곤위지", r2.number === 2, `n=${r2.number}`);

// ===== 타로 =====
console.log("\n── 타로 엔진 테스트 ──");
const deck = buildDeck();
check("덱 78장", deck.length === 78);
const tarot3 = drawSpread(3);
check("3장 스프레드", tarot3.length === 3);
const tarot10 = drawSpread(10);
check("10장 켈틱 크로스", tarot10.length === 10);
// 중복 없음 검증
const keys = tarot10.map(c => c.type === "major" ? `M${c.n}` : `${c.suit}_${c.rank}`);
check("스프레드 카드 중복 없음", new Set(keys).size === keys.length);

// ===== 궁합 =====
console.log("\n── 궁합 엔진 테스트 ──");
const sA = calculateSaju({year: 1990, month: 3, day: 20, hour: 10, gender: "M"});
const sB = calculateSaju({year: 1992, month: 7, day: 11, hour: 14, gender: "F"});
const gh = analyzeGunghap(sA, sB);
check("궁합 점수 0~100", gh.total >= 0 && gh.total <= 100, `${gh.total} (${gh.grade.grade})`);
check("궁합 4개 차원 분석", gh.dayOhaeng && gh.yearBranch && gh.dayBranch && gh.complement);

// ===== 토정비결 =====
console.log("\n── 토정비결 엔진 테스트 ──");
const tj = calculateTojeong({lunarYear: 1990, lunarMonth: 3, lunarDay: 15, age: 35});
check("토정 괘 산출 (상중하)",
  tj.sang >= 1 && tj.sang <= 8 && tj.jung >= 1 && tj.jung <= 6 && tj.ha >= 1 && tj.ha <= 3,
  `${tj.sang}-${tj.jung}-${tj.ha} (${tj.key})`);

// ===== 결과 =====
console.log(`\n총 ${pass + fail}개 중 \x1b[32m${pass} PASS\x1b[0m / \x1b[${fail > 0 ? '31' : '90'}m${fail} FAIL\x1b[0m`);
process.exit(fail > 0 ? 1 : 0);
