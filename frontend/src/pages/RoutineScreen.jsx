import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
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
import {
  EVENING_WASH,
  MORNING_AVOID,
  MORNING_STEPS,
  NIGHT_AVOID,
  NIGHT_STEPS,
  SUPPLEMENT_CARDS,
  WHY_TAGS,
  WHY_TEXT,
} from '@/constants/routines';
// 이제 위 상수를 직접 렌더하지 않고 useRoutineText() 훅의 번역된 값을 쓴다

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
    header: 0,
    segment: 157,
    sectionHeader: 237,
    stepList: [328, 406],
    innerCare: 734,
    supplements: 855,
    avoid: 1103,
    why: [1273, 32],
    recommendTitle: 1482,
    recommendCards: 1517,
    tabBar: 2109,
  },
  morning: {
    frameHeight: 2505,
    header: 0,
    segment: 157,
    sectionHeader: 237,
    stepList: [328, 435],
    eveningWash: 763,
    innerCare: 962,
    supplements: 1083,
    avoid: 1331,
    why: [1501, 0],
    recommendTitle: 1710,
    recommendCards: 1745,
    completeButton: 2337,
    tabBar: 2409,
  },
};

/** 추천 카드 2x2 그리드 — 마켓 1 과 같은 열 좌표·행 간격을 쓴다 */
const RECOMMEND_COLUMNS = [20, 204];
const RECOMMEND_ROW_GAP = 294;

/** 모닝 전용 — 저녁 세안 루틴 안내 카드 (Figma 870:4154) */
function EveningWashCard() {
  const { eveningWash: ew } = useRoutineText();
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
  const L = LAYOUT[cycle];

  /** 하단 추천 카드 4개 — 마켓 목록의 상품을 이름으로 찾아 그대로 쓴다 */
  const recommendProducts = useMemo(
    () => SOLUTION_RECOMMEND_NAMES.map((name) => findProductByKey(name)).filter(Boolean),
    [],
  );

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

  /** 블록을 Figma 좌표에 절대 배치하는 헬퍼 */
  const block = (top, children, key) => (
    <div key={key} className="absolute left-0 w-[393px]" style={{ top }}>
      {children}
    </div>
  );

  return (
    <Screen
      className="bg-white"
      height={L.frameHeight}
      nodeId={night ? '870:3771' : '870:4002'}
      name={night ? 'solution & home - night' : 'solution & home - morning'}
      headerHeight={HEADER_HEIGHT}
      header={header}
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={L.tabBar}
    >
      {/* 세그먼트는 페이드 대상에서 빼야 선택 표시가 끊기지 않고 미끄러진다 */}
      {block(L.segment, segment, 'segment')}

      {/*
        본문은 사이클이 바뀔 때마다 새로 마운트되며 페이드 인 한다.
        (key 를 cycle 로 줘서 CSS 애니메이션이 다시 재생되게 한다)
      */}
      <div key={cycle} className="animate-fade-in" data-name="CycleBody">
      {block(
        L.sectionHeader,
        <SectionHeader
          label={rt.sectionLabel}
          sub={rt.sectionSub}
          title={rt.sectionTitle(night)}
          nodeId={night ? '870:3848' : '870:4079'}
        />,
        'sectionHeader',
      )}

      {block(
        L.stepList[0],
        <StepList
          steps={night ? rt.nightSteps : rt.morningSteps}
          height={L.stepList[1]}
          nodeId={night ? '870:3855' : '870:4086'}
        />,
        'stepList',
      )}

      {night ? null : block(L.eveningWash, <EveningWashCard />, 'eveningWash')}

      {block(L.innerCare, <InnerCareHeader nodeId={night ? '870:3923' : '870:4173'} />, 'innerCare')}

      {block(
        L.supplements,
        <SupplementCards cards={rt.supplementCards} nodeId={night ? '870:3933' : '870:4183'} />,
        'supplements',
      )}

      {block(L.avoid, <AvoidBox items={night ? rt.nightAvoid : rt.morningAvoid} nodeId={night ? '870:3952' : '870:4202'} />, 'avoid')}

      {block(
        L.why[0],
        <WhyBox text={rt.whyText} tags={rt.whyTags} paddingBottom={L.why[1]} nodeId={night ? '870:3971' : '870:4221'} />,
        'why',
      )}

      {/*
        오늘의 솔루션과 어울리는 제품 추천 (Figma 833:3029 · 989:1220 + Group 85 / Frame 88).
        마켓 목록의 상품을 그대로 참조하므로 여기서 누른 하트가 마켓·상세와 함께 움직인다.
      */}
      {block(
        L.recommendTitle,
        <div className="flex w-full flex-col items-start px-[20px]" data-node-id="989:1220">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[18px] font-bold leading-[26px] text-text-strong">
            {t.solution.recommendTitle}
          </p>
        </div>,
        'recommendTitle',
      )}

      {recommendProducts.map((product, i) => (
        <PostCard
          key={`recommend-${product.nodeId}`}
          product={{
            ...product,
            left: RECOMMEND_COLUMNS[i % 2],
            top: L.recommendCards + Math.floor(i / 2) * RECOMMEND_ROW_GAP,
          }}
          onOpen={(p) => navigate(`/market/product/${encodeURIComponent(productKey(p))}`)}
        />
      ))}

      {night
        ? null
        : block(
            L.completeButton,
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
            />,
            'complete',
          )}
      </div>
    </Screen>
  );
}
