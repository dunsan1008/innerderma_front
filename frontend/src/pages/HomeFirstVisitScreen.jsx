import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';

import SolutionHeader from '@/components/home/SolutionHeader';
import CycleSegment from '@/components/home/CycleSegment';
import SolutionBody from '@/components/routine/SolutionBody';
import { useBasicSolution } from '@/hooks/useBasicSolution';
import { toBasicView } from '@/lib/solutionView';
import { BASIC_CTA_LABEL } from '@/constants/basicSolution';
import { useCareStore } from '@/store/careStore';
import { useUiStore } from '@/store/uiStore';
import { buildWeekStrip } from '@/lib/calendar';

/**
 * 최초 접속 홈화면 (Figma 870:3572 > SolutionScreen 870:3573).
 *
 * 아직 오늘 촬영 기록이 없는 상태다. 예전에는 이 사실만 전달하는 빈 화면이었다
 * (회색 자리표시 카드 3개 870:3635~3637 + 값이 '-' 인 세그먼트). 그런데 서비스 전제상
 * 사용자는 오프라인 정밀 진단을 받고(필요하면 시술까지 받고) 그 기록을 계정에 연결한 뒤
 * 들어오므로, 촬영 전에도 솔루션을 구성할 근거 데이터가 이미 있다.
 * 그래서 자리표시 카드를 걷어내고 그 근거로 만든 **기본 솔루션**을 렌더한다.
 *
 * 본문 항목 구성과 높이 측정은 `SolutionBody` 가 맡는다 — 촬영 후 솔루션(`RoutineScreen`)과
 * **같은 렌더 구조**를 공유해야 한쪽만 항목이 빠지는 일이 구조적으로 생기지 않는다.
 * 다른 것은 깊이(depth)뿐이다: 글자 수가 짧고, 부가 안내 박스가 빠지고, 추천 장수가 줄어든다.
 *
 * 이 화면에 남은 책임은 근거 데이터 취득(`useBasicSolution`), 헤더·세그먼트, 프레임 높이 계산이다.
 */

/** 하단 고정 탭바 높이 (Figma Container 870:3984 과 같은 규격) */
const TAB_BAR_HEIGHT = 96;

/**
 * 상단 헤더 높이 — 솔루션을 받은 뒤 홈 헤더(루틴 헤더 870:3773)와 같은 157 로 맞춘다.
 * Figma 최초 접속 홈은 219 였는데, 같은 홈인데도 헤더 높이가 달라 화면을 옮길 때
 * 상단바가 늘었다 줄었다 했다.
 */
const HEADER_HEIGHT = 157;

/**
 * 헤더 아래 고정 높이 블록 두 개. 본문 시작 y 를 이 합으로 정한다.
 *  - 세그먼트(870:3836, variant 'routine'): pt20 + 트랙(4+44+4) + pb8 = 80
 *  - 제목 블록(870:3631): pt20 + 내부 고정 높이 43 = 63
 *
 * 세그먼트는 촬영 후 솔루션과 같은 'routine' 변형을 쓴다(같은 홈인데 컨트롤 타이포·패딩이
 * 촬영 전후로 튀지 않게). 'home' 변형은 아래 여백이 4 라 76 이었는데, routine 은 8 이라 80 이다.
 * `RoutineScreen` 의 Figma 실측 배치(세그먼트 top 157 → 본문 top 237)와도 정확히 맞는다.
 *
 * 제목 블록은 높이가 43 으로 고정이라 언어별 문구 길이와 무관하게 상수로 둘 수 있다.
 * 예전에는 이 두 블록과 본문을 전부 Figma 절대 y(295 / 390) 로 박아 뒀는데, 기본 솔루션은
 * 텍스트 길이·항목 수에 따라 본문 높이가 변해서 절대좌표로는 아래 블록을 밀지 못한다
 * (커밋 9528047 에서 `RoutineScreen` 이 겪은 겹침 회귀와 같은 문제다).
 * 그래서 좌표를 상수 합으로 표현하고 본문은 흐름 배치로 쌓는다.
 */
const SEGMENT_HEIGHT = 80;
const TITLE_HEIGHT = 63;
/** 본문(기본 솔루션) 블록이 시작하는 프레임 y */
const CONTENT_TOP = HEADER_HEIGHT + SEGMENT_HEIGHT + TITLE_HEIGHT;

/** 본문 끝 → 탭바 top 여백. 촬영 후 솔루션 화면과 같은 값을 쓴다 */
const CONTENT_TAIL_GAP = 26;
/** 탭바 top → 프레임 바닥 여백. 촬영 후 솔루션 프레임(2205-2109 / 2505-2409)과 같다 */
const TAB_BAR_BOTTOM_GAP = 96;

/**
 * 아직 본문 높이를 재지 못한 첫 프레임에서 쓸 임시 `contentBottom`.
 * 측정값이 들어오면(마운트 직후 effect) 곧바로 대체되므로 정확할 필요는 없지만,
 * 첫 프레임이 접히거나 과도하게 늘어나 깜빡이면 안 된다.
 *
 * 값 근거 (실측 기반):
 *  1. 폴백 문구로 렌더한 본문 `scrollHeight` 실측 — 나이트 1618 / 모닝 1716.
 *     → contentBottom 은 나이트 1944 (300+1618+26) / 모닝 2042 (300+1716+26).
 *     (추천 카드 제품명을 자르지 않게 되면서 카드가 자랄 수 있고, CTA 블록이 촬영 후와
 *      같은 102 가 되면서 예전 실측치보다 커졌다)
 *  2. **큰 쪽(모닝)을 기준한다.** 부족(콘텐츠 하단이 잘려 스크롤로 닿지 못함)이
 *     초과(첫 프레임에 빈 스크롤 여백)보다 나쁘다. 모닝은 저녁 세안 카드가 더 붙어
 *     항상 나이트보다 크므로 모닝을 덮으면 두 사이클 모두 덮인다.
 *  3. 여기에 실데이터 여유를 얹는다. 폴백 문구 대신 서버 근거가 들어오면 '왜 이 루틴'
 *     요약이 길어지고, 시술 주의사항이 '피해주세요' 앞에 붙어 항목이 3 → 최대 5개가 된다
 *     (`BASIC_AVOID_LIMIT`). 항목 한 줄이 22px(18 + pt4)이므로 +44px, 문구가 두 줄로
 *     접히는 경우까지 보면 +60px 수준이다. 2042 + 60 → 2100 으로 올려 둔다.
 *     항목 수·태그 수에 상한이 있어 실데이터가 이보다 크게 자라지는 않는다.
 *  4. 남는 오차는 눈에 보이지 않는다. 오차 구간은 첫 화면(852px) 아래로 1000px 이상
 *     떨어져 있고, 측정값이 한 프레임 안에 대체한다. 촬영 후 솔루션(`RoutineScreen`)도
 *     Figma 실측 폴백(나이트 2109 / 모닝 2409)이 실제 본문(2198 / 2509)보다 89~100px
 *     작은 상태로 문제없이 동작한다 — 그 화면처럼 사이클별 폴백을 둘 수도 있지만,
 *     이 화면은 Figma 원본이 자리표시 UI 라 근거가 될 실측 프레임 높이가 없다.
 *     그래서 사이클별로 나누지 않고 큰 쪽 하나로 덮는다(설계의 단일 상수와도 일치).
 */
const FALLBACK_CONTENT_BOTTOM = 2100;

/**
 * 하단 CTA — 제출하기 (`BASIC_CTA_LABEL`).
 *
 * 라벨만 '제출하기' 이고 **동작은 촬영 진입 그대로**다(세안 확인 모달 → /camera).
 * 컴포넌트 이름을 `CaptureCtaButton` 으로 둔 것은 그 동작을 드러내기 위한 것이다 —
 * 이름을 라벨에 맞춰 바꾸면 이 버튼이 무엇을 하는지가 코드에서 사라진다.
 *
 * Figma 원본에는 없는 요소다(원본 최초 접속 홈은 회색 자리표시 카드만 있었다).
 * 그래서 규격을 직접 정했고, 촬영 후 솔루션의 CTA(`RoutineScreen` 의 수행 완료 버튼
 * 870:4234)와 **같은 규격**을 쓴다 — 두 화면의 CTA 는 `SolutionBody` 의 같은 슬롯을
 * 쓰므로, 촬영 전후로 하단 버튼의 크기·모서리·색·타이포가 튀면 같은 자리에서 다른
 * 버튼처럼 보인다.
 *   left 20 / w 353 / h 50 / radius 16 / bg header-dark, 라벨 16px bold tracking -0.3
 *
 * 좌표를 absolute 로 두고 top 을 20 으로 맞춘 이유: 수행 완료 버튼도 CTA 슬롯 안에서
 * top 20 에 놓인다(`CompleteButton` 내부 `absolute left-[20px] top-[20px]`).
 * 같은 값을 써야 두 화면에서 버튼이 정확히 같은 y 에 온다.
 * 슬롯의 위 여백(26)과 블록 높이(102)는 `SolutionBody` 가 갖고 있으므로 여기서 만들지 않는다.
 *
 * `data-node-id` 는 붙이지 않는다 — 존재하지 않는 Figma 노드 id 를 발명하면 픽셀 diff
 * 도구가 잘못된 기준을 잡는다. 추적은 `data-name` / `data-testid` 로만 한다.
 */
function CaptureCtaButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-[20px] top-[20px] flex h-[50px] w-[353px] items-center justify-center rounded-[16px] bg-header-dark transition-colors duration-200"
      data-name="BasicCaptureCta"
      data-testid="basic-capture-cta"
    >
      {/*
        수행 완료 버튼은 Figma 실측 좌표로 글자를 앉혔지만(870:4236 — 버튼 중심보다 1.5px
        위, 0.5px 오른쪽), 이 버튼은 원본이 없으니 flex 중앙 정렬로 둔다.
        문구가 '오늘 피부 촬영하기'(9자) → '제출하기'(4자) 로 짧아져도, 번역을 재개해
        길이가 다시 바뀌어도 중앙을 유지한다.
      */}
      <span className="whitespace-nowrap text-center font-sans text-[16px] font-bold leading-[24px] tracking-[-0.3px] text-white [word-break:break-word]">
        {BASIC_CTA_LABEL}
      </span>
    </button>
  );
}

export default function HomeFirstVisitScreen() {
  const navigate = useNavigate();
  const t = useT();
  const phase = useCareStore((s) => s.phase);
  const setPhase = useCareStore((s) => s.setPhase);
  const selectedDate = useCareStore((s) => s.selectedDate);
  const openCalendar = useUiStore((s) => s.openCalendar);
  const openWashCheck = useUiStore((s) => s.openWashCheck);

  /**
   * 최초 접속 상태에서는 수행 기록이 없어야 한다 — 주간 스트립에 완료 표기를 추가하지 않는다.
   * `careStore.completedDates` 는 촬영·분석을 거친 솔루션의 수행 기록이고 캘린더 초록 칩의
   * 근거다. 이 화면은 그 값을 쓰지도 쓰이지도 않게 두고(읽기 전용), 빈 목록을 넘긴다.
   */
  const days = buildWeekStrip(selectedDate, []);

  /**
   * 근거 데이터(오프라인 정밀 진단 + 시술 맥락). 세션이 없거나 조회가 모두 실패하면
   * `source` 가 null 로 남고 `toBasicView` 가 폴백 문구로 전체를 채운다.
   * 그래서 `loading` 을 보고 스켈레톤이나 빈 화면을 내놓지 않는다 — 로딩 중에도 폴백 문구로
   * 즉시 완전한 화면을 렌더하고, 응답이 도착하면 문구만 교체된다.
   * 첫 화면에서 로딩 상태를 노출하는 것은 "빈 화면을 없애자"는 이 화면의 목적과 어긋난다.
   */
  const { source } = useBasicSolution();
  const view = useMemo(() => toBasicView(source, phase), [source, phase]);

  /**
   * 본문 높이를 재서 프레임·스크롤 높이를 함께 늘린다. 측정은 `SolutionBody` 가 하고
   * (ResizeObserver + fonts.ready) 여기서는 결과만 받아 좌표로 환산한다.
   */
  const [bodyHeight, setBodyHeight] = useState(null);
  /** 본문이 끝나는 y (= 탭바 top) */
  const contentBottom =
    bodyHeight === null ? FALLBACK_CONTENT_BOTTOM : CONTENT_TOP + bodyHeight + CONTENT_TAIL_GAP;

  return (
    <Screen
      className="bg-white"
      height={contentBottom + TAB_BAR_BOTTOM_GAP}
      nodeId="870:3573"
      name="최초 접속 홈화면"
      headerHeight={HEADER_HEIGHT}
      header={
        <SolutionHeader
          days={days}
          selectedDate={selectedDate}
          height={HEADER_HEIGHT}
          onOpenCalendar={openCalendar}
          onOpenMyPage={() => navigate('/mypage')}
          onOpenLang={useUiStore.getState().openLang}
        />
      }
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={contentBottom}
    >
      {/*
        헤더 아래 고정 높이 블록. 세그먼트는 `SolutionBody` 밖에 둬야 선택 표시가 끊기지 않고
        미끄러진다(본문은 사이클마다 key 로 재마운트된다).
      */}
      <div className="absolute left-0 w-[393px]" style={{ top: HEADER_HEIGHT }}>
        {/*
          사이클 전환은 화면 안 상태 변경으로만 처리한다.
          `RoutineScreen` 은 setPhase 뒤에 `/solution/:cycle` 로 navigate 하지만, 여기서는
          **navigate 하지 않는다** — 촬영 전에는 그 라우트에 보여줄 촬영 후 솔루션이 없고,
          `/solution/*` 로 넘어가면 `RoutineScreen` 이 뜨면서 기본 솔루션 화면을 벗어난다.
          라우트를 `/home` 으로 유지하고 표시 내용만 교체한다(요구사항 2.4).

          `value` 는 `careStore.phase` 에 바인딩한다. 예전에는 'night' 로 고정돼 있어서,
          phase 가 'morning' 인 상태로 이 화면에 들어오면 세그먼트는 "오늘 밤"이 선택된 것처럼
          보이는데 본문은 모닝이 나오는 불일치가 있었다(본문은 cycle={phase} 를 쓴다).
        */}
        <CycleSegment
          variant="routine"
          value={phase}
          captions={view.segmentCaptions}
          onChange={setPhase}
        />

        <div className="flex w-full flex-col items-start px-[20px] pt-[20px]" data-node-id="870:3631">
          <div
            className="relative flex h-[43px] w-[353px] shrink-0 flex-col items-start pt-[2px]"
            data-node-id="870:3632"
          >
            <div
              className="relative w-full shrink-0 whitespace-pre-line break-words font-sans text-[18px] font-bold leading-[26px] text-text-strong"
              data-node-id="870:3633"
            >
              {/* 언어별 길이 차이를 흡수하도록 개행을 그대로 렌더한다 */}
              {t.home.firstVisitTitle}
            </div>
          </div>
        </div>
      </div>

      {/*
        본문 블록의 시작 y 만 이 상자가 정한다. key/animate-fade-in/ref 를 여기에 다시
        붙이면 페이드가 이중으로 걸린다 — `SolutionBody` 가 이미 갖고 있다.
      */}
      <div className="absolute left-0 w-[393px]" style={{ top: CONTENT_TOP }}>
        <SolutionBody
          view={view}
          cycle={phase}
          onMeasure={setBodyHeight}
          /*
            CTA 슬롯. 모닝에만 촬영 버튼을 둔다(`RoutineScreen` 의 수행 완료 버튼과 같은 규칙).
            나이트에는 넘기지 않아 `SolutionBody` 가 버튼 자리(26+102)를 만들지 않게 한다 —
            촬영은 하루 한 번, 아침 진입 흐름이라 밤 화면에 두면 오해를 준다(QA 피드백).
            제거된 회색 카드 3개가 갖고 있던 세안 확인 진입점은 모닝 버튼이 승계한다
            (탭바 중앙 촬영 버튼과 같은 `openWashCheck` → 세안 확인 → /camera).
            래퍼 여백·높이는 `SolutionBody` 가 갖고 있으므로 버튼 자체만 넘긴다.
          */
          cta={phase === 'night' ? null : <CaptureCtaButton onClick={openWashCheck} />}
        />
      </div>
    </Screen>
  );
}
