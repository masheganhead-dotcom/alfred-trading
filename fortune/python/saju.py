#!/usr/bin/env python3
"""
사주팔자 Python 엔진 - JS 버전과 동일 결과 산출 검증용

도입 참고 (검증된 오픈소스):
  - usingsky/korean_lunar_calendar_py : 음양력 변환 (KASI 데이터 기반)
  - manseryeok 계열 라이브러리         : 한국형 사주 표준
  - bazi-mcp 출력 스키마               : 풍부한 해석 데이터

사용 예:
    $ python3 saju.py --year 1990 --month 5 --day 15 --hour 12 --gender M
    $ python3 saju.py --verify  # 알려진 케이스 검증
"""

import math
import argparse
from datetime import datetime, timezone, timedelta

# === 기본 상수 ===
CHEONGAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
CHEONGAN_KOR = ["갑","을","병","정","무","기","경","신","임","계"]
JIJI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
JIJI_KOR = ["자","축","인","묘","진","사","오","미","신","유","술","해"]
ANIMALS = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"]

STEM_OHAENG = ["목","목","화","화","토","토","금","금","수","수"]
STEM_YINYANG = ["양","음","양","음","양","음","양","음","양","음"]
BRANCH_OHAENG = ["수","토","목","목","토","화","화","토","금","금","토","수"]

# 오호둔: 年干 → 寅月 천간 인덱스
OHO_DUN = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]
# 오자둔: 日干 → 子時 천간 인덱스
OJA_DUN = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]

# === Julian Day ===
def date_to_jd(dt: datetime) -> float:
    """UTC datetime → Julian Day (Meeus 알고리즘)"""
    Y = dt.year
    M = dt.month
    D = dt.day + (dt.hour + (dt.minute + dt.second/60)/60) / 24
    if M <= 2:
        Y -= 1
        M += 12
    A = Y // 100
    B = 2 - A + A // 4
    return math.floor(365.25 * (Y + 4716)) + math.floor(30.6001 * (M + 1)) + D + B - 1524.5


def jd_to_date(jd: float) -> datetime:
    Z = math.floor(jd + 0.5)
    F = (jd + 0.5) - Z
    if Z < 2299161:
        A = Z
    else:
        alpha = math.floor((Z - 1867216.25) / 36524.25)
        A = Z + 1 + alpha - alpha // 4
    B = A + 1524
    C = math.floor((B - 122.1) / 365.25)
    D = math.floor(365.25 * C)
    E = math.floor((B - D) / 30.6001)
    day_frac = B - D - math.floor(30.6001 * E) + F
    day = int(day_frac)
    hour_frac = (day_frac - day) * 24
    hour = int(hour_frac)
    min_frac = (hour_frac - hour) * 60
    minute = int(min_frac)
    second = int((min_frac - minute) * 60)
    month = E - 1 if E < 14 else E - 13
    year = C - 4716 if month > 2 else C - 4715
    return datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)


# === 태양 황경 (Meeus Ch.25 단순화) ===
def solar_longitude(jd: float) -> float:
    T = (jd - 2451545.0) / 36525.0
    L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360
    M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360
    Mrad = math.radians(M)
    e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T
    C = ((1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(Mrad)
         + (0.019993 - 0.000101 * T) * math.sin(2 * Mrad)
         + 0.000289 * math.sin(3 * Mrad))
    true_lon = L0 + C
    omega = 125.04 - 1934.136 * T
    apparent = true_lon - 0.00569 - 0.00478 * math.sin(math.radians(omega))
    return apparent % 360


def find_solar_term_jd(target_lon: float, jd_start: float, jd_end: float) -> float:
    def norm(x):
        v = ((x - target_lon) % 360 + 540) % 360 - 180
        return v
    lo, hi = jd_start, jd_end
    flo = norm(solar_longitude(lo))
    for _ in range(80):
        mid = (lo + hi) / 2
        fmid = norm(solar_longitude(mid))
        if abs(fmid) < 1e-7 or (hi - lo) < 1e-6:
            return mid
        if (fmid >= 0) == (flo >= 0):
            lo, flo = mid, fmid
        else:
            hi = mid
    return (lo + hi) / 2


# 24절기 황경
SOLAR_TERMS = [
    ("춘분", 0, False, None), ("청명", 15, True, 4), ("곡우", 30, False, None),
    ("입하", 45, True, 5), ("소만", 60, False, None), ("망종", 75, True, 6),
    ("하지", 90, False, None), ("소서", 105, True, 7), ("대서", 120, False, None),
    ("입추", 135, True, 8), ("처서", 150, False, None), ("백로", 165, True, 9),
    ("추분", 180, False, None), ("한로", 195, True, 10), ("상강", 210, False, None),
    ("입동", 225, True, 11), ("소설", 240, False, None), ("대설", 255, True, 0),
    ("동지", 270, False, None), ("소한", 285, True, 1), ("대한", 300, False, None),
    ("입춘", 315, True, 2), ("우수", 330, False, None), ("경칩", 345, True, 3),
]
APPROX_DATES = [
    (3,21),(4,5),(4,20),(5,6),(5,21),(6,6),
    (6,21),(7,7),(7,23),(8,8),(8,23),(9,8),
    (9,23),(10,8),(10,23),(11,7),(11,22),(12,7),
    (12,22),(1,6),(1,20),(2,4),(2,19),(3,6),
]


def get_solar_terms_for_year(year: int):
    result = []
    for i, ((name, lon, is_jie, branch), (m, d)) in enumerate(zip(SOLAR_TERMS, APPROX_DATES)):
        start = date_to_jd(datetime(year, m, max(1, d-2), tzinfo=timezone.utc))
        end_d = d + 2
        end_m = m
        if end_d > 28:
            end_d = 28
        end = date_to_jd(datetime(year, end_m, end_d, tzinfo=timezone.utc))
        jd = find_solar_term_jd(lon, start, end)
        result.append({"name": name, "lon": lon, "is_jie": is_jie, "branch": branch,
                       "jd": jd, "date": jd_to_date(jd)})
    return result


def get_jie_for_date(dt: datetime):
    jd = date_to_jd(dt)
    Y = dt.year
    all_jie = []
    for y in [Y-1, Y, Y+1]:
        for t in get_solar_terms_for_year(y):
            if t["is_jie"]:
                t["year"] = y
                all_jie.append(t)
    all_jie.sort(key=lambda x: x["jd"])
    last = None
    for t in all_jie:
        if t["jd"] <= jd + 1e-9:
            last = t
        else:
            break
    return last


# === 60갑자 ===
def gapja(n: int):
    i = ((n % 60) + 60) % 60
    return {"stem": i % 10, "branch": i % 12, "idx": i}


def gapja_name(n: int) -> str:
    g = gapja(n)
    return CHEONGAN[g["stem"]] + JIJI[g["branch"]]


# === 일주 ===
REF_GAPJA = 36  # 1900-01-01 = 庚子日


def get_day_gapja(dt: datetime):
    """KST 기준 datetime → 일주 갑자"""
    # 23시 이후는 다음날
    if dt.hour >= 23:
        dt = dt + timedelta(hours=1)
    target = datetime(dt.year, dt.month, dt.day, 12, tzinfo=timezone.utc)
    ref = datetime(1900, 1, 1, 12, tzinfo=timezone.utc)
    diff_days = round((date_to_jd(target) - date_to_jd(ref)))
    return gapja(REF_GAPJA + diff_days)


# === 년주 ===
def get_year_gapja(dt: datetime):
    Y = dt.year
    terms = get_solar_terms_for_year(Y)
    lichun = next(t for t in terms if t["name"] == "입춘")
    saju_year = Y - 1 if dt < lichun["date"] else Y
    year_idx = ((saju_year - 4) % 60 + 60) % 60
    g = gapja(year_idx)
    g["saju_year"] = saju_year
    return g


# === 월주 ===
def get_month_gapja(dt: datetime, year_stem: int):
    jie = get_jie_for_date(dt)
    branch_idx = jie["branch"]
    in_month_stem = OHO_DUN[year_stem]
    dist = (branch_idx - 2 + 12) % 12
    stem = (in_month_stem + dist) % 10
    return {"stem": stem, "branch": branch_idx}


# === 시주 ===
def get_hour_gapja(dt: datetime, day_stem: int):
    total_min = dt.hour * 60 + dt.minute
    if total_min >= 23*60 or total_min < 60:
        branch_idx = 0
    else:
        branch_idx = (total_min - 60) // 120 + 1
    ja_stem = OJA_DUN[day_stem]
    stem = (ja_stem + branch_idx) % 10
    return {"stem": stem, "branch": branch_idx}


# === 진태양시 보정 ===
def correct_to_solar_time(dt: datetime, longitude: float = 127.0) -> datetime:
    offset_min = (longitude - 135) * 4
    return dt + timedelta(minutes=offset_min)


# === 메인 계산 ===
def calculate_saju(year, month, day, hour, minute=0, gender="M",
                   longitude=127.0, use_true_solar_time=True):
    """양력 KST 기준 입력 → 사주 4주 + 띠"""
    # KST 시각을 UTC tzinfo로 저장 (모든 계산이 시계 시각 기준으로 일관)
    local_dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
    dt = correct_to_solar_time(local_dt, longitude) if use_true_solar_time else local_dt

    year_g = get_year_gapja(dt)
    month_g = get_month_gapja(dt, year_g["stem"])
    day_g = get_day_gapja(dt)
    hour_g = get_hour_gapja(dt, day_g["stem"])

    def make_pillar(g):
        return {
            "stem": g["stem"], "branch": g["branch"],
            "gapja": CHEONGAN[g["stem"]] + JIJI[g["branch"]],
            "kor": CHEONGAN_KOR[g["stem"]] + JIJI_KOR[g["branch"]],
        }

    return {
        "input": {"year": year, "month": month, "day": day, "hour": hour, "minute": minute,
                  "gender": gender, "longitude": longitude},
        "corrected": dt.isoformat(),
        "saju_year": year_g["saju_year"],
        "animal": ANIMALS[year_g["branch"]],
        "year": make_pillar(year_g),
        "month": make_pillar(month_g),
        "day": make_pillar(day_g),
        "hour": make_pillar(hour_g),
        "day_master": {
            "stem_han": CHEONGAN[day_g["stem"]],
            "stem_kor": CHEONGAN_KOR[day_g["stem"]],
            "ohaeng": STEM_OHAENG[day_g["stem"]],
            "yinyang": STEM_YINYANG[day_g["stem"]],
        },
    }


def print_saju(s):
    print(f"\n=== 사주팔자 ({s['saju_year']}년 {s['animal']}띠) ===")
    print(f"입력: {s['input']['year']}-{s['input']['month']:02d}-{s['input']['day']:02d} "
          f"{s['input']['hour']:02d}:{s['input']['minute']:02d} ({s['input']['gender']}) "
          f"경도 {s['input']['longitude']}°")
    print(f"진태양시 보정 후: {s['corrected']}")
    print()
    print(f"  {'年':>4}  {'月':>4}  {'日':>4}  {'時':>4}")
    print(f"  {s['year']['gapja']:>4}  {s['month']['gapja']:>4}  "
          f"{s['day']['gapja']:>4}  {s['hour']['gapja']:>4}")
    print(f"  {s['year']['kor']:>4}  {s['month']['kor']:>4}  "
          f"{s['day']['kor']:>4}  {s['hour']['kor']:>4}")
    dm = s["day_master"]
    print(f"\n일간(나): {dm['stem_han']}({dm['stem_kor']}) - {dm['ohaeng']}/{dm['yinyang']}")


# === 검증 ===
KNOWN_CASES = [
    # (year, month, day, hour, gender, expected_year_gapja, expected_day_gapja)
    # 검증된 만세력 데이터 (대중적 만세력과 비교)
    # 진태양시 보정 없는 단순 값으로 검증
]


def verify():
    print("=== 검증 모드 ===")
    # 케이스: 2024-01-01 12:00 KST (단순)
    s = calculate_saju(2024, 1, 1, 12, 0, use_true_solar_time=False)
    print_saju(s)
    # 2024-01-01은 입춘 이전 → 사주는 2023(癸卯)년
    assert s["saju_year"] == 2023, f"기대 2023, 실제 {s['saju_year']}"
    assert s["year"]["gapja"] == "癸卯", f"기대 癸卯, 실제 {s['year']['gapja']}"
    print("✓ 입춘 이전 처리 OK")

    # 케이스: 2024-02-05 12:00 (입춘 직후)
    s = calculate_saju(2024, 2, 5, 12, 0, use_true_solar_time=False)
    print_saju(s)
    assert s["saju_year"] == 2024, f"기대 2024"
    assert s["year"]["gapja"] == "甲辰", f"기대 甲辰, 실제 {s['year']['gapja']}"
    print("✓ 입춘 후 갑진년 OK")

    print("\n모든 검증 통과 ✓")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--year", type=int)
    p.add_argument("--month", type=int, default=1)
    p.add_argument("--day", type=int, default=1)
    p.add_argument("--hour", type=int, default=12)
    p.add_argument("--minute", type=int, default=0)
    p.add_argument("--gender", default="M")
    p.add_argument("--longitude", type=float, default=127.0)
    p.add_argument("--no-tst", action="store_true", help="진태양시 보정 안함")
    p.add_argument("--verify", action="store_true")
    args = p.parse_args()

    if args.verify:
        verify()
    elif args.year:
        s = calculate_saju(args.year, args.month, args.day, args.hour, args.minute,
                          args.gender, args.longitude, not args.no_tst)
        print_saju(s)
    else:
        # 데모
        s = calculate_saju(1990, 5, 15, 12, 30, "M", 127.0)
        print_saju(s)
