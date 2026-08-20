import { useT } from '@/i18n';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import Spinner from '@/components/ui/Spinner';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { generateUserCode } from '@/lib/userCode';

/** 백엔드에 name/phoneNumber 가 필수라 데모용 고정값을 쓴다 — 실제 입력 폼은 아직 없다. */
const DEMO_NAME = '데모 사용자';
const DEMO_PHONE_NUMBER = '010-0000-0000';

/** 최소 노출 시간 — 응답이 즉시 와도 화면이 깜빡이지 않게 한다 */
const MIN_DISPLAY_MS = 1200;

/**
 * 로딩중1 (Figma 870:3454).
 * "WHS 방문 기록을 조회하는 중" 문구를 그대로 두되, 실제로는 이 화면에서
 * 최초 가입(userCode 생성 + register)을 처리한다. 별도 방문기록 연결 API는
 * 백엔드에 없어서(대회 시연용 구조 — userCode 단일 인증), 가입 자체를
 * "연결"로 취급한다.
 */
export default function ConnectingScreen() {
  const t = useT();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const proceed = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(MIN_DISPLAY_MS - elapsed, 0);
      setTimeout(() => {
        if (!cancelled) navigate('/connected');
      }, wait);
    };

    (async () => {
      const userCode = generateUserCode();
      try {
        const { token, userCode: returnedUserCode, name } = await register({
          userCode,
          name: DEMO_NAME,
          phoneNumber: DEMO_PHONE_NUMBER,
        });
        if (!cancelled) setSession({ userCode: returnedUserCode, name, token });
      } catch (err) {
        // 대회 시연 중 흐름이 끊기지 않도록, 가입 실패는 콘솔에만 남기고 다음 화면으로 넘어간다.
        // (세션이 비어 있으면 다음 스플래시 진입 시 다시 가입을 시도하게 된다)
        console.error('[ConnectingScreen] register failed', err);
      } finally {
        proceed();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, setSession]);

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
