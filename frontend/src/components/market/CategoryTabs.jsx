/**
 * 마켓 카테고리 탭 (Figma `Container` 870:4935).
 *  - 래퍼: 흰 배경, 하단 보더 0.667px #e5e9f0, px-20 py-10
 *  - 내부: gap-8, 높이 31, 폭 311, overflow-clip
 *  - 선택 칩: bg #16161a / 흰 글씨 / border 0.667px #e5e9f0
 *  - 비선택 칩: bg #f7f9fc / #6b7280 글씨
 *      · '수부지' 칩만 border 0.5px #e2e2e2, 나머지는 0.667px #e5e9f0 (Figma 그대로)
 */
const TABS = [
  { key: 'all', label: '전체', nodeId: '870:4937' },
  { key: 'oily', label: '수부지', nodeId: '870:4939', thinBorder: true },
  { key: 'skin', label: '피부탄력', nodeId: '870:4941' },
];

export default function CategoryTabs({ value = 'all', onChange, className = '' }) {
  return (
    <div
      className={`flex flex-col items-start border-b-[0.667px] border-solid border-line bg-white px-[20px] py-[10px] ${className}`}
      data-node-id="870:4935"
      data-name="Container"
    >
      <div className="relative flex h-[31px] w-[311px] shrink-0 items-start gap-[8px] overflow-clip" data-node-id="870:4936">
        {TABS.map((tab) => {
          const active = tab.key === value;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={onChange ? () => onChange(tab.key) : undefined}
              className={`relative flex h-full shrink-0 flex-col items-center justify-center rounded-full border-solid px-[12px] py-[6px] ${
                active
                  ? 'border-[0.667px] border-line bg-header-dark'
                  : tab.thinBorder
                    ? 'border-[0.5px] border-chip-off-line bg-chip-off'
                    : 'border-[0.667px] border-line bg-chip-off'
              }`}
              data-node-id={tab.nodeId}
              data-name="Button"
            >
              <span
                className={`relative shrink-0 whitespace-nowrap text-center font-sans text-[12px] font-semibold leading-[18px] [word-break:break-word] ${
                  active ? 'text-white' : 'text-body'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
