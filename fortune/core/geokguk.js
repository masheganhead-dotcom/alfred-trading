// geokguk.js - 격국(格局) 자동 판별
//
// 격국 = 사주의 그릇·유형. 인생의 큰 방향을 결정.
// 정통 명리학에서 "이 사주는 어떤 종류의 사주인가"를 한 단어로 표현.
//
// 10정격: 정관격·편관격·정인격·편인격·정재격·편재격·식신격·상관격·건록격·양인격
// 외격(從格): 종강격·종왕격·종재격·종살격·종아격·화기격
//
// 판별 원칙:
//   1. 월지(月支) 본기·중기·여기 중 천간에 투간(透干)된 것이 격
//   2. 투간 없으면 월지 본기로 격
//   3. 일간이 극도로 약하면 종격 우선
//
// 출처: 자평진전(子平眞詮), 적천수(滴天髓)

import { CHEONGAN, STEM_OHAENG, STEM_YINYANG, HIDDEN_STEMS, sipsinForStem } from "./saju.js";

export function determineGeokguk(saju, strength) {
  const dayStem = saju.dayMaster.stem;
  const monthBranch = saju.pillars.month.branch;
  const monthHidden = HIDDEN_STEMS[monthBranch];  // 월지 장간

  // 1. 월지 장간 중 천간(년/월/시)에 투간된 것 찾기
  const visibleStems = [
    saju.pillars.year.stem,
    saju.pillars.month.stem,
    saju.pillars.hour.stem,
  ];

  let geokStem = null;
  for (const hidden of monthHidden) {
    if (visibleStems.includes(hidden)) {
      geokStem = hidden;
      break;
    }
  }
  // 투간 없으면 본기(첫번째)
  if (geokStem === null) geokStem = monthHidden[0];

  const sipsin = sipsinForStem(dayStem, geokStem);
  let geokName = mapSipsinToGeok(sipsin);

  // 2. 외격 체크 (일간이 극도로 약하거나 강할 때)
  const exGeok = checkExternalGeok(saju, strength);
  if (exGeok) {
    geokName = exGeok.name;
    return {
      name: geokName,
      type: "외격(從格)",
      stem: CHEONGAN[geokStem],
      sipsin,
      desc: exGeok.desc,
      career: exGeok.career,
      note: exGeok.note,
    };
  }

  return {
    name: geokName,
    type: "정격(正格)",
    stem: CHEONGAN[geokStem],
    sipsin,
    desc: GEOK_DESC[geokName]?.desc || "특수격",
    career: GEOK_DESC[geokName]?.career || "다양한 분야",
    note: GEOK_DESC[geokName]?.note || "",
  };
}

function mapSipsinToGeok(sipsin) {
  const map = {
    "정관": "정관격(正官格)",
    "편관": "편관격(七殺格)",
    "정인": "정인격(正印格)",
    "편인": "편인격(偏印格)",
    "정재": "정재격(正財格)",
    "편재": "편재격(偏財格)",
    "식신": "식신격(食神格)",
    "상관": "상관격(傷官格)",
    "비견": "건록격(建祿格)",
    "겁재": "양인격(羊刃格)",
  };
  return map[sipsin] || "잡격(雜格)";
}

function checkExternalGeok(saju, strength) {
  const oh = saju.ohaengCount;
  const dayOhaeng = saju.dayMaster.ohaeng;
  const total = 8;

  // 종강격: 일간 + 인성이 7~8개 (극신강)
  const sameAndSupport = oh[dayOhaeng] +
    Object.entries(oh).filter(([k, v]) => {
      const SHENG = { "목":"화","화":"토","토":"금","금":"수","수":"목" };
      return SHENG[k] === dayOhaeng;
    }).reduce((a, [, v]) => a + v, 0);
  if (sameAndSupport >= 7) {
    return {
      name: "종강격(從強格)",
      desc: "일간이 극히 강해 거스를 수 없음. 흐름을 따라가야 길.",
      career: "한 분야 최고 전문가, 권력자, 대기업가",
      note: "비겁·인성 운에 발복",
    };
  }

  // 종왕격: 비겁이 6개 이상
  if (oh[dayOhaeng] >= 5) {
    return {
      name: "종왕격(從旺格)",
      desc: "비겁 극강. 협력보다 독주가 길.",
      career: "독립사업, 자영업, 1인 전문가",
      note: "비겁·식상 운에 발복",
    };
  }

  // 종재격: 재성(내가 극)이 5개 이상 + 일간 극약
  const KE = { "목":"토","화":"금","토":"수","금":"목","수":"화" };
  const wealth = oh[KE[dayOhaeng]];
  if (wealth >= 5 && strength.score < 15) {
    return {
      name: "종재격(從財格)",
      desc: "재물을 따라가는 격. 일간 약해도 재에 의탁하면 길.",
      career: "사업·금융·부동산·무역",
      note: "재성·식상 운에 발복. 비겁 운은 흉.",
    };
  }

  // 종살격: 관성(나를 극)이 5개 이상 + 일간 극약
  const officials = Object.entries(KE).find(([k, v]) => v === dayOhaeng)?.[0];
  const officialQty = oh[officials];
  if (officialQty >= 5 && strength.score < 15) {
    return {
      name: "종살격(從殺格)",
      desc: "권력에 종속되어 빛나는 격. 위에서 시키는 일에 큰 운.",
      career: "공직·군·경찰·법조·대기업",
      note: "관성·재성 운에 발복",
    };
  }

  // 종아격: 식상이 5개 이상 + 일간 약
  const SHENG_REV = { "목":"수","화":"목","토":"화","금":"토","수":"금" };
  const child = SHENG_REV[dayOhaeng];  // 일간이 생하는 것의 반대 = 식상
  const SHENG = { "목":"화","화":"토","토":"금","금":"수","수":"목" };
  const childOh = SHENG[dayOhaeng];
  const childQty = oh[childOh];
  if (childQty >= 5 && strength.score < 20) {
    return {
      name: "종아격(從兒格)",
      desc: "자식·작품을 따라가는 격. 표현·창작이 길.",
      career: "예술·연예·창작·교육·연구",
      note: "식상·재성 운에 발복",
    };
  }

  return null;
}

const GEOK_DESC = {
  "정관격(正官格)": {
    desc: "사주의 그릇이 정도(正道)에 있다. 명예·관직·규범·신뢰의 격.",
    career: "공무원, 대기업 정규직, 법조계, 공기업, 안정직",
    note: "정관격은 재성이 함께 있어야 더 빛난다 (재생관). 식상이 정관을 극하면 흉.",
  },
  "편관격(七殺格)": {
    desc: "강력한 압박과 도전을 통해 큰 일을 이룬다. 살(殺)을 다스리는 그릇.",
    career: "군·경찰·검찰·외과의·격투·기업가·정치인",
    note: "편관격은 인성(살인상생) 또는 식신(식신제살)이 필요. 무제압 시 흉.",
  },
  "정인격(正印格)": {
    desc: "학문·자격·후원·문서의 격. 어머니 같은 보호 속에 성장.",
    career: "교육·연구·학문·종교·복지·문화재·작가",
    note: "정인격은 정관이 함께면 명문가. 재성은 인성을 파괴(탐재괴인) 주의.",
  },
  "편인격(偏印格)": {
    desc: "직관·종교·신비·창의의 격. 비주류 학문과 예술의 길.",
    career: "역술·종교·심리·예술·디자인·요리·간호·IT",
    note: "편인격은 편재가 와야 균형. 식신을 극(편인도식)하면 자식·먹복 손상.",
  },
  "정재격(正財格)": {
    desc: "정직한 노력으로 모은 안정 재물의 격. 알뜰·근면의 본보기.",
    career: "월급쟁이·회계·은행·경영지원·자영업(소규모)",
    note: "정재격은 식신이 와야 재가 늘어남(식신생재). 비겁이 재를 극(군겁쟁재)하면 손재.",
  },
  "편재격(偏財格)": {
    desc: "유동·큰돈·역마·인기의 격. 사업가·투자가의 그릇.",
    career: "사업·무역·증권·부동산·연예·영업",
    note: "편재격은 신강해야 큰돈 감당. 신약하면 재다신약으로 오히려 가난.",
  },
  "식신격(食神格)": {
    desc: "표현·여유·먹복·연구의 격. 마음이 풍성한 사람.",
    career: "요리·예술·교육·연구·작가·기획·서비스",
    note: "식신격은 재성이 와야 식신생재. 편인이 식신을 극(편인도식)하면 손상.",
  },
  "상관격(傷官格)": {
    desc: "재능·언변·예술·반항의 격. 비범한 표현력.",
    career: "방송·예술·언론·연예·디자인·창작·강연",
    note: "상관격은 인성이 와야 상관패인(고급화). 정관 보면 상관견관(파직) 주의.",
  },
  "건록격(建祿格)": {
    desc: "스스로 일어선 격. 자수성가·독립·번영의 본보기.",
    career: "자영업·전문직·기업가·운동·예술",
    note: "건록격은 식상·재성 운에 발복. 비겁 운이 거듭되면 군겁쟁재.",
  },
  "양인격(羊刃格)": {
    desc: "양인(羊刃)의 칼날. 강건·결단·카리스마. 무관·경쟁 분야의 정점.",
    career: "군·경·외과·격투·정치·격렬한 사업",
    note: "양인격은 편관이 와야 양인합살로 정상에 오름. 정관 보면 충돌.",
  },
};
