import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT, useWrapClass } from '@/i18n';
import { useRoutineText } from '@/i18n/useRoutineText';
import Screen from '@/components/layout/Screen';
import PostCard from '@/components/market/PostCard';
import { findProductByKey } from '@/constants/marketScreens';
import { SOLUTION_RECOMMEND_NAMES } from '@/constants/marketProducts';
import { productKey } from '@/store/wishlistStore';
import CycleSegment from '@/components/home/CycleSegment';
import RoutineHeader from '@/components/routine/RoutineHeader';
import TabBar from '@/components/layout/TabBar';
import StepList from '@/components/routine/StepList';
import {
  AvoidBox,
  InnerCareHeader,
  SectionHeader,
  SupplementCards,
  WhyBox,
} from '@/components/routine/RoutineSections';
import { useCareStore } from '@/store/careStore';
import { useUiStore } from '@/store/uiStore';
import NoSolutionNotice from '@/components/routine/NoSolutionNotice';
import { buildWeekStrip, formatDateLabel, isFutureDate, todayKey } from '@/lib/calendar';
import { useCareSolution } from '@/hooks/useCareSolution';
import { useAiCare } from '@/hooks/useAiCare';
import { saveCareCompletion } from '@/api/care';
import { useAuthStore } from '@/store/authStore';
// constants/routines.js 의 더미 상수는 이제 useRoutineText() 를 거쳐 폴백으로만 쓰인다
// (실제 데이터가 있으면 useCareSolution() 의 응답으로 덮어쓴다 — 아래 참고)

/**
 * 루틴(솔루션) 화면. Figma 프레임 두 개를 한 컴포넌트의 두 사이클로 구현한다.
 *  - solution & home - night   (870:3771, 높이 1574.5)
 *  - solution & home - morning (870:4002, 높이 1843.5)
 *
 * 블록 y 좌표는 Figma 프레임 실측치를 그대로 쓴다.
 * (프레임 높이가 내용 합계보다 큰 블록이 있어 flow 로 쌓으면 누적 오차가 생긴다)
 */

/** 상단 고정 헤더 높이 (Figma Container 870:3773) */
const HEADER_HEIGHT = 157;
/** 하단 고정 탭바 높이 (Figma Container 870:3984) */
const TAB_BAR_HEIGHT = 96;

/**
 * Figma 프레임에서 읽은 블록 배치. [top, height]
 *
 * `recommendTitle` / `recommendCards` 는 Figma 833:3029(디벨롭된 모닝 프레임)에서
 * 새로 붙은 "오늘의 솔루션과 어울리는 제품 추천" 섹션이다.
 * 원본은 '왜 이 루틴인가요?' 박스 바로 아래(간격 4px)에 붙어 답답했기 때문에
 * 요청대로 위쪽 여백을 33px 로 벌려 배치했다.
 */
const LAYOUT = {
  night: {
    frameHeight: 2205,
    segment: 157,
    sectionHeader: 237,
    tabBar: 2109,
  },
  morning: {
    frameHeight: 2505,
    segment: 157,
    sectionHeader: 237,
    tabBar: 2409,
  },
};

/**
 * '왜 이 루틴인가요?' 박스 아래 여백.
 *
 * Figma 는 나이트 32 / 모닝 0 으로 서로 달라서, 모닝에서 바로 아래
 * '오늘의 솔루션과 어울리는 제품 추천' 제목이 붙어 답답했다.
 * 두 사이클 모두 나이트 값(32)으로 통일한다.
 */
const WHY_BOTTOM_GAP = 32;

/** 추천 카드 2x2 그리드 — 마켓 1 과 같은 열 좌표·행 간격을 쓴다 */
const RECOMMEND_COLUMNS = [20, 204];
const RECOMMEND_ROW_GAP = 294;
/** PostCard 실측 높이 (마켓 카드와 동일) */
const POST_CARD_HEIGHT = 272;

/**
 * 아래 세 값은 Figma 실측 좌표에서 뽑은 "블록 사이 간격"이다.
 * 흐름 배치로 바꾸면서 절대 y 대신 간격으로 표현했다.
 *  - 추천 제목 끝(1508) → 카드 시작(1517) = 9
 *  - 카드 끝(모닝 2311) → 완료 버튼(2337) = 26, 버튼 블록 높이 50 + 아래 여백 22
 */
const RECOMMEND_TITLE_GAP = 9;
const COMPLETE_BUTTON_GAP = 26;
const COMPLETE_BUTTON_BLOCK = 72;

/** 본문 끝 → 탭바 top 여백 (나이트 2109-2083, 모닝 2409-2387) */
const CONTENT_TAIL_GAP = 26;

/** 모닝 전용 — 저녁 세안 루틴 안내 카드 (Figma 870:4154) */
function EveningWashCard({ data: ew }) {
  const wrap = useWrapClass();
  return (
    <div className="flex w-full flex-col items-start px-[20px] pt-[16px]" data-node-id="870:4154" data-name="MorningContent">
      {/*
        번호 배지가 스텝 카드와 같은 자리에 오도록 테두리·padding 을 스텝 카드에 맞춘다.
        예전에는 border 1 + px-16 pt-12 라 배지가 스텝 카드보다 오른쪽으로 3px,
        위로 3px 어긋나 있었다 (스텝 카드는 border-2 + px-12 py-14 → 배지 left 14 / top 16).
      */}
      <div className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] border-2 border-solid border-line bg-white px-[12px] pb-[14px] pt-[14px]">
        <div className="relative flex w-full shrink-0 items-start justify-between">
          <div className="relative flex shrink-0 items-center gap-[8px]">
            <div className="relative flex size-[24px] shrink-0 items-center justify-center rounded-full bg-text-strong">
              <div className="relative flex shrink-0 flex-col items-start">
                <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-bold leading-[10px] text-white [word-break:break-word]">
                  {ew.badge}
                </p>
              </div>
            </div>
            <div className="relative flex shrink-0 flex-col items-start">
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[14px] font-bold leading-[21px] text-text-strong [word-break:break-word]">
                {ew.title}
              </p>
            </div>
          </div>
          <div
            className="relative flex shrink-0 flex-col items-start rounded-full bg-tag-waste-bg px-[8px] py-[2px]"
            data-name="CategoryTag"
          >
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-medium leading-[15px] text-tag-waste-text [word-break:break-word]">
              {ew.tag}
            </p>
          </div>
        </div>

        {/*
          한국어는 어절 단위로 줄바꿈한다.
          Figma 가 문자 단위로 접어 둬서 break-all 로 맞춰 놨었는데,
          "메이크업과 외|출하신" 처럼 단어 중간이 잘려 읽기 나빴다.
        */}
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className={`relative w-full shrink-0 font-sans text-[12px] font-normal leading-[18px] text-text-strong ${wrap}`}>
            {ew.description}
          </p>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-start pt-[12px]" data-name="Container:margin">
          <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-note-line bg-note-bg px-[12px] py-[8px]">
            <div className="relative flex w-full shrink-0 flex-col items-start">
              {/* 어절 단위로만 줄바꿈한다 (break-all 은 글자 중간에서 잘려 읽기 나쁘다) */}
              <p className={`relative w-full shrink-0 font-sans text-[11px] font-normal leading-[16px] text-accent-green ${wrap}`}>
                {ew.note}
              </p>
            </div>
          </div>
        </div>

        {/*
          "3~4 펌프 · 깨끗한 맨손으로 사용" 은 한 줄로 둔다.
          Figma 실측 폭(135)을 그대로 박아 두면 브라우저 폰트가 더 넓어서 두 줄로 접히고,
          컨테이너 높이(23)에 잘려 아랫줄이 반쯤 보였다.
        */}
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className="relative h-[15px] shrink-0 whitespace-nowrap font-sans text-[10px] font-normal leading-[15px] text-body">
            {ew.footnote}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 모닝 전용 — 수행 완료 버튼 (Figma 870:4234).
 * 당일에만 누를 수 있다. 지난 날/미래 날을 보고 있으면 비활성 상태로 둔다.
 * 이미 완료한 날이면 완료 표시로 바뀌고 다시 누르면 완료를 취소한다.
 */
function CompleteButton({ onClick, enabled = true, completed = false }) {
  const t = useT();
  const label = completed ? t.solution.completedBtn : t.solution.completeBtn;

  return (
    <div className="relative h-[102px] w-full" data-node-id="870:4234" data-name="MorningContent">
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled}
        aria-pressed={completed}
        title={enabled ? undefined : t.solution.completeBtnDisabledTip}
        className={`absolute left-[20px] top-[20px] h-[50px] w-[353px] rounded-[16px] transition-colors duration-200 ${
          !enabled ? 'cursor-not-allowed bg-disabled-bg' : completed ? 'bg-chip-green' : 'bg-header-dark'
        }`}
        data-node-id="870:4235"
        data-name="Button"
        data-testid="complete-button"
      >
        <span
          className={`absolute left-[176.99px] top-[11.5px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-bold leading-[24px] tracking-[-0.3px] [word-break:break-word] ${
            enabled ? 'text-white' : 'text-disabled-text'
          }`}
          data-node-id="870:4236"
        >
          {label}
        </span>
      </button>
    </div>
  );
}

export default function RoutineScreen({ cycle: cycleProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const t = useT();
  const rt = useRoutineText();
  /** 라우트 파라미터(/solution/:cycle)를 쓰고, 값이 이상하면 나이트로 본다 */
  const cycle = (cycleProp ?? params.cycle) === 'morning' ? 'morning' : 'night';
  const setPhase = useCareStore((s) => s.setPhase);
  const selectedDate = useCareStore((s) => s.selectedDate);
  const openCalendar = useUiStore((s) => s.openCalendar);
  const openSkinAnalysis = useUiStore((s) => s.openSkinAnalysis);
  const completedDates = useCareStore((s) => s.completedDates);
  const markCompleted = useCareStore((s) => s.markCompleted);
  const unmarkCompleted = useCareStore((s) => s.unmarkCompleted);

  /**
   * 촬영·자가진단 → 솔루션 도출 중 → 오늘의 솔루션 한 줄 정리를 지나 이 화면에
   * 막 도착했을 때만 데일리 스킨 분석 모달을 자동으로 한 번 띄운다
   * (SolutionSummaryScreen 이 navigate 할 때 이 state 를 실어 보낸다).
   * state 를 바로 비워서 새로고침·뒤로가기로 다시 떠 있지 않게 한다.
   */
  useEffect(() => {
    if (!location.state?.showSkinAnalysis) return;
    openSkinAnalysis();
    navigate(location.pathname, { replace: true, state: {} });
  }, []);

  const today = todayKey();
  const days = buildWeekStrip(selectedDate, completedDates, today);

  /** 수행 완료는 오늘 날짜에서만 기록할 수 있다 */
  const isToday = selectedDate === today;
  const doneToday = completedDates.includes(selectedDate);
  const future = isFutureDate(selectedDate, today);
  const night = cycle === 'night';
  const L = LAYOUT[cycle];

  /**
   * 실제 케어 솔루션 조회. 아직 그 날짜에 솔루션이 없거나(신규 유저, 미연동 환경)
   * 요청이 실패하면 solution 은 null 로 남고, 아래에서 기존 더미(rt.*)로 자연스럽게
   * 폴백한다 — 이 화면은 백엔드 연동 여부와 무관하게 항상 뭔가는 보여줘야 한다.
   */
  const { solution, loading: solutionLoading } = useCareSolution(selectedDate);

  /**
   * 신규 AI Care 파이프라인(`/ai-care`, LLM 기반) 결과 — 백엔드가 안정화 중이라고
   * 밝힌 새 시스템으로, 안정화가 끝나면 `/care-solutions`(위 solution)를 대체할
   * 예정이다. 미리 배선해 두되, 날짜별 조회가 안 되므로(오늘만 생성/조회 가능)
   * 오늘 날짜를 보고 있을 때만 부르고, 각 필드가 비어 있으면 기존 solution → 더미
   * 순으로 자연스럽게 폴백한다(아래 steps/avoidItems/supplementCards/whyText 참고).
   */
  const { aiCare } = useAiCare(isToday);
  const aiCareContent = aiCare?.care ?? null;
  const aiCycleCare = aiCareContent ? (night ? aiCareContent.night : aiCareContent.morning) : null;

  /**
   * 솔루션이 없는 날 판별:
   *  - 미래: 아직 촬영이 안 됨 → 조회할 것도 없이 확정한다.
   *  - 그 외 날짜는 실제 백엔드 솔루션 존재 여부를 우선한다. 예전에는 로컬
   *    `completedDates`(수행 완료 버튼을 눌렀는지)만 보고 판단해서, 다른 기기에서
   *    촬영했거나 완료 버튼을 안 눌렀을 뿐인데도 실제로는 솔루션이 있는 날을
   *    "솔루션 없음"으로 잘못 보여줬다.
   *  - 아직 응답 전(loading)이면 성급하게 "솔루션 없음"으로 보여주지 않고 기다린다
   *    (오늘은 원래 로직대로 보여주고, 그 외 날짜는 로딩이 끝날 때까지 대기).
   *  - 응답이 왔는데도 솔루션이 없으면(진짜 그날 기록이 없거나 백엔드 미연동 환경)
   *    기존 로컬 휴리스틱(오늘 여부 / completedDates)으로 폴백한다.
   */
  const noSolution =
    future || (!solutionLoading && !solution && !isToday && !completedDates.includes(selectedDate));

  /** 하단 추천 카드 4개 — 마켓 목록의 상품을 이름으로 찾아 그대로 쓴다 */
  const recommendProducts = useMemo(
    () => SOLUTION_RECOMMEND_NAMES.map((name) => findProductByKey(name)).filter(Boolean),
    [],
  );

  /**
   * 스텝 목록: aiCare(신규) → solution(기존) → 더미 순으로 폴백한다.
   * aiCare 의 Step 은 `/care-solutions`와 스키마가 다르다 — 지시문(title/description)이
   * 아니라 "이 제품을(productName) 이렇게(usage) 쓰세요, 왜냐하면(reason)" 구조라
   * 카드의 title/description 두 줄로 재구성한다. 카테고리 태그(tagKey/tag)에 대응하는
   * 값이 없어서 태그 칩은 만들지 않는다(StepList 가 tag 없으면 칩을 안 그리도록 처리됨).
   */
  const aiSteps = aiCycleCare?.steps?.length
    ? aiCycleCare.steps.map((s) => ({
        title: s.productName,
        description: s.reason ? `${s.usage} ${s.reason}` : s.usage,
      }))
    : null;
  const solutionSteps = solution ? (night ? solution.eveningSteps : solution.morningSteps) : null;
  const realSteps = aiSteps ?? solutionSteps;
  const steps = realSteps?.length
    ? realSteps.map((s, i) => ({ ...s, no: String(i + 1).padStart(2, '0'), nodeId: `step-${i}` }))
    : night
      ? rt.nightSteps
      : rt.morningSteps;

  /**
   * 피해야 할 것: aiCare 는 밤/아침 구분 없이 `innerCare.avoid` 하나뿐이라
   * 두 사이클 화면에 동일하게 쓴다(기존 solution 은 eveningAvoid/morningAvoid로 나뉘어 있었다).
   */
  const aiAvoid = aiCareContent?.innerCare?.avoid?.length ? aiCareContent.innerCare.avoid : null;
  const avoidItems =
    aiAvoid ??
    (solution
      ? night
        ? solution.eveningAvoid
        : solution.morningAvoid
      : night
        ? rt.nightAvoid
        : rt.morningAvoid);

  /** 섭취 추천: aiCare의 innerCare.recommended(productName/usage/reason) → solution.supplements → 더미 */
  const aiRecommended = aiCareContent?.innerCare?.recommended?.length
    ? aiCareContent.innerCare.recommended.map((r) => ({ name: r.productName, howTo: r.usage, note: r.reason || null }))
    : null;
  const supplementCards =
    aiRecommended ??
    (solution?.supplements?.length
      ? solution.supplements.map((s) => ({ name: s.title, howTo: s.usage, note: null }))
      : rt.supplementCards);

  /** 저녁 세안 카드는 aiCare에 대응 필드가 없어 기존 solution/더미 그대로 쓴다 */
  const eveningWash = solution?.eveningWash
    ? { badge: 'N', ...solution.eveningWash }
    : rt.eveningWash;

  /**
   * "왜 이 루틴인가요" 본문:
   *  - aiCare 가 있으면 상태 요약 + 오늘의 목표를 우선 쓰고, 주의사항(caution)이 있으면
   *    맨 앞에 붙인다.
   *  - 없으면 기존 solution(WHS 진단 요약 → 안전 안내)으로, 그것도 없으면 더미로 폴백한다.
   * aiCare의 primaryConcern은 "STABLE"처럼 다듬어지지 않은 내부 값이라 태그로 쓰기엔
   * 부적절해서, whyTags는 aiCare와 무관하게 기존 solution.concernTags → 더미를 그대로 쓴다.
   */
  const aiWhyText = aiCareContent
    ? [aiCareContent.caution, aiCareContent.skinStateSummary, aiCareContent.todayGoal].filter(Boolean).join(' ')
    : '';
  const whyText = aiWhyText || solution?.whsDiagnosisSummary || solution?.safetyMessage || rt.whyText;
  const whyTags = solution?.concernTags?.length ? solution.concernTags : rt.whyTags;

  /**
   * 본문 높이를 재서 프레임·스크롤 높이를 함께 늘린다.
   * 흐름 배치라 텍스트/스텝 개수가 실제 데이터에 따라 달라지면 본문이 자라거나
   * 줄어드는데, Screen 은 높이를 숫자로 받으므로 실측값을 넘겨 줘야 스크롤이
   * 잘리거나 탭바 위에 빈 여백이 남지 않는다.
   * scrollHeight 는 레이아웃 값이라 DeviceFrame 의 transform: scale 에 영향받지 않는다.
   */
  const bodyRef = useRef(null);
  const [bodyHeight, setBodyHeight] = useState(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;
    const measure = () => setBodyHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [cycle, rt]);

  /** 본문이 끝나는 y (= 탭바 top). 아직 못 쟀으면 Figma 실측값을 쓴다 */
  const contentBottom = bodyHeight === null ? L.tabBar : L.sectionHeader + bodyHeight + CONTENT_TAIL_GAP;
  /** 프레임 높이 — 탭바 아래 여백을 원본과 같게 유지한다 */
  const frameHeight = contentBottom + (L.frameHeight - L.tabBar);

  const header = (
    <RoutineHeader
      days={days}
      selectedDate={selectedDate}
      onOpenCalendar={openCalendar}
      onOpenMyPage={() => navigate('/mypage')}
      onOpenLang={useUiStore.getState().openLang}
    />
  );

  const segment = (
    <CycleSegment
      variant="routine"
      value={cycle}
      captions={{ night: t.home.recovery, morning: t.home.protection }}
      onChange={(next) => {
        setPhase(next);
        navigate(next === 'night' ? '/solution/night' : '/solution/morning');
      }}
    />
  );

  // 솔루션이 없는 날: 헤더·세그먼트는 두고 본문만 안내로 바꾼다 (스크롤 없는 한 화면)
  if (noSolution) {
    return (
      <Screen
        className="bg-white"
        nodeId={night ? '870:3771' : '870:4002'}
        name="solution & home - 미래 날짜"
        headerHeight={HEADER_HEIGHT}
        header={header}
        tabBarHeight={TAB_BAR_HEIGHT}
        tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      >
        <div className="absolute left-0 top-[157px] w-[393px]">
          {segment}
          <NoSolutionNotice label={formatDateLabel(selectedDate)} />
        </div>
      </Screen>
    );
  }

  /**
   * 본문은 세로로 쌓이는 흐름(flow)이다.
   *
   * 예전에는 블록마다 Figma 실측 y 를 절대 좌표로 박아 뒀는데, 텍스트가 길어지거나
   * 실제 데이터의 항목 수가 더미와 다르면 아래 블록을 밀어내지 못하고 그대로 겹치거나
   * 빈 여백이 남았다(설명을 2배로 늘리면 스텝 목록이 INNER CARE 제목을 72px 덮었다).
   *
   * 다행히 실측값이 각 블록의 자연 높이 누적과 정확히 맞아떨어져서
   * (SectionHeader 끝 327.5 → StepList 시작 328, StepList 끝 734 = InnerCare 시작 734 …)
   * 절대 배치를 흐름 배치로 바꿔도 더미 데이터 기준 디자인은 그대로 유지된다.
   * 각 블록의 간격은 컴포넌트 자신의 padding 이 이미 갖고 있다.
   */
  const contentTop = L.sectionHeader;

  /** 추천 카드 그리드 높이 — PostCard 가 absolute 라 감싸는 상자가 높이를 가져야 한다 */
  const recommendRows = Math.ceil(recommendProducts.length / 2);
  const recommendGridHeight = (recommendRows - 1) * RECOMMEND_ROW_GAP + POST_CARD_HEIGHT;

  return (
    <Screen
      className="bg-white"
      height={frameHeight}
      nodeId={night ? '870:3771' : '870:4002'}
      name={night ? 'solution & home - night' : 'solution & home - morning'}
      headerHeight={HEADER_HEIGHT}
      header={header}
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={
        <>
          <TabBar className="relative h-[96px] w-[393px]" />
          {/*
            데일리 스킨 분석 재확인 버튼. Figma 에 없는 요소라 디자인·위치를 직접 정했다.
            탭바 위, 화면 오른쪽 아래에 떠 있는 원형 버튼 — 탭바 슬롯 안에 같이 넣어 두면
            스크롤과 무관하게 항상 같은 자리에 고정된다(Screen 이 tabBar 를 절대 위치로 고정한다).
          */}
          <button
            type="button"
            aria-label={t.skinAnalysis.reopenAria}
            onClick={openSkinAnalysis}
            data-testid="skin-analysis-reopen"
            className="absolute bottom-[112px] right-[16px] flex size-[48px] items-center justify-center rounded-full bg-header-dark shadow-lg transition-transform active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3L20.6 9.2L17.3 19.3L6.7 19.3L3.4 9.2Z"
                stroke="white"
                strokeWidth="1.6"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </>
      }
      contentBottom={contentBottom}
    >
      {/* 세그먼트는 페이드 대상에서 빼야 선택 표시가 끊기지 않고 미끄러진다 */}
      <div className="absolute left-0 w-[393px]" style={{ top: L.segment }}>
        {segment}
      </div>

      {/*
        본문은 사이클이 바뀔 때마다 새로 마운트되며 페이드 인 한다.
        (key 를 cycle 로 줘서 CSS 애니메이션이 다시 재생되게 한다)
      */}
      <div
        key={cycle}
        ref={bodyRef}
        className="absolute left-0 flex w-[393px] flex-col items-start animate-fade-in"
        style={{ top: contentTop }}
        data-name="CycleBody"
      >
        <SectionHeader
          label={rt.sectionLabel}
          sub={rt.sectionSub}
          title={rt.sectionTitle(night)}
          nodeId={night ? '870:3848' : '870:4079'}
        />

        <StepList steps={steps} nodeId={night ? '870:3855' : '870:4086'} />

        {night ? null : <EveningWashCard data={eveningWash} />}

        <InnerCareHeader nodeId={night ? '870:3923' : '870:4173'} />

        <SupplementCards cards={supplementCards} nodeId={night ? '870:3933' : '870:4183'} />

        <AvoidBox items={avoidItems} nodeId={night ? '870:3952' : '870:4202'} />

        <WhyBox text={whyText} tags={whyTags} paddingBottom={WHY_BOTTOM_GAP} nodeId={night ? '870:3971' : '870:4221'} />

        {/*
          오늘의 솔루션과 어울리는 제품 추천 (Figma 833:3029 · 989:1220 + Group 85 / Frame 88).
          마켓 목록의 상품을 그대로 참조하므로 여기서 누른 하트가 마켓·상세와 함께 움직인다.
        */}
        <div className="flex w-full shrink-0 flex-col items-start px-[20px]" data-node-id="989:1220">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[18px] font-bold leading-[26px] text-text-strong">
            {t.solution.recommendTitle}
          </p>
        </div>

        {/* PostCard 는 absolute 라 상대 좌표를 가진 상자 안에 넣는다 */}
        <div
          className="relative w-full shrink-0"
          style={{ height: recommendGridHeight, marginTop: RECOMMEND_TITLE_GAP }}
          data-name="RecommendGrid"
        >
          {recommendProducts.map((product, i) => (
            <PostCard
              key={`recommend-${product.nodeId}`}
              product={{
                ...product,
                left: RECOMMEND_COLUMNS[i % 2],
                top: Math.floor(i / 2) * RECOMMEND_ROW_GAP,
              }}
              onOpen={(p) => navigate(`/market/product/${encodeURIComponent(productKey(p))}`)}
            />
          ))}
        </div>

        {night ? null : (
          <div className="relative w-full shrink-0" style={{ marginTop: COMPLETE_BUTTON_GAP, height: COMPLETE_BUTTON_BLOCK }}>
            <CompleteButton
              enabled={isToday}
              completed={doneToday}
              onClick={() => {
                const next = !doneToday;
                /*
                 * 로컬(캘린더 초록 표시)은 즉시 반영하고, 서버 기록은 백그라운드로 보낸다
                 * — 실패해도 화면 흐름을 막지 않는다(카메라 업로드·자가진단과 같은 방식).
                 * "완료" 버튼은 아침 화면에만 있으므로 phase는 항상 MORNING으로 보낸다.
                 */
                if (next) markCompleted(selectedDate);
                else unmarkCompleted(selectedDate);

                const userCode = useAuthStore.getState().userCode;
                if (userCode) {
                  saveCareCompletion(userCode, { servedDate: selectedDate, phase: 'MORNING', completed: next }).catch(
                    (err) => console.error('[RoutineScreen] saveCareCompletion failed', err),
                  );
                }

                if (next) navigate('/home');
              }}
            />
          </div>
        )}
      </div>
    </Screen>
  );
}
