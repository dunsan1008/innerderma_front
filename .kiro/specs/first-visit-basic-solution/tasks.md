# Implementation Plan: 최초 접속 기본 솔루션 (first-visit-basic-solution)

## Overview

`HomeFirstVisitScreen` 의 회색 자리표시 UI 를 **기본 솔루션(basic solution)** 으로 대체한다. 구현은 의존 순서대로 진행한다.

1. 문구·폴백 상수 (`constants/basicSolution.js`)
2. 근거 데이터 정규화 + 병렬 조회 훅 (`hooks/useBasicSolution.js`)
3. 뷰 모델 어댑터 (`lib/solutionView.js` — `toFullView` 는 `RoutineScreen` 인라인 로직의 순수 이동, `toBasicView` 는 신규)
4. 공용 섹션 컴포넌트에 옵셔널 라벨 prop 추가 (`RoutineSections.jsx`)
5. 공유 본문 컴포넌트 (`components/routine/SolutionBody.jsx`)
6. `RoutineScreen` 위임 전환 → **회귀 검증 관문**
7. `HomeFirstVisitScreen` 전환
8. 최종 검증 및 임시 스크립트 정리

구현 언어는 설계 문서와 동일하게 **JavaScript (React 18 / JSX)** 다. 별도 언어 선택 없이 기존 코드베이스 규약을 따른다.

### 검증 수단 (이 저장소의 실제 수단)

유닛 테스트 러너가 없다. 아래 수단만 쓴다. preview 서버는 이미 `http://localhost:4173` 에서 돌고 있다고 가정하며, 아니면 `npm run preview -- --port 4173` 으로 띄운다 (cwd: `frontend`).

| 수단 | 명령 |
|---|---|
| 빌드 | `npm run build` |
| 린트 | `npm run lint` |
| 기능 검증 | `node scripts/verify.mjs http://localhost:4173` — **현재 175개 통과, 회귀 없이 유지** |
| 다국어 검증 | `node scripts/verify-i18n.mjs http://localhost:4173` — **현재 14개 통과, 깨지지 않는지만 확인 (새 항목 추가 금지)** |
| 픽셀 회귀 | `node scripts/sync.mjs http://localhost:4173` — **이미 21개 밴드가 임계값 초과 상태다. 변경 전 결과를 기준선으로 저장해 두고 신규 실패만 본다** |
| 스크린샷 | `node scripts/shoot.mjs http://localhost:4173 <outDir> <route:name>...` |

순수 함수(`normalizeBasicSource`, `toBasicView`) 검증은 **임시 노드 스크립트**로 하고, 검증이 끝나면 **스크립트를 삭제해 커밋에 포함하지 않는다**(git 워크플로 규칙).

이번 구현은 **한국어 기준으로만** 검증한다. 언어를 바꿔가며 문구를 확인하는 절차는 두지 않는다.

## Tasks

- [x] 1. 기본 솔루션 문구·폴백 상수 모듈 신설
  - [x] 1.1 `frontend/src/constants/basicSolution.js` 에 표시 문구 상수를 정의
    - 나이트/모닝 각각 `section`(label·sub·title), `steps`(4장, `no`·`title`·`tag`·`tagKey`·`description` 한 줄), `eveningWash`(모닝 전용, `note`/`footnote` 는 `null`), `avoid`(3항목), `BASIC_INNER_CARE`(1줄 제목), `BASIC_SUPPLEMENTS`(2장, `note: null`), `BASIC_SEGMENT_CAPTIONS = { night: '기본 회복', morning: '기본 보호' }`, `BASIC_WHY_LABEL`, `BASIC_WHY_FALLBACK_TEXT`, `BASIC_RECOMMEND_TITLE`
    - 모든 문자열은 한국어 하드코딩. 사전 파일(`i18n/ko.js` 등)을 건드리지 않고 `useT()` 도 호출하지 않는다
    - `constants/routines.js` 를 읽거나 문자열을 파생·요약하지 않는다. 섭취 문구는 제조사 공식 문구를 그대로 쓰고, 짧게 만들 때 문장을 잘라내지 않고 **별도의 짧은 공식 문구**를 쓴다
    - 스텝 설명은 대응하는 `constants/routines.js` 스텝 설명보다 짧게 작성한다(P3 판정 대상)
    - 파일 상단에 백엔드 연동 시 교체 대상 엔드포인트와 "번역 재개 시 이 파일의 문자열만 사전 키로 옮긴다"는 주석을 남긴다
    - 검증: `npm run build` 통과
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 7.4, 7.5, 7.6, 12.1, 12.2_
    - _Properties: P3_

  - [x] 1.2 폴백 근거 더미와 상한 상수를 같은 파일에 추가
    - `BASIC_FALLBACK_SOURCE`(`BasicSolutionSource` 형태의 완전한 더미 — `skinType`/`concerns`/`diagnosisSummary` 채움, `treatment: null`), `BASIC_AVOID_LIMIT`, `MAX_CAUTION_ITEMS`, `BASIC_RECOMMEND_COUNT = 2` 정의
    - 배열·객체는 모듈 스코프 상수로 두어 렌더마다 재생성되지 않게 한다
    - 검증: `npm run build` 통과
    - _Requirements: 1.3, 6.2, 6.6, 12.1_
    - _Properties: P2_

- [x] 2. 근거 데이터 정규화와 병렬 조회 훅
  - [x] 2.1 `frontend/src/hooks/useBasicSolution.js` 에 `normalizeBasicSource` 를 구현하고 export
    - `emptyBasicSolutionSource()` 기반으로 `skinType`/`diagnosisSummary`/`diagnosedAt`/`concerns`/`treatment` 를 방어적으로 파싱
    - `concerns` 는 `constants/skinAnalysis.js` 의 알려진 키(`pigmentation`·`pore`·`wrinkle`·`redness`·`texture`)만 통과시키고 중복을 제거. SkinAge 의 `pore_texture` 는 `pore` 로 접는다. 미지 코드는 조용히 버린다
    - `diagnosedAt` 이 `YYYY-MM-DD` 형식이 아니면 `null`, `daysSince` 가 음수·비숫자면 `null` 로 접는다
    - `cautions` 문구는 가공하지 않는다(문자 단위 보존)
    - 입력 payload 를 변경하지 않고 새 객체만 반환한다
    - `hasAnyTreatmentField` 가 false 면 `treatment` 는 `null` 로 남긴다 — 시술 없는 사용자와 빈 응답이 같은 경로로 처리된다
    - 검증: `npm run build` 통과
    - _Requirements: 4.3, 4.7, 4.8, 6.3, 6.8, 8.4, 8.5_
    - _Properties: P8_

  - [x] 2.2 `useBasicSolution()` 훅 본체 구현
    - `authStore.userCode` 가 없으면 요청 없이 즉시 `{ source: null, loading: false }` 반환
    - `getLatestSkinDiagnosis(userCode)` 와 `getTreatmentContext(userCode)` 를 `Promise.allSettled` 로 병렬 실행
    - `onboardingStore.userType === 'DIAGNOSIS_ONLY'` 일 때만 시술 조회를 생략. `null`(재접속으로 유실) 이면 조회한다
    - 실패는 `console.error` 만 남기고 throw 하지 않는다. 두 요청 모두 실패하면 `source: null` 로 두어 화면이 폴백을 쓰게 한다
    - 언마운트 후 `setState` 방지용 `cancelled` 플래그 — `useCareSolution` 과 동일 패턴
    - 진단·시술 데이터를 localStorage 에 저장하지 않는다(`careStore` persist 필드 추가 없음)
    - 검증: `npm run build` 통과
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.9, 6.1, 6.4, 6.5_
    - _Properties: P7_

  - [ ]* 2.3 임시 노드 스크립트로 정규화 방어 동작 확인
    - `frontend/scripts/_tmp-normalize-check.mjs`(임시) 에서 `normalizeBasicSource` 를 직접 호출
    - 입력 조합: `null` / 빈 객체 / 배열 / 문자열 / `concerns` 에 미지 코드·`null`·숫자 혼입 / `daysSince` 음수 / `diagnosedAt` 형식 오류 / 시술 필드 일부만 존재
    - 확인: 반환값이 항상 완전한 `BasicSolutionSource` 이고 `concerns ⊆ 알려진 키` · 중복 없음, `cautions` 각 문자열이 입력과 문자 단위로 동일, 입력 객체가 변형되지 않음(`JSON.stringify` 전후 비교)
    - **P8: 문구 무결성** 확인
    - 확인 후 임시 스크립트 삭제
    - _Requirements: 4.7, 4.8, 6.3, 6.8, 8.4, 8.5_
    - _Properties: P8_

- [x] 3. 뷰 모델 어댑터
  - [x] 3.1 `frontend/src/lib/solutionView.js` 에 `toFullView(solution, rt, cycle)` 를 순수 이동
    - 현재 `RoutineScreen` 인라인의 필드별 폴백 순서를 **그대로** 옮긴다: `steps`(실데이터 있으면 `no`/`nodeId` 부여, 없으면 `rt.nightSteps`/`rt.morningSteps`), `avoidItems`, `supplementCards`(`{name, howTo, note: null}` 매핑), `eveningWash`(`badge: 'N'` 부여), `whyText`(`whsDiagnosisSummary || safetyMessage || rt.whyText`), `whyTags`
    - `depth: 'full'`, `nodeIds`(나이트/모닝 Figma 노드 id), `section`, `recommend` 를 포함한 `SolutionView` 를 반환
    - 로직을 개선하거나 조건을 정리하지 않는다 — 순수 이동이다
    - 검증: `npm run build` 통과
    - _Requirements: 11.4_
    - _Properties: P10_

  - [x] 3.2 같은 파일에 `toBasicView(source, cycle)` 구현
    - `source ?? BASIC_FALLBACK_SOURCE` 로 시작해 항상 완전한 view 를 반환한다(부분 반환 금지)
    - `depth: 'basic'`, `segmentCaptions = BASIC_SEGMENT_CAPTIONS`, 스텝 4장 · 섭취 2장 · 피해주세요 3항목 이상 보장
    - `eveningWash` 는 나이트에서 `null`, 모닝에서 `note`/`footnote` 가 `null` 인 카드
    - `why.text` 는 `diagnosisSummary` → `buildSummaryFrom(skinType, concerns)` → `BASIC_WHY_FALLBACK_TEXT` 순. `buildSummaryFrom` 은 피부 타입·고민 키 나열 수준으로만 조립한다(의료적 확정 표현 금지)
    - `why.tags` 는 `'오프라인 정밀 진단'` + (진단일 있으면 `'{진단일} 기준'`) + (시술 `daysSince` 있으면 `'시술 후 N일차'`, 없고 시술명 있으면 시술명) → 2~3개. **`'오늘 피부 사진'` 태그를 넣지 않는다**
    - 시술 `cautions` 는 `take(cautions, MAX_CAUTION_ITEMS)` 를 `avoid.items` 앞쪽에 붙이고 전체를 `BASIC_AVOID_LIMIT` 로 자른다. **자르는 것은 항목 개수이고 각 문구는 원문 그대로다**
    - `recommend.products` 는 `findProductByKey` 로 찾아 2장
    - `onboardingStore` 를 참조하지 않는다(순수 함수 — `userType` 비의존)
    - 검증: `npm run build` 통과
    - _Requirements: 1.3, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.2, 7.7, 8.1, 8.2, 8.3_
    - _Properties: P2, P3, P4, P5, P6_

  - [ ]* 3.3 임시 노드 스크립트로 뷰 모델 속성 전수 확인
    - `frontend/scripts/_tmp-view-check.mjs`(임시) 에서 `BasicSolutionSource` 필드별 값 후보(정상/`null`/타입 오류/빈 배열)를 데카르트 곱으로 생성해 `toBasicView` 를 전수 호출 (필드 수가 적어 수백 조합 수준)
    - **P2: 개수 보존** — 모든 조합에서 `steps.length === 4`, `supplements.length === 2`, `avoid.items.length >= 3`
    - **P3: 분량 축소** — 대응 스텝 쌍에서 `len(basic.description) < len(full.description)`, `eveningWash.note === null`, `footnote === null`, 섭취 `note === null`, `recommend.products.length === 2`
    - **P4: 근거 정직성** — `'오늘 피부 사진' ∉ why.tags`, `why.tags.length` 가 2~3
    - **P5: 시술 유무 무관 안정성** — `treatment` 가 `null` 이든 아니든 필수 필드에 `undefined` 가 없음
    - **P6: userType 비의존** — 같은 source 로 `userType` 을 `'DIAGNOSIS_ONLY'`/`'DIAGNOSIS_AND_TREATMENT'`/`null` 로 바꿔 호출한 결과가 deep-equal
    - **P8** — `cautions` 원문이 `avoid.items` 안에서 문자 단위로 동일
    - 확인 후 임시 스크립트 삭제
    - _Requirements: 3.2, 3.3, 4.6, 5.4, 5.5, 6.6, 7.2, 8.1, 8.2_
    - _Properties: P2, P3, P4, P5, P6, P8_

- [x] 4. 체크포인트 - 데이터 계층 확인
  - 여기까지 순수 함수·훅만 추가되었고 화면은 아직 변하지 않았다. `npm run build` 와 `npm run lint` 를 통과시키고, `node scripts/verify.mjs http://localhost:4173` 이 175개 통과 상태를 유지하는지 확인한다. 임시 검증 스크립트가 남아 있지 않은지 `git status` 로 확인한다. 질문이 생기면 사용자에게 묻는다.

- [x] 5. 공용 섹션 컴포넌트에 옵셔널 라벨 prop 추가
  - [x] 5.1 `RoutineSections.jsx` 의 4개 컴포넌트에 라벨 prop 을 추가 (기본값 = 기존 `useT()` 값)
    - `InnerCareHeader({ label, sub, lines, nodeId })` — `lines` 기본값 `[t.solution.intakeSolution1, t.solution.intakeSolution2]`
    - `SupplementCards({ cards, recommendLabel, nodeId })` — 기본값 `t.solution.todayRecommend`
    - `AvoidBox({ items, label, title, nodeId })` — 기본값 `t.solution.etc`(없으면 현행 하드코딩 `'ETC'` 유지) / `t.solution.avoidToday`
    - `WhyBox({ text, tags, label, paddingBottom, nodeId })` — 기본값 `t.solution.whyThisRoutine`
    - `SectionHeader` 는 이미 전부 props 라 변경하지 않는다
    - 사전 파일(`ko.js`/`en.js`/`zh.js`/`ja.js`)과 `i18n/useRoutineText.js` 는 변경하지 않는다
    - `SupplementCards` 의 "복용량 판단 금지, 제조사 공식 문구만 노출" 제약을 유지한다
    - 검증: `npm run build` + `node scripts/verify.mjs http://localhost:4173` 175개 통과 유지 (prop 미전달 시 기존 문구가 그대로 나오는지 확인)
    - _Requirements: 11.1, 12.2, 12.5, 7.5_
    - _Properties: P10_

- [x] 6. 공유 본문 컴포넌트 `SolutionBody`
  - [x] 6.1 `frontend/src/components/routine/SolutionBody.jsx` 렌더 구조 구현
    - `({ view, cycle, onMeasure, cta })` 시그니처. 렌더 순서를 단일 정의점으로 고정: `SectionHeader` → `StepList` → `EveningWashCard`(모닝 전용) → `InnerCareHeader` → `SupplementCards` → `AvoidBox` → `WhyBox` → 추천 제목 + `RecommendGrid` → `cta` 슬롯
    - `EveningWashCard` 를 `RoutineScreen` 에서 이 파일로 옮기고, `note`/`footnote` 가 `null` 이면 해당 블록을 렌더하지 않도록 조건부 처리
    - 추천 그리드는 기존 패턴 유지 — `PostCard` 가 `absolute` 라 높이를 가진 상대 컨테이너로 감싸고 행 수로 높이를 계산한다
    - 라벨은 `view` 에 값이 있으면 prop 으로 넘기고, 없으면 넘기지 않아 `useT()` 폴백이 동작하게 한다
    - `depth === 'basic'` 블록에는 `data-name` 만 부여하고 존재하지 않는 `data-node-id` 를 발명하지 않는다. `full` 은 `view.nodeIds` 의 실제 Figma id 를 붙인다
    - 본문을 flex column 흐름으로 쌓는다(절대좌표 블록을 섞지 않는다)
    - 검증: `npm run build` 통과
    - _Requirements: 2.5, 3.1, 3.7, 8.6, 10.1_
    - _Properties: P1_

  - [x] 6.2 높이 측정과 사이클 전환 처리를 `SolutionBody` 에 통합
    - `bodyRef` + `ResizeObserver` 1개 + `document.fonts?.ready` 로 `scrollHeight` 를 측정해 `onMeasure(height)` 호출
    - `view`/`cycle` 변경 시 재측정. 언마운트 시 `ro.disconnect()`
    - 최상위 래퍼에 `key={cycle}` 과 `animate-fade-in` 을 적용해 사이클 전환마다 fade-in 이 재생되게 한다
    - 검증: `npm run build` 통과
    - _Requirements: 2.6, 10.1, 10.3, 10.6, 10.7_
    - _Properties: P9_

- [x] 7. `RoutineScreen` 을 `SolutionBody` 로 위임 전환
  - [x] 7.1 본문 렌더·측정 코드를 제거하고 `toFullView` + `SolutionBody` 로 교체
    - `useCareSolution` 결과를 `toFullView(solution, rt, cycle)` 로 변환해 `SolutionBody` 에 넘긴다
    - `cta` 슬롯에 기존 `CompleteButton`(모닝 전용, `isToday`/`doneToday`/`markCompleted`/`unmarkCompleted` 동작 그대로)을 주입한다
    - 유지: `noSolution` 분기, 스킨 분석 모달 자동 오픈(`location.state.showSkinAnalysis`), 재확인 플로팅 버튼, `LAYOUT` 실측 상수와 `contentBottom`/`frameHeight` 계산식, `data-node-id`
    - 라벨 prop 은 넘기지 않는다 — 기존 `useT()` 폴백으로 문구가 그대로 유지되어야 한다
    - `constants/routines.js`, `i18n/useRoutineText.js`, `store/careStore.js` 는 건드리지 않는다
    - 검증: `npm run build` + `npm run lint` 통과
    - _Requirements: 9.5, 11.1, 11.2, 11.3, 11.4, 11.5_
    - _Properties: P1, P10_

- [x] 8. 회귀 검증 관문 (여기서 통과하지 못하면 다음 단계로 넘어가지 않는다)
  - [x] 8.1 기능 회귀 확인
    - `node scripts/verify.mjs http://localhost:4173` → **175개 통과 유지**. 실패 항목이 하나라도 늘면 7.1 로 돌아가 원인을 고친다
    - `node scripts/verify-i18n.mjs http://localhost:4173` → **14개 통과 유지**(새 항목을 추가하지 않는다. 이번 변경으로 깨지지 않는지만 본다)
    - `/solution/night` ↔ `/solution/morning` 세그먼트 전환, 모닝 수행 완료 버튼(오늘만 활성 / 완료 취소), 미래 날짜 `noSolution` 안내, 스킨 분석 모달 자동 오픈이 모두 이전과 동일하게 동작하는지 확인
    - _Requirements: 11.2, 11.3, 9.5_
    - _Properties: P10_

  - [x] 8.2 픽셀 회귀 확인 (기존 실패와 신규 실패를 구분)
    - 변경 전 `node scripts/sync.mjs http://localhost:4173` 결과를 기준선으로 저장해 둔다(이미 21개 밴드가 임계값 초과 상태다)
    - 변경 후 다시 실행해 **초과 밴드 목록이 기준선과 같은지** 비교한다. `RoutineScreen` 나이트·모닝 프레임에서 신규 초과 밴드가 생기면 위임 전환이 픽셀을 바꾼 것이므로 7.1 을 수정한다
    - 필요하면 `node scripts/shoot.mjs http://localhost:4173 <outDir> /solution/night:night /solution/morning:morning` 으로 스크린샷을 떠 육안 대조한다
    - _Requirements: 11.2, 11.3_
    - _Properties: P10_

- [ ] 9. `HomeFirstVisitScreen` 전환
  - [x] 9.1 자리표시 UI 를 제거하고 기본 솔루션 본문을 연결
    - Figma `870:3635`~`870:3637` 회색 카드 3개와 그 컨테이너(`870:3634`)를 제거
    - `useBasicSolution()` + `useMemo(() => toBasicView(source, phase), [source, phase])` 로 view 를 만들고 `SolutionBody` 에 넘긴다. `loading` 중에도 스켈레톤·빈 화면 없이 폴백 문구로 즉시 렌더한다
    - `SolutionHeader` 높이 157 과 제목 블록(`870:3631`~`870:3633`, `t.home.firstVisitTitle`)은 그대로 둔다
    - 절대좌표 배치와 `HEADER_SHRINK` 상수를 걷어내고 본문을 흐름 배치로 전환한다
    - `careStore.completedDates` 는 읽기 전용으로 쓰고, 촬영 기록이 없는 상태의 주간 캘린더 표기를 유지한다
    - 검증: `npm run build` 통과 후 `/home`(촬영 전 상태) 진입해 8개 섹션이 모두 보이는지 확인
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 9.3, 9.4_
    - _Properties: P1, P2, P7_

  - [-] 9.2 사이클 세그먼트 토글과 CTA 버튼 연결
    - `CycleSegment` 를 `variant='routine'`, `value={phase}`, `captions={view.segmentCaptions}`(`기본 회복`/`기본 보호`), `onChange={setPhase}` 로 바꾼다. **`navigate` 하지 않는다** — 촬영 전에는 `/solution/:cycle` 로 가지 않고 `/home` 을 유지한다
    - 본문 하단 CTA 슬롯에 `'오늘 피부 촬영하기'` 버튼(한국어 하드코딩)을 넣고 `uiStore.openWashCheck` 를 호출한다 — 제거된 회색 카드의 진입점을 승계한다
    - 모닝 선택 시 저녁 세안 카드가 등장하고 나이트로 돌아가면 사라지는지 확인
    - 검증: `/home` 에서 세그먼트 전환 시 URL 이 `/home` 으로 유지되는지, 촬영 버튼 → 세안 확인 모달 → 카메라 흐름이 이어지는지 확인
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.2, 12.3, 12.4_
    - _Properties: P1_

  - [~] 9.3 측정값 기반 프레임 높이·`contentBottom` 계산 연결
    - `onMeasure={setBodyHeight}` 로 받은 값으로 `contentBottom = CONTENT_TOP + bodyHeight + CONTENT_TAIL_GAP`, `height = contentBottom + TAB_BAR_BOTTOM_GAP` 를 계산해 `Screen` 에 넘긴다
    - 아직 측정 전이면 `FALLBACK_CONTENT_BOTTOM` 을 쓴다(첫 프레임 깜빡임 방지)
    - 검증: 스텝 설명을 임시로 3배 길이 문자열로 바꿔 `/home` 을 렌더하고 블록 겹침·잘림이 없는지, 탭바 위에 빈 여백이 남지 않는지, `contentBottom >= CONTENT_TOP + bodyHeight` 인지 확인한다. 확인 후 임시 문자열을 되돌린다
    - 필요하면 `node scripts/find-clipped-text.mjs` 로 잘린 텍스트를 함께 확인한다
    - _Requirements: 10.2, 10.4, 10.5, 10.6_
    - _Properties: P9_

- [ ] 10. 최종 검증 및 정리
  - [~] 10.1 전체 검증 실행
    - `npm run build`, `npm run lint` 통과
    - `node scripts/verify.mjs http://localhost:4173` → 175개 통과 유지
    - `node scripts/verify-i18n.mjs http://localhost:4173` → 14개 통과 유지
    - `node scripts/sync.mjs http://localhost:4173` → 초과 밴드 목록이 8.2 기준선과 비교해 신규 실패 없음(최초 접속 홈은 Figma 원본이 자리표시 UI 이므로 이 프레임의 diff 변화는 의도된 것으로 기록한다)
    - localStorage 를 비운 상태와 `innerderma.care` 에 옛 값이 남은 상태 양쪽에서 `/home` 진입 확인
    - 새로고침 후에도 시술 안내가 유지되는지 확인 (`userType` 유실 시나리오 — P6 의 핵심)
    - _Requirements: 1.1, 4.5, 4.6, 6.2, 6.6, 6.7, 11.2_
    - _Properties: P6, P7, P9, P10_

  - [~] 10.2 임시 산출물 정리
    - 2.3 · 3.3 의 임시 노드 스크립트(`frontend/scripts/_tmp-*.mjs`)와 9.3 의 임시 문자열 변경이 남아 있지 않은지 `git status` / `git diff` 로 확인해 제거한다
    - 스크린샷 산출물 등 검증용 파일이 워킹 트리에 남아 있지 않은지 확인한다
    - _Requirements: 12.1_

## Notes

- `*` 가 붙은 하위 태스크는 선택 사항이다. 다만 2.3 · 3.3 은 이 저장소에 유닛 테스트 러너가 없는 상황에서 Property 2~6·8 을 확인할 유일한 수단이므로 건너뛸 경우 해당 속성이 미검증 상태로 남는다.
- **문구 검수 (design.md 열린 질문 3):** 태스크 1.1 의 기본 솔루션 문구(스텝 4장, 섭취 2장, 피해주세요 3항목, 헤더, 요약)는 스킨케어 안내 문구다. `constants/routines.js` 가 사전 검수 리소스인 것처럼 이 문구도 같은 검수를 거쳐야 하는지 **검수 주체를 사용자에게 확인**해야 한다. 확인 전에는 잠정 문구로 두고, 문구가 확정되면 1.1 파일만 교체하면 된다.
- **응답 필드명 확인 (design.md 열린 질문 1·2, 코드 작업 아님):** `GET /users/{userCode}/skin-diagnosis` 의 `skinType`/`concerns`/`summary`/`diagnosedAt` 과 `treatment-context` 의 `cautions` 존재 여부는 설계의 추정이다. 배포 백엔드 `/api-docs` 로 확인할 수 있으면 확인하고, 필드명이 다르면 `normalizeBasicSource` 한 곳만 수정한다. `cautions` 가 없어도 P5(시술 유무 무관 안정성)는 만족한다.
- 이번 구현은 **한국어 기준으로만** 검증한다. 언어 전환 문구 확인은 번역 재개 시점으로 이관한다. `verify-i18n.mjs` 는 기존 14개가 깨지지 않는지 확인하는 용도로만 돌린다.
- 픽셀 회귀는 **이미 21개 밴드가 임계값 초과 상태**다. 절대 통과를 목표로 하지 않고 8.2 에서 저장한 기준선과 비교해 신규 실패만 본다.
- 변경하지 않는 파일: `i18n/ko.js`·`en.js`·`zh.js`·`ja.js`, `i18n/useRoutineText.js`, `constants/routines.js`, `api/*`, `store/careStore.js`(persist 필드), `store/onboardingStore.js`, `components/routine/StepList.jsx`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "5.1"] },
    { "id": 1, "tasks": ["1.2", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["3.3", "6.1"] },
    { "id": 5, "tasks": ["6.2"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["8.1", "8.2"] },
    { "id": 8, "tasks": ["9.1"] },
    { "id": 9, "tasks": ["9.2"] },
    { "id": 10, "tasks": ["9.3"] },
    { "id": 11, "tasks": ["10.1", "10.2"] }
  ]
}
```
