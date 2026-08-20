import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n';
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
// constants/routines.js 의 더미 상수는 이제 useRoutineText() 를 거쳐 폴백으로만 쓰인다
// (실제 데이터가 있으면 useCareSolution() 의 응답으로 덮어쓴다 — 아래 참고)

/**
 * 루틴(솔루션) 화면. Figma 프레임 두 개를 한 컴포넌트의 두 사이클로 구현한다.
 *  - solution & home - night   (870:3771, 높이 1574.5)
 *  - solution & home - morning (870:4002, 높이 1843.5)
 *
 * 본문 블록들은 실제 데이터 길이(스텝 수, 보충제 카드 수 등)에 따라 세로 길이가
 * 달라지므로 Figma 절대좌표 대신 일반 문서 흐름(flow)으로 쌓고, 렌더된 실제 높이를
 * ResizeObserver 로 재서 Screen 의 height/contentBottom 에 반영한다.
 * (더미 데이터 기준일 때만 아래 프레임 실측치와 같은 모습이 나온다 — 실제 데이터가
 * 더 짧거나 길면 그만큼 화면 높이도 따라 늘어나거나 줄어든다)
 */

/** 상단 고정 헤더 높이 (Figma Container 870:3773) */
const HEADER_HEIGHT = 157;
/** 하단 고정 탭바 높이 (Figma Container 870:3984) */
const TAB_BAR_HEIGHT = 96;

/** 첫 측정 전 사용할 본문 높이 기본값 (Figma 프레임 실측치 기준, 깜빡임 방지용) */
const CONTENT_HEIGHT_FALLBACK = {
  night: 2205 - HEADER_HEIGHT - TAB_BAR_HEIGHT,
  morning: 2505 - HEADER_HEIGHT - TAB_BAR_HEIGHT,
};

/** 추천 카드 2x2 그리드 — 마켓 1 과 같은 열 좌표·행 간격을 쓴다 */
const RECOMMEND_COLUMNS = [20, 204];
const RECOMMEND_ROW_GAP = 294;
const POST_CARD_HEIGHT = 272;

/**
 * 추천 상품 그리드. PostCard 는 항상 절대좌표(left/top)로 배치되는 컴포넌트라
 * 문서 흐름에 바로 섞을 수 없다 — 카드 개수로 계산한 고정 높이를 가진 로컬
 * relative 컨테이너로 감싼다. 추천 상품 개수는 항상 고정(SOLUTION_RECOMMEND_NAMES)
 * 이라 이 섹션의 높이는 실제 데이터 연동 여부와 무관하게 일정하다.
 */
function RecommendGrid({ products, onOpen }) {
  const rows = Math.ceil(products.length / 2);
  const height = rows > 0 ? (rows - 1) * RECOMMEND_ROW_GAP + POST_CARD_HEIGHT : 0;
  return (
    <div className="relative w-full" style={{ height }}>
      {products.map((product, i) => (
        <PostCard
          key={`recommend-${product.nodeId}`}
          product={{
            ...product,
            left: RECOMMEND_COLUMNS[i % 2],
            top: Math.floor(i / 2) * RECOMMEND_ROW_GAP,
          }}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

/** 모닝 전용 — 저녁 세안 루틴 안내 카드 (Figma 870:4154) */
function EveningWashCard({ data: ew }) {
  return (
    <div className="flex w-full flex-col items-start px-[20px] pt-[16px]" data-node-id="870:4154" data-name="MorningContent">
      <div className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] border border-solid border-line bg-white px-[16px] pb-[16px] pt-[12px]">
        <div className="relative flex w-full shrink-0 items-start justify-between">
          <div className="relative flex shrink-0 items-center gap-[8px]">
            <div className="relative flex size-[24px] shrink-0 items-center justify-center rounded-full bg-text-strong">
              <div className="relative flex shrink-0 flex-col items-start">
                <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-bold leading-[15px] text-white [word-break:break-word]">
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

        {/* Figma 는 한글을 문자 단위로 줄바꿈하므로 break-all 로 맞춘다 */}
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className="relative w-[319px] shrink-0 break-all font-sans text-[12px] font-normal leading-[18px] text-text-strong">
            {ew.description}
          </p>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-start pt-[12px]" data-name="Container:margin">
          <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-note-line bg-note-bg px-[12px] py-[8px]">
            <div className="relative flex w-full shrink-0 flex-col items-start">
              {/* 어절 단위로만 줄바꿈한다 (break-all 은 글자 중간에서 잘려 읽기 나쁘다) */}
              <p className="relative w-[293px] shrink-0 font-sans text-[11px] font-normal leading-[16px] text-accent-green [word-break:keep-all]">
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
        <div className="relative flex w-[319px] shrink-0 flex-col items-start pt-[8px]">
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
  const params = useParams();
  const t = useT();
  const rt = useRoutineText();
  /** 라우트 파라미터(/solution/:cycle)를 쓰고, 값이 이상하면 나이트로 본다 */
  const cycle = (cycleProp ?? params.cycle) === 'morning' ? 'morning' : 'night';
  const setPhase = useCareStore((s) => s.setPhase);
  const selectedDate = useCareStore((s) => s.selectedDate);
  const openCalendar = useUiStore((s) => s.openCalendar);
  const completedDates = useCareStore((s) => s.completedDates);
  const markCompleted = useCareStore((s) => s.markCompleted);
  const unmarkCompleted = useCareStore((s) => s.unmarkCompleted);

  const today = todayKey();
  const days = buildWeekStrip(selectedDate, completedDates, today);

  /** 수행 완료는 오늘 날짜에서만 기록할 수 있다 */
  const isToday = selectedDate === today;
  const doneToday = completedDates.includes(selectedDate);
  /**
   * 솔루션이 없는 날 판별:
   *  - 미래: 아직 촬영이 안 됨
   *  - 과거인데 completedDates 에 없음: 그날 촬영·수행 기록이 없음
   *  - 오늘: 촬영을 마쳤으므로 항상 보여준다 (HomeRoute 가 hasCaptureToday 로 분기하니 여기까지 온 건 촬영 완료 의미)
   */
  const future = isFutureDate(selectedDate, today);
  const noSolution = future || (!isToday && !completedDates.includes(selectedDate));
  const night = cycle === 'night';

  /**
   * 본문 실제 렌더 높이 측정. 스텝 개수·보충제 카드 개수 등이 실제 데이터에 따라
   * 달라지므로, 고정 픽셀값 대신 ResizeObserver 로 잰 값을 Screen 에 그대로 먹인다.
   */
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(CONTENT_HEIGHT_FALLBACK[cycle]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;

    const measure = () => setContentHeight(el.scrollHeight || CONTENT_HEIGHT_FALLBACK[cycle]);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [cycle]);

  /** 하단 추천 카드 4개 — 마켓 목록의 상품을 이름으로 찾아 그대로 쓴다 */
  const recommendProducts = useMemo(
    () => SOLUTION_RECOMMEND_NAMES.map((name) => findProductByKey(name)).filter(Boolean),
    [],
  );

  /**
   * 실제 케어 솔루션 조회. 아직 그 날짜에 솔루션이 없거나(신규 유저, 미연동 환경)
   * 요청이 실패하면 solution 은 null 로 남고, 아래에서 기존 더미(rt.*)로 자연스럽게
   * 폴백한다 — 이 화면은 백엔드 연동 여부와 무관하게 항상 뭔가는 보여줘야 한다.
   */
  const { solution } = useCareSolution(selectedDate);
  const realSteps = solution ? (night ? solution.eveningSteps : solution.morningSteps) : null;
  const steps = realSteps?.length
    ? realSteps.map((s, i) => ({ ...s, no: String(i + 1).padStart(2, '0'), nodeId: `step-${i}` }))
    : night
      ? rt.nightSteps
      : rt.morningSteps;
  const avoidItems = solution
    ? night
      ? solution.eveningAvoid
      : solution.morningAvoid
    : night
      ? rt.nightAvoid
      : rt.morningAvoid;
  const supplementCards = solution?.supplements?.length
    ? solution.supplements.map((s) => ({ name: s.title, howTo: s.usage, note: null }))
    : rt.supplementCards;
  const eveningWash = solution?.eveningWash
    ? { badge: 'N', ...solution.eveningWash }
    : rt.eveningWash;
  /** "왜 이 루틴인가요" 본문은 WHS 진단 요약을 우선하고, 없으면 안전 안내 메시지를 쓴다 */
  const whyText = solution?.whsDiagnosisSummary || solution?.safetyMessage || rt.whyText;
  const whyTags = solution?.concernTags?.length ? solution.concernTags : rt.whyTags;

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

  return (
    <Screen
      className="bg-white"
      height={HEADER_HEIGHT + contentHeight + TAB_BAR_HEIGHT}
      nodeId={night ? '870:3771' : '870:4002'}
      name={night ? 'solution & home - night' : 'solution & home - morning'}
      headerHeight={HEADER_HEIGHT}
      header={header}
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={HEADER_HEIGHT + contentHeight}
    >
      <div ref={contentRef} className="absolute left-0 top-[157px] w-[393px]">
        {/* 세그먼트는 페이드 대상에서 빼야 선택 표시가 끊기지 않고 미끄러진다 */}
        {segment}

        {/*
          본문은 사이클이 바뀔 때마다 새로 마운트되며 페이드 인 한다.
          (key 를 cycle 로 줘서 CSS 애니메이션이 다시 재생되게 한다)
        */}
        <div key={cycle} className="animate-fade-in" data-name="CycleBody">
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

          <WhyBox text={whyText} tags={whyTags} paddingBottom={0} nodeId={night ? '870:3971' : '870:4221'} />

          {/*
            오늘의 솔루션과 어울리는 제품 추천 (Figma 833:3029 · 989:1220 + Group 85 / Frame 88).
            마켓 목록의 상품을 그대로 참조하므로 여기서 누른 하트가 마켓·상세와 함께 움직인다.
          */}
          <div className="flex w-full flex-col items-start px-[20px] pt-[33px]" data-node-id="989:1220">
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[18px] font-bold leading-[26px] text-text-strong">
              {t.solution.recommendTitle}
            </p>
          </div>

          <RecommendGrid
            products={recommendProducts}
            onOpen={(p) => navigate(`/market/product/${encodeURIComponent(productKey(p))}`)}
          />

          {night ? null : (
            <CompleteButton
              enabled={isToday}
              completed={doneToday}
              onClick={() => {
                if (doneToday) {
                  unmarkCompleted(selectedDate);
                  return;
                }
                markCompleted(selectedDate);
                navigate('/home');
              }}
            />
          )}
        </div>
      </div>
    </Screen>
  );
}
