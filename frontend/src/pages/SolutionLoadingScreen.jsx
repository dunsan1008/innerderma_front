import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import Spinner from '@/components/ui/Spinner';

/**
 * 로딩중-솔루션 생성 (Figma 970:1129).
 * 자가진단 저장 후 솔루션을 도출하는 동안 노출된다.
 * 구조는 로딩중-최초접속(870:3454)과 동일하고 문구만 다르다.
 *
 * 추후 백엔드 연동 시 setTimeout 대신 솔루션 생성 API 응답을 기다린다.
 */
export default function SolutionLoadingScreen() {
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/solution-summary'), 1800);
    return () => clearTimeout(timer);
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
