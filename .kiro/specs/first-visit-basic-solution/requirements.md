# Requirements Document

## Introduction

최초 접속 홈 화면(`HomeFirstVisitScreen`, Figma `870:3573`)은 지금 촬영 기록이 없다는 사실만 전달한다. 회색 자리표시 카드 3개와 값이 `-` 인 사이클 세그먼트 보조 텍스트가 그 빈 상태를 그대로 노출한다. 그런데 서비스 전제상 사용자는 오프라인에서 정밀 피부 진단을 받고(필요하면 시술까지 받고) 그 기록을 계정에 연결한 뒤 앱에 들어온다. 촬영 전이라도 솔루션을 구성할 근거 데이터는 이미 존재한다.

이 스펙은 그 근거로 **기본 솔루션(basic solution)** 을 구성해 자리표시 UI를 대체한다. 기본 솔루션은 촬영 후 솔루션(`RoutineScreen`)과 **렌더 항목 구성이 동일**하고, 다른 것은 **깊이(depth)** 뿐이다. 각 항목의 글자 수가 짧고, 부가 안내 박스(note/footnote)가 빠지고, 제품 추천 장수가 줄어든다. 항목 자체는 줄어들지 않는다.

요구사항은 설계 문서(`design.md`)에서 도출했으며, 설계가 명시적으로 결정한 제약(근거 정직성, 안전 문구 무결성, `userType` 비의존, 기존 화면 무변경, 번역 작업 보류 방침)을 검증 가능한 형태로 고정한다.

## Glossary

- **First_Visit_Home**: 촬영 기록이 없는 상태의 홈 화면 컴포넌트(`pages/HomeFirstVisitScreen.jsx`, Figma `870:3573`).
- **Routine_Screen**: 촬영·분석을 마친 뒤 표시되는 솔루션 화면(`pages/RoutineScreen.jsx`, Figma `870:3771` / `870:4002`).
- **Solution_Body**: 두 화면이 공유하는 본문 렌더 구조 및 높이 측정 컴포넌트(`components/routine/SolutionBody.jsx`).
- **Basic_Solution_Hook**: 오프라인 진단과 시술 맥락을 병렬 조회해 정규화된 근거 데이터를 반환하는 훅(`hooks/useBasicSolution.js`).
- **Source_Normalizer**: 신뢰할 수 없는 서버 payload 를 `BasicSolutionSource` 로 정규화하는 순수 함수(`normalizeBasicSource`).
- **Basic_View_Builder**: `BasicSolutionSource` 와 사이클을 받아 `depth='basic'` 표시 모델을 조립하는 순수 함수(`toBasicView`).
- **Full_View_Builder**: 촬영 후 솔루션 응답을 받아 `depth='full'` 표시 모델을 조립하는 순수 함수(`toFullView`).
- **Basic_View**: `Basic_View_Builder` 가 반환하는 `depth='basic'` 표시 모델.
- **Full_View**: `Full_View_Builder` 가 반환하는 `depth='full'` 표시 모델.
- **Cycle_Segment**: 오늘 밤 / 내일 아침을 전환하는 세그먼트 컨트롤(`components/home/CycleSegment.jsx`).
- **Routine_Sections**: `InnerCareHeader` / `SupplementCards` / `AvoidBox` / `WhyBox` 를 포함한 공용 섹션 컴포넌트 모듈(`components/routine/RoutineSections.jsx`).
- **Supplement_Cards**: 섭취(이너케어) 카드 컴포넌트(`Routine_Sections` 내부).
- **Basic_Copy_Module**: 기본 솔루션의 한국어 하드코딩 문구와 폴백 더미를 담는 상수 모듈(`constants/basicSolution.js`).
- **Care_Store**: 촬영·수행 상태 저장소(`store/careStore.js`). `phase`, `selectedDate`, `completedDates`, `hasCaptureToday` 를 보유한다.
- **Treatment_Context**: 시술명·시술일·경과일·주의사항으로 구성된 시술 맥락 데이터. 없으면 `null`.
- **Concern_Key**: 고민 항목 키. `'pigmentation' | 'pore' | 'wrinkle' | 'redness' | 'texture'`(`constants/skinAnalysis.js`).
- **Render_Slot**: `Solution_Body` 가 정의한 본문 항목 단위. DERMA CARE 헤더 · 스텝 목록 · 저녁 세안 카드 · INNER CARE 헤더 · 섭취 카드 · 피해주세요 · 왜 이 루틴인가요 · 제품 추천 · CTA 로 구성된다.
- **Photo_Evidence_Tag**: 사진 분석을 근거로 표시하는 태그(예: `'오늘 피부 사진'`).

## Requirements

### Requirement 1: 최초 접속 홈 화면의 기본 솔루션 표시

**User Story:** As a 오프라인 정밀 진단을 마치고 앱에 처음 들어온 사용자, I want 촬영 전에도 내 진단 데이터에 근거한 기본 솔루션을 보고 싶다, so that 빈 회색 화면 대신 지금 당장 할 수 있는 관리 방법을 알 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 오늘 촬영 기록 없이 `/home` 에 진입하면, THE First_Visit_Home SHALL 기본 솔루션 본문을 `Solution_Body` 로 렌더한다
2. THE First_Visit_Home SHALL 본문 영역을 기본 솔루션 항목만으로 구성한다 (Figma `870:3635` · `870:3636` · `870:3637` 회색 자리표시 카드는 구성에서 빠진다)
3. WHILE 근거 데이터 조회가 진행 중인 동안, THE First_Visit_Home SHALL Basic_Copy_Module 의 폴백 문구로 구성된 기본 솔루션을 렌더한다
4. WHEN 근거 데이터 조회가 완료되면, THE First_Visit_Home SHALL 조회 결과가 채운 필드의 문구를 갱신한다
5. THE First_Visit_Home SHALL 상단 헤더 높이를 157px 로 유지하고 기존 제목 블록(Figma `870:3631`~`870:3633`)을 그대로 표시한다

### Requirement 2: 사이클 세그먼트 보조 텍스트와 화면 내 토글

**User Story:** As a 촬영 전 사용자, I want 오늘 밤과 내일 아침 기본 솔루션을 세그먼트로 전환해서 보고 싶다, so that 촬영 후와 같은 방식으로 하루 흐름을 파악할 수 있다

#### Acceptance Criteria

1. THE Cycle_Segment SHALL 보조 텍스트로 나이트에 `'기본 회복'`, 모닝에 `'기본 보호'` 를 표시한다
2. THE Cycle_Segment SHALL First_Visit_Home 에서 `variant='routine'` 규격으로 렌더된다
3. WHEN 사용자가 세그먼트에서 다른 사이클을 선택하면, THE First_Visit_Home SHALL Care_Store 의 `phase` 를 선택한 사이클로 설정한다
4. WHEN 사용자가 세그먼트를 전환하면, THE First_Visit_Home SHALL 현재 라우트를 `/home` 으로 유지한 상태에서 표시 내용만 교체한다
5. WHILE 모닝 사이클이 선택된 동안, THE Solution_Body SHALL 저녁 세안 카드를 표시한다
6. WHEN 사이클이 전환되면, THE Solution_Body SHALL `key={cycle}` 재마운트로 fade-in 전환을 재생한다

### Requirement 3: 항목 파리티와 분량 축소

**User Story:** As a 촬영 전후를 모두 경험하는 사용자, I want 기본 솔루션과 촬영 후 솔루션의 항목 구성이 같기를 원한다, so that 촬영 후 화면이 낯설어지지 않고 "촬영하면 더 정밀해진다"는 차이만 느낄 수 있다

#### Acceptance Criteria

1. THE Solution_Body SHALL `depth='basic'` 과 `depth='full'` 에 대해 동일한 순서의 Render_Slot 집합을 사용한다
2. THE Basic_View SHALL 스텝 카드 4개, 섭취 카드 2개, 피해주세요 항목 3개 이상을 포함한다
3. THE Basic_View SHALL 각 스텝의 설명을 대응하는 Full_View 스텝 설명보다 짧은 문자열로 제공한다
4. THE Basic_View SHALL 저녁 세안 카드의 `note` 와 `footnote` 를 `null` 로 제공한다
5. WHERE depth 가 `'basic'` 인 경우, THE Basic_View SHALL 섭취 카드의 `note` 를 `null` 로 제공한다
6. THE Basic_View SHALL 제품 추천 항목을 2개로 제공한다
7. THE Basic_View SHALL DERMA CARE 헤더와 INNER CARE 헤더를 Full_View 와 동일한 위치의 Render_Slot 에 제공한다

### Requirement 4: 근거 데이터 취득과 userType 비의존 판정

**User Story:** As a 진단 기록을 계정에 연결한 사용자, I want 새로고침이나 재접속 후에도 내 시술 정보가 반영된 기본 솔루션을 보고 싶다, so that 앱을 다시 열 때마다 안내가 사라지지 않는다

#### Acceptance Criteria

1. WHEN userCode 가 존재하는 상태로 First_Visit_Home 이 마운트되면, THE Basic_Solution_Hook SHALL `getLatestSkinDiagnosis` 와 `getTreatmentContext` 를 병렬로 호출한다
2. IF userCode 가 없으면, THEN THE Basic_Solution_Hook SHALL 요청을 생략하고 `{source: null, loading: false}` 를 반환한다
3. THE Basic_Solution_Hook SHALL 시술 정보 존재 여부를 `getTreatmentContext` 응답의 시술 필드 존재 여부로 판정한다
4. WHERE `onboardingStore.userType` 이 `'DIAGNOSIS_ONLY'` 인 경우, THE Basic_Solution_Hook SHALL 시술 맥락 조회를 생략한다
5. WHERE `onboardingStore.userType` 이 `null` 인 경우, THE Basic_Solution_Hook SHALL 시술 맥락을 조회한다
6. THE Basic_View_Builder SHALL 동일한 근거 데이터에 대해 `onboardingStore.userType` 값과 무관하게 동일한 Basic_View 를 반환한다
7. THE Source_Normalizer SHALL 알려진 Concern_Key 만 `concerns` 에 포함시키고 중복을 제거한다
8. THE Source_Normalizer SHALL SkinAge 의 `'pore_texture'` 를 Concern_Key `'pore'` 로 대응시킨다
9. THE Basic_Solution_Hook SHALL 진단·시술 데이터를 localStorage 에 저장하지 않고 렌더에만 사용한다

### Requirement 5: 시술 정보 유무에 따른 표시

**User Story:** As a 진단만 받고 시술은 받지 않은 사용자, I want 시술 관련 안내가 없어도 온전한 기본 솔루션을 보고 싶다, so that 내 상황과 무관한 빈 항목이나 오류 문구를 보지 않는다

#### Acceptance Criteria

1. WHERE Treatment_Context 가 존재하고 경과일이 있는 경우, THE Basic_View_Builder SHALL '왜 이 루틴인가요' 태그에 `'시술 후 N일차'` 를 추가한다
2. WHERE Treatment_Context 가 존재하고 경과일이 없으며 시술명이 있는 경우, THE Basic_View_Builder SHALL 태그에 시술명을 추가한다
3. WHERE Treatment_Context 에 주의사항이 있는 경우, THE Basic_View_Builder SHALL 주의사항을 '피해주세요' 항목 앞쪽에 덧붙인다
4. IF Treatment_Context 가 `null` 이면, THEN THE Basic_View_Builder SHALL 시술 관련 태그와 주의사항을 제외한 완전한 Basic_View 를 반환한다
5. THE Basic_View_Builder SHALL Treatment_Context 유무와 무관하게 모든 필수 표시 필드가 채워진 Basic_View 를 반환한다
6. THE Basic_View_Builder SHALL '왜 이 루틴인가요' 태그를 2개 이상 3개 이하로 제공한다

### Requirement 6: 실패 상황의 폴백 렌더

**User Story:** As a 백엔드 미연동 환경이나 네트워크 오류 상황의 사용자, I want 오류 메시지 대신 읽을 수 있는 기본 솔루션을 보고 싶다, so that 첫 화면에서 서비스가 고장 났다고 느끼지 않는다

#### Acceptance Criteria

1. IF 진단 조회가 실패하면, THEN THE Basic_Solution_Hook SHALL 오류를 콘솔에만 기록하고 해당 근거 필드를 `null` 로 둔다
2. IF 진단 조회와 시술 조회가 모두 실패하면, THEN THE First_Visit_Home SHALL Basic_Copy_Module 의 폴백 문구로 기본 솔루션 전체를 렌더한다
3. IF 응답 필드가 예상 타입과 다르면, THEN THE Source_Normalizer SHALL 해당 필드를 `null` 또는 빈 배열로 접는다
4. THE Basic_Solution_Hook SHALL 예외를 호출부로 전파하지 않고 `loading` 을 최종적으로 `false` 로 만든다
5. IF 시술 조회가 404 를 반환하면, THEN THE First_Visit_Home SHALL 시술을 받지 않은 사용자와 동일한 화면을 렌더한다
6. THE First_Visit_Home SHALL 폴백 경로에서도 스텝 카드 4개, 섭취 카드 2개, 피해주세요 항목 3개 이상을 표시한다
7. THE First_Visit_Home SHALL 조회 실패 사실과 엔드포인트 정보를 화면에 표시하지 않고 폴백 콘텐츠만 표시한다
8. THE Source_Normalizer SHALL 입력 payload 를 변경하지 않고 새 객체를 반환한다

### Requirement 7: 안전 문구 무결성

**User Story:** As a 시술을 받은 사용자, I want 시술 후 주의사항을 서버가 내려준 문구 그대로 보고 싶다, so that 말줄임이나 요약으로 안전 안내가 잘리지 않는다

#### Acceptance Criteria

1. WHEN 시술 주의사항이 렌더되면, THE Solution_Body SHALL 서버 원문과 문자 단위로 동일한 문자열을 표시한다
2. WHERE 주의사항 개수가 `BASIC_AVOID_LIMIT` 을 초과하는 경우, THE Basic_View_Builder SHALL 항목 개수만 상한까지 잘라내고 각 문구는 원문을 유지한다
3. WHEN 진단 요약 문구가 기대보다 긴 경우, THE Solution_Body SHALL 문구를 원문 그대로 렌더하고 해당 블록의 높이를 늘린다
4. THE Basic_Copy_Module SHALL `constants/routines.js` 와 문자열을 공유하지 않는 별도 파일로 문구를 제공한다
5. THE Supplement_Cards SHALL 제조사 공식 섭취 방법 문구만 표시한다
6. WHERE 기본 솔루션의 섭취 문구를 짧게 만드는 경우, THE Basic_Copy_Module SHALL 문장을 잘라낸 결과가 아닌 별도의 짧은 공식 문구를 제공한다
7. THE Basic_View_Builder SHALL 진단 요약이 없을 때 피부 타입과 Concern_Key 나열 수준으로만 요약 문장을 조립한다

### Requirement 8: 근거 정직성

**User Story:** As a 사용자, I want 화면이 표시하는 근거가 실제로 보유한 데이터이기를 원한다, so that 촬영하지 않았는데 사진 분석 결과가 있다고 오해하지 않는다

#### Acceptance Criteria

1. THE Basic_View_Builder SHALL '왜 이 루틴인가요' 태그를 실제 보유한 근거만으로 구성한다
2. WHERE depth 가 `'basic'` 인 경우, THE Basic_View_Builder SHALL Photo_Evidence_Tag 를 태그 목록에서 제외한다
3. WHERE 진단일이 존재하는 경우, THE Basic_View_Builder SHALL `'{진단일} 기준'` 형식의 태그를 추가한다
4. IF 진단일 형식이 `YYYY-MM-DD` 가 아니면, THEN THE Source_Normalizer SHALL `diagnosedAt` 을 `null` 로 접는다
5. IF 미지의 고민 코드가 응답에 포함되면, THEN THE Source_Normalizer SHALL 해당 코드를 버린다
6. THE Solution_Body SHALL 기본 솔루션 블록에 `data-name` 만 부여하고 존재하지 않는 Figma `data-node-id` 를 부여하지 않는다

### Requirement 9: 촬영 유도 CTA

**User Story:** As a 촬영 전 사용자, I want 기본 솔루션 하단에서 바로 촬영을 시작하고 싶다, so that 더 정밀한 솔루션으로 넘어가는 다음 행동이 명확하다

#### Acceptance Criteria

1. THE First_Visit_Home SHALL 본문 하단 CTA 슬롯에 `'오늘 피부 촬영하기'` 버튼을 표시한다
2. WHEN 사용자가 CTA 버튼을 누르면, THE First_Visit_Home SHALL `uiStore.openWashCheck` 를 호출해 세안 확인 모달을 연다
3. THE First_Visit_Home SHALL Care_Store 의 `completedDates` 를 읽기 전용으로 사용한다
4. WHILE 촬영 기록이 없는 동안, THE First_Visit_Home SHALL 주간 캘린더에 수행 완료 표기가 없는 날짜 목록을 전달한다
5. THE Routine_Screen SHALL 촬영 후 화면에서 기존 수행 완료 버튼 동작을 유지한다

### Requirement 10: 가변 텍스트에서도 무너지지 않는 레이아웃

**User Story:** As a 사용자, I want 문구 길이가 달라져도 카드가 겹치거나 잘리지 않기를 원한다, so that 어떤 데이터가 내려와도 화면을 끝까지 읽을 수 있다

#### Acceptance Criteria

1. THE Solution_Body SHALL 본문을 흐름(flex column) 배치로 쌓고 `scrollHeight` 를 측정해 `onMeasure` 로 전달한다
2. WHEN 본문 높이가 변경되면, THE First_Visit_Home SHALL `contentBottom` 과 프레임 `height` 를 측정값으로 재계산한다
3. WHEN 웹폰트 로드가 완료되면, THE Solution_Body SHALL 높이를 재측정한다
4. WHILE 최초 측정값이 없는 동안, THE First_Visit_Home SHALL `FALLBACK_CONTENT_BOTTOM` 을 `contentBottom` 으로 사용한다
5. WHERE 스텝 설명 길이가 기준 분량의 3배까지 늘어나는 경우, THE First_Visit_Home SHALL `contentBottom ≥ CONTENT_TOP + bodyHeight` 를 유지한다
6. WHEN 사이클이 전환되면, THE Solution_Body SHALL 본문 높이를 재측정한다
7. THE Solution_Body SHALL 하나의 `ResizeObserver` 로 두 화면의 높이 측정을 처리한다

### Requirement 11: 기존 촬영 후 솔루션 화면 무변경

**User Story:** As a 이미 번역된 촬영 후 솔루션 화면을 쓰는 사용자, I want 이번 변경으로 그 화면의 문구와 동작이 달라지지 않기를 원한다, so that 한국어 기준 회귀 없이 기존 화면을 계속 쓸 수 있다

#### Acceptance Criteria

1. WHERE 라벨 prop 이 전달되지 않은 경우, THE Routine_Sections SHALL 기존 `useT()` 값을 라벨로 사용한다
2. WHERE 표시 언어가 한국어인 경우, THE Routine_Screen SHALL 이 변경 전과 동일한 문구와 레이아웃을 렌더한다 (한국어 외 언어의 렌더 결과는 11.1 의 `useT()` 폴백으로 구조적으로 보장되며 이번 스펙의 검증 대상이 아니다)
3. THE Routine_Screen SHALL 본문 렌더와 높이 측정을 Solution_Body 에 위임한 뒤에도 `noSolution` 분기, 스킨 분석 모달 자동 오픈, 수행 완료 버튼 동작, 실측 레이아웃 상수를 유지한다
4. THE Full_View_Builder SHALL 현재 Routine_Screen 에 인라인으로 있는 필드별 폴백 순서를 동일하게 유지한다
5. THE 구현 SHALL `constants/routines.js`, `i18n/useRoutineText.js`, `store/careStore.js` 의 persist 필드를 변경 없이 유지한다

### Requirement 12: 텍스트 리소스 관리와 번역 마이그레이션 경로

**User Story:** As a 나중에 번역을 일괄 진행할 개발자, I want 기본 솔루션 문구가 한 파일에 모여 있기를 원한다, so that 번역 재개 시 옮길 대상이 명확하다

#### Acceptance Criteria

1. THE Basic_Copy_Module SHALL 기본 솔루션의 모든 표시 문자열을 한 파일에 정의한다
2. THE 구현 SHALL i18n 사전 파일(`ko.js`, `en.js`, `zh.js`, `ja.js`)을 변경 없이 유지한다
3. WHERE 사용자가 한국어 외 언어를 선택한 경우, THE First_Visit_Home SHALL 기본 솔루션 문구를 한국어로 표시한다 (의도된 동작이며, 언어별 표시 검증은 번역 재개 시점에 다룬다)
4. THE First_Visit_Home SHALL 기존 번역 텍스트(`t.home.firstVisitTitle`)를 사전 경유로 그대로 사용한다
5. THE Routine_Sections SHALL 라벨을 옵셔널 prop 으로 받고 기본값을 기존 `useT()` 값으로 제공한다
