import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import { useCartStore } from '@/store/cartStore';
import { productKey, useWishlistStore } from '@/store/wishlistStore';
import { PRODUCT_DETAIL } from '@/constants/productDetail';
import { findProductByKey } from '@/constants/marketScreens';
import { formatPrice } from '@/constants/cartItems';
import { joinNameLines } from '@/lib/productName';
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

/**
 * 상품명 배치.
 *
 * 찜(1026:2590, y+30 h17.97)과 공유(1026:2630, y+29 h20) 아이콘의 세로 중심은 y+39 다.
 * 상품명 **첫 줄의 세로 중심**을 그 값에 맞춰 아이콘과 한 가로열로 읽히게 한다.
 * (예전에는 이름 중심이 y+42.8 로 3.8px 아래에 있어 열이 어긋나 보였다)
 *
 * 이름은 자르지 않고 전부 보여주므로 길면 여러 줄이 된다. 늘어난 높이만큼
 * 아래 요소(태그·가격·상세 블록·베스트 조합)를 함께 내려 배치가 겹치지 않게 한다.
 */
const NAME_LINE_HEIGHT = 16.5;
const ICON_CENTER_Y = 39;
const NAME_TOP = ICON_CENTER_Y - NAME_LINE_HEIGHT / 2;
/** 찜 아이콘(x310) 앞에서 끝나도록 잡은 폭 */
const NAME_WIDTH = 270;

/**
 * 상세 설명 3블록 (Figma Frame 60/61/62).
 * Figma 원본은 내부 그룹이 전부 hidden 인 빈 자리표시였다 — 제품 특징 / 사용 방법 /
 * 보관 및 주의사항 실제 콘텐츠로 채운다. 백엔드에 상품 설명 필드가 없어서(이름·가격·
 * 태그·이미지뿐) 특정 성분·효능을 지어내는 대신, 스킨케어/이너뷰티 두 카테고리에
 * 공통으로 적용 가능한 일반적인 안내문을 쓰고, 태그는 실제 상품 데이터를 그대로 쓴다.
 */
const DETAIL_BLOCKS = [
  { top: 592, height: 245, nodeId: '1026:2608' },
  { top: 856, height: 181, nodeId: '1026:2609' },
  { top: 1056, height: 194, nodeId: '1026:2610' },
];

/**
 * 상품이 이너뷰티(윔 스토어, 섭취형)인지 스킨케어(피쓰 서울, 바르는 제품)인지 구분한다.
 * 실제 백엔드 상품은 `source`로 바로 구분되지만, 더미 상품은 그 필드가 없어서
 * 이름에 섭취형 제품에 흔한 단어가 있는지로 대신 판별한다.
 */
const SUPPLEMENT_KEYWORDS = ['쉐이크', '식이섬유', '도시락', '콜라겐', '프로바이오틱스', '환', '스틱'];
function isSupplementProduct(name, source) {
  if (source === 'WIM_STORE') return true;
  if (source === 'PIECE_SEOUL') return false;
  return SUPPLEMENT_KEYWORDS.some((kw) => name.includes(kw));
}

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
  const t = useT();
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

  /**
   * 상품명이 한 줄을 넘어간 만큼(extra)을 재서 아래 요소를 내린다.
   *
   * 이름을 자르지 않으니 길이에 따라 1~3줄이 되는데, 아래 요소가 모두 절대 좌표라
   * 가만히 두면 두 줄째부터 태그·가격 위로 글자가 겹친다. 실제 렌더 높이를 재서
   * 늘어난 만큼만 밀어 준다. 폰트 로딩·언어 전환으로 높이가 바뀌어도 따라오도록
   * ResizeObserver 를 쓴다.
   */
  const nameRef = useRef(null);
  const [nameHeight, setNameHeight] = useState(NAME_LINE_HEIGHT);

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return undefined;

    // scrollHeight 는 레이아웃 값이라 DeviceFrame 의 transform: scale 에 영향받지 않는다
    const measure = () => setNameHeight(el.scrollHeight || NAME_LINE_HEIGHT);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // 웹폰트가 늦게 붙으면 줄 수가 달라진다
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [view.name]);

  /** 한 줄일 때 0, 두 줄이면 16.5, 세 줄이면 33 */
  const nameLines = Math.max(1, Math.round(nameHeight / NAME_LINE_HEIGHT));
  const extra = (nameLines - 1) * NAME_LINE_HEIGHT;

  /** 상세 설명 3블록 콘텐츠 — 이너뷰티/스킨케어 카테고리별로 문구가 갈린다 */
  const isSupplement = isSupplementProduct(view.name, selected?.source);
  const usageSteps = isSupplement ? t.productDetail.supplementUsageSteps : t.productDetail.skincareUsageSteps;
  const featuresIntro = isSupplement ? t.productDetail.supplementIntro : t.productDetail.skincareIntro;
  const careText = isSupplement ? t.productDetail.supplementCare : t.productDetail.skincareCare;

  /** 하단 바의 선택 개수 — Figma 기본값은 0개 */
  const [quantity, setQuantity] = useState(0);
  /** 베스트 조합 펼침 여부 — 기본은 접힌 상태이고, 사용자가 화살표를 눌러야 열린다 */
  const [comboOpen, setComboOpen] = useState(false);

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
      // 실제 백엔드 상품이면(더미가 아니면) 서버 장바구니 동기화에 쓴다 — cartStore 참고
      productCode: selected?.productCode,
      source: selected?.source,
    });
    navigate('/market/cart');
  };

  /** 베스트 조합 3개를 각각 1개씩 장바구니에 담는다 */
  const addComboToCart = () => {
    for (const item of PRODUCT_DETAIL.combo.products) {
      add({ ...item, quantity: 1 });
    }
    navigate('/market/cart');
  };

  return (
    <Screen
      className="bg-white"
      height={FRAME_HEIGHT + extra}
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
              aria-label={t.common.back}
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
              {t.common.selectedCount(quantity)}
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
              {t.common.cart}
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
              {t.productDetail.buyNow}
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
        {/*
          실제 백엔드 상품의 imageUrl 이 아직 리졸브 안 되는 경우가 있다 —
          깨진 이미지 아이콘 대신 위 배경(bg-image-bg)만 남긴다.
        */}
        <img
          alt=""
          src={view.image}
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          data-testid="pd-hero"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* 정보 블록 배경 — 이름이 길어지면 그만큼 높아진다 */}
      <div
        className="absolute left-0 w-[393px] bg-white"
        style={{ top: INFO_TOP + 9, height: 100 + extra }}
        data-node-id="1026:2588"
      />

      {/* 찜 — 목록과 동기화 */}
      <button
        type="button"
        aria-label={wished ? t.market.removeWish : t.market.addWish}
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
        aria-label={t.common.share}
        className="absolute left-[345px] z-10 h-[20px] w-[18px]"
        style={{ top: INFO_TOP + 29 }}
        data-node-id="1026:2630"
      >
        <img alt="" src={shareIcon} className="absolute inset-0 block size-full max-w-none" />
      </button>

      {/*
        상품명 — 상세 페이지에서는 **자르지 않고 전부** 보여준다(마켓 카드·배너는 … 로 줄인다).
        첫 줄의 세로 중심을 찜·공유 아이콘 중심(y+39)에 맞춰 한 가로열로 읽히게 하고,
        길어서 줄이 늘면 아래 요소를 extra 만큼 밀어 겹치지 않게 한다.
        폭은 찜 아이콘(x310) 앞에서 끝나므로 아이콘을 덮지 않는다.
      */}
      <p
        ref={nameRef}
        className="absolute left-[15.83px] font-sans text-[16px] font-semibold leading-[16.5px] text-ink [word-break:break-word]"
        style={{ top: INFO_TOP + NAME_TOP, width: NAME_WIDTH }}
        data-node-id="1026:2591"
        data-testid="pd-name"
      >
        {view.name}
      </p>

      {/* 가격 */}
      <p
        className="absolute left-[302px] w-[77px] font-display text-[16px] font-bold leading-[13.5px] text-ink [word-break:break-word]"
        style={{ top: INFO_TOP + 68 + extra }}
        data-node-id="1026:2593"
      >
        {view.priceText}
      </p>

      {/* 태그 3개 */}
      {view.tags.slice(0, 3).map((label, i) => (
        <div
          key={label}
          className="absolute flex h-[29px] items-center pt-[6px]"
          style={{ left: TAG_LEFT[i], top: INFO_TOP + 57 + extra }}
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

      {/* 상세 설명 1 — 제품 특징: 실제 태그 + 카테고리별 소개 문구 */}
      <div
        className="absolute left-[4px] flex w-[384px] flex-col items-start gap-[10px] rounded-[16px] border border-solid border-line bg-white px-[16px] py-[16px]"
        style={{ top: DETAIL_BLOCKS[0].top + extra, height: DETAIL_BLOCKS[0].height }}
        data-node-id={DETAIL_BLOCKS[0].nodeId}
        data-name="DetailFeatures"
      >
        <p className="font-sans text-[14px] font-bold leading-[21px] text-text-strong">
          {t.productDetail.detailFeaturesTitle}
        </p>
        {view.tags.length ? (
          <div className="flex flex-col items-start gap-[4px]">
            {view.tags.slice(0, 3).map((tag) => (
              <div key={tag} className="flex items-center gap-[6px]">
                <span className="size-[4px] shrink-0 rounded-full bg-accent-teal" />
                <p className="font-sans text-[12px] font-normal leading-[18px] text-body">{tag}</p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="font-sans text-[12px] font-normal leading-[18px] text-label-sub [word-break:keep-all]">
          {featuresIntro}
        </p>
      </div>

      {/* 상세 설명 2 — 사용 방법: 카테고리별 3단계 */}
      <div
        className="absolute left-[4px] flex w-[384px] flex-col items-start gap-[8px] rounded-[16px] border border-solid border-line bg-white px-[16px] py-[16px]"
        style={{ top: DETAIL_BLOCKS[1].top + extra, height: DETAIL_BLOCKS[1].height }}
        data-node-id={DETAIL_BLOCKS[1].nodeId}
        data-name="DetailUsage"
      >
        <p className="font-sans text-[14px] font-bold leading-[21px] text-text-strong">
          {t.productDetail.detailUsageTitle}
        </p>
        <div className="flex w-full flex-col items-start gap-[6px]">
          {usageSteps.map((step, i) => (
            <div key={step} className="flex w-full items-center gap-[8px]">
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-text-strong">
                <span className="font-sans text-[9px] font-bold leading-[9px] text-white">{i + 1}</span>
              </span>
              <p className="font-sans text-[12px] font-normal leading-[18px] text-text-strong [word-break:keep-all]">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 상세 설명 3 — 보관 및 주의사항: AvoidBox 와 같은 경고색 톤 재사용 */}
      <div
        className="absolute left-[4px] flex w-[384px] flex-col items-start gap-[6px] rounded-[16px] border border-solid border-warn-line bg-warn-bg px-[16px] py-[16px]"
        style={{ top: DETAIL_BLOCKS[2].top + extra, height: DETAIL_BLOCKS[2].height }}
        data-node-id={DETAIL_BLOCKS[2].nodeId}
        data-name="DetailCare"
      >
        <p className="font-sans text-[13px] font-semibold leading-[19.5px] text-accent-brown">
          {t.productDetail.detailCareTitle}
        </p>
        <p className="font-sans text-[12px] font-normal leading-[18px] text-accent-brown [word-break:keep-all]">
          {careText}
        </p>
      </div>

      {/* 많이 구매하는 베스트 조합 */}
      <p
        className="absolute left-[19px] whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] text-text-strong"
        style={{ top: COMBO_TITLE_TOP + extra }}
        data-node-id="1026:2612"
      >
        {t.productDetail.comboTitle}
      </p>

      {/*
        베스트 조합 — 화살표로 접고 펼친다.
        접으면 CTA 가 위로 밀리며 사라지고 테두리 높이도 이미지 줄만 남게 줄어든다.
      */}
      <div
        className="absolute left-[12px] w-[372px] overflow-hidden rounded-[10px] border border-solid border-stepper-line transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ top: COMBO_CARD_TOP + extra, height: comboOpen ? COMBO_OPEN_H : COMBO_CLOSED_H }}
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
          onClick={() => addComboToCart()}
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
            {t.productDetail.comboCta}
          </span>
        </button>

        {/*
          접기/펴기 화살표 (Figma Button:margin 1026:2626 의 셰브론).
          카드 아래쪽에 붙여 두어 높이가 줄면 같이 따라 올라온다.
        */}
        <button
          type="button"
          aria-expanded={comboOpen}
          aria-label={comboOpen ? t.productDetail.comboCollapseAria : t.productDetail.comboExpandAria}
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
