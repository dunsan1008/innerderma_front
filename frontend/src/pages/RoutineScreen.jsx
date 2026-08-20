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
function EveningWashCard() {
  const { eveningWash: ew } = useRoutineText();
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

        {/* Figma 는 한글을 문자 단위로 줄바꿈하므로 break-all 로 맞춘다 */}
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className="relative w-full shrink-0 break-all font-sans text-[12px] font-normal leading-[18px] text-text-strong">
            {ew.description}
          </p>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-start pt-[12px]" data-name="Container:margin">
          <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-note-line bg-note-bg px-[12px] py-[8px]">
            <div className="relative flex w-full shrink-0 flex-col items-start">
              {/* 어절 단위로만 줄바꿈한다 (break-all 은 글자 중간에서 잘려 읽기 나쁘다) */}
              <p className="relative w-full shrink-0 font-sans text-[11px] font-normal leading-[16px] text-accent-green [word-break:keep-all]">
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

  /**
   * 본문 높이를 재서 프레임·스크롤 높이를 함께 늘린다.
   * 흐름 배치라 텍스트가 길어지면 본문이 자라는데, Screen 은 높이를 숫자로 받으므로
   * 실측값을 넘겨 줘야 스크롤이 잘린 부분까지 닿는다.
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
   * 예전에는 블록마다 Figma 실측 y 를 절대 좌표로 박아 뒀는데, 텍스트가 길어져
   * 카드가 자라면 아래 블록을 밀어내지 못하고 그대로 겹쳤다(설명을 2배로 늘리면
   * 스텝 목록이 INNER CARE 제목을 72px 덮었다).
   *
   * 다행히 실측값이 각 블록의 자연 높이 누적과 정확히 맞아떨어져서
   * (SectionHeader 끝 327.5 → StepList 시작 328, StepList 끝 734 = InnerCare 시작 734 …)
   * 절대 배치를 흐름 배치로 바꿔도 1배 상태의 디자인은 그대로 유지된다.
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
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
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

        <StepList steps={night ? rt.nightSteps : rt.morningSteps} nodeId={night ? '870:3855' : '870:4086'} />

        {night ? null : <EveningWashCard />}

        <InnerCareHeader nodeId={night ? '870:3923' : '870:4173'} />

        <SupplementCards cards={rt.supplementCards} nodeId={night ? '870:3933' : '870:4183'} />

        <AvoidBox items={night ? rt.nightAvoid : rt.morningAvoid} nodeId={night ? '870:3952' : '870:4202'} />

        <WhyBox
          text={rt.whyText}
          tags={rt.whyTags}
          paddingBottom={WHY_BOTTOM_GAP}
          nodeId={night ? '870:3971' : '870:4221'}
        />

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
                if (doneToday) {
                  unmarkCompleted(selectedDate);
                  return;
                }
                markCompleted(selectedDate);
                navigate('/home');
              }}
            />
          </div>
        )}
      </div>
    </Screen>
  );
}
