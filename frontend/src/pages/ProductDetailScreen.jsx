import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import { useCartStore } from '@/store/cartStore';
import { productKey, useWishlistStore } from '@/store/wishlistStore';
import { PRODUCT_DETAIL } from '@/constants/productDetail';
import { findProductByKey } from '@/constants/marketScreens';
import { formatPrice } from '@/constants/cartItems';
import { joinNameLines, truncateProductName } from '@/lib/productName';
import backIcon from '@/assets/figma/pd-back.svg';
import shareIcon from '@/assets/figma/pd-share.svg';
import plusIcon from '@/assets/figma/pd-plus.svg';
import heartFilled from '@/assets/figma/heart-red.svg';
import heartEmpty from '@/assets/figma/heart-empty.svg';

/**
 * 상품 상세 (Figma 1026:2575 ProductDetail, 393x1611).
 *
 * 라우트 파라미터(`/market/product/:id`)의 상품 키로 목록과 **같은 상품 객체**를 찾아
 * 대표 이미지·이름·가격·태그·찜 상태를 모두 그 상품에서 가져온다.
 * 찜은 `wishlistStore` 를 직접 쓰므로 목록에서 누른 하트가 상세에도 그대로 보인다.
 *
 * 구조 (좌표는 모두 프레임 기준 절대값)
 *  - 헤더 Group 84 (1026:2576) 393x129 : bg #16161a, 상태바 white, 뒤로가기 셰브론, 흰 로고
 *  - 대표 이미지 image 15 (1026:2585) 393x362 @ y129
 *  - Group 86 (1026:2587) @ y491 : 흰 배경 100 + 이름 / 가격 / 태그 3개 / 찜 / 공유
 *  - Container (1026:2606) @ y681 : 상세 설명 자리표시 3블록
 *      Figma 는 루틴 카드 인스턴스를 재사용했지만 내부 그룹이 모두 hidden 이라
 *      실제로는 rgba(177,177,177,0.46) 배경 + 2px #f3f3f3 테두리 빈 블록으로 보인다.
 *  - Group 92 (1026:2611) : 제목 @ y1266, 베스트 조합 카드 372x167 @ y1298 (접기/펴기)
 *  - Container (1026:2631) @ y1482 h119 : 선택 개수 · 합계 · 장바구니 / 바로구매
 */

const HEADER_HEIGHT = 129;
/** Figma 프레임 전체 높이 */
const FRAME_HEIGHT = 1611;
/** 하단 고정 바 (1026:2631) top / height */
const BAR_TOP = 1482;
const BAR_HEIGHT = 119;

/** Group 86 기준 y (Container 1026:2586) */
const INFO_TOP = 491;

/** 상세 설명 자리표시 블록 (Figma Frame 60/61/62) */
const DETAIL_BLOCKS = [
  { top: 592, height: 245, nodeId: '1026:2608' },
  { top: 856, height: 181, nodeId: '1026:2609' },
  { top: 1056, height: 194, nodeId: '1026:2610' },
];

/** 태그 pill 좌표 (Figma Container 1026:2594 / 2598 / 2602) */
const TAG_LEFT = [15.83, 82.83, 149.83];
/** 태그 pill 폭 — 글자 수에 따라 Figma 가 61 / 68 두 가지를 쓴다 */
const tagWidth = (label) => (label.length > 4 ? 68 : 61);
const tagTextWidth = (label) => (label.length > 4 ? 54 : label.length > 3 ? 45 : 40);

/** 베스트 조합 (Group 92) */
const COMBO_TITLE_TOP = 1266;
const COMBO_CARD_TOP = 1298;
/** 펼친 높이 / 접은 높이 — 접으면 이미지 줄만 남는다(18 + 85 + 18) */
const COMBO_OPEN_H = 167;
const COMBO_CLOSED_H = 121;

export default function ProductDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const add = useCartStore((s) => s.add);

  /** 목록에서 넘어온 상품. 없으면 더미 상세로 떨어진다 */
  const selected = useMemo(() => findProductByKey(id ? decodeURIComponent(id) : ''), [id]);

  /** 화면에 그릴 값 — 선택된 상품이 있으면 그 상품이 우선이다 */
  const view = useMemo(() => {
    if (!selected) {
      return {
        key: PRODUCT_DETAIL.id,
        name: PRODUCT_DETAIL.name,
        priceText: formatPrice(PRODUCT_DETAIL.price),
        priceValue: PRODUCT_DETAIL.price,
        option: PRODUCT_DETAIL.option,
        image: PRODUCT_DETAIL.image,
        tags: PRODUCT_DETAIL.tags.map((t) => t.label),
        wishTarget: null,
      };
    }
    const fullName = joinNameLines(selected);
    const priceValue = Number(String(selected.price).replace(/[^0-9]/g, '')) || 0;
    return {
      key: productKey(selected),
      name: fullName,
      priceText: selected.price,
      priceValue,
      option: fullName,
      // 카드 이미지의 첫 레이어를 대표 이미지로 쓴다
      image: selected.layers?.[0]?.srcs?.[0] ?? PRODUCT_DETAIL.image,
      tags: selected.tags ?? [],
      wishTarget: selected,
    };
  }, [selected]);

  /** 찜 — 목록과 같은 스토어·같은 키를 쓴다 */
  const wishKeys = useWishlistStore((s) => s.keys);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = wishKeys.includes(view.key);

  /** 하단 바의 선택 개수 — Figma 기본값은 0개 */
  const [quantity, setQuantity] = useState(0);
  /** 베스트 조합 펼침 여부 */
  const [comboOpen, setComboOpen] = useState(true);

  const total = view.priceValue * quantity;

  /** 장바구니에 담고 장바구니 화면으로 이동 */
  const addToCart = (qty) => {
    add({
      id: view.key,
      name: view.name,
      option: view.option,
      price: view.priceValue,
      image: view.image,
      quantity: Math.max(1, qty),
    });
    navigate('/market/cart');
  };

  return (
    <Screen
      className="bg-white"
      height={FRAME_HEIGHT}
      nodeId="1026:2575"
      name="ProductDetail"
      headerHeight={HEADER_HEIGHT}
      header={
        <div className="relative h-[129px] w-[393px] overflow-clip bg-header-dark" data-node-id="1026:2577" data-name="Container">
          <StatusBar tone="white" />

          <div className="absolute left-0 top-[51px] h-[60px] w-[393px]" data-node-id="1026:2580" data-name="Container">
            {/* 뒤로가기 — Figma 는 19x10 셰브론을 90도 돌려 쓴다 */}
            <button
              type="button"
              aria-label="뒤로"
              onClick={() => navigate(-1)}
              className="absolute left-[22.83px] top-[24px] flex h-[19px] w-[10px] items-center justify-center"
              data-node-id="1026:2584"
            >
              <span className="flex-none rotate-90">
                <span className="relative block h-[10px] w-[19px]">
                  <img alt="" src={backIcon} className="absolute inset-[-8.61%_-4.77%_-18.15%_-4.77%] block size-full max-w-none" />
                </span>
              </span>
            </button>

            <p
              className="absolute left-[46.83px] top-[26px] h-[13px] w-[123px] whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[16.5px] text-white"
              data-node-id="1026:2583"
            >
              InnerDerma
            </p>
          </div>
        </div>
      }
      tabBarHeight={BAR_HEIGHT}
      tabBar={
        <div
          className="relative h-[119px] w-[393px] border-t-[0.667px] border-solid border-bar-line bg-white"
          data-node-id="1026:2631"
          data-name="Container"
        >
          <div
            className="absolute left-[17px] top-[8px] flex w-[363px] items-center justify-between px-[4px]"
            data-node-id="1026:2632"
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => (q === 0 ? 1 : 0))}
              className="relative shrink-0 whitespace-nowrap font-sans text-[13px] font-normal leading-[19.5px] text-cart-sub"
              data-node-id="1026:2634"
              data-testid="pd-select-toggle"
            >
              선택 {quantity}개
            </button>
            <p
              className="relative shrink-0 whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] text-text-strong"
              data-node-id="1026:2636"
            >
              {formatPrice(total)}
            </p>
          </div>

          {/* 장바구니 — Figma 1026:2639 (left 17 + -8 = 9) */}
          <button
            type="button"
            onClick={() => addToCart(quantity || 1)}
            className="absolute left-[9px] top-[45.09px] h-[54px] w-[148px] rounded-[5px] border border-solid border-ink bg-white"
            data-node-id="1026:2639"
            data-testid="pd-add-cart"
          >
            <span className="absolute left-[73.5px] top-[14px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-semibold leading-[24px] text-ink">
              장바구니
            </span>
          </button>

          {/* 바로구매 — Figma 1026:2642 (left 184 + -20 = 164) */}
          <button
            type="button"
            onClick={() => addToCart(quantity || 1)}
            className="absolute left-[164px] top-[45.08px] h-[52px] w-[221px] rounded-[5px] bg-header-dark"
            data-node-id="1026:2642"
            data-testid="pd-buy-now"
          >
            <span className="absolute left-[110.5px] top-[14px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-semibold leading-[24px] text-white">
              바로구매
            </span>
          </button>
        </div>
      }
      contentBottom={BAR_TOP}
    >
      {/* 대표 이미지 — 목록에서 고른 상품의 이미지 */}
      <div
        className="absolute left-0 top-[129px] h-[362px] w-[393px] overflow-clip bg-image-bg"
        data-node-id="1026:2585"
        data-name="image 15"
      >
        <img
          alt=""
          src={view.image}
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          data-testid="pd-hero"
        />
      </div>

      {/* 정보 블록 배경 */}
      <div className="absolute left-0 h-[100px] w-[393px] bg-white" style={{ top: INFO_TOP + 9 }} data-node-id="1026:2588" />

      {/* 찜 — 목록과 동기화 */}
      <button
        type="button"
        aria-label={wished ? '찜 해제' : '찜하기'}
        aria-pressed={wished}
        onClick={() => (view.wishTarget ? toggleWish(view.wishTarget) : toggleWish({ name: view.name }))}
        className="absolute left-[310px] z-10 h-[17.966px] w-[19.945px] transition-transform active:scale-90"
        style={{ top: INFO_TOP + 30 }}
        data-node-id="1026:2590"
        data-testid="pd-wish"
      >
        <img alt="" src={wished ? heartFilled : heartEmpty} className="absolute inset-0 block size-full max-w-none" />
      </button>

      {/* 공유 — Figma Vector(1026:2630) */}
      <button
        type="button"
        aria-label="공유"
        className="absolute left-[345px] z-10 h-[20px] w-[18px]"
        style={{ top: INFO_TOP + 29 }}
        data-node-id="1026:2630"
      >
        <img alt="" src={shareIcon} className="absolute inset-0 block size-full max-w-none" />
      </button>

      {/*
        상품명 — 마켓 카드와 같은 18자 규칙을 적용한다.
        내부 텍스트 박스(338)가 바깥 박스(214)보다 넓어 찜·공유 버튼 위를 덮으므로
        클릭이 막히지 않게 pointer-events 를 끈다.
      */}
      <div
        className="pointer-events-none absolute left-[15.83px] flex h-[46px] w-[214px] flex-col items-start"
        style={{ top: INFO_TOP + 16 }}
        data-node-id="1026:2591"
        data-name="Paragraph"
      >
        <div className="relative h-[44px] w-[338px] shrink-0 font-sans text-[16px] font-semibold leading-[0] text-ink [word-break:break-word]">
          <p className="mb-0 leading-[16.5px]">&#8203;</p>
          <p className="leading-[16.5px]" data-testid="pd-name">
            {truncateProductName(view.name)}
          </p>
        </div>
      </div>

      {/* 가격 */}
      <p
        className="absolute left-[302px] w-[77px] font-display text-[16px] font-bold leading-[13.5px] text-ink [word-break:break-word]"
        style={{ top: INFO_TOP + 68 }}
        data-node-id="1026:2593"
      >
        {view.priceText}
      </p>

      {/* 태그 3개 */}
      {view.tags.slice(0, 3).map((label, i) => (
        <div
          key={label}
          className="absolute flex h-[29px] items-center pt-[6px]"
          style={{ left: TAG_LEFT[i], top: INFO_TOP + 57 }}
          data-name="Container"
        >
          <div
            className="relative flex h-[23px] shrink-0 flex-col items-start rounded-full bg-ink px-[6px] py-[2px]"
            style={{ width: tagWidth(label) }}
          >
            <div className="relative flex shrink-0 items-center justify-center pt-[3px]">
              <p
                className="relative shrink-0 text-right font-sans text-[11px] font-medium leading-[13.5px] text-white [word-break:break-word]"
                style={{ width: tagTextWidth(label) }}
              >
                {label}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* 상세 설명 자리표시 3블록 */}
      {DETAIL_BLOCKS.map((block) => (
        <div
          key={block.nodeId}
          className="absolute left-[4px] w-[384px] rounded-[16px] border-2 border-solid border-placeholder-line bg-detail-placeholder"
          style={{ top: block.top, height: block.height }}
          data-node-id={block.nodeId}
          data-name="DetailPlaceholder"
        />
      ))}

      {/* 많이 구매하는 베스트 조합 */}
      <p
        className="absolute left-[19px] whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] text-text-strong"
        style={{ top: COMBO_TITLE_TOP }}
        data-node-id="1026:2612"
      >
        {PRODUCT_DETAIL.combo.title}
      </p>

      {/*
        베스트 조합 — 화살표로 접고 펼친다.
        접으면 CTA 가 위로 밀리며 사라지고 테두리 높이도 이미지 줄만 남게 줄어든다.
      */}
      <div
        className="absolute left-[12px] w-[372px] overflow-hidden rounded-[10px] border border-solid border-stepper-line transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ top: COMBO_CARD_TOP, height: comboOpen ? COMBO_OPEN_H : COMBO_CLOSED_H }}
        data-node-id="1026:2625"
        data-name="ComboCard"
        data-open={comboOpen}
      >
        {/* 상품 이미지 3개 */}
        {PRODUCT_DETAIL.combo.images.map((src, i) => (
          <div
            key={src}
            className="absolute size-[85px] overflow-clip rounded-[5px]"
            style={{ left: [33, 144, 255][i], top: 18 }}
            data-name={`combo-${i + 1}`}
          >
            <img alt="" src={src} className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover" />
          </div>
        ))}

        {/* 플러스 아이콘 2개 */}
        {[119, 230].map((left) => (
          <img key={left} alt="" src={plusIcon} className="absolute size-[24px]" style={{ left, top: 48 }} aria-hidden />
        ))}

        {/* CTA — 접으면 위로 올라가며 사라진다 */}
        <button
          type="button"
          onClick={() => addToCart(3)}
          tabIndex={comboOpen ? 0 : -1}
          aria-hidden={!comboOpen}
          className="absolute left-[33px] top-[120px] h-[28px] w-[307px] rounded-[5px] bg-header-dark transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: comboOpen ? 1 : 0,
            transform: `translateY(${comboOpen ? 0 : -16}px)`,
            pointerEvents: comboOpen ? 'auto' : 'none',
          }}
          data-node-id="1026:2628"
          data-testid="combo-add"
        >
          <span className="absolute left-[153px] top-[2px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[10px] font-semibold leading-[24px] text-white">
            {PRODUCT_DETAIL.combo.cta}
          </span>
        </button>

        {/*
          접기/펴기 화살표 (Figma Button:margin 1026:2626 의 셰브론).
          카드 아래쪽에 붙여 두어 높이가 줄면 같이 따라 올라온다.
        */}
        <button
          type="button"
          aria-expanded={comboOpen}
          aria-label={comboOpen ? '베스트 조합 접기' : '베스트 조합 펼치기'}
          onClick={() => setComboOpen((v) => !v)}
          className="absolute bottom-0 left-1/2 flex h-[19px] w-[60px] -translate-x-1/2 items-center justify-center"
          data-testid="combo-toggle"
        >
          <span
            className="block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `rotate(${comboOpen ? 0 : 180}deg)` }}
          >
            <svg viewBox="0 0 24 8" className="block h-[7px] w-[23px]" aria-hidden>
              <path
                d="M1 7 12 1 23 7"
                fill="none"
                stroke="#1A1D23"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </Screen>
  );
}
