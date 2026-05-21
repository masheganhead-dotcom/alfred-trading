#!/usr/bin/env node
// 통합 사주 분석 CLI
// 사용: node analyze.mjs <YYYY> <MM> <DD> <HH> [MM] [M|F] [longitude]
// 예시: node analyze.mjs 1990 5 15 12 0 M 127

import { calculateSaju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG } from "../core/saju.js";
import { analyzeShinsal, checkSamjae, dangsa } from "../core/mudang.js";
import { determineYongsin } from "../core/yongsin.js";
import { determineGeokguk } from "../core/geokguk.js";
import { predictNextYears, predictLifeEvents, analyzeGungseong } from "../core/sigi.js";
import { sajuToBig5, birthSeasonEffect, calculateZodiac, crossCompare } from "../core/statistical_science.js";
import { sajuToMBTI, biorhythm, lifePathNumber, bayesianFortune, extractSajuSignals, comprehensiveScore } from "../core/science.js";
import fs from "node:fs";

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error("사용: node analyze.mjs <year> <month> <day> <hour> [minute] [M|F] [longitude]");
  console.error("예시: node analyze.mjs 1990 5 15 12 30 M 127");
  process.exit(1);
}

const [yearS, monthS, dayS, hourS, minuteS = "0", gender = "M", lngS = "127"] = args;
const input = {
  year: +yearS, month: +monthS, day: +dayS, hour: +hourS,
  minute: +minuteS, gender, longitude: +lngS,
};

const root = new URL("..", import.meta.url).pathname;
const ilju = JSON.parse(fs.readFileSync(root + "data/ilju60.json"));
const mudang = JSON.parse(fs.readFileSync(root + "data/korea_mudang.json"));

const saju = calculateSaju(input);
const shinsal = analyzeShinsal(saju);
const samjae = checkSamjae(saju.pillars.year.branch, new Date().getFullYear());
const ds = dangsa(saju, mudang);
const yongsin = determineYongsin(saju);
const geokguk = determineGeokguk(saju, yongsin.strength);
const gungseong = analyzeGungseong(saju);
const next10 = predictNextYears(saju, new Date().getFullYear() + 1, 10, gender);
const lifeEvents = predictLifeEvents(saju, new Date().getFullYear() + 1, gender);
const big5 = sajuToBig5(saju);
const season = birthSeasonEffect(input.year, input.month, input.day, big5);
const zodiac = calculateZodiac(input.year, input.month, input.day);
const cross = crossCompare(saju, zodiac);
const mbti = sajuToMBTI(saju);
const bio = biorhythm(input.year, input.month, input.day);
const lp = lifePathNumber(input.year, input.month, input.day);
const signals = extractSajuSignals(saju);
const bayes = bayesianFortune(signals);
const total = comprehensiveScore(saju, bio, lp, bayes);

const myIlju = ilju.data[saju.pillars.day.gapja];
const napeum = mudang.napeum_60.data[saju.pillars.day.gapja];

const report = {
  input,
  pillars: saju.pillars,
  dayMaster: saju.dayMaster,
  animal: saju.animal,
  ohaengCount: saju.ohaengCount,
  relations: saju.relations,
  ilju: myIlju,
  napeum,
  shinsal,
  samjae,
  dangsa: ds,
  strength: yongsin.strength,
  geokguk,
  yongsin: yongsin.primary,
  gisin: yongsin.gisin,
  gungseong,
  next10,
  lifeEvents,
  big5: big5.scores,
  big5_interpretation: big5.interpretation,
  season: { label: season.label, citation: season.citation },
  zodiac: { name: zodiac.name, en: zodiac.en, element: zodiac.element },
  cross: cross.match,
  mbti: { type: mbti.type, description: mbti.description, confidence: mbti.confidence },
  lifePath: lp,
  bayesian: bayes,
  daewoon: saju.daewoon,
  totalScore: total,
};

console.log(JSON.stringify(report, null, 2));
