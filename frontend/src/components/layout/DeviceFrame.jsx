import { useEffect, useState } from 'react';
import { FRAME } from '@/theme';

/**
 * 웹앱 셸.
 * 아이폰 16(393 x 852) 프레임을 웹 화면 가운데에 두고 위/아래 여백을 남긴다.
 * 라운드(44px)와 그림자는 Figma 프레임에 적용된 값을 그대로 쓴다.
 *
 * 브라우저 창이 프레임보다 낮아도 페이지가 스크롤되지 않도록,
 * 프레임 크기는 393x852 그대로 두고 `transform: scale` 로만 줄인다.
 * (크기를 줄이면 내부 좌표가 전부 어긋나므로 스케일 방식을 쓴다)
 */

/** 프레임 위/아래로 남길 최소 여백 */
const MARGIN_Y = 32;

function useFitScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const available = window.innerHeight - MARGIN_Y * 2;
      // 가로도 좁을 수 있으니 함께 고려한다.
      const availableX = window.innerWidth - 24;
      const next = Math.min(1, available / FRAME.height, availableX / FRAME.width);
      setScale(next > 0 ? next : 1);
    };

    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return scale;
}

export default function DeviceFrame({ children }) {
  const scale = useFitScale();

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      {/* 스케일된 실제 크기만큼만 자리를 차지하도록 감싼다 */}
      <div
        className="shrink-0"
        style={{ width: FRAME.width * scale, height: FRAME.height * scale }}
      >
        <div
          data-frame
          className="relative overflow-hidden bg-white"
          style={{
            width: FRAME.width,
            height: FRAME.height,
            borderRadius: FRAME.radius,
            boxShadow: FRAME.shadow,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
