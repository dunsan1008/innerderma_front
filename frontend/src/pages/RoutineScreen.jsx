import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { useRoutineText } from '@/i18n/useRoutineText';
import Screen from '@/components/layout/Screen';
import CycleSegment from '@/components/home/CycleSegment';
import RoutineHeader from '@/components/routine/RoutineHeader';
import TabBar from '@/components/layout/TabBar';
import SolutionBody from '@/components/routine/SolutionBody';
import { toFullView } from '@/lib/solutionView';
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
 * 블록 y 좌표는 Figma 프레임 실측치를 그대로 쓴다.
 * (프레임 높이가 내용 합계보다 큰 블록이 있어 flow 로 쌓으면 누적 오차가 생긴다)
 *
 * 본문 항목 렌더와 높이 측정은 `SolutionBody` 가 맡는다 — 촬영 전 기본 솔루션 화면과
 * **같은 구조**를 공유해야 한쪽만 항목이 빠지는 일이 구조적으로 생기지 않는다.
 * 이 화면에 남은 책임은 데이터 취득(`useCareSolution`), 헤더·세그먼트, 프레임 높이 계산,
 * 그리고 CTA(수행 완료 버튼) 동작이다.
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

/** 본문 끝 → 탭바 top 여백 (나이트 2109-2083, 모닝 2409-2387) */
const CONTENT_TAIL_GAP = 26;

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
   * 요청이 실패하면 solution 은 null 로 남고, 아래 `toFullView` 가 기존 더미(rt.*)로
   * 필드별 폴백한다 — 이 화면은 백엔드 연동 여부와 무관하게 항상 뭔가는 보여줘야 한다.
   */
  const { solution, loading: solutionLoading } = useCareSolution(selectedDate);

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

  /**
   * 표시 모델. 필드별 폴백 순서는 `toFullView` 안에 그대로 옮겨져 있다.
   * `rt` 가 렌더마다 새 객체이므로 view 도 매 렌더 새로 만들어진다 — 예전에 `rt` 를
   * 그대로 쓰던 것과 성질이 같아 memo 없이 두어도 안전하다.
   */
  const view = toFullView(solution, rt, cycle);

  /**
   * 본문 높이를 재서 프레임·스크롤 높이를 함께 늘린다.
   * 흐름 배치라 텍스트/스텝 개수가 실제 데이터에 따라 달라지면 본문이 자라거나
   * 줄어드는데, Screen 은 높이를 숫자로 받으므로 실측값을 넘겨 줘야 스크롤이
   * 잘리거나 탭바 위에 빈 여백이 남지 않는다.
   * 측정은 `SolutionBody` 가 하고(ResizeObserver + fonts.ready) 여기서는 결과만 받는다.
   */
  const [bodyHeight, setBodyHeight] = useState(null);

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
   *
   * 이 화면이 정하는 것은 본문 블록의 시작 y 하나뿐이다. 흐름 배치·페이드 인·높이 측정은
   * 모두 `SolutionBody` 안에 있다.
   */
  const contentTop = L.sectionHeader;

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
        본문 블록의 시작 y 만 이 상자가 정한다. key/animate-fade-in/ref 를 여기에 다시
        붙이면 페이드가 이중으로 걸린다 — `SolutionBody` 가 이미 갖고 있다.
      */}
      <div className="absolute left-0 w-[393px]" style={{ top: contentTop }}>
        <SolutionBody
          view={view}
          cycle={cycle}
          onMeasure={setBodyHeight}
          /*
            CTA 슬롯. 모닝에만 수행 완료 버튼을 둔다. 나이트에는 아무것도 넘기지 않아
            `SolutionBody` 가 버튼 자리(26+72)를 만들지 않게 한다.
            래퍼 여백·높이는 `SolutionBody` 가 갖고 있으므로 버튼 자체만 넘긴다.
          */
          cta={
            night ? null : (
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
            )
          }
        />
      </div>
    </Screen>
  );
}
