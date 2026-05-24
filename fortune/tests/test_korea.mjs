// 한국 빅데이터 + 과학 모듈 통합 테스트
import { calculateSaju } from "../core/saju.js";
import { analyzeShinsal, checkSamjae, dangsa, mudangSummary } from "../core/mudang.js";
import { sajuToMBTI, bayesianFortune, extractSajuSignals, biorhythm, lifePathNumber, comprehensiveScore } from "../core/science.js";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const ilju = JSON.parse(fs.readFileSync(root + "data/ilju60.json"));
const mudang = JSON.parse(fs.readFileSync(root + "data/korea_mudang.json"));
const ddi = JSON.parse(fs.readFileSync(root + "data/ddi_gunghap.json"));

let pass = 0, fail = 0;
function check(name, cond, note = "") {
  const mark = cond ? "✓" : "✗";
  const color = cond ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${mark}\x1b[0m ${name}${note ? "  ─ " + note : ""}`);
  if (cond) pass++; else fail++;
}

console.log("\n── 한국 무당 시스템 테스트 ──");

const saju = calculateSaju({year:1990, month:5, day:15, hour:12, gender:"M"});

// 60일주 데이터
check("60일주 데이터 60개 로드", Object.keys(ilju.data).length === 60);
const myIlju = ilju.data[saju.pillars.day.gapja];
check("내 일주 해석 존재", !!myIlju, `${saju.pillars.day.gapja} → ${myIlju?.kor}: ${myIlju?.mudang?.slice(0, 30)}...`);

// 띠궁합 매트릭스
check("12x12 띠궁합 매트릭스 144개", Object.keys(ddi.matrix).length === 12 && Object.keys(ddi.matrix["쥐"]).length === 12);
check("천생연분: 쥐↔소", ddi.matrix["쥐"]["소"].score >= 90, `${ddi.matrix["쥐"]["소"].score}점`);
check("원진살: 쥐↔양 점수 낮음", ddi.matrix["쥐"]["양"].score <= 35, `${ddi.matrix["쥐"]["양"].score}점`);

// 신살 자동 판별
const shinsal = analyzeShinsal(saju);
check("신살 판별 동작", Array.isArray(shinsal), `검출: ${shinsal.length}개 (${shinsal.map(s => s.name).join(", ")})`);

// 삼재
const sj = checkSamjae(saju.pillars.year.branch, 2025);
check("삼재 판별 동작", "inSamjae" in sj, sj.inSamjae ? `${sj.phase}` : "평년");

// 당사주
const ds = dangsa(saju, mudang);
check("당사주 4단계 산출", ds.length === 4, ds.map(d => `${d.stage}=${d.star}`).join(", "));

// 무당식 종합 해석
const summary = mudangSummary(saju, shinsal, sj, ilju, mudang, mudang.napeum_60);
check("무당식 종합 해석 생성", summary.length > 200 && summary.includes("일주"), `${summary.length}자`);

// 납음
const napeum = mudang.napeum_60.data[saju.pillars.day.gapja];
check("납음오행 매핑", !!napeum, `${saju.pillars.day.gapja} → ${napeum}`);

console.log("\n── 과학 결합 모듈 테스트 ──");

// MBTI
const mbti = sajuToMBTI(saju);
check("MBTI 16유형 산출", /^[EI][NS][TF][JP]$/.test(mbti.type), `${mbti.type} (신뢰도 ${mbti.confidence}%)`);
check("MBTI 점수 0~100", Object.values(mbti.scores).every(v => v >= 0 && v <= 100));

// 베이지안
const signals = extractSajuSignals(saju);
const bayes = bayesianFortune(signals);
check("베이지안 확률 0~100", bayes.probability >= 0 && bayes.probability <= 100, `${bayes.probability}% (${bayes.nSignals}개 시그널)`);

// 바이오리듬
const bio = biorhythm(1990, 5, 15);
check("바이오리듬 4사이클", Object.keys(bio.cycles).length === 4);
check("바이오리듬 trend 38일", bio.trend.length === 38);
const bioVals = Object.values(bio.cycles);
check("바이오리듬 값 -1~1 범위", bioVals.every(c => c.value >= -1 && c.value <= 1));

// 수비학
const lp = lifePathNumber(1990, 5, 15);
check("Life Path Number 1~9 또는 마스터", [1,2,3,4,5,6,7,8,9,11,22,33].includes(lp.lifePathNumber), `LP=${lp.lifePathNumber}`);

// 알려진 케이스: 1990-5-15 → 1+9+9+0=19→10→1, 5, 1+5=6, 합 1+5+6=12→3
const lpCheck = lifePathNumber(1990, 5, 15);
check("LP 산출 검증 (1990-5-15 → 3)", lpCheck.lifePathNumber === 3, `LP=${lpCheck.lifePathNumber}`);

// 마스터 넘버
const lpMaster = lifePathNumber(1992, 11, 11);
check("마스터 넘버 감지 가능", typeof lpMaster.isMaster === "boolean");

// 종합 점수
const total = comprehensiveScore(saju, bio, lp, bayes);
check("종합 점수 0~100", total.total >= 0 && total.total <= 100, `${total.total}점 (${total.grade}급)`);

console.log(`\n총 ${pass + fail}개 중 \x1b[32m${pass} PASS\x1b[0m / \x1b[${fail > 0 ? '31' : '90'}m${fail} FAIL\x1b[0m`);
process.exit(fail > 0 ? 1 : 0);
