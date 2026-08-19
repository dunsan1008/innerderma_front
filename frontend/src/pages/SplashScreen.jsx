import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';

/**
 * 첫 화면 (Figma 870:3435).
 * 검정 배경 + Palatino Bold 40px 로고. 상태바는 흰색 톤.
 * `AIDrawing_...` 사각형(414x276 @ -11,161)은 디자인에서 채움이 없어 자리만 유지한다.
 */
export default function SplashScreen() {
  const navigate = useNavigate();

  // 스플래시는 잠시 노출 후 가입 화면으로 넘어간다.
  useEffect(() => {
    const timer = setTimeout(() => navigate('/signup'), 1600);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Screen className="bg-ink" nodeId="870:3435" name="첫 화면">
      <StatusBar tone="white" />

      <div
        className="absolute left-[-11px] top-[161px] h-[276px] w-[414px]"
        data-node-id="870:3437"
        data-name="AIDrawing_260810_d1fae847-9f97-4064-82b1-c51ef577dfb2_0_MiriCanvas 1"
      />

      <p
        className="absolute left-[198px] top-[383px] h-[31px] w-[274px] -translate-x-1/2 text-center font-logo text-[40px] font-bold not-italic leading-[16.5px] text-white [word-break:break-word]"
        data-node-id="870:3438"
      >
        InnerDerma
      </p>
    </Screen>
  );
}
