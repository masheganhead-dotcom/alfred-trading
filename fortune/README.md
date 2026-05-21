# 🔮 오라클 — 사주·역술·신점 통합 시스템

전통 동양 역술(사주·주역·토정비결·궁합) + 서양 점술(타로) 통합 운세 시스템.
브라우저 단독 동작(서버 불필요), 모바일 친화 UI.

## 빠른 시작

```bash
cd fortune
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080
```

## 구성

```
fortune/
├── index.html              # 메인 UI (모바일 최적화 다크 테마)
├── app.js                  # UI 컨트롤러
├── core/
│   ├── solar_terms.js      # 24절기 천문 계산 (Meeus Astronomical Algorithms)
│   ├── saju.js             # 사주팔자 4주 + 십신 + 대운 + 형충회합
│   ├── iching.js           # 주역 64괘 시초점·동전점
│   ├── tarot.js            # 타로 78장 셔플·스프레드
│   ├── tojeong.js          # 토정비결 144괘
│   ├── gunghap.js          # 사주 궁합 분석
│   └── interpret.js        # 한국어 종합 해석 엔진
├── data/
│   ├── saju_basic.json     # 천간·지지·오행·십신·12운성·12신살·형충회합표
│   ├── iching64.json       # 주역 64괘 + 괘사 + 효사
│   ├── tarot78.json        # 타로 78장 정/역 해석
│   └── tojeong144.json     # 토정비결 샘플 괘
├── python/
│   └── saju.py             # Python 검증 엔진 (CLI)
└── tests/
    └── test_saju.html      # 브라우저 자체 테스트
```

## 핵심 알고리즘

### 1. 사주팔자

- **진태양시 보정**: 한국 표준시(135°E)와 출생지 경도 차이를 4분/° 보정. 서울 127°E → -32분.
- **년주**: 입춘(立春, 황경 315°) 기준 — 입춘 이전 출생은 전년 사주.
- **월주**: 12절기(節氣) 기반 월지 결정 + 오호둔(五虎遁)으로 월간 산출.
- **일주**: 1900-01-01 = 庚子日(36) 기준 60갑자 순환.
- **시주**: 2시간 단위 12지지 + 오자둔(五子遁) 시간 산출 (子시는 23:00~01:00).
- **십신**: 일간 기준 오행+음양 관계로 비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인.
- **대운**: 양남음녀 순행 / 음남양녀 역행. 출생일과 다음/이전 절기까지의 일수 ÷ 3 = 대운수.

### 2. 24절기 (천문 계산)

Jean Meeus, *Astronomical Algorithms* 2nd ed. Ch.25(태양 위치) + Ch.27(춘분/하지) 알고리즘 단순화 버전. 태양 황경이 15°의 배수에 도달하는 순간을 이분법으로 탐색. 정확도: 분 단위.

### 3. 주역 점법

- **시초점**(蓍草占, Yarrow): 50개 시초 → 49개 분할(3회) → 1효. 6회 반복. 확률: 노음 1/16, 소양 5/16, 소음 7/16, 노양 3/16.
- **동전점**(三錢): 3개 동전 합으로 1효. 확률 균등.
- 동효(6 또는 9)가 있으면 변괘(變卦) 산출 → 두 괘로 흐름 해석.

### 4. 궁합

다차원 가중 평균:
- 일간 오행 관계 (35%) - 상생/상극/비화
- 일지(부부궁) 합·충 (35%)
- 띠(년지) 합·충·삼합·육합 (15%)
- 오행 보완도 (15%)

## 도입한 오픈소스 컨셉 (출처 명시)

본 시스템은 다음의 검증된 오픈소스 프로젝트들의 **알고리즘 컨셉**을 참조해 자체 구현했습니다.

| 프로젝트 | 라이선스 | 도입 컨셉 |
|---|---|---|
| [usingsky/korean_lunar_calendar_js](https://github.com/usingsky/korean_lunar_calendar_js) | MIT | KASI 표준 음양력 변환 알고리즘 |
| [urstory/manseryeok-js](https://github.com/urstory/manseryeok-js) | MIT | 진태양시 경도 보정 + 절기 기반 월주 산출 |
| [yhj1024/manseryeok](https://github.com/yhj1024/manseryeok) | MIT | 한국형 60갑자 만세력 |
| [cantian-ai/bazi-mcp](https://github.com/cantian-ai/bazi-mcp) | MIT | 십신·길흉신·대운·형충회합 출력 스키마 |
| [alvamind/bazi-calculator](https://github.com/alvamind/bazi-calculator-by-alvamind) | MIT | Bazi 호환성(궁합) 분석 |
| [tommitoan/bazica](https://github.com/tommitoan/bazica) | MIT | 1900~2100 일주 인덱스 검증 |
| [hjsh200219/fortuneteller](https://github.com/hjsh200219/fortuneteller) | - | 사주 MCP 서버 컨셉 |
| [Brianfit/I-Ching](https://github.com/Brianfit/I-Ching) | MIT | Yarrow stalk 시초점 알고리즘 |
| Jean Meeus, *Astronomical Algorithms* (2nd ed.) | 책 | 태양 황경·율리우스일 계산 |
| Rider-Waite-Smith Tarot (1909) | Public Domain | 타로 78장 이미지·해석 전통 |

## Python CLI 사용

```bash
python3 python/saju.py --year 1990 --month 5 --day 15 --hour 12 --gender M
python3 python/saju.py --verify   # 검증 케이스 실행
```

출력 예:
```
=== 사주팔자 (1990년 말띠) ===
     年     月     日     時
    庚午    辛巳    丙午    甲午
일간(나): 丙(병) - 화/양
```

## 면책

운명은 참고일 뿐, 결정은 본인의 몫입니다. 본 시스템은 학술·교육·문화체험 목적으로 제공되며, 의료·법률·재정 결정의 근거로 사용하지 마세요.
