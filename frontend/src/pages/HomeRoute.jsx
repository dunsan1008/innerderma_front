import HomeFirstVisitScreen from '@/pages/HomeFirstVisitScreen';
import RoutineScreen from '@/pages/RoutineScreen';
import { useCareStore } from '@/store/careStore';

/**
 * /home 진입 분기.
 * Figma 에 홈이 두 가지 상태로 그려져 있어 촬영 여부로 나눈다.
 *  - 촬영 기록 없음 → "최초 접속 홈화면" (870:3572, 루틴 카드가 빈 자리표시)
 *  - 촬영 기록 있음 → "solution & home" (870:3771 / 870:4002, 실제 루틴)
 */
export default function HomeRoute() {
  const hasCaptureToday = useCareStore((s) => s.hasCaptureToday);
  const phase = useCareStore((s) => s.phase);

  return hasCaptureToday ? <RoutineScreen cycle={phase} /> : <HomeFirstVisitScreen />;
}
