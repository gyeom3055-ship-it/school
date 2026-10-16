# 9~10장. Unity 프로젝트 구조 · 사례 데이터 스키마와 규칙 판정

[← 목차로](README.md)

> 이 장은 구현을 위한 설계이며 C# 소스 코드는 포함하지 않는다. 클래스 이름·필드·메서드 이름은 구현 시 기준으로 삼되, 세부는 프로토타입 단계에서 조정할 수 있다.

---

## 9. Unity 프로젝트 구조와 클래스 책임

### 9.1 기술 기준

| 항목 | 선택 | 이유 |
|---|---|---|
| 엔진 | Unity 6 (6000.x LTS 계열 중 제작 시작 시점의 최신 LTS) | 요구 사항. LTS로 장기 안정성 확보 |
| 언어 | C# | Unity 표준 |
| UI | **UI Toolkit (런타임)** 권장 — UXML(구조) + USS(스타일) | 테마 교체를 USS 스타일시트 교체로 처리하기 쉬움. 레이아웃과 스타일 분리가 이 프로젝트의 핵심 요구와 맞음 |
| UI 대안 | uGUI + TextMeshPro | 팀이 UI Toolkit에 익숙하지 않거나 프로토타입 검증에서 픽셀 렌더링 품질 문제가 발견되면 전환. 이 경우에도 아래 Presenter/View 분리 구조는 동일 |
| 입력 | Input System 패키지 (터치, 핀치) | 멀티터치 제스처 처리 |
| 현지화 | Localization 패키지 (String Table) | 한국어 기본, 향후 언어 추가 대비. 사례 문장도 테이블 키로 관리 |
| 2D 렌더 | URP 2D + Pixel Perfect Camera (도트 테마 배경용) | 정수 배율 렌더 |
| 테스트 | Unity Test Framework (EditMode/PlayMode) | 판정 로직 단위 테스트, 흐름 테스트 |
| 데이터 | ScriptableObject + (P1) JSON/CSV 가져오기 도구 | 데이터 중심 설계, 기획자 편집 용이 |
| 외부 SDK | **없음** (광고·분석·로그인·클라우드 저장 SDK 미사용) | 아동 보호, 오프라인 원칙 |

> UI Toolkit과 uGUI 중 최종 선택은 [13장 Phase 0](09-roadmap-and-tests.md#133-제작-로드맵)의 기술 검증(픽셀 글꼴 선명도, 핀치 확대 성능, 저사양 기기 프레임) 결과로 확정한다.

### 9.2 레이어 구조

```
┌───────────────────────────────────────────────────────────────┐
│ Presentation (테마별로 바뀌는 부분)                               │
│  UXML 레이아웃(공유) · USS 테마 · 스프라이트 · 글꼴 · 애니메이션      │
│  DocumentView, DecisionPanel, BriefingView, ReportView ...     │
└───────────────▲───────────────────────────────────────────────┘
                │ 읽기 전용 ViewModel / 사용자 입력 이벤트
┌───────────────┴───────────────────────────────────────────────┐
│ Game (Unity 의존, MonoBehaviour 매니저)                          │
│  GameManager · CaseManager · ScoreManager · ProgressManager     │
│  SaveManager · ThemeManager · AudioManager                      │
└───────────────▲───────────────────────────────────────────────┘
                │ 순수 C# 호출
┌───────────────┴───────────────────────────────────────────────┐
│ Core (Unity 비의존 순수 C# — 단위 테스트 대상)                     │
│  RuleEvaluator · ScoreCalculator · CaseSession · FactSet        │
│  VerdictResult · SaveDataMigrator                               │
└───────────────▲───────────────────────────────────────────────┘
                │ 런타임 모델로 변환
┌───────────────┴───────────────────────────────────────────────┐
│ Data (ScriptableObject 자산)                                     │
│  CaseDefinition · RuleDefinition · DayDefinition · Topic ...    │
└───────────────────────────────────────────────────────────────┘
```

- **의존 방향은 아래 → 위로만** 흐른다. Core는 Presentation을 모르고, Presentation은 판정 로직을 직접 호출하지 않는다.
- 두 테마는 Presentation 레이어의 *자산*만 다르고 C# View 클래스는 공유한다. (테마별로 꼭 다른 연출이 필요하면 `IFeedbackAnimator` 같은 인터페이스의 테마별 구현을 ThemeDefinition에 연결)

### 9.3 폴더 구조

```
Assets/
└─ _Project/
   ├─ Scripts/
   │  ├─ Core/                 DigitalGuard.Core.asmdef  (UnityEngine 참조 없음)
   │  │  ├─ Domain/            Fact, FactSet, VerdictType, RuleOutcome ...
   │  │  ├─ Evaluation/        RuleEvaluator, ConditionEvaluators
   │  │  ├─ Scoring/           ScoreCalculator, DayMetrics
   │  │  ├─ Session/           CaseSession, Clue, Flag, Attempt
   │  │  └─ Save/              SaveData, SaveDataMigrator, Checksum
   │  ├─ Data/                 DigitalGuard.Data.asmdef  (ScriptableObject 정의)
   │  ├─ Game/                 DigitalGuard.Game.asmdef  (매니저)
   │  ├─ UI/                   DigitalGuard.UI.asmdef    (View, Presenter)
   │  ├─ Infrastructure/       파일 입출력, 햅틱, 플랫폼 래퍼
   │  └─ Editor/               DigitalGuard.Editor.asmdef (검증기, 사례 작성 도구)
   ├─ Data/
   │  ├─ Rules/                R-SHARE-01.asset ...
   │  ├─ Cases/Ch1 ~ Ch4/      C1-01.asset ...
   │  ├─ Days/                 Day00.asset ~ Day18.asset
   │  ├─ Topics/  Tools/  Glossary/
   │  └─ ContentDatabase.asset (모든 콘텐츠의 진입점)
   ├─ UI/
   │  ├─ Layouts/              *.uxml (테마 공유)
   │  └─ Common/               공통 USS (레이아웃 규칙만, 색·글꼴 없음)
   ├─ Themes/
   │  ├─ Modern/               Modern.asset(ThemeDefinition), Modern.uss, Fonts/, Sprites/, Sfx/
   │  └─ Pixel/                Pixel.asset, Pixel.uss, Fonts/, Sprites/, Sfx/, Anim/
   ├─ Localization/            String Tables (ko 기본)
   ├─ Scenes/                  Boot.unity, Main.unity
   └─ Tests/
      ├─ EditMode/             RuleEvaluatorTests, ScoreCalculatorTests, CaseDataTests, SaveTests
      └─ PlayMode/             FlowTests, ThemeSwitchTests
```

- **씬 구성**: `Boot`(서비스 초기화, 저장 불러오기) → `Main`(로비·브리핑·데스크·리포트를 UI 화면 전환으로 처리). 씬 전환을 최소화해 화면 전환 시 상태가 초기화되지 않게 한다.

### 9.4 서비스 연결 방식

- `Boot` 씬의 `AppBootstrapper`가 매니저들을 순서대로 생성·초기화하고, 단순한 **서비스 레지스트리**에 등록한다(외부 DI 프레임워크는 필수 아님).
- 매니저 사이 통신은 **C# 이벤트**로 하고, 이벤트 이름은 아래 표로 고정한다. View는 매니저 이벤트를 구독해 화면을 갱신한다.

| 이벤트 | 발행자 | 주요 구독자 | 데이터 |
|---|---|---|---|
| `GameStateChanged` | GameManager | 모든 View, AudioManager | 이전/다음 상태 |
| `CaseStarted` | CaseManager | DocumentView, DecisionPanel | CaseViewModel |
| `DocumentAdded` | CaseManager | DocumentView(트레이) | 문서 ID |
| `ClueCreated` / `FlagToggled` | CaseManager | DocumentView, 근거 트레이 | Clue / 필드 ID |
| `VerdictSubmitted` | DecisionPanel | CaseManager | 판정, 근거 ID 목록, 시도 번호 |
| `VerdictEvaluated` | CaseManager | ScoreManager(결과 누적, 화면 비공개), ProcessedStampView, AudioManager | VerdictResult |
| `CaseCompleted` | CaseManager | ScoreManager, ProgressManager, SaveManager | CaseRecord |
| `DayCompleted` | GameManager | ProgressManager, SaveManager, DayResultView | DaySummary (완료/실패, 사건별 정답·해설) |
| `SecurityIncident` | CaseManager | GameManager | 사고 난 사건 ID (즉시 DayResult 실패로 전환) |
| `ThemeChanged` | ThemeManager | 모든 View | ThemeDefinition |
| `SettingsChanged` | SaveManager | AudioManager, ThemeManager, View | Settings |

### 9.5 판정 1회의 처리 흐름

```
플레이어          DecisionPanel        CaseManager            RuleEvaluator      ScoreManager     SaveManager
  │ [거부] 탭         │                     │                      │                 │               │
  │─────────────────▶│ 버튼 잠금(중복 방지)   │                      │                 │               │
  │ 확인 시트 [확정]   │                     │                      │                 │               │
  │─────────────────▶│ VerdictSubmitted ──▶│ 시도 번호 검사          │                 │               │
  │                  │                     │ (이미 처리된 시도면 무시) │                 │               │
  │                  │                     │──── Judge(session) ──▶│                 │               │
  │                  │                     │◀─── VerdictResult ────│                 │               │
  │                  │                     │── VerdictEvaluated ──────────────────▶│ 점수 계산        │
  │◀── 결과·해설 화면 ─────────────────────│                      │                 │               │
  │                  │                     │ (정답 or 2회 오답)      │                 │               │
  │                  │                     │── CaseCompleted ──────────────────────▶│──────────────▶│ 자동 저장
```

### 9.6 GameManager

| 구분 | 내용 |
|---|---|
| 책임 | 앱 전체 상태 머신 관리, 화면 전환 지시, 하루 시작·종료, 일시정지/재개, 앱 백그라운드 전환 처리 |
| 주요 필드 | `currentState: GameState`, `previousState: GameState`, `activeDay: DayDefinition`, `isPaused: bool` |
| 주요 메서드 | `StartDay(dayId)`, `ResumeDay()`, `EnterState(state)`, `Pause()`, `Resume()`, `CompleteDay()`, `ReturnToLobby()` |
| 처리 | `OnApplicationPause(true)` / `OnApplicationFocus(false)` 시 일시정지 상태로 바꾸고 SaveManager에 즉시 저장 요청 |

**상태 전이표**

| 현재 상태 | 이벤트 | 다음 상태 |
|---|---|---|
| Boot | 저장 불러오기 완료(신규) | FirstRun |
| Boot | 저장 불러오기 완료(기존) | Lobby |
| FirstRun | 출근하기 | Briefing (Day 0) |
| Lobby | 오늘의 근무 시작 | Briefing (새 규칙 있음) / CaseReview (없음) |
| Lobby | 이어서 하기 | CaseReview (저장된 사례부터) |
| Briefing | 브리핑 완료 | CaseReview |
| CaseReview | 판정 제출 | Processed (처리 완료 도장, 정답 비공개) |
| Processed | 보안 사고(위험도 높음 사건 승인) | DayResult (실패) |
| Processed | 다음 요청 | CaseReview (다음 사례) |
| CaseReview | 추가 확인 제출(2단계 사례) | CaseReview (같은 사례 다음 단계, 고른 경로에 맞는 답 문서 추가) |
| Processed | 마지막 사례 완료 | DayResult (처리 성공률 60% 이상이면 완료, 미만이면 실패) |
| DayResult | 완료: 로비로·다음 Day / 실패: 처음부터 다시 하기 | Lobby / Briefing(같은 Day, Day 시작 저장으로 복원) |
| 모든 진행 상태 | 일시정지 | Paused (이전 상태 기억) |
| Paused | 계속하기 | 이전 상태 |

### 9.7 CaseManager

| 구분 | 내용 |
|---|---|
| 책임 | Day의 사례 목록 로딩, 현재 사례의 런타임 세션(`CaseSession`) 생성·복원, 대조·깃발·추가 정보 조회 처리, 판정 제출을 RuleEvaluator에 위임, 2단계 사례 진행 |
| 주요 필드 | `dayCases: List<CaseDefinition>`, `currentIndex: int`, `session: CaseSession`, `evaluator: RuleEvaluator`, `isEvaluating: bool` |
| 주요 메서드 | `LoadDay(DayDefinition)`, `BeginCase(index)`, `RestoreSession(ActiveSessionData)`, `TryCompare(fieldA, fieldB) → CompareResult`, `ToggleFlag(fieldId)`, `RequestLookup(lookupId)`, `SubmitVerdict(VerdictSubmission)`, `AdvanceStage()`, `NextCase()` |
| 비고 | `TryCompare`는 두 필드의 `compareKey`가 같을 때만 단서를 만든다(10.5 참고). 이미 만든 단서와 같은 조합이면 새로 만들지 않는다 |

**CaseSession (Core, 런타임 상태)**

| 필드 | 타입 | 설명 |
|---|---|---|
| `caseId` | string | 사례 ID |
| `stageIndex` | int | 현재 단계(0부터) |
| `visibleDocumentIds` | List\<string\> | 트레이에 보이는 문서(추가 조회로 늘어남) |
| `clues` | List\<Clue\> | 생성된 단서 (fieldA, fieldB, isMatch) |
| `flags` | HashSet\<string\> | 깃발 꽂힌 필드 ID |
| `attempts` | List\<Attempt\> | 시도 기록 (verdict, reasonIds, verifyRouteId, result, timestamp) |
| `elapsedSeconds` | float | 사례 소요 시간(일시정지 제외) |
| `hintsShown` | int | 힌트 표시 횟수 |

### 9.8 RuleEvaluator

| 구분 | 내용 |
|---|---|
| 책임 | 사례의 사실(Fact)과 규칙 조건을 평가해 *계산된 판정*을 도출, 플레이어 판정과 비교해 결과(정답/허용 대안/오답)와 피드백 데이터를 생성 |
| 위치 | Core (Unity 비의존). 에디터 검증 도구와 런타임이 **같은 코드**를 사용 |
| 주요 메서드 | `Evaluate(CaseStageData, ruleSet) → EvaluationReport`(규칙별 결과, 계산된 판정, 관련 필드), `Judge(CaseSession, VerdictSubmission) → VerdictResult`, `Compare(FieldData a, FieldData b) → CompareResult` |
| 출력 `VerdictResult` | `outcome`(Correct / Acceptable / Incorrect), `correctVerdict`, `scoreMultiplier`, `riskSpotsFound/Missed`, `wrongFlags`, `reasonResult`(All/Partial/None), `hintId`(오답 시), `explanationId`, `epilogueId`, `nextStage`(2단계 진입 여부) |

알고리즘 상세는 [10.4](#104-규칙-판정-알고리즘) 참고.

### 9.9 DocumentView

| 구분 | 내용 |
|---|---|
| 책임 | 문서 카드 렌더링(필드 단위), 문서 트레이 탭, 비교 모드 분할, 확대/축소, 필드 상태 표시(선택·일치·불일치·의심·위험 요소), 용어 말풍선 |
| 주요 필드 | `layoutAsset: VisualTreeAsset`, `currentDocumentId`, `compareMode: bool`, `zoomLevel: float(1.0~2.5)`, `fieldElements: Dictionary<string, VisualElement>` |
| 주요 메서드 | `Bind(CaseViewModel)`, `ShowDocument(docId)`, `EnterCompareMode(topId, bottomId)`, `SetFieldState(fieldId, FieldVisualState)`, `HighlightRiskSpots(list)`, `SetZoom(level)` |
| 입력 이벤트 | `FieldTapped(fieldId)`, `FieldDragDropped(fromId, toId)`, `FieldLongPressed(fieldId)` → 현재 도구 모드에 따라 CaseManager 호출 |
| 비고 | 판정 로직 없음. 표시 텍스트는 Localization 키로 받아 현재 글자 크기 배율을 적용. 필드 상태는 `FieldVisualState` 열거형 → USS 클래스(`.field--mismatch` 등)로 변환해 테마가 모양을 결정 |

### 9.10 DecisionPanel

| 구분 | 내용 |
|---|---|
| 책임 | 사례·단계별로 허용된 판정 버튼만 표시, 승인은 즉시 제출, 거부·추가 확인은 처리 시트(신고·근거·확인 경로) 표시(v0.3: 판정 확인 단계 없음), 판정 제출 이벤트 발행, **중복 입력 방지** |
| 주요 필드 | `allowedVerdicts: VerdictType[]`, `requireReasons: bool`, `reasonOptions: List<ReasonOptionVM>`, `verifyRoutes: List<VerifyRouteVM>`, `state: Idle / Confirming / Submitting / Locked`, `attemptIndex: int` |
| 주요 메서드 | `Configure(stageVM)`, `OnVerdictTapped(type)`, `Confirm()`, `Cancel()`, `Lock()`, `Unlock()` |
| 중복 방지 | `Submitting` 상태에서는 모든 입력 무시. 제출 이벤트에 `attemptIndex`를 담아 CaseManager가 같은 시도 번호를 두 번 처리하지 않도록 이중 방어. 확인 시트를 끈 설정에서는 판정 버튼에 0.4초 입력 쿨다운 적용 |

### 9.11 ScoreManager

| 구분 | 내용 |
|---|---|
| 책임 | 사례 점수 계산(Core `ScoreCalculator` 위임), 연속 정답 관리, Day 지표 집계, 별점 계산 |
| 주요 필드 | `scoringConfig: ScoringConfig`(SO, [7장](04-levels-and-scoring.md#72-사례-1건-점수-계산) 수치), `streak: int`, `caseRecords: List<CaseRecord>`, `dayMetrics: DayMetrics` |
| 주요 메서드 | `OnVerdictEvaluated(result)`, `ComputeCaseScore(session, result) → ScoreBreakdown`, `BuildDaySummary() → DaySummary`, `ComputeStars(DayMetrics, StarRule) → int` |
| 비고 | 수치는 모두 `ScoringConfig` 데이터로 관리해 밸런스 조정 시 코드 수정 불필요 |

### 9.12 ProgressManager

| 구분 | 내용 |
|---|---|
| 책임 | Day 해금, 규칙·도구 해금, 주제별 숙달도 계산, 복습 노트 관리, 별 누적과 꾸미기 해금 |
| 주요 필드 | `progress: ProgressData`(저장 데이터 일부), `content: ContentDatabase` |
| 주요 메서드 | `IsDayUnlocked(dayId)`, `OnCaseCompleted(record)`, `OnDayCompleted(summary)`, `GetTopicMastery(topicId) → MasteryLevel`, `AddToReviewNotes(caseId, reason)`, `GetUnlockedTools() → ToolDefinition[]` |
| 비고 | 해금 조건은 DayDefinition·ToolDefinition 데이터에 기록. 숙달도는 최근 N건 기록(`topicHistory`)으로 계산 ([7.5](04-levels-and-scoring.md#75-학습-진행도-주제별-숙달도)) |

### 9.13 ThemeManager

| 구분 | 내용 |
|---|---|
| 책임 | 현재 테마 적용·전환, 글자 크기·고대비·움직임 줄이기·본문 글꼴 옵션을 스타일에 반영 |
| 주요 필드 | `themes: ThemeDefinition[]`, `current: ThemeDefinition`, `rootPanel: PanelSettings / UIDocument` |
| 주요 메서드 | `ApplyTheme(themeId)`, `ApplyTextScale(scale)`, `ApplyHighContrast(on)`, `ApplyReduceMotion(on)` |
| 전환 방식 | 루트 VisualElement의 테마 USS를 교체하고 `ThemeChanged` 발행. View는 상태를 다시 만들지 않고 스타일만 바뀐다 → **진행 상태 유지** |

**ThemeDefinition (ScriptableObject)**

| 필드 | 타입 | 설명 |
|---|---|---|
| `themeId` | string | `modern` / `pixel` |
| `displayNameKey` | string | 현지화 키 |
| `styleSheet` | StyleSheet | 색상 토큰·글꼴·형태 정의 USS |
| `highContrastStyleSheet` | StyleSheet | 고대비 덮어쓰기 |
| `bodyFont`, `monoFont`, `titleFont` | FontAsset | 글꼴 |
| `readableBodyFont` | FontAsset | "문서 본문 일반 글꼴" 옵션용 |
| `iconAtlas` | SpriteAtlas | 아이콘 세트 |
| `panelSprites` | 구조체 | 9-slice 패널·버튼 이미지 |
| `sfxSet` | SfxSet (SO) | 효과음 세트 |
| `feedbackAnimator` | 참조 | 정답/오답 연출 구현(테마별) |
| `pixelPerfect` | bool | 정수 배율 렌더 사용 여부 |
| `thumbnail` | Sprite | 설정 화면 미리보기 |

### 9.14 SaveManager

| 구분 | 내용 |
|---|---|
| 책임 | 저장 데이터 읽기/쓰기, 자동 저장 시점 관리, 무결성 검사, 백업·복구, 버전 마이그레이션, 설정 변경 통지 |
| 주요 메서드 | `Load() → LoadResult`, `Save(reason)`, `SaveActiveSession(session)`, `ClearActiveSession()`, `ResetAll()` |
| 상세 | [12장](08-save-and-errors.md) 참고 |

### 9.15 AudioManager

| 구분 | 내용 |
|---|---|
| 책임 | 배경음·효과음 재생, 음량 설정, 진동(햅틱) 재생, 테마별 효과음 세트 교체, 앱 백그라운드 시 일시정지 |
| 주요 필드 | `bgmVolume`, `sfxVolume`, `hapticsEnabled`, `currentSet: SfxSet`, 효과음 풀(AudioSource 4~6개) |
| 주요 메서드 | `PlaySfx(SfxId)`, `PlayBgm(BgmId)`, `Haptic(HapticPattern)`, `ApplySettings(Settings)` |
| 비고 | 효과음 ID(`Approve`, `Reject`, `Verify`, `ClueMatch`, `ClueMismatch`, `Flag`, `Correct`, `TryAgain`, `StageAdvance`)는 테마 공통, 실제 오디오 클립만 테마별. 진동은 정답·단서 발견에만 짧게, 오답에는 사용하지 않음 |

---

## 10. 사례 데이터 스키마 및 규칙 판정 방식

### 10.1 데이터 관계도

```
ContentDatabase
 ├─ DayDefinition[]  ──▶ CaseDefinition[] (순서 있음)
 │                     ├─ CaseStage[] (1~2개)
 │                     │   ├─ DocumentDefinition[] (초기 공개 / 조회로 공개 / 단계 진입 시 공개)
 │                     │   │   └─ FieldDefinition[]  (표시 텍스트 + compareKey + factKey)
 │                     │   ├─ FactEntry[]        (판정용 구조화 사실)
 │                     │   ├─ RuleDefinition 참조[]
 │                     │   ├─ RiskSpot[]  ReasonOption[]  VerifyRoute[]  Hint[]
 │                     │   └─ correctVerdict, acceptableAlternatives[]
 │                     └─ TopicDefinition 참조[], difficulty 변수
 ├─ RuleDefinition[]  ──▶ RuleCondition[]
 ├─ TopicDefinition[]  ToolDefinition[]  LookupDefinition[]  GlossaryEntry[]  FileTypeDefinition[]
 └─ ScoringConfig, StarRule
```

### 10.2 스키마 상세

#### CaseDefinition

| 필드 | 타입 | 필수 | 설명 | 요구 항목 대응 |
|---|---|---|---|---|
| `caseId` | string | ✔ | `C{장}-{번호}` 형식, 전체에서 유일 | 사건 ID |
| `titleKey` | string | ✔ | 사례 제목 현지화 키 | — |
| `descriptionKey` | string | ✔ | 요청 카드 문장 | 사건 설명 |
| `requesterId` | string | | 등장인물 ID (후일담 연결) | — |
| `topics` | TopicDefinition[] | ✔ | 교육 주제 (숙달도 반영) | — |
| `difficulty` | enum | ✔ | Beginner / Intermediate / Advanced / Expert | 난이도 |
| `difficultyParams` | 구조체 | ✔ | 적용 규칙 수, 대조 단계, 함정 수 등 ([6.3](04-levels-and-scoring.md#63-난이도-조절-변수)) | 난이도 |
| `riskLevel` | enum | ✔ | Low / Medium / High (안전 게이지 가중치) | — |
| `parTimeSeconds` | int | | 시간 도전 모드 기준 시간 | — |
| `stages` | CaseStage[] | ✔ | 1개 이상 | — |
| `isGenerated` | bool | | 템플릿 생성 사례 여부 (P2) | — |

#### CaseStage

| 필드 | 타입 | 필수 | 설명 | 요구 항목 대응 |
|---|---|---|---|---|
| `stageId` | string | ✔ | 예: `C4-02-S1` | — |
| `documents` | DocumentRef[] | ✔ | 문서 + 공개 조건(`Initial` / `Lookup:{lookupId}` / `OnStageEnter`) | 검토 대상 문서 |
| `facts` | FactEntry[] | ✔ | 판정용 사실 목록 (10.3) | 관련 정보와 비교 기준 |
| `rules` | RuleDefinition[] | ✔ | 이 단계에 적용되는 규칙 | 적용되는 보안 규칙 |
| `allowedVerdicts` | VerdictType[] | ✔ | Approve / Reject / Verify 중 1~3개 | — |
| `correctVerdict` | VerdictType | ✔ | 작성자가 입력한 정답 (판정기 계산 결과와 같아야 함) | 정답 판정 |
| `acceptableAlternatives` | {verdict, multiplier, feedbackKey}[] | | 허용 대안과 점수 배율 | — |
| `riskSpots` | {fieldId, required: bool, labelKey}[] | | 위험 요소 위치 | 위험 요소의 위치 |
| `keyEvidence` | {fieldA, fieldB}[] | ✔ | 근거 확인 판정용 핵심 대조 쌍 | 판정 근거 |
| `rationaleKey` | string | ✔ | 판정 근거 한두 문장 | 판정 근거 |
| `explanationKey` | string | ✔ | 교육용 해설 (실천 팁 포함) | 교육용 해설 |
| `hints` | {forVerdict, textKey}[] | ✔ | 오답 판정 종류별 '다시 볼 곳' 문장 (v0.3: 근무 결과에서만 표시) | 오답 시 힌트 |
| `altNextDocs` | DocumentRef[] | | 추가 확인 경로를 틀렸을 때 도착하는 답 문서 (2단계 사례, [G20](01-overview.md#34-v03-판정-흐름-변경)) | — |
| `reasonOptions` | {id, textKey, isCorrect, linkedFieldIds[]}[] | 고급 이상 ✔ | 근거 선택 보기 | — |
| `verifyRoutes` | {id, textKey, isCorrect}[] | Verify 허용 시 ✔ | 확인 경로 보기 | — |
| `epilogues` | {condition, textKey}[] | | 결과별 후일담 (Correct / OverBlock / RiskApprove) | — |
| `nextStageOnVerify` | bool | | 추가 확인 정답 시 다음 단계로 진행 | — |
| `verifyResultKey` | string | Verify 정답 ✔ | 확인 결과 카드 문장 (1단계·2단계 사례 모두 필수, [G4](01-overview.md#33-게임플레이-단계-점검-v02)) | — |
| `reportable` | bool | Reject 정답 ✔ | 신고 시트의 정답 (`true` = 신고하기, `false` = 안내만 하기) | — |
| `myRecord` | DocumentRef | ✔ | 👤 내 기록 탭 문서. 요청자가 원래 알던 정보만 담는다 | 관련 정보와 비교 기준 |

#### DocumentDefinition / FieldDefinition

| 필드 | 타입 | 설명 |
|---|---|---|
| `documentId` | string | 사례 안에서 유일 (예: `mail`, `domainList`) |
| `docType` | enum | Mail, Sms, ShareRequest, ShareSettings, Roster, Profile, LoginAlert, Schedule, DeviceList, Policy, Form, Notice, PermissionRequest, ContactDirectory, VerifyResult, Message, **FileInfo**, **MyRecord** |
| `titleKey` | string | 문서 제목 |
| `fields` | FieldDefinition[] | 표시 순서대로 |
| `field.fieldId` | string | `{documentId}.{name}` (예: `mail.sender`) — 사례 안에서 유일 |
| `field.labelKey` / `field.valueKey` | string | 라벨·값 현지화 키 |
| `field.displayStyle` | enum | Text, Mono(주소·ID), List, Table, Image(설명 텍스트 포함) |
| `field.compareKey` | string | 대조 가능한 정보 종류 (예: `person.name`, `domain`, `time`, `device.id`) |
| `field.compareValue` | string | 대조에 쓰는 정규화된 값 (예: 도메인은 `baeumteo-security.example`) |
| `field.glossaryIds` | string[] | 이 필드에 등장하는 용어 |

#### RuleDefinition

| 필드 | 타입 | 설명 |
|---|---|---|
| `ruleId` | string | `R-{분류}-{번호}` |
| `titleKey`, `summaryKey` | string | 규칙 카드 제목·한 줄 설명 |
| `goodExampleKey`, `badExampleKey` | string | 좋은 예·나쁜 예 |
| `topic` | TopicDefinition | 교육 주제 |
| `introducedOnDay` | int | 도입 Day |
| `conditions` | RuleCondition[] | 평가 조건 (모두 Pass여야 규칙 Pass) |
| `onViolation` | enum | `Reject` / `Verify` — 위반 시 요구되는 판정 |
| `onUnknown` | enum | `Verify` / `Ignore` — 사실이 미확인일 때 |

#### FactEntry

| 필드 | 타입 | 설명 |
|---|---|---|
| `key` | string | 사실 키 (예: `share.recipients`, `sender.domain`, `identity.status`) |
| `valueType` | enum | String, StringList, Int, Bool, TimeRange, Time, Enum |
| `value` | 직렬화 문자열 | 값 |
| `status` | enum | Known / Unconfirmed / Missing — 정보의 확인 상태 |
| `sourceFieldIds` | string[] | 이 사실이 표시된 문서 필드 (위험 위치·근거와 연결) |

#### FileTypeDefinition (v0.2 추가)

| 필드 | 타입 | 설명 |
|---|---|---|
| `extension` | string | 점을 뺀 소문자 확장자 (예: `zip`, `exe`, `hwp`) |
| `category` | enum | Document, Image, Media, Archive, Executable, MacroDocument, Shortcut, WebPage, Calendar, Contact, Other |
| `displayNameKey` | string | "실행 파일 (프로그램)" 같은 쉬운 이름 |
| `riskNote` | enum | Usually / CheckContext / AvoidUnlessExpected / NeverFromUnknown — 확장자 도감 표시용 안내 등급. **판정은 규칙 조건이 내리며, 이 값만으로 정답을 정하지 않는다** |
| `glossaryKey` | string | 확장자 도감 설명 |
| `introducedOnDay` | int | 처음 등장하는 Day (그 전 사례에 쓰이면 검증기 오류) |

- 파일 필드는 `fileName`(화면 표시용, 공백 포함 가능), `lastExtension`(판정용, 검증기가 `fileName`에서 다시 계산해 일치 확인), `sizeLabel`, `archiveEntries[]`(압축일 때)를 가진다.
- 확장자 목록과 분류는 [부록 E](10-appendix.md#e-확장자-도감-파일-종류)를 원본으로 삼는다.

### 10.3 사실(Fact) 모델과 조건 유형

판정기는 **자연어를 해석하지 않는다.** 사례 작성자가 문서에 보이는 정보를 구조화된 사실로 함께 입력하고, 판정기는 그 사실과 규칙 조건만 평가한다. 화면의 문장과 사실이 어긋나지 않도록 `sourceFieldIds`로 연결하고 에디터 검증기가 누락을 경고한다.

| 조건 유형 | 파라미터 | Pass 조건 | 사용 예 |
|---|---|---|---|
| `AllInList` | itemsKey, listKey | items의 모든 값이 list에 있음 | 공유 대상 ⊂ 모둠 명단 (C1-01) |
| `SubsetOfAllowed` | itemsKey, allowedKey | 수집 항목이 허용 목록에 모두 포함 | 신청 양식 항목 ⊂ 운영 지침 (C1-02) |
| `MinLength` | key, n | 값 길이 ≥ n | 비밀번호 10자 이상 (C1-03) |
| `ContainsNone` | key, forbiddenKeys[] | 값이 금지 사실들의 값을 포함하지 않음 | 비밀번호에 이름·생일 없음 (C1-03) |
| `DomainEquals` | key, officialKey | 등록 도메인이 공식 도메인과 같음 | 발신·링크 도메인 (C2-01) |
| `TimeWithin` | timeKey, rangeKey | 시각이 범위 안 | 로그인 시간 ⊂ 수업 시간 (C2-02) |
| `InList` | key, listKey | 값이 목록에 있음 | 기기 ID ∈ 등록 기기 (C2-02) |
| `IsTrue` / `IsFalse` | key | 불리언 값 조건 | `request.asksCredential == false` (C2-01, C4-02) |
| `EnumEquals` | key, value | 열거값 일치 | `share.scope == SpecificPeople` (C3-02) |
| `IdentityConfirmed` | key | `Confirmed` → Pass, `Unconfirmed` → Unknown, `Refuted` → Violation | 운영자·교사 신원 (C2-03, C4-02) |
| `IsPresent` | key | 사실이 Known 상태로 존재 | 승인자 기록 (C4-01) |
| `NoForbiddenPublicInfo` | profileKeys[] | 공개 항목에 실명·학교·위치·일정·얼굴 태그 없음 | 공개 프로필 (C3-01) |
| `ExtensionCategoryNotIn` | fileKey, categories[] | 파일의 *마지막* 확장자가 금지 분류(실행·매크로 문서·바로가기 등)에 속하지 않음 | 실행 파일 거부 (C2-03, C2-06) |
| `ExtensionMatchesExpected` | fileKey, expectedKey | 마지막 확장자의 분류가 안내·요청된 분류와 같음(문서↔문서는 같은 분류로 본다) | `.pdf` 기대 → `.exe` 수신은 위반, `.hwp` 수신은 통과 (C2-06) |
| `ArchiveContainsNone` | fileKey, categories[] | 압축 파일의 내용 목록에 금지 분류 파일이 없음 | 사진 압축 승인 (C2-05) |

- **등록 도메인 추출 규칙**: 게임 속 도메인은 모두 `이름.example` 2단 구조이므로, 주소의 **마지막 두 라벨**을 등록 도메인으로 본다. (`baeumteo.login-check.example` → `login-check.example`) 이 단순화는 게임 데이터에만 적용하며, 데이터 검증기가 3단 이상의 등록 도메인(예: `.co.example`)을 금지한다.
- 조건 결과는 `Pass` / `Violation` / `Unknown` 세 가지다. 사실이 `Unconfirmed` 또는 `Missing`이면 대부분의 조건은 `Unknown`을 낸다.

### 10.4 규칙 판정 알고리즘

```
입력: 단계 데이터(facts, rules, allowedVerdicts), 플레이어 제출(verdict, reasons, verifyRoute), 세션(flags, clues)

1) 규칙 평가
   각 rule에 대해 conditions를 평가
     - 하나라도 Violation → rule 결과 = Violation
     - Violation 없이 Unknown 존재 → rule 결과 = Unknown
     - 모두 Pass → rule 결과 = Pass

2) 계산된 판정(derivedVerdict) 도출 — 우선순위 고정
     ① onViolation == Reject 인 규칙이 Violation          → Reject
     ② onViolation == Verify 인 규칙이 Violation          → Verify
     ③ onUnknown == Verify 인 규칙이 Unknown              → Verify
     ④ 그 외                                             → Approve

3) 정답 확정
     correct = stage.correctVerdict   (에디터 검증으로 derivedVerdict와 같음이 보장됨)
     ※ 생성 사례(isGenerated)는 derivedVerdict를 그대로 정답으로 사용

4) 플레이어 판정 비교
     verdict == correct                        → Correct
     verdict ∈ acceptableAlternatives          → Acceptable (multiplier 적용)
     그 외                                     → Incorrect (hints[forVerdict] 선택)

5) 부가 평가
     - 위험 탐지: flags ∩ riskSpots(required/optional), flags − riskSpots = 오표시
     - 근거 확인: keyEvidence 쌍이 모두 clues에 있는지
     - 근거 선택: 선택한 reasonOptions의 isCorrect 집계 → All / Partial / None
     - 확인 경로: verdict == Verify 일 때 verifyRoute.isCorrect

6) 다음 단계
     Correct && verdict == Verify && nextStageOnVerify → 다음 CaseStage 진입
       (OnStageEnter 문서 공개, facts는 다음 단계 데이터로 교체, 판정 버튼 재구성)
```

**골든 사례 판정기 검산 (14개 사례, 15개 단계)**

| 사례 | 핵심 규칙 결과 | 계산된 판정 | 작성된 정답 | 일치 |
|---|---|---|---|---|
| C1-01 | R-SHARE-01 Pass | Approve | 승인 | ✔ |
| C1-02 | R-PRIV-01 Violation(Reject) | Reject | 거부 | ✔ |
| C1-03 | R-PW-01 Violation(Reject, `ContainsNone` 실패) | Reject | 거부 | ✔ |
| C2-01 | R-LINK-01 Violation(Reject) | Reject | 거부 | ✔ |
| C2-02 | R-LOGIN-01 Pass, R-MFA-01 Pass | Approve | 승인 | ✔ |
| C2-03 | R-ID-01 Violation(Refuted), R-FILE-01 Violation(Reject) | Reject | 거부 | ✔ |
| C3-01 | R-FOOT-01 Pass, R-PRIV-01 Pass | Approve | 승인 | ✔ |
| C3-02 | R-SHARE-02 Violation(Reject), R-PRIV-01 Violation(Reject) | Reject | 거부 | ✔ |
| C4-01 | R-PERM-01 Unknown(승인자 Missing) → onUnknown Verify | Verify | 추가 확인 | ✔ |
| C4-02-S1 | R-ID-01 Unknown(Unconfirmed) → Verify | Verify | 추가 확인 | ✔ |
| C4-02-S2 | R-ID-01 Violation(Refuted), R-PW-02 Violation(Reject) | Reject | 거부 | ✔ |
| C2-04 | R-LINK-01 Violation(Reject) | Reject | 거부 | ✔ |
| C2-05 | R-FILE-03 Pass, R-ID-01 Pass(저장된 연락처 = Confirmed) | Approve | 승인 | ✔ |
| C2-06 | R-FILE-02 Violation(Reject), R-FILE-01 Violation(Reject) | Reject | 거부 | ✔ |
| C3-03 | R-ID-01 Unknown(Unconfirmed) → Verify | Verify | 추가 확인 | ✔ |

> `R-ID-01`의 `onViolation`은 `Reject`(신원이 거짓으로 밝혀짐), `onUnknown`은 `Verify`(신원 미확인)이다. 이렇게 하면 C2-03처럼 *공식 정책으로 거짓이 확인되는* 사칭은 거부, C4-02-S1처럼 *아직 확인되지 않은* 신원은 추가 확인으로 일관되게 처리된다.

### 10.5 대조(Compare) 판정 규칙

| 상황 | 결과 |
|---|---|
| 두 필드의 `compareKey`가 같고 `compareValue`가 같음 | ✓ 일치 단서 |
| `compareKey`가 같고 값이 다름 | ⚠ 불일치 단서 |
| 한쪽이 목록(List)이고 다른 쪽 값이 목록 안에 있음 | ✓ 일치 단서 ("명단에 있어요") |
| `compareKey`가 다름 | 단서 없음 + "서로 비교하기 어려운 정보예요" 안내 (감점 없음) |
| 같은 문서 안의 두 필드 | 허용 (예: 비밀번호 점검표 안의 조각 ↔ 길이 조건은 불필요하므로 보통 compareKey가 다름) |
| 이미 만든 조합 | 기존 단서를 강조 표시만 함 |

- 단서 결과는 *사실 그대로*를 보여 줄 뿐 정답을 알려 주지 않는다. 예: "일치"가 많아도 다른 규칙 위반이 있을 수 있다.
- 설정 "대조 결과 즉시 표시"를 끄면 단서 칩은 "대조함" 상태로만 생기고 일치/불일치는 플레이어가 직접 판단한다(고급 사용자용 도전 옵션).

### 10.6 예시 데이터 — C2-01 (작성 도구 내보내기 형식)

> Unity에서는 ScriptableObject(YAML)로 저장되며, 아래는 사람이 읽기 쉬운 JSON 형식으로 표현한 *예시 데이터*다.

```json
{
  "caseId": "C2-01",
  "titleKey": "case.C2-01.title",
  "descriptionKey": "case.C2-01.desc",
  "requesterId": "char.eunsol",
  "topics": ["topic.phishing", "topic.links"],
  "difficulty": "Intermediate",
  "difficultyParams": { "ruleCount": 2, "compareSteps": 2, "traps": 0, "documents": 3 },
  "riskLevel": "High",
  "parTimeSeconds": 90,
  "stages": [{
    "stageId": "C2-01-S1",
    "documents": [
      { "documentId": "mail", "reveal": "Initial" },
      { "documentId": "domainList", "reveal": "Initial" },
      { "documentId": "notice", "reveal": "Initial" }
    ],
    "facts": [
      { "key": "sender.domain", "valueType": "String", "value": "baeumteo-security.example", "status": "Known", "sourceFieldIds": ["mail.sender"] },
      { "key": "link.domain", "valueType": "String", "value": "login-check.example", "status": "Known", "sourceFieldIds": ["mail.link"] },
      { "key": "official.domain", "valueType": "String", "value": "baeumteo.example", "status": "Known", "sourceFieldIds": ["domainList.baeumteo"] },
      { "key": "request.asksCredential", "valueType": "Bool", "value": "true", "status": "Known", "sourceFieldIds": ["mail.body"] }
    ],
    "rules": ["R-LINK-01", "R-REPORT-01"],
    "allowedVerdicts": ["Approve", "Reject"],
    "correctVerdict": "Reject",
    "acceptableAlternatives": [],
    "riskSpots": [
      { "fieldId": "mail.sender", "required": true },
      { "fieldId": "mail.link", "required": true },
      { "fieldId": "mail.body", "required": false }
    ],
    "keyEvidence": [
      { "fieldA": "mail.sender", "fieldB": "domainList.baeumteo" },
      { "fieldA": "mail.link", "fieldB": "domainList.baeumteo" }
    ],
    "rationaleKey": "case.C2-01.rationale",
    "explanationKey": "case.C2-01.explanation",
    "hints": [{ "forVerdict": "Approve", "textKey": "case.C2-01.hint.approve" }],
    "epilogues": [
      { "condition": "Correct", "textKey": "case.C2-01.epi.correct" },
      { "condition": "RiskApprove", "textKey": "case.C2-01.epi.riskApprove" }
    ],
    "nextStageOnVerify": false
  }]
}
```

**규칙 예시 — R-LINK-01**

```json
{
  "ruleId": "R-LINK-01",
  "topic": "topic.links",
  "introducedOnDay": 5,
  "conditions": [
    { "type": "DomainEquals", "key": "sender.domain", "officialKey": "official.domain" },
    { "type": "DomainEquals", "key": "link.domain", "officialKey": "official.domain" }
  ],
  "onViolation": "Reject",
  "onUnknown": "Verify"
}
```

### 10.7 데이터 검증 (에디터 + CI)

`CaseValidator`(Editor 어셈블리)가 메뉴 실행·자산 저장 시·빌드 전·EditMode 테스트에서 모든 사례를 검사한다. **오류**가 하나라도 있으면 빌드를 막는다.

| 등급 | 검사 항목 |
|---|---|
| 오류 | `caseId`·`fieldId` 중복 / 필수 필드 누락 / 참조 대상(규칙·문서·필드) 없음 |
| 오류 | **판정기 계산 판정 ≠ 작성된 정답** (모순 방지 핵심 규칙) |
| 오류 | 정답·허용 대안이 `allowedVerdicts`에 없음 / 허용 대안이 정답과 같음 |
| 오류 | 계산 판정이 Verify인데 해당 Day에 추가 확인이 해금되지 않음(Day 9 이전) |
| 오류 | 사례의 규칙이 해당 Day 이후에 도입되는 규칙임 |
| 오류 | `riskSpots`·`keyEvidence`가 존재하지 않는 필드를 가리킴 |
| 오류 | 고급 이상인데 `reasonOptions`에 정답 근거 또는 오답 근거가 없음 / Verify 허용인데 정답 `verifyRoutes` 없음 |
| 오류 | 이메일·URL 값의 도메인이 `.example`로 끝나지 않음, 3단 이상 등록 도메인 |
| 오류 | 현지화 키가 String Table에 없음 |
| 경고 | 판정에 쓰이는 사실의 `sourceFieldIds`가 비어 있음 |
| 경고 | Violation 규칙의 관련 필드가 `riskSpots`에 없음(위험 위치 누락 가능성) |
| 경고 | Day 안에서 같은 정답이 3회 연속 / Day 판정 분포가 [6.4](04-levels-and-scoring.md#64-판정-분포-가이드) 범위에서 15%p 이상 벗어남 |
| 경고 | `difficultyParams`가 등급 범위를 벗어남 |
| 경고 | 해설 텍스트에 금지 표현 목록("해킹당", "큰일", "실패" 등) 포함 |
| 오류 | **문서 텍스트에 정답 암시 문구 포함** — 금지 목록("답장할 필요 없", "안전한 메시지", "이건 진짜", "믿어도 돼" 등)과 일치. 사례별 예외는 사유를 적어 승인해야 함 ([G13](01-overview.md#33-게임플레이-단계-점검-v02)) |
| 오류 | 첨부 파일의 표시 이름·마지막 확장자·`FileTypeDefinition` 분류·압축 내용 목록이 서로 맞지 않음 |
| 오류 | Reject 정답인데 `reportable` 미지정 / Verify 정답인데 `verifyResultKey` 없음 / `myRecord` 없음 |
| 경고 | `myRecord`에 메시지 본문과 같은 문장이 들어 있음(주장과 기록이 섞였을 가능성) |

### 10.8 템플릿 기반 사례 생성 (P2)

연습실의 "무작위 사례"를 위해, 고정 사례와 별개로 **템플릿 + 슬롯 + 제약** 방식의 생성기를 둔다.

1. **템플릿**: 문서 구조와 사실 키가 정해진 틀 (예: '파일 공유 요청' 템플릿 = 요청서 + 명단).
2. **슬롯 값 풀**: 가상 이름, 파일명, 도메인 등 (모두 검증된 가상 데이터).
3. **변형 연산자**: "공유 대상 1명을 명단 밖 인물로 교체", "도메인에 하이픈 단어 추가" 등. 각 연산자는 어떤 규칙을 위반시키는지 메타데이터를 가짐.
4. **생성 절차**: 정상 사례 생성 → 변형 0~2개 적용 → **RuleEvaluator로 정답 계산** → 위반 규칙의 `sourceFieldIds`로 위험 위치 자동 산출 → 검증기 통과 시에만 출제.
5. **모순 방지**: 정답은 항상 판정기가 계산한 값만 사용한다. 변형 연산자의 의도(예: "위반을 만들었음")와 판정기 결과가 다르면 그 사례는 폐기하고 로그에 남긴다.
6. **해설**: 위반 규칙별 해설 템플릿을 조합해 생성. 문장 품질 확인을 위해 출시 전 템플릿 조합별 샘플을 사람이 검수한다.
7. **시드 고정**: 생성은 시드 기반으로 해 같은 시드면 같은 사례가 나오도록 하여 버그 재현을 쉽게 한다.

### 10.9 콘텐츠 제작 파이프라인

| 단계 | 도구 | 담당 |
|---|---|---|
| 1. 사례 기획 | 사례 기획 시트(스프레드시트: 사건 설명·문서·정답·해설) | 기획 |
| 2. 교육 검수 | 체크리스트([5.12](03-cases.md#512-사례-작성-체크리스트-콘텐츠-제작용)) + 교사·사서 자문 | 기획·자문 |
| 3. 데이터 입력 | (P0) ScriptableObject 커스텀 인스펙터 / (P1) CSV·JSON 가져오기 도구 | 기획 |
| 4. 자동 검증 | CaseValidator | 자동 |
| 5. 플레이 확인 | 에디터의 "이 사례 바로 플레이" 버튼, 두 테마 전환 확인 | 기획·QA |
| 6. 현지화 문장 검수 | String Table 검토(어휘 수준, 맞춤법) | 기획 |
