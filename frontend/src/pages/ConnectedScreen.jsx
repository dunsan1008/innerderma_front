import { useT } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import checkIcon from '@/assets/figma/check-icon.svg';
import { useCareStore } from '@/store/careStore';

/**
 * 연결 완료 (Figma 870:3439).
 * Container(393 x 723.086 @ y=95, pt-180 px-20) 안의 플렉스 스택을 그대로 옮겼다.
 */
export default function ConnectedScreen() {
  const t = useT();
  const navigate = useNavigate();
  const startFresh = useCareStore((s) => s.startFresh);

  /**
   * 방금 계정을 연결한 사용자는 아직 촬영 기록이 없으므로
   * 홈을 "최초 접속" 상태로 되돌린 뒤 이동한다.
   */
  const goHome = () => {
    startFresh();
    navigate('/home');
  };

  return (
    <Screen className="bg-white" nodeId="870:3439" name="연결 완료">
      <div
        className="absolute left-0 top-[95px] flex h-[723.086px] w-[393px] flex-col items-start overflow-clip px-[20px] pt-[180px]"
        data-node-id="870:3440"
        data-name="Container"
      >
        <div className="relative flex w-full shrink-0 flex-col items-center" data-node-id="870:3441">
          <div className="relative flex shrink-0 flex-col items-start pb-[16px]" data-node-id="870:3442">
            <div
              className="relative flex size-[80px] shrink-0 items-center justify-center rounded-full bg-surface-muted"
              data-node-id="870:3443"
            >
              <div className="relative size-[40px] shrink-0" data-node-id="870:3444" data-name="Icon">
                <img alt="" src={checkIcon} className="absolute inset-0 block size-full max-w-none" />
              </div>
            </div>
          </div>

          <p
            className="relative shrink-0 whitespace-nowrap text-center font-sans text-[22px] font-bold leading-[33px] text-text-strong [word-break:break-word]"
            data-node-id="870:3447"
          >
            {t.onboarding.connected}
          </p>

          <div className="relative flex shrink-0 flex-col items-start pt-[8px]" data-node-id="870:3448">
            <p
              className="relative shrink-0 whitespace-nowrap text-center font-sans text-[14px] font-normal leading-[21px] text-body [word-break:break-word]"
              data-node-id="870:3449"
            >
              {t.onboarding.connectedSub}
            </p>
          </div>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-start pt-[100px]" data-node-id="870:3450">
          <button
            type="button"
            onClick={goHome}
            className="relative h-[52px] w-[353px] shrink-0 rounded-[14px] bg-ink"
            data-node-id="870:3451"
            data-name="Button"
          >
            <p
              className="absolute left-[176.89px] top-[12px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-medium leading-[24px] text-white [word-break:break-word]"
              data-node-id="870:3452"
            >
              {t.onboarding.goHome}
            </p>
          </button>
        </div>
      </div>

      <StatusBar />
    </Screen>
  );
}
