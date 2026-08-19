import { useT } from '@/i18n';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import Spinner from '@/components/ui/Spinner';

/**
 * 로딩중1 (Figma 870:3454).
 * WHS 방문 기록을 조회하는 동안 노출된다.
 * 추후 백엔드 연동 시 setTimeout 대신 방문 기록 연결 API 응답을 기다린다.
 */
export default function ConnectingScreen() {
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/connected'), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Screen className="bg-white" nodeId="870:3454" name="로딩중1">
      <StatusBar />

      <Spinner />

      <div
        className="absolute left-0 top-[353px] flex h-[241px] w-[393px] flex-col items-start overflow-clip"
        data-node-id="870:3458"
        data-name="Container"
      >
        <div className="relative flex w-full shrink-0 flex-col items-center" data-node-id="870:3459">
          {/* Container:margin — 디자인상 비어 있는 상단 여백 */}
          <div className="relative flex h-[35px] w-[19px] shrink-0 flex-col items-start pb-[16px]" data-node-id="870:3460" />

          <div
            className="relative shrink-0 whitespace-pre-line break-words text-center font-sans text-[22px] font-bold leading-[33px] text-text-strong"
            data-node-id="870:3461"
          >
            {t.onboarding.connecting}
          </div>

          <div className="relative flex shrink-0 flex-col items-start pt-[8px]" data-node-id="870:3462">
            <p
              className="relative shrink-0 whitespace-nowrap text-center font-sans text-[14px] font-normal leading-[21px] text-body [word-break:break-word]"
              data-node-id="870:3463"
            >
              {t.onboarding.connectingSub}
            </p>
          </div>
        </div>
      </div>
    </Screen>
  );
}
