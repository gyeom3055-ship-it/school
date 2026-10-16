# 12장. 저장 및 예외 처리 설계

[← 목차로](README.md)

## 12.1 저장 원칙

1. **기기 안에만 저장** — `Application.persistentDataPath` 아래 로컬 파일. 클라우드 동기화·계정 로그인 없음.
2. **개인정보 없음** — 저장 내용은 프리셋 닉네임, 진행도, 설정뿐이다.
3. **자주, 작게, 안전하게** — 사례 완료마다 자동 저장하고, 쓰기 도중 앱이 꺼져도 이전 데이터가 살아 있도록 *원자적 쓰기*를 한다.
4. **망가져도 처음부터가 아니다** — 백업 파일로 복구하고, 그래도 안 되면 복구 가능한 부분만 살린다.

## 12.2 저장 파일 구성

| 파일 | 내용 | 비고 |
|---|---|---|
| `save_main.json` | 진행·설정·진행 중 세션 | 주 저장 파일 |
| `save_main.bak` | 직전에 정상적으로 저장된 버전 | 주 파일 교체 직전에 복사 |
| `save_main.tmp` | 쓰는 중인 임시 파일 | 쓰기 완료 후 주 파일로 교체, 남아 있으면 시작 시 삭제 |

## 12.3 저장 데이터 스키마 (`SaveData`)

| 필드 | 타입 | 설명 |
|---|---|---|
| `schemaVersion` | int | 저장 형식 버전 (마이그레이션 기준) |
| `appVersion` | string | 저장한 앱 버전 |
| `contentVersion` | string | 콘텐츠 데이터 버전 (사례 ID 변경 감지) |
| `createdAt`, `updatedAt` | string (ISO 8601) | 생성·갱신 시각 |
| `profile.nicknameParts` | int[3] | 형용사·동물·숫자 인덱스 (문자열이 아닌 인덱스로 저장) |
| `settings` | 객체 | themeId, textScale, highContrast, reduceMotion, readableBodyFont, timerMode, instantCompareResult, confirmSheet, bgmVolume, sfxVolume, haptics |
| `progress.highestUnlockedDay` | int | 해금된 최대 Day |
| `progress.dayRecords` | {dayId: {completed, bestStars, bestScore, bestAccuracy, playCount}} | Day별 최고 기록 |
| `progress.totalStars` | int | 별 누적 (dayRecords에서 재계산 가능 — 손상 검증에 사용) |
| `progress.unlockedRuleIds`, `unlockedToolIds` | string[] | 해금 목록 (Day 기록으로 재계산 가능) |
| `progress.topicHistory` | {topicId: [{caseId, firstTryCorrect, dayId}] (최근 8건)} | 숙달도 계산용 |
| `progress.reviewNotes` | [{caseId, reason, addedAt, cleared}] | 복습 노트 |
| `progress.glossaryFound` | string[] | 보안 사전 수집 |
| `progress.decorations` | string[] | 해금한 꾸미기 |
| `activeDay` | 객체 또는 null | 진행 중인 하루 (아래) |
| `checksum` | string | 위 내용 전체의 SHA-256 해시 (손상 감지용, 부정행위 방지 목적 아님) |

**`activeDay` (진행 중인 하루)**

| 필드 | 설명 |
|---|---|
| `dayId`, `caseOrder` | 진행 중인 Day와 사례 순서 |
| `completedCases` | 완료한 사례의 CaseRecord 목록 (점수·결과) |
| `streak` | 현재 연속 정답 |
| `currentCase` | 진행 중 사례의 `CaseSession` 스냅샷: caseId, stageIndex, visibleDocumentIds, clues, flags, attempts, elapsedSeconds, hintsShown |
| `uiState` | 현재 문서 ID, 비교 모드 문서 쌍, 스크롤 위치(비율), 확대 배율 |

## 12.4 저장 시점

| 시점 | 저장 범위 | 비고 |
|---|---|---|
| 첫 실행 '출근하기' | 전체 생성 | — |
| Day 시작(아침 브리핑 완료) | `dayStartSnapshot` (그 Day를 시작하기 직전의 진행·숙달도) | v0.3: 실패 후 **처음부터 다시 하기**는 이 스냅샷으로 되돌린 뒤 첫 사건부터 시작 |
| 사례 판정 결과 확정(정답·2회 오답·허용 대안) | `completedCases`, `streak`, `progress` 일부 | 핵심 저장 시점 |
| 단서 생성·깃발 토글·추가 조회 | `currentCase` | 디바운스 2초(연속 조작 시 마지막 한 번만 저장) |
| 2단계 진입 | `currentCase` | — |
| 하루 완료 | `dayRecords`, 해금, `activeDay = null` | — |
| 설정 변경 | `settings` | 시트를 닫을 때 저장 |
| 앱 백그라운드 전환 (`OnApplicationPause(true)`) | 전체 | 즉시 저장(디바운스 무시) |
| 앱 종료 (`OnApplicationQuit`) | 전체 | 모바일에서는 호출이 보장되지 않으므로 위 백그라운드 저장이 주 수단 |

## 12.5 원자적 쓰기 절차

```
1. SaveData를 JSON으로 직렬화 → checksum 계산 후 포함
2. save_main.tmp 에 쓰기 → 파일 버퍼 비우기(flush)
3. save_main.tmp 를 다시 읽어 checksum 검증 (실패 시 2번 1회 재시도, 그래도 실패면 중단하고 기존 파일 유지)
4. 기존 save_main.json 이 정상이면 save_main.bak 로 복사
5. save_main.tmp → save_main.json 으로 교체 (File.Replace 또는 이동)
6. 저장은 메인 스레드 프레임을 막지 않도록 직렬화 후 파일 입출력을 비동기로 수행하되,
   동시에 두 개의 저장이 실행되지 않도록 저장 요청 큐(마지막 요청만 유지)를 사용
```

## 12.6 불러오기·복구 절차

```
시작 시:
 1. save_main.tmp 가 남아 있으면 삭제 (이전 쓰기 중단 흔적)
 2. save_main.json 읽기
     ├ 파일 없음 → (bak 있으면 3으로) 없으면 신규 사용자 → 첫 실행 화면
     ├ JSON 파싱 실패 또는 checksum 불일치 → 3으로
     └ 정상 → 4로
 3. save_main.bak 읽기
     ├ 정상 → 복구 성공 안내 후 4로 ("마지막 저장 직전 상태로 되돌렸어요")
     └ 실패 → 5로
 4. 버전 확인 및 마이그레이션 → 내용 검증(12.7) → 게임 시작
 5. 부분 복구 시도: 두 파일 중 파싱 가능한 부분에서 settings, dayRecords만 추출
     ├ 성공 → "일부 기록을 복구했어요. 진행 중이던 하루는 처음부터 다시 시작해요."
     └ 실패 → 손상 파일을 save_corrupt_{시각}.json 으로 보관(최대 2개) 후 새로 시작
              "저장 기록을 읽을 수 없어 새로 시작해요. 미안해요!" (탓하지 않는 문구)
```

## 12.7 내용 검증과 마이그레이션

| 검사 | 문제 발견 시 처리 |
|---|---|
| `schemaVersion` < 현재 | `SaveDataMigrator`가 버전별 변환 단계를 순서대로 적용 (v1→v2→v3). 변환 전 원본을 `save_premigration_v{n}.json`으로 1회 보관 |
| `schemaVersion` > 현재 (앱을 낮은 버전으로 되돌린 경우) | 덮어쓰지 않고 읽기 전용 안내: "더 새로운 버전에서 저장된 기록이에요. 앱을 업데이트해 주세요." 새 게임 시작은 막음(데이터 보호) |
| `highestUnlockedDay`가 범위 밖 | `dayRecords`에서 완료한 Day 기준으로 재계산 |
| `totalStars` ≠ dayRecords 합 | dayRecords 기준으로 재계산 |
| 존재하지 않는 caseId/ruleId/toolId (콘텐츠 업데이트로 삭제·변경) | 해당 항목 제거. `contentVersion` 변경 시 ID 변경표(`ContentIdRemap`)로 치환 |
| `activeDay.currentCase`의 문서·필드 ID가 현재 데이터에 없음 | 그 사례를 처음 상태로 다시 시작 (완료한 사례 기록은 유지) |
| 설정값 범위 밖 (음량 150 등) | 기본값으로 교정 |
| 해금 목록이 Day 기록과 모순 | Day 기록 기준으로 재계산 (해금은 항상 파생 데이터로 취급) |

## 12.8 런타임 예외 처리

| 상황 | 감지 | 처리 | 사용자에게 보이는 것 |
|---|---|---|---|
| 판정 버튼 연타 / 동시 입력 | DecisionPanel 상태 `Submitting`, CaseManager `attemptIndex` 검사 | 첫 입력만 처리, 나머지 무시 | 버튼 눌림 상태 + 로딩 표시 |
| 결과 화면에서 "다음" 연타 | GameManager 상태 전이 잠금 | 같은 상태 전이 요청 1회만 처리 | 없음 |
| 사례 데이터 누락(문서·필드 참조 없음) | 로드 시 런타임 검증 (빌드 전 검증을 통과했더라도 방어) | 해당 사례 건너뛰고 로그 기록, Day 사례 수에서 제외하고 지표 계산 | "이 사례를 불러오지 못해 다음 사례로 넘어가요." |
| 현지화 키 누락 | String Table 조회 실패 | 개발 빌드: `[MISSING:key]` 표시 / 출시 빌드: 해당 줄 숨김 + 로그 | 출시 빌드에서는 빈 줄 없이 자연스럽게 |
| 글꼴에 없는 글자 | 폰트 에셋 폴백 체인 | 테마 글꼴 → 일반 글꼴 → 시스템 글꼴 순 폴백 | 글자가 다른 모양으로 보일 수 있음(깨짐 방지) |
| Day의 모든 사례 로드 실패 | 유효 사례 0개 | 로비로 돌아가고 해당 Day 해금은 유지 | "오늘 근무를 준비하지 못했어요. 다른 날을 먼저 해 볼까요?" |
| 저장 공간 부족 | 파일 쓰기 예외 | 기존 파일 유지, 다음 저장 시점에 재시도, 연속 3회 실패 시 안내 1회 | "기기 저장 공간이 부족해 진행을 저장하지 못했어요." |
| 저장 중 앱 강제 종료 | 다음 실행 시 tmp 존재 | 12.6 절차로 복구 | 대부분 표시 없음 |
| 앱 백그라운드 장시간 후 복귀 | `OnApplicationPause(false)` | 일시정지 메뉴 표시, 타이머 정지 상태 유지 | 일시정지 메뉴 |
| 메모리 부족 경고 | `Application.lowMemory` | 사용하지 않는 테마 자산·배경 언로드 | 없음 |
| 화면 회전·해상도 변경(폴더블 등) | 화면 크기 변경 감지 | 레이아웃 재계산, 세션 상태 유지 | 없음 |
| 예상하지 못한 예외 | 전역 예외 로그 핸들러 | 로컬 로그 파일(최근 200줄, 개인정보 없음)에 기록, 가능하면 로비로 복귀하고 진행 저장 | "앗, 문제가 생겼어요. 진행은 저장되어 있어요." |

> 로컬 로그 파일은 기기 밖으로 전송하지 않는다. 문제 제보가 필요한 경우를 대비해 설정 > 정보에 "문제 기록 보기"(P2, 사용자가 직접 내용을 보고 복사)만 제공한다.

## 12.9 진행 초기화

- 설정 > 데이터 > "진행 초기화" → 1차 확인("모든 기록이 지워져요") → 2차 확인(버튼 3초 길게 누르기 *또는* "초기화" 버튼을 한 번 더 누르는 두 가지 방식 제공).
- 초기화 시 `save_main.json`을 `save_reset_backup.json`으로 1개 보관하고 새로 시작한다. 다음 초기화 때 덮어쓴다.
