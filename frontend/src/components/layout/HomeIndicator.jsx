/**
 * 아이폰 하단 홈 인디케이터.
 * Figma 컴포넌트 `Home Indicator/Light` (38:1660) 그대로.
 * 393x34 영역 안에서 134x5 검정 알약이 bottom 8px, 가로 중앙(+0.5px)에 놓인다.
 */
export default function HomeIndicator({ className = 'absolute left-0 top-[818px] h-[34px] w-[393px]' }) {
  return (
    <div className={className} data-node-id="38:1660" data-name="Home Indicator/Light">
      <div
        className="absolute bottom-[8px] h-[5px] w-[134px] -translate-x-1/2 rounded-[100px] bg-ink"
        style={{ left: 'calc(50% + 0.5px)' }}
        data-node-id="38:1661"
      />
    </div>
  );
}
