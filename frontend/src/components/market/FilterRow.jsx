import caret from '@/assets/figma/caret-down.svg';

/**
 * 정렬/필터 행 (Figma `Group 34` 870:4943 + `Group 48` 870:5058).
 * 세 개의 드롭다운(성별 / 나이대 / 맞춤형 진단)이 절대 좌표로 놓여 있다.
 *  - 라벨: 12px medium leading 19.5, 검정
 *  - 캐럿: 10x5, 박스 inset [-7.07% -3.54% -14.14% -3.54%]
 *
 * @param {number} top 프레임 기준 라벨 y 좌표 (화면마다 609 / 611 / 616 으로 다르다)
 * @param {Array<{label:string,x:number,caretX:number}>} items
 */
export default function FilterRow({ top, items, onOpen }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <button
            type="button"
            onClick={onOpen ? () => onOpen(item) : undefined}
            className="absolute h-[19px] whitespace-nowrap text-left font-sans text-[12px] font-medium leading-[19.5px] text-ink [word-break:break-word]"
            style={{ left: item.x, top, width: item.width }}
          >
            {item.label}
          </button>
          <div className="absolute h-[5px] w-[10px]" style={{ left: item.caretX, top: top + 9 }}>
            <div className="absolute inset-[-7.07%_-3.54%_-14.14%_-3.54%]">
              <img alt="" src={caret} className="block size-full max-w-none" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
