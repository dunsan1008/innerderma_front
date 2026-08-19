import timeInk from '@/assets/figma/status-time-ink.svg';
import timeWhite from '@/assets/figma/status-time-white.svg';
import rightInk from '@/assets/figma/status-right-ink.svg';
import rightWhite from '@/assets/figma/status-right-white.svg';

/**
 * 아이폰 상단 상태바.
 * Figma 컴포넌트 `iPhone X (or newer)/Light/Default` (38:1635) 를 그대로 옮긴 것.
 * 프레임 기준 기본 배치는 left 13px / top 7px / 366x44 이며,
 * 프레임마다 top 값이 4~7px 로 다르므로 `className` 으로 위치를 지정한다.
 *
 * @param {'ink'|'white'} tone  시간·우측 아이콘 색. 어두운 배경 화면은 'white'.
 * @param {string} className    배치용 클래스 (absolute 위치 지정)
 */
export default function StatusBar({ tone = 'ink', className = 'absolute left-[13px] top-[7px] h-[44px] w-[366px]' }) {
  const timeSrc = tone === 'white' ? timeWhite : timeInk;
  const rightSrc = tone === 'white' ? rightWhite : rightInk;

  return (
    <div className={`overflow-clip ${className}`} data-node-id="38:1635" data-name="iPhone X (or newer)/Light/Default">
      {/*
        Notch 레이어는 Figma 컴포넌트에서 숨김 처리되어 있어 렌더하지 않는다.
        (MCP get_design_context 는 숨은 노드도 함께 내보내지만, 실제 Figma 렌더에는 노치가 없음)
      */}
      {/* Right Side (신호 · 와이파이 · 배터리) */}
      <div className="absolute right-[14.67px] top-[17.33px] h-[11.336px] w-[66.661px]">
        <img alt="" src={rightSrc} className="absolute inset-0 block size-full max-w-none" />
      </div>
      {/* Left Side > Time */}
      <div className="absolute left-[21px] top-[12px] h-[21px] w-[54px]">
        <img alt="" src={timeSrc} className="absolute inset-0 block size-full max-w-none" />
      </div>
    </div>
  );
}
