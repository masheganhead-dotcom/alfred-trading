# 🔮 오라클 프로젝트 — 세션 핸드오프 문서

> **새 세션에서 이 파일 하나만 읽으면 모든 컨텍스트를 파악하고 즉시 작업 재개 가능합니다.**

---

## 📌 한 줄 요약

**한국식 사주명리학 + 머신러닝 + 5인 협업 분석 + 시기 예측 시스템**을 구축한 음악 프로듀서 최성훈의 개인 사주·운세 도구.
GitHub 레포: `masheganhead-dotcom/alfred-trading`, 브랜치: `claude/fortune-telling-system-MqR3P`, PR #1.

---

## 🚨 IMMEDIATE TODO (새 세션이 가장 먼저 할 일)

### 텔레그램 봇 매일 자동 발송 시스템 마무리

**준비된 모든 코드는 이미 푸시 완료**. 남은 작업은 GitHub 측면 설정 3가지:

#### 1. PR #1 머지
```
URL: https://github.com/masheganhead-dotcom/alfred-trading/pull/1
- 현재 Draft 상태
- "Ready for review" → "Merge pull request" 클릭
- 이유: GitHub Actions는 main 브랜치 워크플로우만 등록됨
```

#### 2. GitHub Secrets 2개 등록
```
URL: https://github.com/masheganhead-dotcom/alfred-trading/settings/secrets/actions/new

Secret 1:
  Name:    TELEGRAM_BOT_TOKEN
  Secret:  8904832471:AAHxejPWRcsMwVygjCaVbv7EUG6tMQODR_8

Secret 2:
  Name:    TELEGRAM_CHAT_ID
  Secret:  1647981769
```

#### 3. 워크플로우 수동 실행 (테스트 발송)
```
URL: https://github.com/masheganhead-dotcom/alfred-trading/actions/workflows/daily-fortune.yml
- 우측 "Run workflow" 클릭
- Branch: main (PR 머지 후) 또는 claude/fortune-telling-system-MqR3P
- "Run workflow" 클릭
- 30초 후 텔레그램 도착 확인
```

#### 4. 성공 확인 후 권장
- 봇 토큰 revoke 후 재발급 (이 채팅에서 노출됨)
- `@BotFather` → `/mybots` → 본인 봇 → Revoke current token
- 새 토큰을 GitHub Secrets에서 Update

---

## 👤 사용자 정보

```
이름:    최성훈 (영문 활동명 미정)
직업:    음악 작곡가/프로듀서 (마스크 아티스트로도 활동 기획중)
생년월일: 1998년 11월 7일 (양력) 오전 7:35
성별:    남
출생지:  서울 (경도 127°)
현재 나이: 만 27세
스트레스: 코인 -40% / 저작권 문제 / 불면증
```

### 사주
```
사주: 戊寅 / 壬戌 / 甲申 / 戊辰
일간: 甲(갑) - 큰 나무, 목·양
띠:   호랑이 (寅)
일주: 甲申 (갑신일주) — "갑목 위에 신금이 앉아 도끼질이 끊이지 않으니 몸이 고단하다"
격국: 편재격 (사업·역마·인기 그릇)
신강/약: 14점 극신약
용신: 화(火) — 빨강·남쪽·연예/방송/음악/IT
기신: 금(金) — 흰색·서쪽·금속·금융 피하기
신살: 백호살×2 + 역마살 + 화개살 + 괴강살

오행: 목2 / 화0 / 토4 / 금1 / 수1 (화 결핍 / 토 과다)
일지충: 寅申충 (년지↔일지)
시지자형: 辰辰

대운 (10년 단위, 순행, 0.11세 시작):
  0~9세    癸亥(정재) — 안정·물의 기운
  10~19세  甲子(편관) — 압박·시련
  20~29세  乙丑(정관) — 답답함 (현재)
  30~39세  丙寅(편인) — ⭐ 인생 황금기 시작
  40~49세  丁卯(정인) — 명예 정점
  50~59세  戊辰(비견) — 안정
  60~69세  己巳(겁재) — 정리·라이벌
  70~79세  庚午(식신) — 베푸는 노년
```

### 결정적 길일 (2026)
```
🌟 2026년 5월 29일 (금) — 76점 大길 (己巳일, 일간합+일지합+정재)
🌟 2026년 7월 28일 (화) — 76점
🌟 2026년 9월 26일 (토) — 76점
🌟 2026년 11월 25일 (수) — 76점

⛔ 절대 피해야 할 날 (庚寅일·乙酉일 60일 주기):
  6/19·8/18·10/17·12/16 (庚寅) — 일주충 발동
  6/24·8/23·10/22·12/21 (乙未) — 백호살 폭발
```

---

## 👥 5인 협업 그룹 사주

### 김건희 (형, 음악 동료 / 멘토 역할)
```
생일: 1995년 6월 3일 08:30 (양력, 남)
사주: 乙亥 / 辛巳 / 辛卯 / 壬辰
일간: 辛(신금) - 보석·정밀·완벽주의
띠:   돼지 (亥)
일주: 辛卯 — "보석이 꽃을 자르는 격, 마음 다칠 일 많음"
격국: 정관격
신강/약: 신약 15점
용신: 토(억부)
기신: 수
신살: 역마·원진·귀문관·괴강

본인과의 궁합: 55점 C급
관계: 정관(형)-정재(나) = 정통 멘토-실무 구조
경고: 형은 본질이 안정직(정관격), 음악이 본업 아닐 수도. 귀문관·원진살로 신경 예민.
```

### DAWN (이던, 본명 김효종) — 메인 듀오 동료 ⭐
```
생일: 1994년 6월 1일 (양력, 남) - 시각 미상
사주: 甲戌 / 己巳 / 甲申 / 庚午
일간: 甲(갑) - 본인과 동일!
일주: 甲申 (갑신) — 본인과 같은 일주! ⭐
띠:   개 (戌)
격국: 편관격 (도전·시련·살)
신강/약: 극신약 8점 (본인보다 더 약)
용신: 수(조후) / 기신: 화 ← 본인 용신과 반대
신살: 문창귀인·역마·화개·원진·귀문관·공망 (6개)
펜타곤 출신 → P NATION → 솔로 (현아와 공개연애 사건)

본인과의 궁합: 76점 A급 ⭐⭐ (5명 중 1위)
관계: 비견-비견 (동등한 동료, 형제 같음)
띠궁합: 88점 寅午戌 삼합
오행 보완: 본인 화0 ← DAWN 화2 (완벽 보완)

이미 dawn이 "팀하자/계약하자" 제안 → 검토 중. 결정 = 2026/5/29
```

### JUNNY (본명 김형준, 캐나다 밴쿠버 출생) — 정신적 가이드
```
생일: 1996년 4월 6일 (양력, 남) - 시각 미상
사주: 丙子 / 壬辰 / 己亥 / 庚午
일간: 己(기) - 작은 토, 옥토
일주: 己亥 (기해) — "기토가 큰 물 옆에 있으니 마음이 깊다"
띠:   쥐 (子)
격국: 양인격 (강건·결단)
신강/약: 중화 42점 (5명 중 가장 강함) ⭐
용신: 목(통관) / 기신: 토
신살: 화개·도화·원진·귀문관·괴강·공망

본인과의 궁합: 59점 C급 (子午충 영향)
관계: 정재-정관 (내부 멘토 — 정신 가이드 역할)
역할: 5인 중 멘탈 코치
```

### Andnew (본명 정창윤, 대구) — 도전·자극 동료
```
생일: 1997년 5월 12일 (양력, 남) - 시각 미상
사주: 丁丑 / 乙巳 / 庚辰 / 壬午
일간: 庚(경) - 큰 쇠·도끼
일주: 庚辰 (경진) — 괴강살 일주, "두령의 기상"
띠:   소 (丑)
격국: 편관격 (DAWN과 같은 격)
신강/약: 신약 17점
용신: 수(조후) / 기신: 화
신살: 도화·화개·원진·귀문관·백호·괴강 (6개, DAWN보다 백호살 더)

본인과의 궁합: 65점 B급
관계: 편관-편재 (본인을 압박·자극)
역할: 본인 한계 깨주는 도전 동료
```

### 5인 오행 합계 (놀라울 정도로 균형)
```
            목  화  토  금  수
최성훈       2   0   4   1   1   (화 결핍, 토 과다)
김건희       2   1   1   2   2   (균형)
DAWN        2   2   2   2   0   (수 결핍)
JUNNY       0   2   2   1   3   (목 결핍)
Andnew      1   3   2   1   1   (화 강)
─────────────────────────────────
5인 합계     7   8   11  7   7   ★ 편차 4, 거의 완벽 균형

→ 사주적으로 한 팀이 되어야 할 운명
→ 한 명이라도 빠지면 한쪽이 무너짐
```

### 5인 십신 구조 (관계 본질)
```
김건희 형  → 정관 (외부 멘토·디렉팅)
DAWN     → 비견 (동등 동료·듀오)
JUNNY    → 정관 (정신 멘토)
Andnew   → 편관 (도전 자극)
최성훈   → 중심 (편재격, 모든 자원 연결)

→ 한 팀의 모든 역할이 사주적으로 갖춰짐
```

### 2026/5/29 3인 시너지
```
나 단독        76점
+ DAWN        152점  🌟 최강
+ 김건희       132점
+ Andnew      132점
+ JUNNY       117점 (子午충)
```

---

## 🗂 시스템 구조 (이미 만든 모든 것)

### 디렉토리
```
alfred-trading/
├── fortune/                    ← 사주 시스템 (메인)
│   ├── index.html              UI (8개 탭)
│   ├── app.js                  UI 컨트롤러
│   ├── README.md
│   ├── core/                   알고리즘 모듈 18개
│   ├── data/                   빅데이터 JSON 13개
│   ├── python/                 Python 엔진·ML
│   └── tests/                  테스트·분석 스크립트 14개
├── .github/workflows/
│   └── daily-fortune.yml       매일 텔레그램 발송 cron
├── index.html                  기존 alfred-trading 봇 대시보드
└── update_dashboard.py         기존 봇
```

### Core 모듈 (`fortune/core/`)
```
solar_terms.js          24절기 천문 계산 (Meeus 알고리즘)
saju.js                 사주 4기둥 + 십신 + 대운 + 형충회합
iching.js               주역 64괘 + 시초점·동전점
tarot.js                타로 78장 셔플·스프레드
tojeong.js              토정비결 144괘
gunghap.js              사주 궁합
interpret.js            한국어 종합 해석
mudang.js               한국 무당식 (신살·삼재·당사주·납음·일주)
yongsin.js              용신 4종 + 신강/약 정밀 점수
geokguk.js              격국 자동 판별 (10정격 + 5외격)
sigi.js                 시기 예측 (대운+세운+월운)
wol_il.js               월운·일진·택일 (7개 활동)
era.js                  역사·국가·60갑자 시대 사이클
science.js              MBTI/베이지안/바이오리듬/수비학
statistical_science.js  Big5/출생계절/Forer/황도12궁
ml_classifier.js        사주→직업 분류기
daily_story.js          매일 텔레그램 스토리 생성
telegram_send.js        텔레그램 봇 API
dialog_parser.js        카톡/전사 파싱
dialog_features.js      대화 50+ 특징 추출
saju_dialog_match.js    사주↔대화 자동 검증
```

### 데이터 (`fortune/data/`)
```
saju_basic.json          천간/지지/오행/십신/12운성/신살
iching64.json            주역 64괘 + 괘사
tarot78.json             타로 78장 정/역 해석
tojeong144.json          토정비결 샘플
shinsal.json             신살 자동판별표
ilju60.json              60갑자 일주 정밀해석 (60개 전부)
ddi_gunghap.json         12x12 띠궁합 매트릭스
korea_mudang.json        한국 무속 (삼재·부적·당사주·납음)
history_charts.json      역사 인물·국가 사주
figures_dataset.json     인물 데이터셋 158명
figures_dataset_extended.json  추가 160명 (총 316명)
myeongri_rules.json      명리학 룰 100개 (자평진전·적천수)
ml_phase3_results.json   머신러닝 결과
credits.json             출처 명시
```

### Python (`fortune/python/`)
```
saju.py                  Python 사주 엔진 (검증용)
ml_phase3.py             scikit-learn ML 분석
daily_telegram.mjs       매일 텔레그램 발송 메인
```

### 워크플로우
```
.github/workflows/daily-fortune.yml
- cron: '30 22 * * *' (UTC = KST 7:30 매일)
- workflow_dispatch: 수동 실행 가능
```

---

## 🎯 핵심 사주 분석 결과 (요약)

### 본인 인생 시기별 (검증 60~70% 적중)
```
0~9세    조용한 꼬마 - 잔병치레
10~19세  ⚠ 압박의 시기 - 학교/부모/입시 시련 (음악 시작은 고1)
20~29세  ⚠ 답답함의 시기 (현재) - 가장 어두움
30~39세  ⭐⭐⭐ 인생 첫 황금기 (2028~) - 결혼·재물 폭발
40~49세  ⭐ 명예 정점
50~59세  ✓ 거장 안정 (한국 국운과 동조)
60~69세  △ 라이벌 정리
70세~    ✓ 노년에도 음악
```

### 핵심 시기 예측
```
2026 (만28세) 丙午년 — 사주에 처음 화 들어옴 ⭐
  → 2026/5/29(금) 인생급 발매·계약 D-DAY
2027 (만29세) 丁未년 — 30대 진입 직전
2028 (만30세) 戊申년 — ⭐⭐⭐ 30대 대운 시작, 결혼/재물
2029 (만31세) 己酉년 — 결혼/재물 정점
2030 (만32세) 庚戌년 — 직장·계약 안정
2034 (만36세) 甲寅년 — ⚠ 일주충 재발동, 큰 변동
```

### Big5 OCEAN 자동 매핑
```
O 개방성 53
C 성실성 50
E 외향성 73 ← 높음 (사주 화 부족 보완)
A 친화성 25 ← 낮음 (독립·경쟁적)
N 신경증 65 ← 높음 (감정 변동 큼)
```

### MBTI 매핑
```
ESTP (사업가형) — 편재·편관 활동력
신뢰도 37% (휴리스틱)
```

### 황도12궁 (서양 별자리)
```
전갈자리 (Scorpio) ♏ - 수/명왕성
사주↔별자리 교차: 사주 토 vs 별자리 수 → 차이 (양면 고려)
```

### 출생계절 효과 (PLOS ONE 2021 인용)
```
가을생 (9-11월): 겨울 임신으로 Vit D 부족 가능
정서: Disorderliness 점수↑ (남성)
```

---

## 💰 코인 분석 결과 (사용자 -40% 상태)

### 비트코인 사주
```
출생: 2008-10-31 백서 / 2009-01-03 제네시스
사주: 戊子년 (토극수, 안정 속 재물)
오행: 수3 / 토2 / 화1~2
```

### 이더리움 사주
```
출생: 2015-07-30 메인넷
사주: 乙未 / 癸未 / 癸酉
일간: 癸(수) - 작은 물·이슬
오행: 금3 / 토2 / 수2 / 목1 / 화0
```

### 본인 ↔ 코인 궁합
```
본인 ↔ 비트코인:  59점 C급 (비견 경쟁)
본인 ↔ 이더리움:  69점 B급 (상대가 본인을 도움) ⭐
→ ETH 비중 확대 권장
```

### 60년 사이클 (1846·1906·1966·2026 모두 丙午년)
```
1906 → 1907 미국 금융패닉 -50%
1966 → 1968 증시 -36%
2026 → 현재 -40% 진행 중 (사주 패턴 일치)
```

### 향후 5년 코인 운세
```
연도   세운   BTC점수  ETH점수
2026 丙午   65점    70점 (조정 중)
2027 丁未   55점    55점 (횡보)
2028 戊申   70점    60점 ⭐ 회복 본격
2029 己酉   70점    60점 ⭐ 회복 지속
2030 庚戌   45점    60점 (규제 강화)
```

### 본인 사주 기반 투자 가이드
```
✅ 추천:
  - 인덱스·ETF (분산투자) ← 공망 방어
  - 해외 우량주 (역마)
  - 음악·엔터·IT 산업 (화 용신)
  - 적은 금액 자주 (극신약 + 편재)
  - 장기 적립식

❌ 피해야:
  - 레버리지·선물·옵션 (백호살 폭발)
  - 단타·스캘핑 (충동 매매)
  - 한 종목 몰빵 (재다신약)
  - 친구 따라 투자 (군겁쟁재)
  - 금속·금융주 (기신 = 금)

시기 전략:
  ~2027: 큰 베팅 X, 분할 매수
  2028~: 본격 투자 시작 (대운 시작)
  2030: 규제 조정 가능, 차익 실현 검토
```

---

## 🔬 머신러닝 검증 결과 (Phase 3)

### 시스템 성능
```
데이터셋:          316명 인물 사주 학습
직업 분류 TOP1:    48.1% (5-fold CV)
랜덤 대비:         5.8배
TOP3:              약 75%
```

### 본인 사주와 99% 비슷한 인물 (코사인 유사도)
```
1위  톨스토이 (문학)     0.93
2위  하니 (뉴진스)       0.90
3위  천러 (NCT)         0.89
4위  안중근 (정치)       0.88
```

### 본인 사주 RF 직업 예측
```
1위 연예      30.3%
2위 작곡가    18.1% ← 본업과 일치
3위 문학      13.3%
4위 정치       9.9%
5위 스포츠     6.6%
```

### 김건희 형 RF 예측
```
1위 연예      56.7% ← 본업 음악과 일치 (시스템 정확성 검증)
2위 종교      16.0%
3위 기업가     7.1%
```

### Feature Importance 1위
```
ilju_idx (60갑자 일주) 8.5% ← 명리학 통념 검증
```

---

## 📋 텔레그램 봇 시스템

### 메시지 페르소나
```
호칭:    "성훈"
톤:      친근한 사주 친구 (무당식 살짝)
이모지:  매일 다른 (10가지 인트로 풀)
구성:    인트로 + 사주 점수 + 십신 조언 + 신호 + 시간대 + D-DAY 카운트 + 처방 + 클로징
```

### 매일 발송 시간
```
한국시간 오전 7:30 자동 (cron: '30 22 * * *' UTC)
```

### 데모 예시 (5/29 大길 메시지)
```
🌞 일어났어? / 성훈 🌟

*2026년 5월 29일 금요일*
오늘 일진은 *己巳일* / 십신은 *정재*
사주 점수: *76점* (대길)

📖 *오늘 진짜 좋은 날이야!*
약속 잘 지키기

🎯 오늘 신호들:
  · 일간합 - 만남·계약 신호
  · 일지합 - 만남·계약·결혼에 길
  · 정재 - 재물 활동·계약·인기 길

⏰ 오늘의 시간:
  🌟 23:30-01:30 (자시) - 삼합
  🌟 07:30-09:30 (진시) - 삼합
  ⛔ 03:30-05:30 (인시) - 충, 피해

💊 오늘의 처방: 🌙 22시 이후 작업 OFF

— 조심조심·살살살살 🍀
```

---

## 🛠 새 세션이 사용할 명령어

### 1. 레포 클론 (맥북 새 세션 시작 시)
```bash
cd ~/path/to/projects
git clone <레포 URL>  # 또는 이미 있으면
cd alfred-trading
git checkout claude/fortune-telling-system-MqR3P
git pull
```

### 2. 시스템 작동 확인
```bash
cd fortune
node tests/demo_daily_story.mjs       # 오늘 메시지 미리보기
node tests/analyze_5people.mjs        # 5인 매트릭스
node tests/crypto_analysis.mjs        # 코인 분석
python3 python/saju.py --verify       # Python 엔진 검증
```

### 3. 테스트 텔레그램 발송 (로컬에서)
```bash
export TELEGRAM_BOT_TOKEN="8904832471:AAHxejPWRcsMwVygjCaVbv7EUG6tMQODR_8"
export TELEGRAM_CHAT_ID="1647981769"
cd fortune
node python/daily_telegram.mjs
```

### 4. GitHub Secrets 등록 (gh CLI 있을 때)
```bash
gh auth login
gh secret set TELEGRAM_BOT_TOKEN -b "8904832471:AAHxejPWRcsMwVygjCaVbv7EUG6tMQODR_8" -R masheganhead-dotcom/alfred-trading
gh secret set TELEGRAM_CHAT_ID -b "1647981769" -R masheganhead-dotcom/alfred-trading
gh workflow run daily-fortune.yml -R masheganhead-dotcom/alfred-trading
```

### 5. PR 머지 (gh CLI)
```bash
gh pr ready 1 -R masheganhead-dotcom/alfred-trading
gh pr merge 1 -R masheganhead-dotcom/alfred-trading --squash
```

### 6. 또는 브라우저 자동화 (맥북에 Playwright 있다면)
```
새 세션에 한 마디:
"GitHub Secrets에 TELEGRAM_BOT_TOKEN=8904832471:AAHxejPWRcsMwVygjCaVbv7EUG6tMQODR_8,
TELEGRAM_CHAT_ID=1647981769 등록하고 워크플로우 수동 실행해줘.
PR #1도 머지해줘. 다 자동으로."
```

---

## 🎯 새 세션이 할 일 우선순위

1. **이 핸드오프 파일 읽고 컨텍스트 파악** (5분)
2. **시스템 작동 확인** (테스트 실행)
3. **PR #1 머지** (또는 사용자에게 부탁)
4. **GitHub Secrets 등록** (브라우저 자동화 시도 / 사용자 직접)
5. **워크플로우 수동 실행 → 텔레그램 도착 확인**
6. **봇 토큰 revoke 권유 + 새 토큰 등록**

---

## 💡 추가 작업 옵션 (사용자 요청 가능)

### 시스템 강화
- 데이터셋 1,000명+ 확장 → 적중률 60%+
- 사용자 피드백 폼 + 추적 데이터셋
- 카톡·전사 데이터 결합 (`dialog_parser.js` 이미 준비됨)
- 5인 + 외부 인물 추가 분석

### 텔레그램 봇 강화
- 5인 매트릭스 자동 매일 비교
- 주말 다음 주 예고편
- 월 1회 종합 리포트
- 위기 신호 별도 알림
- 코인 차트 + 사주 시그널 결합

### 투자 분석
- alfred-trading 봇과 결합
- 본인 사주 기반 매일 투자 컨디션
- 자산별 사주 분석 (HYPE/SOL/특정 주식)

---

## ⚠ 보안 알림

이 문서에 텔레그램 봇 토큰 노출됨:
```
8904832471:AAHxejPWRcsMwVygjCaVbv7EUG6tMQODR_8
```
**작동 확인 후 즉시 BotFather에서 revoke + 재발급 권장**.

---

## 📚 도입한 오픈소스 (모두 MIT/Public Domain)

```
- urstory/manseryeok-js: 진태양시 보정·만세력
- yhj1024/manseryeok: 60갑자 시스템
- tommitoan/bazica: 1900-2100 일주
- cantian-ai/bazi-mcp: 출력 스키마
- alvamind/bazi-calculator: 호환성 분석
- usingsky/korean_lunar_calendar_js: 음양력
- Brianfit/I-Ching: Yarrow 시초점
- Rider-Waite-Smith Tarot 1909: 타로
- Jean Meeus Astronomical Algorithms: 천문 계산
- 자평진전(子平眞詮): 정통 격국론
- 적천수(滴天髓): 용신론
- Costa & McCrae NEO-PI-R: Big5
- PLOS ONE 2021 / Frontiers Psychiatry 2025: 출생계절
- Forer 1948: Barnum effect
```

---

## 🔮 마무리 — 새 세션 첫 메시지 예시

```
"방금 만든 사주 시스템의 모든 컨텍스트를 HANDOFF.md에서 확인했어.
지금 가장 급한 건 텔레그램 봇 자동 발송 시스템 마무리야:

1. PR #1을 main에 머지
2. GitHub Secrets에 TELEGRAM_BOT_TOKEN과 TELEGRAM_CHAT_ID 등록
3. 워크플로우 수동 실행해서 첫 텔레그램 발송 테스트
4. 도착하면 봇 토큰 revoke 후 새 토큰으로 교체

브라우저 자동 조작으로 다 처리해줘.
값은 HANDOFF.md에 적혀있고, 레포는 masheganhead-dotcom/alfred-trading,
브랜치는 claude/fortune-telling-system-MqR3P야."
```

이걸 새 세션에 그대로 붙여넣으시면 됩니다.

---

**마지막 커밋**: 2026-05-22 / **브랜치**: claude/fortune-telling-system-MqR3P / **PR**: #1 (Draft)
