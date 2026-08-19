import heartFilled from '@/assets/figma/heart-red.svg';
import heartEmpty from '@/assets/figma/heart-empty.svg';
import { productKey, useWishlistStore } from '@/store/wishlistStore';
import { displayProductName } from '@/lib/productName';

/**
 * 하트 아이콘.
 * 찜한 상태 = 채워진 빨강 하트 / 찜하지 않은 상태 = 빈 하트(heart-empty.svg).
 */
const HEART = { filled: heartFilled, empty: heartEmpty };

/**
 * 상품 카드 (Figma `PostCard`, 예: 870:4951).
 *  - 167x272, 흰 배경, border 0.667px #e5e9f0, radius 20, shadow 0 2 8 rgba(0,0,0,0.04), overflow-clip, pt-20
 *  - 이미지 영역: 높이 143, 배경 #dadada. 카드마다 사진 박스 위치/크기가 달라 layer 로 받는다
 *  - 하트 버튼 19.5x17.25 @ (128.33, 0.17)
 *  - 정보 영역: 높이 108, pb-10 pt-8 px-10
 *      · 이름 11~12px semibold leading 16.5
 *      · 가격 13~14px semibold leading 16.5
 *      · 태그 3개: 검정 알약, px-6 py-2, 9px medium leading 13.5
 *
 * layer 형태
 *   { box: [left, top, width, height], srcs: [url, ...], inner?: { w, h, top } }
 *   inner 가 있으면 Figma 의 이중 크롭(사진을 박스 안에서 다시 확대)을 재현한다.
 */
/**
 * @param {object}   product   상품 데이터(좌표·이미지·문구 포함)
 * @param {boolean}  [selectable] 선택 체크박스를 표시할지 (찜 화면에서만 true)
 * @param {boolean}  [selected]   선택 여부
 * @param {Function} [onToggleSelect] 선택 토글 콜백
 * @param {Function} [onOpen]     카드 본문을 누르면 상세로 이동
 */
export default function PostCard({ product, selectable = false, selected = false, onToggleSelect, onOpen }) {
  const { left, top, imageWidth, layers, name, nameLines, price, tags, sizes, nodeId } = product;

  /** 공백 포함 18자 제한 + … */
  const displayName = displayProductName(product);

  const wished = useWishlistStore((s) => s.keys.includes(productKey(product)));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <div
      className={`absolute flex h-[272px] w-[167px] flex-col items-start overflow-clip rounded-[20px] border-solid bg-white pt-[20px] transition-colors ${
        selected ? 'border-[1.5px] border-ink' : 'border-[0.667px] border-line'
      }`}
      style={{ left, top, boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)' }}
      data-node-id={nodeId}
      data-name="PostCard"
      data-selected={selectable ? selected : undefined}
    >
      <div
        className={`relative h-[143px] shrink-0 bg-image-bg ${imageWidth ? '' : 'w-full'}`}
        style={imageWidth ? { width: imageWidth } : undefined}
      >
        {/*
          개별 선택 체크박스 — 찜 화면에서만 노출.
          하트와 같은 가로열에 놓기 위해 하트와 같은 컨테이너 안에 두고
          하트 박스(top 0.17 / h 17.25) 의 세로 중심에 맞춘다. 하트 위치는 그대로다.
        */}
        {selectable ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={`${nameLines ? nameLines.join('') : name} 선택`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(product);
            }}
            className={`absolute left-[8px] top-[-0.2px] z-20 flex size-[18px] items-center justify-center rounded-[4px] border-[1.2px] border-solid shadow-sm transition-colors ${
              selected ? 'border-ink bg-ink' : 'border-tool-gray bg-white'
            }`}
            data-name="SelectCheckbox"
          >
            {selected ? (
              <svg viewBox="0 0 10 10" className="size-[10px]" aria-hidden>
                <path d="M1 5.2 3.6 7.8 9 2.4" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : null}
          </button>
        ) : null}
        {layers.map((layer, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: layer.box[0], top: layer.box[1], width: layer.box[2], height: layer.box[3] }}
            data-name={i === 0 ? 'image 15' : 'image 16'}
          >
            {layer.inner ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <img
                  alt=""
                  src={layer.srcs[0]}
                  className="absolute left-0 max-w-none"
                  style={{ width: layer.inner.w, height: layer.inner.h, top: layer.inner.top }}
                />
              </div>
            ) : (
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {layer.srcs.map((src) => (
                  <img key={src} alt="" src={src} className="absolute size-full max-w-none object-cover" />
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          aria-label={wished ? '찜 해제' : '찜하기'}
          aria-pressed={wished}
          onClick={() => toggle(product)}
          className="absolute left-[128.33px] top-[0.17px] z-10 h-[17.25px] w-[19.5px] transition-transform active:scale-90"
          data-name="Button"
        >
          {/* 빈 하트는 원본 비율(22x20)이 슬롯과 달라 찌그러지지 않게 contain 으로 맞춘다 */}
          <img
            alt=""
            src={wished ? HEART.filled : HEART.empty}
            className={`absolute inset-0 block size-full max-w-none ${wished ? '' : 'object-contain'}`}
          />
        </button>
      </div>

      <div className="relative flex h-[108px] w-full shrink-0 flex-col items-start px-[10px] pb-[10px] pt-[8px] bg-white">
        {/*
          이름 — 공백 포함 18자로 자르고 초과분은 … 으로 대체한다.
          Figma 는 제품마다 이름을 2~3줄로 손수 쪼개 뒀지만, 길이가 제각각이라
          카드 높이와 태그 줄이 밀렸다. 잘린 이름 한 덩이를 넣고 줄바꿈은 브라우저에 맡긴다.
        */}
        <div
          className="relative flex shrink-0 flex-col items-start"
          style={sizes?.nameBox ? { height: sizes.nameBox, width: '100%' } : { width: '100%' }}
          data-name="Paragraph"
        >
          <p
            className="relative w-[154px] shrink-0 font-sans font-semibold text-ink [word-break:break-word]"
            style={{
              fontSize: sizes.nameSize,
              height: sizes.nameHeight ?? sizes.nameBox,
              lineHeight: `${sizes.nameLeading || 16.5}px`,
            }}
            data-name="ProductName"
          >
            {displayName}
          </p>
        </div>

        {/* Figma 에 존재하는 빈 Paragraph 자리(카드마다 높이가 달라 간격이 맞는다) */}
        {sizes.spacer ? (
          <div className="relative w-[57px] shrink-0" style={{ height: sizes.spacer }} data-name="Paragraph" />
        ) : null}

        {/* 가격 */}
        <div
          className="relative flex w-[57px] shrink-0 flex-col items-start"
          style={sizes.priceBox ? { height: sizes.priceBox } : undefined}
          data-name="Paragraph"
        >
          <p
            className="relative shrink-0 font-sans font-semibold leading-[16.5px] text-ink [word-break:break-word]"
            style={{ fontSize: sizes.priceSize, width: sizes.priceWidth }}
          >
            {price}
          </p>
        </div>

        {/* 일부 카드는 가격 아래에 빈 Paragraph 가 하나 더 있다 (Figma 구조 그대로) */}
        {sizes.spacerAfterPrice ? (
          <div className="relative w-[57px] shrink-0" style={{ height: sizes.spacerAfterPrice }} data-name="Paragraph" />
        ) : null}

        {/* 태그 */}
        <div
          className="relative flex shrink-0 items-center gap-[3px] pt-[6px]"
          style={{ height: sizes.tagBox }}
          data-name="Container"
        >
          {tags.map((tag) => (
            <div
              key={tag}
              className="relative flex shrink-0 flex-col items-start rounded-full bg-ink px-[6px] py-[2px]"
              data-name="Text"
            >
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[9px] font-medium leading-[13.5px] text-white [word-break:break-word]">
                {tag}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/*
        카드 본문 클릭 영역.
        하트(z-10)·선택 체크박스(z-20) 아래(z-0)에 깔아서 그 둘의 클릭을 가리지 않는다.
      */}
      {onOpen ? (
        <button
          type="button"
          aria-label={`${nameLines ? nameLines.join('') : name} 상세보기`}
          onClick={() => onOpen(product)}
          className="absolute inset-0 z-0 cursor-pointer"
          data-name="OpenDetail"
        />
      ) : null}
    </div>
  );
}
