// era.js - 역사·시대·국가 사주 분석 모듈
//
// 우리의 사주 산출 알고리즘을 역사적 인물·국가 건국일·60갑자 시대 사이클에 적용.
// 패턴 분석 + 시대 인사이트.
//
// 핵심 기능:
//   1. 역사적 인물·국가 사주 자동 산출 (출생/건국일 → 4기둥)
//   2. 60갑자 시대 사이클 분석 (60년·120년·180년 주기)
//   3. 사용자 사주 ↔ 시대 흐름 결합 (어느 대운에 어떤 시대를 살았나)
//   4. 두 시점의 갑자 비교 (예: 1966 병오 vs 2026 병오)

import { calculateSaju, CHEONGAN, JIJI, gapja } from "./saju.js";

// === 연도 → 60갑자 (간략) ===
export function yearToGapja(year) {
  const idx = ((year - 4) % 60 + 60) % 60;
  const g = gapja(idx);
  return {
    idx,
    stem: g.stem,
    branch: g.branch,
    gapja: CHEONGAN[g.stem] + JIJI[g.branch],
  };
}

// === 60년 주기 동일 갑자 연도들 찾기 ===
// 어떤 해의 갑자가 어느 해에 다시 반복되는가
export function find60YearCycles(targetYear, range = 240) {
  const tgt = yearToGapja(targetYear);
  const cycles = [];
  for (let y = targetYear - range; y <= targetYear + range; y += 60) {
    if (y === targetYear) continue;
    cycles.push({ year: y, gapja: yearToGapja(y).gapja });
  }
  return { targetGapja: tgt.gapja, cycles };
}

// === 역사적 인물 사주 일괄 산출 ===
export function analyzeHistoricalFigures(figures, options = {}) {
  return figures.map(f => {
    const params = {
      year: f.year, month: f.month, day: f.day,
      hour: f.hour !== null && f.hour !== undefined ? f.hour : 12,
      minute: f.minute || 0,
      gender: f.gender || "M",
      useTrueSolarTime: options.useTST || false,
      longitude: options.longitude || 127.0,
    };
    try {
      const saju = calculateSaju(params);
      return {
        ...f,
        gapja_year: saju.pillars.year.gapja,
        gapja_month: saju.pillars.month.gapja,
        gapja_day: saju.pillars.day.gapja,
        gapja_hour: f.hour !== null ? saju.pillars.hour.gapja : "??",
        dayMaster: saju.dayMaster.stemHan,
        animal: saju.animal,
        ohaeng: saju.ohaengCount,
        relations: saju.relations,
      };
    } catch (e) {
      return { ...f, error: e.message };
    }
  });
}

// === 두 사주 간 공통 패턴 추출 ===
// 같은 분야 인물들(예: 예술가, 정치가, 사업가)이 공통으로 가진 사주 특징
export function findCommonPatterns(figures) {
  const dayMasters = {};
  const animals = {};
  const ohaengAvg = { 목:0, 화:0, 토:0, 금:0, 수:0 };

  figures.forEach(f => {
    dayMasters[f.dayMaster] = (dayMasters[f.dayMaster] || 0) + 1;
    animals[f.animal] = (animals[f.animal] || 0) + 1;
    if (f.ohaeng) {
      for (const k of ["목","화","토","금","수"]) {
        ohaengAvg[k] += (f.ohaeng[k] || 0);
      }
    }
  });

  for (const k of Object.keys(ohaengAvg)) ohaengAvg[k] = (ohaengAvg[k] / figures.length).toFixed(2);

  return {
    sample: figures.length,
    dayMasters: Object.entries(dayMasters).sort((a,b)=>b[1]-a[1]),
    animals: Object.entries(animals).sort((a,b)=>b[1]-a[1]),
    ohaengAvg,
  };
}

// === 시대 사이클 분석: 갑자가 같은 두 시점 비교 ===
export function compareTwoEras(year1, year2) {
  const g1 = yearToGapja(year1);
  const g2 = yearToGapja(year2);
  return {
    year1, year2,
    diff: year2 - year1,
    gapja1: g1.gapja,
    gapja2: g2.gapja,
    sameGapja: g1.gapja === g2.gapja,
    cyclesBetween: Math.abs(year2 - year1) / 60,
  };
}

// === 사용자 사주 ↔ 시대 흐름 결합 ===
// 사용자의 대운 시기와 그 시기의 한국·세계 사건을 매칭
export function combinePersonalAndEra(userSaju, eraData) {
  if (!userSaju.daewoon || !userSaju.daewoon.list) return null;
  const birthYear = userSaju.input.year;
  return userSaju.daewoon.list.map(d => {
    const startYear = birthYear + d.age;
    const endYear = startYear + 9;
    const era = eraData.korean_eras.find(e => startYear >= e.start && startYear <= e.end);
    return {
      ageRange: `${d.age}~${d.age + 9}세`,
      yearRange: `${startYear}~${endYear}`,
      daewoonGapja: d.gapja,
      daewoonSipsin: d.sipsinStem,
      eraName: era?.name || "?",
      eraNote: era?.note || "",
    };
  });
}

// === 갑자 별 시대 키워드 (정통 명리 + 역사 패턴) ===
export const GAPJA_ERA_KEYWORDS = {
  "甲子":"새 시작·창조의 60년",
  "乙丑":"인내·축적의 시기",
  "丙寅":"확장·진취의 시기",
  "丁卯":"문화·예술 융성",
  "戊辰":"안정·보수화",
  "己巳":"지혜·신중함",
  "庚午":"개혁·격동",
  "辛未":"세련·완성",
  "壬申":"지혜·민첩",
  "癸酉":"예리·정밀",
  "甲戌":"보수·전통 회귀",
  "乙亥":"학문·인문",
  "丙子":"표면 밝음·내적 갈등",
  "丁丑":"섬세·인내",
  "戊寅":"강력한 리더십·산업화",
  "己卯":"부드러운 변화",
  "庚辰":"결단·전쟁·강제 통합",
  "辛巳":"정련·법치",
  "壬午":"격동·변동기",
  "癸未":"화개·정신문화",
  "甲申":"기술·기계·도구 혁명",
  "乙酉":"세공·정밀산업",
  "丙戌":"권위·전문가 시대",
  "丁亥":"학문·예술·문화",
  "戊子":"보수적 안정·재물 축적",
  "己丑":"실용·꾸준함",
  "庚寅":"강력한 변화·국제화",
  "辛卯":"문화·미·예술",
  "壬辰":"권력·카리스마 리더",
  "癸巳":"지혜·전략",
  "甲午":"열정·확장·인기",
  "乙未":"예술·종교·문화",
  "丙申":"기술·재능 발현",
  "丁酉":"정밀·완벽주의",
  "戊戌":"강건·외로움·고집",
  "己亥":"학문·교육",
  "庚子":"민첩·소통·지혜",
  "辛丑":"세련·정밀·인내",
  "壬寅":"확장·진취·해외",
  "癸卯":"예술·섬세",
  "甲辰":"용기·도전·격변",
  "乙巳":"화려·총명",
  "丙午":"폭발적 발산·정점·인기",
  "丁未":"예술·문화·종교",
  "戊申":"안정 속 발전·기술",
  "己酉":"실용·정밀",
  "庚戌":"권위·정의·강건",
  "辛亥":"지혜·예술",
  "壬子":"총명·도화·인기",
  "癸丑":"신비·종교",
  "甲寅":"용맹·진취·리더",
  "乙卯":"예술·인기",
  "丙辰":"안정·풍요",
  "丁巳":"명민·집중",
  "戊午":"강렬·열정",
  "己未":"예술·종교·풍요",
  "庚申":"의리·기술·결단",
  "辛酉":"완벽·정밀",
  "壬戌":"강건·고독",
  "癸亥":"지혜·외로움",
};
