// user_context_schema.js — zod 스키마. user_context.json 검증.
// 잘못된 필드·누락·타입 오류를 즉시 발견 (런타임 무한 디버깅 방지).

import { z } from "zod";

const BirthSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  gender: z.enum(["M", "F"]),
  longitude: z.number().min(120).max(135)  // 한국·일본 범위
});

const YongsinKisinSchema = z.object({
  ohaeng: z.enum(["목", "화", "토", "금", "수"]),
  easy: z.string(),
  meaning: z.string().optional()
});

const Big5Schema = z.object({
  O: z.number().min(0).max(100),
  C: z.number().min(0).max(100),
  E: z.number().min(0).max(100),
  A: z.number().min(0).max(100),
  N: z.number().min(0).max(100),
  _note: z.string().optional()
});

const UserSchema = z.object({
  name: z.string().min(1),
  birth: BirthSchema,
  ilju: z.string().length(2),  // 한자 2글자 (天干+地支)
  ilju_kor: z.string().optional(),
  day_stem: z.string().length(1),
  day_branch: z.string().length(1),
  yongsin: YongsinKisinSchema,
  kisin: YongsinKisinSchema,
  mbti: z.string().optional(),
  mbti_hint: z.string().optional(),  // legacy
  mbti_note: z.string().optional(),
  big5: Big5Schema,
  shinsal_owned: z.array(z.string()).optional(),
  personal_state: z.record(z.string()).optional()
});

const PersonSchema = z.object({
  name: z.string(),
  alias: z.string().optional(),
  role: z.string(),
  ilju: z.string().length(2),
  day_stem: z.string().length(1),
  day_branch: z.string().length(1),
  synergy_score: z.number().min(0).max(100),
  synergy_grade: z.enum(["S", "A", "B", "C", "D"]),
  synergy_note: z.string(),
  current_offer: z.string().optional(),
  today_default_tone: z.string()
});

const DateEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().optional(),
  why: z.string().optional(),
  reason: z.string().optional(),
  weight: z.number().optional()
}).refine(d => d.label || d.reason, { message: "label 또는 reason 중 하나는 필수" });

export const UserContextSchema = z.object({
  _meta: z.object({
    title: z.string(),
    updated: z.string(),
    note: z.string().optional()
  }),
  user: UserSchema,
  five_people: z.array(PersonSchema),
  key_dates: z.array(DateEntrySchema),
  avoid_dates: z.array(DateEntrySchema),
  investment_guide: z.record(z.any()).optional(),
  her_release: z.record(z.any()).optional()
});
