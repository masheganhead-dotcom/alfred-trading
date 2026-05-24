// mudang.js
// 한국 무당식 종합 해석 엔진
//
// 통합 기능:
//  - 신살 자동 판별 (천을귀인·문창·도화·역마·화개·양인·백호·괴강·원진·귀문관·양차·급각)
//  - 공망 계산 (60갑자 공망표)
//  - 삼재 판별 (띠 기준 9년 주기)
//  - 60일주 정밀 해석
//  - 납음오행 매핑
//  - 당사주 12천성
//  - 무당식 말투 생성

import { CHEONGAN, JIJI, CHEONGAN_KOR, JIJI_KOR, gapja } from "./saju.js";

// === 신살 판별 함수들 ===

const CHEONEUL_GWIEIN = {
  // 일간 → [지지 인덱스 2개]
  0: [1, 7], 5: [1, 7],   // 甲己 → 丑未
  1: [0, 8], 6: [0, 8],   // 乙庚 → 子申
  2: [9, 11], 3: [9, 11], // 丙丁 → 酉亥
  4: [1, 7], 9: [1, 7],   // 戊癸 → 丑未
  7: [2, 6],              // 辛 → 寅午
  8: [3, 5],              // 壬 → 卯巳
};

const MUNCHANG = {
  0:5, 1:6, 2:8, 3:9, 4:8, 5:9, 6:11, 7:0, 8:2, 9:3
};

const YANGIN = {
  0:3, 2:6, 4:6, 6:9, 8:0  // 양간만 (甲卯, 丙午, 戊午, 庚酉, 壬子)
};

// 도화/역마/화개: 년지·일지 기준 삼합 그룹별
const SAMHAP_BASED = {
  // 그룹 (해당 그룹의 지지들) → 도화·역마·화개
  "申子辰": { members: [8, 0, 4], dohwa: 9, yeokma: 2, hwagae: 4 },
  "巳酉丑": { members: [5, 9, 1], dohwa: 6, yeokma: 11, hwagae: 1 },
  "寅午戌": { members: [2, 6, 10], dohwa: 3, yeokma: 8, hwagae: 10 },
  "亥卯未": { members: [11, 3, 7], dohwa: 0, yeokma: 5, hwagae: 7 },
};

const WONJIN_PAIRS = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];  // 자미, 축오, 인유, 묘신, 진해, 사술
const GWIMUN_PAIRS = [[0,9],[1,6],[2,7],[3,8],[4,11],[5,10]];

const BAEKHO_GAPJA = ["甲辰","戊辰","丙戌","壬戌","丁丑","癸丑","乙未"];
const GOEGANG_GAPJA = ["庚辰","庚戌","壬辰","壬戌","戊戌"];

// 공망표: 60갑자 일주 기준
// 갑자순(0~9) → 戌亥, 갑술순(10~19) → 申酉, 갑신(20~29) → 午未, 갑오(30~39) → 辰巳, 갑진(40~49) → 寅卯, 갑인(50~59) → 子丑
function getGongmang(dayGapjaIdx) {
  const range = Math.floor(dayGapjaIdx / 10);
  const voids = [[10,11],[8,9],[6,7],[4,5],[2,3],[0,1]];
  return voids[range];
}

// === 메인 신살 분석 ===
export function analyzeShinsal(saju) {
  const dayStem = saju.dayMaster.stem;
  const yearBranch = saju.pillars.year.branch;
  const dayBranch = saju.pillars.day.branch;
  const allBranches = [
    saju.pillars.year.branch,
    saju.pillars.month.branch,
    saju.pillars.day.branch,
    saju.pillars.hour.branch,
  ];

  const found = [];

  // 천을귀인
  const cheoneul = CHEONEUL_GWIEIN[dayStem] || [];
  for (const br of cheoneul) {
    if (allBranches.includes(br)) {
      found.push({
        id: "cheoneul", name: "天乙貴人(천을귀인)", type: "길신",
        location: locOf(saju, br),
        text: "가장 강력한 길신. 큰 위기에 귀인이 나타나 도움.",
        mudang: "하늘이 내린 귀인이 곁에 있구나. 큰 고비마다 도와줄 사람이 나타난다.",
      });
      break;
    }
  }

  // 문창귀인
  const munchang = MUNCHANG[dayStem];
  if (allBranches.includes(munchang)) {
    found.push({
      id: "munchang", name: "文昌貴人(문창귀인)", type: "길신",
      location: locOf(saju, munchang),
      text: "학문·시험·문서운. 머리가 영민.",
      mudang: "문창성이 빛나니 공부와 시험에 큰 복이 있다.",
    });
  }

  // 양인살
  const yangin = YANGIN[dayStem];
  if (yangin !== undefined && allBranches.includes(yangin)) {
    found.push({
      id: "yangin", name: "羊刃殺(양인살)", type: "흉살",
      location: locOf(saju, yangin),
      text: "강한 칼날. 무관·외과·격투에 길. 일반인은 사고·다툼 주의.",
      mudang: "양인이 빛나니 강단이 있으나 칼이 보이는 직업이 길하다.",
    });
  }

  // 도화·역마·화개 (년지·일지 기준)
  for (const ref of [yearBranch, dayBranch]) {
    for (const [name, group] of Object.entries(SAMHAP_BASED)) {
      if (group.members.includes(ref)) {
        if (allBranches.includes(group.dohwa)) {
          if (!found.some(f => f.id === "dohwa")) {
            found.push({
              id: "dohwa", name: "桃花殺(도화살)", type: "길흉양면",
              location: locOf(saju, group.dohwa),
              text: "이성·인기·매력. 연예·예술계 길. 약하면 색난.",
              mudang: "도화가 피니 인기가 따르나 이성 문제를 조심해야 한다.",
            });
          }
        }
        if (allBranches.includes(group.yeokma)) {
          if (!found.some(f => f.id === "yeokma")) {
            found.push({
              id: "yeokma", name: "驛馬殺(역마살)", type: "변동",
              location: locOf(saju, group.yeokma),
              text: "이동·여행·해외·변동. 영업·운수업 길.",
              mudang: "역마가 발동하니 멀리 떠나거나 자주 움직이는 운이다.",
            });
          }
        }
        if (allBranches.includes(group.hwagae)) {
          if (!found.some(f => f.id === "hwagae")) {
            found.push({
              id: "hwagae", name: "華蓋殺(화개살)", type: "예술종교",
              location: locOf(saju, group.hwagae),
              text: "예술·종교·학문·고독. 명상·수도 기질.",
              mudang: "화개가 머무니 속세보다 정신적·예술적 길이 맞다.",
            });
          }
        }
        break;
      }
    }
  }

  // 원진살
  for (const [a, b] of WONJIN_PAIRS) {
    if (allBranches.includes(a) && allBranches.includes(b)) {
      found.push({
        id: "wonjin", name: "怨嗔殺(원진살)", type: "관계살",
        text: "미움·원망·말없는 갈등. 가까운 사이 응어리.",
        mudang: "원진이 들었으니 가까운 이와 말 못할 응어리가 있다.",
      });
      break;
    }
  }

  // 귀문관살
  for (const [a, b] of GWIMUN_PAIRS) {
    if (allBranches.includes(a) && allBranches.includes(b)) {
      found.push({
        id: "gwimun", name: "鬼門關殺(귀문관살)", type: "정신살",
        text: "신경예민·직감·예지. 정신 분야 재능. 강하면 정신 불안.",
        mudang: "귀문관이 열리니 영감이 예리하나 마음의 안정이 필요하다.",
      });
      break;
    }
  }

  // 백호살 / 괴강살 (각 기둥별 갑자 검사)
  for (const p of ["year","month","day","hour"]) {
    const g = saju.pillars[p].gapja;
    if (BAEKHO_GAPJA.includes(g)) {
      found.push({
        id: "baekho_"+p, name: "白虎大殺(백호살)", type: "흉살",
        location: p,
        text: "혈광지사. 큰 사고·수술. 균형 좋으면 권위로 발현.",
        mudang: "백호가 도사리니 피를 흘리는 일을 조심해야 한다.",
      });
    }
    if (GOEGANG_GAPJA.includes(g)) {
      found.push({
        id: "goegang_"+p, name: "魁罡殺(괴강살)", type: "길흉양면",
        location: p,
        text: "총명·강건·카리스마. 극단적. 여성은 부부궁 약함.",
        mudang: "괴강이 빛나니 두령의 기상이로다. 다만 부부 인연 굴곡.",
      });
    }
  }

  // 공망
  const dayGapjaIdx = gapja(findGapjaIdx(saju.pillars.day.stem, saju.pillars.day.branch)).idx;
  const gongmang = getGongmang(dayGapjaIdx);
  const gongmangFound = [];
  for (const v of gongmang) {
    if ([yearBranch, saju.pillars.month.branch, saju.pillars.hour.branch].includes(v)) {
      gongmangFound.push(JIJI[v]);
    }
  }
  if (gongmangFound.length > 0) {
    found.push({
      id: "gongmang", name: "空亡(공망)", type: "허무살",
      location: gongmangFound.join(","),
      text: `${gongmangFound.join("·")} 자리가 공망. 그 자리의 십신은 효력 반감. 충(沖)되면 살아남.`,
      mudang: "공망에 든 것은 잡으려 해도 손에 잡히지 않으니 마음을 비우라.",
    });
  }

  return found;
}

function findGapjaIdx(stem, branch) {
  for (let i = 0; i < 60; i++) {
    const g = gapja(i);
    if (g.stem === stem && g.branch === branch) return i;
  }
  return 0;
}

function locOf(saju, branchIdx) {
  for (const p of ["year","month","day","hour"]) {
    if (saju.pillars[p].branch === branchIdx) return p;
  }
  return "외부";
}

// === 삼재 판별 ===
const SAMJAE_GROUPS = {
  "巳酉丑": { members: [5, 9, 1], samjae: [11, 0, 1] },  // 뱀닭소 → 돼지쥐소 해
  "申子辰": { members: [8, 0, 4], samjae: [2, 3, 4] },   // 원숭이쥐용 → 범토끼용 해
  "亥卯未": { members: [11, 3, 7], samjae: [5, 6, 7] },  // 돼지토끼양 → 뱀말양 해
  "寅午戌": { members: [2, 6, 10], samjae: [8, 9, 10] }, // 호말개 → 원닭개 해
};

export function checkSamjae(yearBranch, currentYear) {
  // 현재 연도의 사주 연지 (입춘 기준 단순화 - 정확히는 별도 계산)
  const curYearGapja = ((currentYear - 4) % 60 + 60) % 60;
  const curYearBranch = curYearGapja % 12;

  for (const [name, group] of Object.entries(SAMJAE_GROUPS)) {
    if (group.members.includes(yearBranch)) {
      const phase = group.samjae.indexOf(curYearBranch);
      if (phase === -1) {
        return { inSamjae: false, group: name };
      }
      const phaseName = ["들삼재","중삼재","날삼재"][phase];
      return {
        inSamjae: true,
        phase: phaseName,
        phaseIdx: phase,
        group: name,
        startYear: currentYear - phase,
        endYear: currentYear - phase + 2,
        currentYearBranch: JIJI[curYearBranch],
      };
    }
  }
  return { inSamjae: false };
}

// === 무당식 종합 해석 ===
export function mudangSummary(saju, shinsal, samjae, ilju60Data, mudangData, napeumData) {
  const dayGapja = saju.pillars.day.gapja;
  const ilju = ilju60Data.data[dayGapja];
  const napeum = napeumData ? napeumData[dayGapja] : null;
  const phrases = mudangData.mudang_phrases;

  const lines = [];
  // 도입
  lines.push(pick(phrases.intro_general));
  lines.push("");

  // 일주 정밀 해석
  if (ilju) {
    lines.push(`▣ 일주 ${dayGapja}(${ilju.kor}) · ${ilju.animal}띠 일주`);
    lines.push(`  본성: ${ilju.character}`);
    lines.push(`  연애: ${ilju.love}`);
    lines.push(`  직업: ${ilju.career}`);
    lines.push(`  재물: ${ilju.money}`);
    lines.push(`  건강: ${ilju.health}`);
    lines.push(`  ※ 무당 풀이: ${ilju.mudang}`);
    lines.push("");
  }

  // 납음오행
  if (napeum) {
    const interp = napeumData.interpretations ? napeumData.interpretations[napeum.replace(/\(.+\)/, "")] : "";
    lines.push(`▣ 납음(納音) - ${napeum}`);
    if (interp) lines.push(`  ${interp}`);
    lines.push("");
  }

  // 신살 종합
  const giljins = shinsal.filter(s => s.type === "길신");
  const hyungsals = shinsal.filter(s => s.type !== "길신");
  if (giljins.length > 0) {
    lines.push(`▣ 길신(吉神) ${giljins.length}개`);
    giljins.forEach(s => lines.push(`  · ${s.name} → ${s.mudang}`));
    lines.push("");
  }
  if (hyungsals.length > 0) {
    lines.push(`▣ 흉살·조심할 자리 ${hyungsals.length}개`);
    hyungsals.forEach(s => lines.push(`  · ${s.name} → ${s.mudang}`));
    lines.push("");
  }

  // 삼재
  if (samjae.inSamjae) {
    const relief = mudangData.samjae_relief[samjae.phase];
    lines.push(`▣ ${samjae.phase} (${samjae.startYear}~${samjae.endYear}) — 현재 진행중!`);
    lines.push(`  기운: ${relief.energy}`);
    lines.push(`  주의: ${relief.caution.slice(0, 3).join(" / ")}`);
    lines.push(`  처방: ${relief.bujeok.join(", ")} 권함`);
    lines.push(`  ※ ${relief.mudang}`);
    lines.push("");
  }

  // 닫는 말
  lines.push(pick(phrases.closing));

  return lines.join("\n");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// === 당사주 12천성 ===
export function dangsa(saju, dangsaData) {
  const stages = ["초년","청년","중년","말년"];
  const branches = [
    saju.pillars.year.branch,
    saju.pillars.month.branch,
    saju.pillars.day.branch,
    saju.pillars.hour.branch,
  ];
  return stages.map((stage, i) => {
    const star = dangsaData.dangsa_12chunseong.stars[branches[i]];
    return {
      stage,
      ageRange: ["~25세","25~40세","40~55세","55세 이후"][i],
      star: star.kor,
      starHan: star.star,
      desc: star.desc,
      fortune: star.fortune,
    };
  });
}
