import { FRAME } from '@/theme';

/**
 * 개별 화면 래퍼.
 * Figma 프레임 1개 = Screen 1개. 좌표는 각 화면이 프레임 기준 절대값으로 직접 배치한다.
 *
 * 스크롤 구조
 *  - `header`  : 상단 고정 레이어 (상태바 · 로고 · 요일 스트립). 스크롤되지 않는다.
 *  - `tabBar`  : 하단 고정 레이어 (네비게이션). 스크롤되지 않는다.
 *  - children  : 그 사이만 스크롤된다. 좌표는 프레임 기준 그대로 쓰고,
 *                Screen 이 headerHeight 만큼 끌어올려 스크롤 영역에 맞춘다.
 *
 * @param {number} height        Figma 프레임 전체 높이
 * @param {node}   header        상단 고정 레이어
 * @param {number} headerHeight  상단 고정 레이어 높이 (스크롤 시작 y)
 * @param {node}   tabBar        하단 고정 레이어
 * @param {number} tabBarHeight  하단 고정 레이어 높이 (스크롤 하단 여백)
 * @param {number} contentBottom 스크롤 콘텐츠가 끝나는 프레임 y (보통 탭바 top)
 */
export default function Screen({
  children,
  height = FRAME.height,
  className = 'bg-white',
  header = null,
  headerHeight = 0,
  tabBar = null,
  tabBarHeight = 0,
  contentBottom,
  nodeId,
  name,
}) {
  const bottom = contentBottom ?? height;
  /** 스크롤되는 콘텐츠 높이 + 탭바에 가리지 않도록 하단 여백 */
  const scrollHeight = Math.max(0, bottom - headerHeight) + tabBarHeight;
  const scrolls = scrollHeight > FRAME.height - headerHeight;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} data-node-id={nodeId} data-name={name}>
      {/* 가운데 스크롤 영역 */}
      <div
        className={`app-scroll absolute left-0 w-[393px] ${scrolls ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={{ top: headerHeight, bottom: 0 }}
      >
        <div data-screen-content className="relative w-[393px]" style={{ height: scrollHeight }}>
          {/* 프레임 좌표를 유지하기 위해 headerHeight 만큼 위로 올린다 */}
          <div className="absolute left-0 w-[393px]" style={{ top: -headerHeight, height }}>
            {children}
          </div>
        </div>
      </div>

      {header ? (
        <div className="absolute left-0 top-0 z-30 w-[393px]" data-fixed-header>
          {header}
        </div>
      ) : null}

      {tabBar ? (
        <div className="absolute bottom-0 left-0 z-30 w-[393px]" data-fixed-tabbar>
          {tabBar}
        </div>
      ) : null}
    </div>
  );
}
