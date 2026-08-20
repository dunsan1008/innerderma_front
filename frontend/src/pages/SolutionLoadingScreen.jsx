import { useEffect, useState } from 'react';
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
 * 얼굴 사진 분석이 끝나길 기다리는 예산. CameraScreen 은 사진 업로드+분석을
 * 화면 전환을 막지 않고 백그라운드로 쏘기 때문에(자가진단 작성 시간 동안 끝나길
 * 기대), 자가진단을 빨리 마치면 분석이 아직 안 끝난 채로 이 화면에 도착할 수 있다.
 * 그 경우 케어 사이클 생성이 ANALYSIS_001(분석 결과 없음)로 즉시 실패하므로,
 * 바로 포기하지 않고 이 예산 안에서 짧은 간격으로 재시도한다.
 */
const ANALYSIS_POLL_INTERVAL_MS = 2000;
const ANALYSIS_MAX_WAIT_MS = 15000;
/** 분석 실패 안내를 실제로 읽을 수 있게 두는 시간 */
const ANALYSIS_FAILED_DISPLAY_MS = 2200;

const isAnalysisNotReady = (err) => err?.response?.data?.code === 'ANALYSIS_001';

/**
 * 로딩중-솔루션 생성 (Figma 970:1129).
 * 자가진단 저장 후 솔루션을 도출하는 동안 노출된다.
 * 구조는 로딩중-최초접속(870:3454)과 동일하고 문구만 다르다.
 *
 * 이 화면에서 실제로 케어 사이클 생성 → 그 사이클 기준 케어 솔루션 생성을
 * 순서대로 호출한다(둘 다 오늘 촬영·자가문진 기록을 서버가 자동으로 엮는다).
 * 결과 자체는 여기서 쓰지 않는다 — SolutionSummary/RoutineScreen이 각자
 * 필요할 때 다시 조회한다(새로고침·재방문에도 항상 최신 데이터를 보게 하려고).
 *
 * 케어 사이클 생성이 "분석 결과 없음"으로 실패하면(분석이 아직 안 끝남) 위 예산
 * 안에서 재시도하고, 그래도 안 끝나면 분석 실패를 화면에 알린 뒤 넘어간다.
 * 백엔드에 "분석 없이 솔루션 생성" 옵션이 아직 없어서, 이 경우 솔루션 자체는
 * 못 만들고(RoutineScreen 이 기존 더미로 폴백) 실패했다는 사실만 정직하게 보여준다.
 */
export default function SolutionLoadingScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [analysisFailed, setAnalysisFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const proceed = (extraDelayMs = 0) => {
      const wait = Math.max(MIN_DISPLAY_MS - (Date.now() - start), 0) + extraDelayMs;
      setTimeout(() => {
        if (!cancelled) navigate('/solution-summary');
      }, wait);
    };

    (async () => {
      const userCode = useAuthStore.getState().userCode;
      if (!userCode) {
        proceed();
        return;
      }

      const deadline = Date.now() + ANALYSIS_MAX_WAIT_MS;
      let cycle = null;
      let failed = false;
      while (!cancelled) {
        try {
          cycle = await createCareCycle(userCode);
          break;
        } catch (err) {
          if (isAnalysisNotReady(err) && Date.now() < deadline) {
            await new Promise((r) => setTimeout(r, ANALYSIS_POLL_INTERVAL_MS));
            continue;
          }
          console.error('[SolutionLoadingScreen] care cycle creation failed', err);
          failed = isAnalysisNotReady(err);
          break;
        }
      }
      if (cancelled) return;

      if (cycle) {
        try {
          await createCareSolution(userCode, cycle.id);
        } catch (err) {
          console.error('[SolutionLoadingScreen] solution generation failed', err);
        }
      }

      if (failed) {
        setAnalysisFailed(true);
        proceed(ANALYSIS_FAILED_DISPLAY_MS);
      } else {
        proceed();
      }
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
            {analysisFailed ? t.solutionLoading.analysisFailedTitle : t.solutionLoading.deriving}
          </div>

          <div className="relative flex shrink-0 flex-col items-start pt-[8px]" data-node-id="970:1137">
            <p
              className="relative shrink-0 whitespace-nowrap text-center font-sans text-[14px] font-normal leading-[21px] text-body [word-break:break-word]"
              data-node-id="970:1138"
            >
              {analysisFailed ? t.solutionLoading.analysisFailedSub : t.solutionLoading.aggregating}
            </p>
          </div>
        </div>
      </div>
    </Screen>
  );
}
