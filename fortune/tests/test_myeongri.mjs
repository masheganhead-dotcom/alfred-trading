// 정통 명리학 모듈 테스트 (격국·용신·시기·궁성)
import { calculateSaju } from "../core/saju.js";
import { determineYongsin, calculateStrength } from "../core/yongsin.js";
import { determineGeokguk } from "../core/geokguk.js";
import { analyzeYear, predictNextYears, predictLifeEvents, analyzeGungseong } from "../core/sigi.js";

let pass = 0, fail = 0;
function check(name, cond, note = "") {
  const m = cond ? "✓" : "✗";
  const c = cond ? "\x1b[32m" : "\x1b[31m";
  console.log(`${c}${m}\x1b[0m ${name}${note ? "  ─ " + note : ""}`);
  if (cond) pass++; else fail++;
}

console.log("\n── 신강/신약 + 용신 테스트 ──");
const saju = calculateSaju({year:1990, month:5, day:15, hour:12, gender:"M"});

const strength = calculateStrength(saju);
check("신강/신약 점수 0~100", strength.score >= 0 && strength.score <= 100, `${strength.score}점 (${strength.grade})`);
check("등급 분류 정상", ["신왕(身旺)","신강(身強)","중화(中和)","신약(身弱)","극신약(極身弱)"].includes(strength.grade));

const yongsin = determineYongsin(saju);
check("용신 4종 모두 산출", yongsin.eokbu && yongsin.johu !== undefined && yongsin.tongkwan !== undefined && yongsin.byeongyak !== undefined);
check("주(主) 용신 선택", yongsin.primary.method && yongsin.primary.ohaeng, `${yongsin.primary.method} = ${yongsin.primary.ohaeng}`);
check("처방(직업·색·방향) 포함", yongsin.primary.prescription && yongsin.primary.prescription.color);
check("기신(忌神) 산출", yongsin.gisin, `기신: ${yongsin.gisin}`);

console.log("\n── 격국 테스트 ──");
const geokguk = determineGeokguk(saju, strength);
check("격국명 산출", geokguk.name.includes("격"), geokguk.name);
check("격국 타입 (정격/외격)", ["정격(正格)","외격(從格)"].includes(geokguk.type), geokguk.type);
check("직업 추천 존재", geokguk.career.length > 0);
check("명리 노트 존재", geokguk.note.length > 0);

console.log("\n── 시기 예측 테스트 ──");
const yearRes = analyzeYear(saju, 2025, "M");
check("세운 분석 결과 구조", "year" in yearRes && "events" in yearRes && "score" in yearRes);
check("세운 점수 0~100", yearRes.score >= 0 && yearRes.score <= 100, `2025년: ${yearRes.score}점 (${yearRes.yearGapja})`);

const next10 = predictNextYears(saju, 2025, 10, "M");
check("향후 10년 예측", next10.length === 10);
check("각 연도 다른 갑자", new Set(next10.map(y => y.yearGapja)).size === 10);

const life = predictLifeEvents(saju, 2025, "M");
check("인생 이벤트 5종 키 존재", "marriage" in life && "wealth" in life && "promotion" in life);

console.log("\n── 궁성·육친 테스트 ──");
const gung = analyzeGungseong(saju);
check("4궁 모두 산출", "year" in gung && "month" in gung && "day" in gung && "hour" in gung);
check("부모궁(年柱) 조언 존재", gung.year.advice.length > 0, gung.year.advice.slice(0, 30) + "...");
check("부부궁(日柱) 조언 존재", gung.day.advice.length > 0, gung.day.advice.slice(0, 30) + "...");

console.log("\n── 검증 케이스: 다양한 사주 ──");
// 신강한 사주 예
const strongSaju = calculateSaju({year:1986, month:3, day:1, hour:6, useTrueSolarTime:false});
const strongStrength = calculateStrength(strongSaju);
const strongYongsin = determineYongsin(strongSaju);
check("케이스1: 신강사주 점수 산출", strongStrength.score > 0, `${strongStrength.grade}(${strongStrength.score})`);
check("케이스1: 용신 결정", strongYongsin.primary.ohaeng !== null);

const strongGeok = determineGeokguk(strongSaju, strongStrength);
check("케이스1: 격국 결정", strongGeok.name.length > 0, strongGeok.name);

// 신약한 사주 예
const weakSaju = calculateSaju({year:1995, month:11, day:30, hour:0, useTrueSolarTime:false});
const weakYongsin = determineYongsin(weakSaju);
check("케이스2: 신약사주 처리", weakYongsin.primary.method !== null);

console.log(`\n총 ${pass + fail}개 중 \x1b[32m${pass} PASS\x1b[0m / \x1b[${fail > 0 ? '31' : '90'}m${fail} FAIL\x1b[0m`);
process.exit(fail > 0 ? 1 : 0);
