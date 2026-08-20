import { useT } from '@/i18n';
import caret from '@/assets/figma/caret-down.svg';

/**
 * 정렬/필터 행 (Figma `Group 34` 870:4943 + `Group 48` 870:5058).
 * 세 개의 드롭다운(성별 / 나이대 / 데일리 스킨 분석)이 오른쪽에 붙어 나열된다.
 *  - 라벨: 12px medium leading 19.5, 검정
 *  - 캐럿: 10x5, 박스 inset [-7.07% -3.54% -14.14% -3.54%]
 *
 * Figma 는 라벨과 캐럿을 각각 절대 좌표(x / caretX)에 고정 폭으로 박아 뒀는데,
 * 라벨이 길어지면 글자가 캐럿을 덮고 화면 밖으로 넘어갔다
 * ('데일리 스킨 분석' 은 박스 59 에 글자 85.6, 영어는 110 까지 나온다).
 * 그래서 오른쪽 정렬 flex 행으로 바꿨다 — 라벨 길이에 맞춰 각 항목이 자리를 잡고,
 * 마지막 항목의 오른쪽 끝(x=373)은 Figma 실측과 같다.
 *
 * @param {number} top 프레임 기준 라벨 y 좌표 (화면마다 609 / 611 / 616 으로 다르다)
 * @param {Array<{key:string}>} items
 */
/** 마지막 항목 오른쪽 끝 — Figma 실측(캐럿 365 + 폭 10 → 375, 여백 20 기준) */
const ROW_RIGHT = 20;
/** 항목 사이 간격 — Figma 의 라벨 간격(성별 캐럿 229 → 나이대 244)에서 뽑았다 */
const ITEM_GAP = 16;
/** 라벨과 캐럿 사이 간격 */
const LABEL_CARET_GAP = 4;
/**
 * 캐럿을 아래로 내리는 양 (px).
 *
 * `align-items: center` 는 글자의 **줄 박스**를 기준으로 맞추는데, 한글은 줄 박스
 * 안에서 글자가 아래쪽에 치우쳐 있다(12px 글자 / 줄간격 19.5px 기준 잉크 중심이
 * 줄 박스 중심보다 2.2px 아래). 그래서 줄 박스로 정렬하면 캐럿이 글자보다 위로
 * 떠 보인다. 캐럿을 그만큼 내려 글자 잉크 중심에 맞춘다.
 */
const CARET_OFFSET_Y = 2.2;

export default function FilterRow({ top, items, onOpen }) {
  const t = useT();
  return (
    <div
      className="absolute flex items-center justify-end"
      style={{ right: ROW_RIGHT, top, gap: ITEM_GAP }}
      data-name="FilterRow"
    >
      {items.map((item) => (
        <button
          type="button"
          key={item.key}
          onClick={onOpen ? () => onOpen(item) : undefined}
          className="flex h-[19px] shrink-0 items-center whitespace-nowrap font-sans text-[12px] font-medium leading-[19.5px] text-ink"
          style={{ gap: LABEL_CARET_GAP }}
        >
          {t.filter[item.key]}
          <span
            className="relative block h-[5px] w-[10px] shrink-0"
            style={{ transform: `translateY(${CARET_OFFSET_Y}px)` }}
          >
            <span className="absolute inset-[-7.07%_-3.54%_-14.14%_-3.54%]">
              <img alt="" src={caret} className="block size-full max-w-none" />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
