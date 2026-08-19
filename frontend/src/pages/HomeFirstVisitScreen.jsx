import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';

import SolutionHeader from '@/components/home/SolutionHeader';
import CycleSegment from '@/components/home/CycleSegment';
import { useCareStore } from '@/store/careStore';
import { useUiStore } from '@/store/uiStore';
import { buildWeekStrip } from '@/lib/calendar';

/**
 * 최초 접속 홈화면 (Figma 870:3572 > SolutionScreen 870:3573).
 * 아직 촬영 기록이 없는 상태. 세그먼트 보조값은 '-' 이고 루틴 카드는 빈 자리표시 3개다.
 * 촬영을 마치면 /solution/night 의 실제 루틴 화면으로 대체된다.
 */
/** Figma 에서 탭바가 놓인 y 와 높이 (하단 고정 레이어로 올려 쓴다) */
const TAB_BAR_TOP = 756;
const TAB_BAR_HEIGHT = 96;

export default function HomeFirstVisitScreen() {
  const navigate = useNavigate();
  const t = useT();
  const selectedDate = useCareStore((s) => s.selectedDate);
  const openCalendar = useUiStore((s) => s.openCalendar);
  const openWashCheck = useUiStore((s) => s.openWashCheck);
  // 최초 접속 상태에서는 수행 기록이 없어야 한다 — 캘린더에도 아무 추가 표기가 없다
  const days = buildWeekStrip(selectedDate, []);

  return (
    <Screen className="bg-white" nodeId="870:3573" name="최초 접속 홈화면" tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={TAB_BAR_TOP}>
      <SolutionHeader
        days={days}
        selectedDate={selectedDate}
        height={219}
        onOpenCalendar={openCalendar}
        onOpenMyPage={() => navigate('/mypage')}
        onOpenLang={useUiStore.getState().openLang}
      />

      <CycleSegment
        variant="home"
        value="night"
        captions={{ night: '-', morning: '-' }}
        className="absolute left-0 right-0 top-[219px]"
      />

      <div
        className="absolute left-0 right-0 top-[295px] flex flex-col items-start px-[20px] pt-[20px]"
        data-node-id="870:3631"
      >
        <div className="relative flex h-[43px] w-[353px] shrink-0 flex-col items-start pt-[2px]" data-node-id="870:3632">
          <div
            className="relative w-full shrink-0 whitespace-pre-line break-words font-sans text-[18px] font-bold leading-[26px] text-text-strong"
            data-node-id="870:3633"
          >
            {/* 언어별 길이 차이를 흡수하도록 개행을 그대로 렌더한다 */}
            {t.home.firstVisitTitle}
          </div>
        </div>
      </div>

      {/* 촬영 전이라 내용이 비어 있는 루틴 카드 3개 */}
      <div
        className="absolute left-0 top-[390px] flex h-[366px] flex-col items-start gap-[8px] py-[30px] pl-[20px]"
        data-node-id="870:3634"
      >
        {['870:3635', '870:3636', '870:3637'].map((id) => (
          <button
            type="button"
            key={id}
            onClick={openWashCheck}
            className="relative flex h-[109px] w-[353px] shrink-0 flex-col items-start gap-[8px] rounded-[16px] border-2 border-solid border-placeholder-line bg-placeholder px-[12px] py-[14px]"
            data-node-id={id}
          />
        ))}
      </div>
    </Screen>
  );
}
