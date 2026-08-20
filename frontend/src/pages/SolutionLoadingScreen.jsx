import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import Spinner from '@/components/ui/Spinner';
import { createCareCycle, createCareSolution } from '@/api/care';
import { useAuthStore } from '@/store/authStore';

/** 최소 노출 시간 — 응답이 즉시 와도 화면이 깜빡이지 않게 한다 */
const MIN_DISPLAY_MS = 1200;

/**
 * 로딩중-솔루션 생성 (Figma 970:1129).
 * 자가진단 저장 후 솔루션을 도출하는 동안 노출된다.
 * 구조는 로딩중-최초접속(870:3454)과 동일하고 문구만 다르다.
 *
 * 이 화면에서 실제로 케어 사이클 생성 → 그 사이클 기준 케어 솔루션 생성을
 * 순서대로 호출한다(둘 다 오늘 촬영·자가문진 기록을 서버가 자동으로 엮는다).
 * 결과 자체는 여기서 쓰지 않는다 — SolutionSummary/RoutineScreen이 각자
 * 필요할 때 다시 조회한다(새로고침·재방문에도 항상 최신 데이터를 보게 하려고).
 */
export default function SolutionLoadingScreen() {
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const proceed = () => {
      const wait = Math.max(MIN_DISPLAY_MS - (Date.now() - start), 0);
      setTimeout(() => {
        if (!cancelled) navigate('/solution-summary');
      }, wait);
    };

    (async () => {
      const userCode = useAuthStore.getState().userCode;
      if (userCode) {
        try {
          const cycle = await createCareCycle(userCode);
          await createCareSolution(userCode, cycle.id);
        } catch (err) {
          console.error('[SolutionLoadingScreen] solution generation failed', err);
        }
      }
      proceed();
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <Screen className="bg-white" nodeId="970:1129" name="로딩중-솔루션 생성">
      <StatusBar />

      <Spinner />

      <div
        className="absolute left-0 top-[353px] flex h-[241px] w-[393px] flex-col items-start overflow-clip"
        data-node-id="970:1133"
        data-name="Container"
      >
        <div className="relative flex w-full shrink-0 flex-col items-center" data-node-id="970:1134">
          {/* Container:margin — 디자인상 비어 있는 상단 여백 */}
          <div className="relative flex h-[35px] w-[19px] shrink-0 flex-col items-start pb-[16px]" data-node-id="970:1135" />

          <div
            className="relative shrink-0 whitespace-pre-line break-words text-center font-sans text-[22px] font-bold leading-[33px] text-text-strong"
            data-node-id="970:1136"
          >
            {t.solutionLoading.deriving}
          </div>

          <div className="relative flex shrink-0 flex-col items-start pt-[8px]" data-node-id="970:1137">
            <p
              className="relative shrink-0 whitespace-nowrap text-center font-sans text-[14px] font-normal leading-[21px] text-body [word-break:break-word]"
              data-node-id="970:1138"
            >
              {t.solutionLoading.aggregating}
            </p>
          </div>
        </div>
      </div>
    </Screen>
  );
}
