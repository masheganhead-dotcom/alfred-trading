# Alfred M4L Suite — Session Handoff

> **다른 Claude 세션에서 이 파일을 받으면 즉시 이 문서를 끝까지 읽고
> 작업 컨텍스트를 파악한 다음 사용자에게 "어디까지 진행되었는지" 한
> 줄 요약하고 다음 액션을 제안해주세요. 사용자는 한국어 비개발자이고
> Ableton Live 12 Suite 유저입니다.**

---

## TL;DR (10초 요약)

- **누구**: 한국어 사용자, 비개발자, Ableton Live 12 Suite (macOS)
- **무엇**: Max for Live (M4L) 디바이스 6개 빌드 — 코드/패치는 다
  작성·검증·푸시 완료
- **지금 막힌 곳**: 사용자가 **Max에서 `.maxpat` → `.amxd` 변환을
  직접 해야 함** (90초 작업). Claude는 클라우드라 Max 실행 불가.
- **다음 액션**: 사용자가 Alfred Shader 빌드 시도 → 막히면
  스크린샷 받아서 디버그 → 동작 확인되면 Phase B로 진행
- **GitHub**: `masheganhead-dotcom/alfred-trading`, branch
  `claude/max-for-live-plugin-research-bUhx7`, PR #2 (draft)

---

## 1. 사용자 프로필 (어떻게 대해야 하는지)

- **언어**: 한국어 우선. 영어 섞어도 OK. 짧은 메시지("ㄱㄱ", "ㅋㅋ")
  자주 씀.
- **기술 수준**: 비개발자. Max/코딩 모름. 음악 프로듀싱은 잘 함.
- **톤**: 캐주얼. 욕("시발") 가끔 함 — 짜증이 아니라 캐주얼 표현.
- **응답 선호도**:
  - **짧고 직접적**으로 답할 것 (장황한 설명 싫어함)
  - 결정 빨리 — "ㄱㄱ" = "더 안 물어봐도 됨, 그냥 진행"
  - 숫자/정확도 좋아함 (예: "70%인지 90%인지" 명확히)
  - **솔직함** 좋아함 (못 하는 거 솔직히 말하면 OK함)
- **금기 사항**:
  - 너무 많이 물어보지 말기
  - 깊은 기술 용어 남발 ❌
  - "이걸 하시려면 먼저…" 같은 길게 우회하는 답변 ❌
  - 약속 못 지킬 일 미리 말하지 말기

---

## 2. 프로젝트 현황 — 빌드된 6개 디바이스

모두 `m4l/devices/<device>/` 폴더에 들어있고, 각 디바이스는
`<Name>.maxpat` + `<name>.js` + `README.md` 세트.

| # | 디바이스 폴더 | 목적 | 상태 |
| --- | --- | --- | --- |
| 1 | `system-audio-capture/` | 시스템 사운드 (Suno/유튜브 등) → Live 트랙 원클릭 녹음 | 코드 완료, 미빌드 |
| 2 | `smart-group-resample/` | 그룹 트랙을 한 오디오 클립으로 바운스 (freeze 우회) | 코드 완료, 미빌드 |
| 3 | `suno-bridge/` | Suno URL 붙여넣기 → maxurl로 다운로드 → 트랙 import | 코드 완료, 미빌드 |
| 4 | `session-cleaner/` | 빈 트랙/뮤트 클립/비활성 디바이스 SCAN→CLEAN | 코드 완료, 미빌드 |
| 5 | `float-mixer/` | 별도 floating 믹서 창 (Logic/Cubase 스타일) | 코드 완료, 미빌드 |
| 6 | **`alfred-shader/`** ⭐ | **오디오 반응 art 비주얼라이저** (3 프리셋: Liquid Chrome / Audio Blob / VHS Glitch) | **코드 완료, 미빌드 — 현재 빌드 대기 중** |

**현재 사용자가 도움 요청한 것은 #6 Alfred Shader**. 이게 가장 viral
잠재력 있는 디바이스라 우선순위 높음.

### 공유 라이브러리
`m4l/devices/_lib/alfred-liveapi.js` — 6개 디바이스 공통으로 쓰는
LiveAPI 헬퍼 (트랙 생성, 라우팅, mute/solo/arm, 디바이스 enumeration
등). 새 디바이스 만들 때 `include("alfred-liveapi.js")` 한 줄로
사용 가능.

---

## 3. 사용자가 지금 해야 하는 일 (현재 차단된 step)

Alfred Shader 디바이스를 본인 Mac에서 **마우스 클릭 ~5번**으로 빌드:

### Step 1. ZIP 다운로드
GitHub repo의 PR #2 브랜치에서 `m4l/devices/alfred-shader/` 폴더 받기.
또는 repo 전체 clone.

### Step 2. 폴더 배치
`alfred-shader/` 폴더 통째로 → `~/Documents/Max 8/Library/`
(Max가 없으면 9도 같은 경로지만 `Max 9`)

### Step 3. Live에서 빈 디바이스 → 편집 모드
Live 12 → 빈 오디오 트랙 → 브라우저 `Max for Live → Audio Effect →
Max Audio Effect` 드래그 → 트랙에 들어간 디바이스의 ✏️ (편집) 아이콘 클릭.

### Step 4. Max에서 패치 열기
Max가 열리면 → `File → Open` → `AlfredShader.maxpat` 선택.

### Step 5. .amxd로 저장 (마법의 클릭)
`File → Save As…` → Format: **Max for Live Device (.amxd)** →
Type: **Audio Effect** → 저장 위치:
`~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/`
→ 파일명 `Alfred Shader.amxd`

**끝. 90초 작업.**

상세 한국어 가이드: `m4l/docs/사용설명서_한국어.md`

### 자주 막히는 부분
- **객체가 빨간 점선** → 셰이더 파일 (`.jxs`)을 Max가 못 찾는 거.
  Max → Options → File Preferences → Search Path → Add Path →
  `alfred-shader` 폴더 추가.
- **OPEN VISUAL 눌러도 창 안 뜸** → Max Console 에러 확인 필요.
  사용자에게 콘솔 스크린샷 요청.
- **창은 뜨는데 검은 화면** → `shaders/` 폴더가 따라가지 않은 경우.
  Search Path 다시 확인.

---

## 4. 다음 진행 옵션 (사용자가 동작 확인하면)

### Phase B (10h): 4개 프리셋 추가
- 🌀 Fractal Cave (Inigo Quilez 스타일 raymarching)
- ✨ Particle Bloom (Active Theory 풍 cinematic)
- 📈 Oscilloscope (Jerobeam Fenderson 풍 Lissajous)
- 🏛️ Art Deco (geometric vintage)

### Phase C (12h): 하이엔드 art tier
- 🌌 Neural Brush (Refik Anadol 라텐트 brush)
- 🏔️ Painted Hills (raymarched landscape)
- 🦠 Reaction-Diffusion (Karl Sims)
- 🌪️ Strange Attractor (Lorenz/Aizawa)

### Phase D (10h): Code Mode 🔥
- Shadertoy URL 붙여넣기 → 자동 변환 → 음악에 반응
- Hydra subset translator
- 라이브 GLSL 편집

### Phase E (6h): 출하 마무리
- MP4 녹화 버튼
- 9:16 / 1:1 aspect 변환
- 퀄리티 auto-tuner

전체 catalog: `m4l/devices/alfred-shader/PLAN.md`

### 또는 다른 디바이스 추가 빌드
`m4l/docs/IDEAS.md`에 30+ 디바이스 아이디어 있음 (3개 Round로
구성). ROI 높은 것들:
- **Track Naming & Color Enforcer** (3h, 매일 쓰는 도구)
- **Auto Side-chain Setup** (5h, EDM 필수)
- **Drop Trigger** (8h, build-up 자동 생성)
- **Hyperpop Vocal Stack** (5h, 보컬 1버튼)
- **Vibe Roulette** (6h, viral 잠재력)

---

## 5. 세션 히스토리 요약

### Round 1 — 워크플로우 유틸리티 (디바이스 1-5 빌드 완료)
처음에는 producer pain point 12개 아이디어 도출 (Track Naming
Enforcer, Stem Export Pre-Flight, Section Locator Generator,
Reference A/B LUFS Match, MIDI Multi-Clip Humanize, View Snapshot
Manager 등). 그 중에서 사용자가 워크플로우 정리 도구들 (Session
Cleaner) 선호.

### Round 2 — Pro Tools 이주자 + EDM 페인포인트
Commit / Bounce in Place, Auto Side-chain Setup, Vocal Take
Recorder, Drum Velocity Patterns, Macro Mapping Inspector 등
디자인. 이건 빌드 안 함.

### Round 3 — Gen-Z / viral 디바이스
사용자가 "젠지스럽고 유쾌하고 성능 좋고 후기 좋은" 디바이스 원함.
8개 viral 후보 (Pong/Snake Beats, Vibe Roulette, ReelMaker,
Hyperpop Vocal Stack, Beat Bingo, Drop Trigger, ChatVibe, Mood
Lights) 도출. 그 중 사용자가 **비주얼 반응 도구**에 꽂힘.

### Alfred Shader 디자인 + Phase A 빌드
처음에 "WAVES / SPECTRUM" 같은 평범한 모드 제안했더니 사용자가
"너무 아트적이지 않다"고 거절. 그래서 진짜 art 레퍼런스 12개 큐레이션
(Refik Anadol, Inigo Quilez, GMUNK, Active Theory, Jerobeam
Fenderson 등) → `m4l/devices/alfred-shader/PLAN.md`로 정리 →
Phase A (3 프리셋) 빌드 완료 → 현재 사용자 빌드 검증 대기.

### 사용자가 명시적으로 거절한 것들
- ❌ **그룹 자동 생성 디바이스** — LiveAPI에 `Song.group_tracks()`
  메서드가 없음. Cmd+G 시뮬레이션만 가능 (깨지기 쉬움). 솔직히
  말했더니 OK함.
- ❌ **평범한 visualizer 모드** (Waves/Spectrum/Orbs) — 너무
  generic, art 레퍼런스 원함

### 사용자가 명시적으로 OK한 것들
- ✅ 3개 ROUND 아이디어 정리
- ✅ Alfred Shader Phase A 빌드
- ✅ 한국어 가이드 작성
- ✅ Phase A 빌드 시도 (현재)

---

## 6. 기술적 제약 (다음 Claude가 알아야 할 것)

### Claude가 못 하는 것
1. **Max 실행 불가** — 클라우드 컨테이너 환경, GUI 없음
2. **`.amxd` 직접 생성 불가** — 포맷이 `[binary header] + [JSON
   patcher] + [binary footer]`이고 binary 부분은 Max만 만들 수
   있음. 외부에서 못 함.
3. **Live 실행/테스트 불가** — 같은 이유

### LiveAPI 알려진 한계
- ❌ `Song.group_tracks()` — 트랙 그룹화 메서드 없음
- ❌ `Song.move_track()` — 트랙 순서 이동 없음
- ❌ Plugin cross-track copy — 트랙 간 디바이스 복사 없음
- ❌ Preset save/load API — 디바이스 프리셋 저장 API 없음
- ❌ 실제 freeze/flatten 호출 — `is_frozen` read만, set/call 없음
- ✅ 트랙 생성/삭제, 디바이스 활성/삭제/같은 트랙 내 이동, 라우팅,
  볼륨/팬/M/S/R, 클립 생성/삭제, 마커, 색상, FFT/peakamp/RMS 분석

### Max 디바이스 작성 시 알아야 할 것
- `.maxpat`은 JSON. `python -m json.tool < file.maxpat`로 검증 가능
- 객체 ID는 직접 정함 (`obj-1`, `obj-mix` 등). 충돌 안 나게.
- `lines` 배열의 `source`/`destination`은 `[object_id, outlet_index]` 형식
- `live.thisdevice` 객체 필수 (디바이스 라이프사이클)
- Audio Effect는 `plugin~` (입력) + `plugout~ 1 2` (출력) 필요
- `live.text mode 1`은 버튼, `mode 0`은 표시용
- `live.dial`/`live.numbox`는 자동화 가능 (parameter 노출)
- Jitter 객체 (`jit.world`, `jit.gl.videoplane`, `jit.gl.slab`)는
  비주얼용. 셰이더는 `.jxs` 형식 (XML 헤더 + GLSL)

---

## 7. 파일 인덱스 (어디 뭐 있는지)

```
m4l/
├── README.md                        — 전체 suite 소개
├── docs/
│   ├── RESEARCH.md                  — 2025-2026 M4L 시장 조사
│   ├── DESIGN.md                    — 처음 3개 디바이스 설계
│   ├── BUILD_GUIDE.md               — .maxpat → .amxd 변환 (영문)
│   ├── IDEAS.md                     — 30+ 디바이스 아이디어
│   │                                  (Round 1 워크플로우, Round 2
│   │                                  Pro Tools/EDM, Round 3 viral)
│   ├── 사용설명서_한국어.md         — 비개발자용 빌드 가이드
│   └── SESSION_HANDOFF.md           — 이 파일
└── devices/
    ├── _lib/
    │   └── alfred-liveapi.js        — 공유 LiveAPI 헬퍼
    ├── system-audio-capture/        — 디바이스 1
    │   ├── SystemAudioCapture.maxpat
    │   ├── system_audio_capture.js
    │   └── README.md
    ├── smart-group-resample/        — 디바이스 2
    │   ├── SmartGroupResample.maxpat
    │   ├── smart_group_resample.js
    │   └── README.md
    ├── suno-bridge/                 — 디바이스 3
    │   ├── SunoBridge.maxpat
    │   ├── suno_bridge.js
    │   └── README.md
    ├── session-cleaner/             — 디바이스 4
    │   ├── SessionCleaner.maxpat
    │   ├── session_cleaner.js
    │   └── README.md
    ├── float-mixer/                 — 디바이스 5
    │   ├── FloatMixer.maxpat
    │   ├── mixer-strip.maxpat       — bpatcher용 strip 패치
    │   ├── float_mixer.js
    │   ├── PLAN.md                  — Logic-style mixer 전체 계획
    │   └── README.md
    └── alfred-shader/               — 디바이스 6 (현재 빌드 대기)
        ├── AlfredShader.maxpat
        ├── alfred_shader.js
        ├── PLAN.md                  — 12 art 프리셋 카탈로그
        ├── README.md
        └── shaders/
            ├── liquid-chrome.jxs    — 프리셋 1
            ├── audio-blob.jxs       — 프리셋 2
            └── vhs-glitch.jxs       — 프리셋 3
```

---

## 8. Git / GitHub 상태

- **Repo**: `masheganhead-dotcom/alfred-trading`
- **Branch**: `claude/max-for-live-plugin-research-bUhx7`
- **PR**: [#2](https://github.com/masheganhead-dotcom/alfred-trading/pull/2) (draft)
- 모든 작업이 이 브랜치에 푸시됨
- 최근 커밋 (최신 → 오래된 순):
  - Add Korean step-by-step build guide
  - Build Alfred Shader Phase A — 3 art presets
  - Add Alfred Shader PLAN — 12 art-grade presets
  - Expand IDEAS.md Round 3 — Gen-Z / viral devices
  - Expand IDEAS.md Round 2 — Pro Tools 이주자 + EDM
  - Add IDEAS.md — 12 producer pain-point ideas
  - Add Session Cleaner + Float Mixer
  - Add Alfred M4L Suite — three utility devices

---

## 9. 빌드 환경 안내 (사용자)

- **OS**: macOS (Mac)
- **DAW**: Ableton Live 12 Suite (Max for Live 포함)
- **Max 버전**: 8 또는 9 (Live 12 Suite에 번들된 버전)
- **선택적 도구**:
  - BlackHole 2ch (System Audio Capture 디바이스용)
  - OBS Studio (Alfred Shader 창 캡처 → TikTok용)

---

## 10. 첫 응답 템플릿 (새 세션 시작 시)

새 Claude는 이 파일을 받자마자 사용자에게 이런 식으로 인사:

```
파일 받았어요. Alfred M4L Suite 6개 디바이스 빌드 중이고, 지금
사용자가 Alfred Shader (#6, 오디오 반응 비주얼라이저)를 본인 Mac
에서 빌드 시도하다가 막힌 상황으로 이해했어요.

다음 중 어디 단계예요?
1. ZIP 아직 다운 안 받음 → 가이드 링크 보내드릴게요
2. ZIP 받았는데 Max에서 .maxpat 안 열림 → 어떻게 에러 나는지 알려주세요
3. Max에서 패치는 열렸는데 빨간 점선 객체 있음 → Search Path 문제
4. .amxd로 저장은 됐는데 Live에서 OPEN VISUAL 눌러도 창 안 뜸
5. 창은 뜨는데 검은 화면

또는 그냥 화면 스크린샷 한 장 보내주시면 어디인지 바로 보고
도와드릴게요.
```

또는 더 짧게:

```
파일 받음. Alfred Shader 빌드 어디까지 진행됐어요?
스크린샷 한 장이면 바로 뭐가 막혔는지 알아요.
```

---

## 11. 자주 묻는 질문 (FAQ — 새 세션이 미리 알아야 할 답)

**Q: Claude가 직접 .amxd 만들어줄 수는 없어?**
A: 안 됨. `.amxd` 포맷이 binary 헤더/푸터 포함이라 Max만 만들 수 있음.
외부 도구로 만든 .amxd는 Live가 거부함.

**Q: Live 12 Suite 없는데?**
A: 그럼 빌드 불가. Suite에 Max for Live 포함됨. Standard/Intro는
Max 별도 구매 ($399) 필요. 30일 무료 평가판은 가능
(ableton.com/en/trial/).

**Q: 다른 사람이 빌드해서 .amxd 보내주면 되는 거 아냐?**
A: 가능. 단 받은 사람도 Live Suite (또는 Max 라이센스) 있어야 작동.
Fiverr에 "Max for Live build $10~30" 검색하면 대행 가능.

**Q: 이거 다 만들었는데 무료 배포하면 안 돼?**
A: 가능. M4L 디바이스는 사용자가 Live Suite/Max만 있으면 작동. .amxd
파일 GitHub releases에 올리거나 maxforlive.com에 업로드 가능.

**Q: GLSL 셰이더 수정하면 어떻게 반영해?**
A: `.jxs` 파일 직접 텍스트 에디터로 수정 → Max에서 디바이스 다시
로드 (또는 Live 세션 다시 열기). Phase D Code Mode 빌드되면 라이브
편집 가능.

---

## 12. 사용자가 자주 쓰는 단축 표현 사전

| 사용자 표현 | 의미 |
| --- | --- |
| "ㄱㄱ" | "그냥 결정해서 진행" |
| "ㄱㄱㄱㄱ" | "더 안 물어봐도 됨, 빨리 진행" |
| "ㅋㅋ" | 그냥 캐주얼 |
| "시발" | 가벼운 짜증/감탄. 진짜 화난 거 아님 |
| "재밌는거" | viral 잠재력 있는 |
| "젠지스럽고" | Gen-Z 미학, TikTok 친화적 |
| "후기좋은" | 검증된, 실제로 인기있는 |
| "성능좋은" | 실제로 작동하고 효과 있는 |

---

## 13. 우선순위 — 새 세션이 가장 먼저 결정할 것

사용자가 첫 메시지에서 어떤 상태인지에 따라:

### Case A — "빌드 됐어 동작해"
→ Phase B/C/D/E 중 어디 갈지 물어봐. 또는 IDEAS.md에서 다른 디바이스
원하는지. 또는 사용자가 직접 다른 아이디어 가져오는 거 환영.

### Case B — "이거 에러 나" / 스크린샷
→ 즉시 디버그. 위 Section 3 troubleshooting 참고. Max Console
스크린샷 요청 가능.

### Case C — "다른 거 만들고 싶어"
→ IDEAS.md 30+ 아이디어 보여주거나 새 컨셉 받음. ROI 평가해서 추천.

### Case D — "이거 어떻게 더 멋지게 만들 수 있을까"
→ Alfred Shader Phase B-D 강력 추천 (Shadertoy import + 9개 프리셋
추가). 진짜 게임체인저.

---

## 끝.

이 파일이 모든 컨텍스트의 single source of truth. 새 Claude는
이걸 다 읽고 시작해야 함. 사용자 톤 가이드 (캐주얼, 짧게, 솔직히)
잊지 말 것.

빌드 환경 마지막 업데이트: 2026-05-24, Opus 4.7.
