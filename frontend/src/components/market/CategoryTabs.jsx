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

/**
 * @param {string} [value] 활성 탭 key
 * @param {string[]} [staticKeys]
 *   누를 수 없게 둘 탭 key 목록. 윔 스토어처럼 해당 카테고리 화면이 없는 경우에 쓴다.
 *   (예전에는 이 탭들이 피쓰 서울 라우트로 이동해 스토어가 바뀌어 버렸다)
 * @param {Function} [onChange]
 */
export default function CategoryTabs({ value = 'all', staticKeys, onChange, className = '' }) {
  const isStatic = (key) => Boolean(staticKeys?.includes(key));

  return (
    <div
      className={`flex flex-col items-start border-b-[0.667px] border-solid border-line bg-white px-[20px] py-[10px] ${className}`}
      data-node-id="870:4935"
      data-name="Container"
    >
      <div className="relative flex h-[31px] w-[311px] shrink-0 items-start gap-[8px] overflow-clip" data-node-id="870:4936">
        {TABS.map((tab) => {
          const active = tab.key === value;
          const staticTab = isStatic(tab.key);
          return (
            <button
              type="button"
              key={tab.key}
              disabled={staticTab}
              aria-disabled={staticTab || undefined}
              onClick={staticTab || !onChange ? undefined : () => onChange(tab.key)}
              className={`relative flex h-full shrink-0 flex-col items-center justify-center rounded-full border-solid px-[12px] py-[6px] ${
                active
                  ? 'border-[0.667px] border-line bg-header-dark'
                  : tab.thinBorder
                    ? 'border-[0.5px] border-chip-off-line bg-chip-off'
                    : 'border-[0.667px] border-line bg-chip-off'
              }`}
              data-node-id={tab.nodeId}
              data-name="Button"
              data-static={staticTab || undefined}
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
