import { useT } from '@/i18n';
import { FRAME } from '@/theme';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';
import StatusBar from '@/components/layout/StatusBar';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { DELIVERY_OPTIONS, formatPrice } from '@/constants/cartItems';
import check from '@/assets/figma/cart-check.svg';
import checkSmall from '@/assets/figma/cart-check-sm.svg';
import closeIcon from '@/assets/figma/cart-close.svg';
import caret from '@/assets/figma/cart-caret.svg';
import caretSmall from '@/assets/figma/cart-caret-sm.svg';
import minus from '@/assets/figma/cart-minus.svg';
import plus from '@/assets/figma/cart-plus.svg';

/**
 * MY 장바구니 (Figma 1026:2397, 393x933).
 *
 * 구조 (좌표는 Figma 프레임 기준 절대값 — 헤더를 129→84 로 줄였으므로
 *  실제 렌더 y 는 헤더 아래 블록마다 HEADER_GROWTH(-45) 가 더해진다)
 *  - Group 83 (1026:2399) 393x129 : bg #16161a, 상태바 white, 흰 로고 @ (25, 79)
 *      → 홈·마켓 헤더와 같은 규격(84, 로고 20/48)으로 맞춤
 *  - Heading 1 (1026:2406) @ y129 h53 : "MY 장바구니" 20px bold @ (24, 149)
 *  - Container (1026:2408) @ y182 h34 : px-24 py-8
 *      전체 체크(14x14 r3) · 배송방법 변경(12px #959595) · 선택삭제(11px #959595)
 *  - Container (1026:2424) @ y216 : CartItemCard 361x136.667
 *      첫 카드 top 224, 이후 148.667(=136.667+12) 간격
 *  - Container (1026:2528) @ y728.333 h108.667 : 합계 + 구매하기(361x52 r15)
 *  - Group 84 (1026:2537) @ y837 h96 : 탭바
 *
 * 카드 개수가 바뀔 수 있으니 합계 블록은 목록 끝 기준으로 다시 계산한다.
 * (Figma 기본 3개일 때의 y728.333 을 최소값으로 유지한다)
 */

/**
 * 상단 고정 헤더 높이.
 *
 * Figma 는 129 였지만 로고가 (25, 79)에 있어 홈·마켓 헤더(로고 20, 48)와 어긋났다.
 * 홈 헤더 규격(상태바 44 + 로고 줄 40)에 맞춰 84 로 맞춘다.
 * 마켓 계열 헤더와 같은 값이라 장바구니로 들어올 때 로고가 튀지 않는다.
 */
const HEADER_HEIGHT = 84;
/** Figma 원본(129) 대비 줄어든 만큼 — 아래 블록 좌표에서 뺀다 */
const HEADER_GROWTH = HEADER_HEIGHT - 129;
const TAB_BAR_HEIGHT = 96;
/** 첫 카드 top (Figma 216 + margin 8) */
const LIST_TOP = 224 + HEADER_GROWTH;
/** 카드 높이 */
const CARD_HEIGHT = 136.667;
/** 카드 사이 간격 */
const CARD_GAP = 12;
/** 합계 블록 높이 (Figma 1026:2528) */
const SUMMARY_HEIGHT = 108.667;
/** 장바구니가 비었을 때 안내 문구의 top / 아래끝 (leading 20) */
const EMPTY_MESSAGE_TOP = 380 + HEADER_GROWTH;
const EMPTY_MESSAGE_BOTTOM = EMPTY_MESSAGE_TOP + 20;

/** 배송방법 셀렉트 (Figma 1026:2444) — 디자인은 정적이지만 실제로 고를 수 있게 한다 */
function DeliverySelect({ value, onChange }) {
  const t = useT();
  return (
    <div
      className="relative flex shrink-0 items-center gap-[5px] rounded-[6px] border-[0.667px] border-solid border-card-line px-[8px] py-[4px]"
      data-node-id="1026:2444"
    >
      <span className="relative shrink-0 whitespace-nowrap font-sans text-[11px] font-normal leading-[16.5px] text-select-text">
        {value}
      </span>
      <img alt="" src={caret} className="relative h-[5px] w-[8px] shrink-0" />
      {/* 접근성을 위해 실제 select 를 겹쳐 둔다 */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t.cart.shippingMethodAria}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {DELIVERY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/** 수량 스테퍼 (Figma 1026:2449) */
function QuantityStepper({ value, onChange }) {
  const t = useT();
  return (
    <div
      className="relative flex h-[27.333px] w-[87.333px] shrink-0 items-center overflow-clip rounded-[6px] border-[0.667px] border-solid border-card-line"
      data-node-id="1026:2449"
    >
      <button
        type="button"
        aria-label={t.cart.decreaseQtyAria}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="relative flex h-[26px] w-[28px] shrink-0 items-center justify-center border-r-[0.667px] border-solid border-card-line disabled:opacity-40"
      >
        <img alt="" src={minus} className="relative h-[2px] w-[11px] shrink-0" />
      </button>
      <span className="relative flex w-[30px] shrink-0 flex-col items-center text-center font-sans text-[12px] font-medium leading-[18px] text-header-dark">
        {value}
      </span>
      <button
        type="button"
        aria-label={t.cart.increaseQtyAria}
        onClick={() => onChange(value + 1)}
        className="relative flex h-[26px] w-[28px] shrink-0 items-center justify-center border-l-[0.667px] border-solid border-card-line"
      >
        <img alt="" src={plus} className="relative size-[11px] shrink-0" />
      </button>
    </div>
  );
}

/** 장바구니 상품 카드 (Figma 1026:2426) */
function CartItemCard({ item, selected, onToggle, onRemove, onQuantity, onDelivery, top }) {
  const t = useT();
  return (
    <div
      className="absolute left-[16px] flex w-[361px] flex-col items-start rounded-[12px] border-[0.667px] border-solid border-card-line bg-white p-[12px]"
      style={{ top, filter: 'drop-shadow(0px 1px 2px rgba(166,175,195,0.28))' }}
      data-node-id={item.nodeId}
      data-name="CartItemCard"
      data-selected={selected}
    >
      <div className="relative flex w-[335.667px] shrink-0 items-start gap-[12px]" data-node-id="1026:2427">
        {/* 체크박스 */}
        <div className="relative flex h-[22px] w-[18px] shrink-0 flex-col items-start justify-center pt-[4px]">
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={`${item.name} ${t.common.select}`}
            onClick={() => onToggle(item.id)}
            className={`relative flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[0.667px] border-solid transition-colors ${
              selected ? 'border-header-dark bg-header-dark' : 'border-card-line bg-white'
            }`}
            data-name="SelectCheckbox"
          >
            {selected ? <img alt="" src={check} className="relative h-[8px] w-[10px] shrink-0" /> : null}
          </button>
        </div>

        {/* 썸네일 — 실제 백엔드 상품 imageUrl 이 안 리졸브되면 배경(bg-thumb-bg)만 남긴다 */}
        <div className="relative flex size-[72px] shrink-0 flex-col items-start overflow-clip rounded-[8px] bg-thumb-bg">
          <img
            alt=""
            src={item.image}
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* 이름 / 옵션 */}
        <div className="relative flex min-w-px flex-1 flex-col items-start">
          <div className="relative flex h-[18px] w-full shrink-0 flex-col items-start overflow-clip">
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[13px] font-semibold leading-[18px] text-header-dark">
              {item.name}
            </p>
          </div>
          <div className="relative flex h-[17px] w-full shrink-0 flex-col items-start overflow-clip pt-[2px]">
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[11px] font-normal leading-[15px] text-option-gray">
              {item.option}
            </p>
          </div>
        </div>

        {/* 삭제 */}
        <button
          type="button"
          aria-label={`${item.name} ${t.common.delete}`}
          onClick={() => onRemove(item.id)}
          className="relative flex h-[22px] w-[20px] shrink-0 flex-col items-start justify-center px-[4px] pb-[4px] pt-[6px]"
        >
          <img alt="" src={closeIcon} className="relative size-[12px] shrink-0" />
        </button>
      </div>

      {/* 하단 행 */}
      <div className="relative flex w-full shrink-0 flex-col items-center pt-[12px]" data-node-id="1026:2442">
        <div className="relative flex w-full shrink-0 items-center justify-between pl-[30px]" data-node-id="1026:2443">
          <DeliverySelect value={item.delivery} onChange={(v) => onDelivery(item.id, v)} />
          <QuantityStepper value={item.quantity} onChange={(q) => onQuantity(item.id, q)} />
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[13px] font-semibold leading-[19.5px] text-header-dark">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartScreen() {
  const t = useT();
  const items = useCartStore((s) => s.items);
  const selectedIds = useCartStore((s) => s.selectedIds);
  const toggleSelect = useCartStore((s) => s.toggleSelect);
  const toggleSelectAll = useCartStore((s) => s.toggleSelectAll);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setDelivery = useCartStore((s) => s.setDelivery);
  const setDeliveryForSelected = useCartStore((s) => s.setDeliveryForSelected);
  const remove = useCartStore((s) => s.remove);
  const removeSelected = useCartStore((s) => s.removeSelected);
  const openPurchaseConfirm = useUiStore((s) => s.openPurchaseConfirm);

  const allChecked = items.length > 0 && selectedIds.length === items.length;
  const someChecked = selectedIds.length > 0 && !allChecked;
  const total = items
    .filter((it) => selectedIds.includes(it.id))
    .reduce((sum, it) => sum + it.price * it.quantity, 0);

  /**
   * 합계·구매하기 블록은 **내용 바로 아래**에 붙인다.
   *
   * 예전에는 Figma 기본 상태(상품 3개)의 y 를 최소값으로 깔아 둬서, 상품이 1~2개거나
   * 아예 없어도 블록이 그 자리에 머물렀다. 그러면 목록과 블록 사이가 크게 비고
   * 콘텐츠가 화면보다 길어져(contentBottom 792 > 756) 구매하기 버튼이 탭바 아래로
   * 밀려 스크롤해야 보였다.
   *
   * 이제 목록이 끝나는 곳(비어 있으면 안내 문구 아래)에서 이어지므로
   * 상품 3개까지는 스크롤 없이 한 화면에 들어온다.
   */
  const listBottom = LIST_TOP + items.length * (CARD_HEIGHT + CARD_GAP);
  /**
   * 빈 상태에서는 구매하기 블록이 촬영 버튼(탭바 중앙 원, 위끝 ≈ 탭바 top - 12) 바로 위에
   * 오되 가려지지 않는 위치에 붙는다. 탭바 가시 영역 = FRAME.height - TAB_BAR_HEIGHT = 756.
   * 촬영 버튼(68 원)이 탭바 위로 튀어나와 실제 차지 영역은 그보다 좁다.
   * summaryBottom ≤ 756 - 20(=여유) 이면 안 가리므로, summaryTop ≤ 736 - SUMMARY_HEIGHT ≈ 627.
   */
  const SUMMARY_BOTTOM_MAX = FRAME.height - TAB_BAR_HEIGHT - 20; // 736
  const emptySummaryTop = SUMMARY_BOTTOM_MAX - SUMMARY_HEIGHT;   // ≈627
  const summaryTop = items.length ? listBottom + 12 : Math.max(EMPTY_MESSAGE_BOTTOM + 24, emptySummaryTop);
  const contentBottom = summaryTop + SUMMARY_HEIGHT;
  /** Figma 프레임은 933 이었지만, 내용이 짧을 때 빈 높이를 잡아 둘 이유가 없다 */
  const frameHeight = Math.max(contentBottom, FRAME.height);

  return (
    <Screen
      className="bg-white"
      height={frameHeight}
      nodeId="1026:2397"
      name="MY 장바구니"
      headerHeight={HEADER_HEIGHT}
      header={
        /*
          상태바·로고 줄은 홈 헤더(870:3791)·마켓 헤더와 같은 규격을 쓴다.
          예전에는 상태바를 기본 배치(left 13 / top 7)로 두고 로고를 (25, 79)에
          h-13/w-123 + leading-16.5 로 박아 둬서, 마켓에서 장바구니로 들어올 때
          로고가 31px 내려앉고 크기도 달라 보였다.
          우측 아이콘은 Figma 장바구니 프레임에 없으므로 넣지 않는다.
        */
        <div
          className="relative flex w-[393px] flex-col items-start overflow-clip bg-header-dark"
          style={{ height: HEADER_HEIGHT }}
          data-node-id="1026:2399"
          data-name="Container"
        >
          <div className="relative h-[44px] w-full shrink-0">
            <StatusBar tone="white" className="absolute left-0 top-0 h-[44px] w-[393px]" />
          </div>

          {/* 로고 줄 — 홈 헤더와 같은 패딩. 여기 값을 바꾸면 로고 y 가 홈과 어긋난다 */}
          <div
            className="relative flex w-full shrink-0 items-center justify-between px-[20px] pb-[16px] pt-[4px]"
            data-node-id="1026:2402"
          >
            <div className="relative flex shrink-0 flex-col items-start">
              <p
                className="relative shrink-0 whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[20px] text-white [word-break:break-word]"
                data-node-id="1026:2405"
              >
                InnerDerma
              </p>
            </div>
          </div>
        </div>
      }
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={contentBottom}
    >
      {/*
        제목 + 뒤로가기.

        뒤로가기는 헤더가 아니라 제목 줄에 둔다. 헤더에 넣으면 로고가 오른쪽으로
        밀려(상품 상세는 그래서 로고가 46.83 에 있다) 홈·마켓과 맞춰 둔 로고 위치가
        다시 어긋난다. 제목 줄에 두면 헤더는 그대로 두면서 되돌아갈 길이 생긴다.
      */}
      <div
        className="absolute left-0 flex h-[53px] w-[393px] items-center gap-[10px] px-[24px] pb-[8px] pt-[20px]"
        style={{ top: 129 + HEADER_GROWTH }}
        data-node-id="1026:2406"
        data-name="Heading 1"
      >
        <button
          type="button"
          aria-label={t.common.back}
          onClick={() => navigate(-1)}
          className="relative -ml-[4px] flex size-[24px] shrink-0 items-center justify-center text-text-strong"
          data-testid="cart-back"
        >
          {/* 상품 상세의 셰브론(19x10 을 90도 돌린 것)과 같은 모양·굵기 */}
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden>
            <path d="M9.75 1.25L1.5 9.5l8.25 8.25" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </button>
        <p className="relative shrink-0 whitespace-nowrap font-sans text-[20px] font-bold leading-[25px] text-text-strong">
          {t.cart.title}
        </p>
      </div>

      {/* 도구 행 */}
      <div
        className="absolute left-0 flex h-[34px] w-[393px] items-center px-[24px] py-[8px]"
        style={{ top: 182 + HEADER_GROWTH }}
        data-node-id="1026:2408"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={allChecked ? 'true' : someChecked ? 'mixed' : 'false'}
          aria-label={t.common.selectAll}
          onClick={toggleSelectAll}
          className="relative flex shrink-0 items-center gap-[6px]"
          data-node-id="1026:2409"
          data-testid="cart-select-all"
        >
          <span
            className={`flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border-[0.667px] border-solid transition-colors ${
              selectedIds.length > 0 ? 'border-header-dark bg-header-dark' : 'border-card-line bg-white'
            }`}
          >
            {allChecked ? (
              <img alt="" src={checkSmall} className="h-[6px] w-[8px]" />
            ) : someChecked ? (
              <svg viewBox="0 0 8 6" className="h-[6px] w-[8px]" aria-hidden>
                <path d="M1 3h6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : null}
          </span>
          <span className="whitespace-nowrap text-center font-sans text-[12px] font-medium leading-[18px] text-header-dark">
            {t.filter.all}
          </span>
        </button>

        {/* 선택된 상품의 배송방법을 한 번에 바꾼다 */}
        <div
          className="relative flex h-[18px] w-[95px] shrink-0 items-center gap-[4px] pl-[16px]"
          data-node-id="1026:2415"
        >
          <span className="whitespace-nowrap text-center font-sans text-[12px] font-normal leading-[18px] text-tool-gray">
            {t.market.changeDelivery}
          </span>
          <span className="relative flex size-[6px] shrink-0 items-center justify-center">
            <span className="flex-none rotate-90">
              <img alt="" src={caretSmall} className="block size-[6px]" />
            </span>
          </span>
          <select
            value=""
            onChange={(e) => e.target.value && setDeliveryForSelected(e.target.value)}
            disabled={selectedIds.length === 0}
            aria-label={t.cart.changeDeliveryBulkAria}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          >
            <option value="">{t.common.select}</option>
            {DELIVERY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Figma 1026:2421 — 남는 폭을 채우는 스페이서 */}
        <div className="relative h-0 min-w-px flex-1" data-node-id="1026:2421" />

        <button
          type="button"
          onClick={removeSelected}
          disabled={selectedIds.length === 0}
          className={`relative shrink-0 whitespace-nowrap text-center font-sans text-[11px] font-normal leading-[16.5px] transition-colors ${
            selectedIds.length > 0 ? 'text-tool-gray' : 'text-tool-gray opacity-50'
          }`}
          data-node-id="1026:2422"
          data-testid="cart-delete-selected"
        >
          {t.market.selectDelete}
        </button>
      </div>

      {/* 카드 목록 */}
      {items.length ? (
        items.map((item, i) => (
          <CartItemCard
            key={item.id}
            item={item}
            selected={selectedIds.includes(item.id)}
            onToggle={toggleSelect}
            onRemove={remove}
            onQuantity={setQuantity}
            onDelivery={setDelivery}
            top={LIST_TOP + i * (CARD_HEIGHT + CARD_GAP)}
          />
        ))
      ) : (
        <p
          className="absolute left-0 w-[393px] text-center font-sans text-[13px] font-normal leading-[20px] text-body"
          style={{ top: EMPTY_MESSAGE_TOP }}
        >
          {t.cart.emptyMessage}
        </p>
      )}

      {/* 합계 + 구매하기 */}
      <div
        className="absolute left-0 flex w-[393px] flex-col items-start border-t-[0.667px] border-solid border-bar-line px-[16px] pb-[12px] pt-[8px]"
        style={{ top: summaryTop }}
        data-node-id="1026:2528"
      >
        <div className="relative flex w-full shrink-0 items-center justify-between px-[4px]" data-node-id="1026:2529">
          <p className="whitespace-nowrap font-sans text-[13px] font-normal leading-[19.5px] text-cart-sub">
            {t.common.selectedCount(selectedIds.length)}
          </p>
          <p className="whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] text-header-dark">
            {formatPrice(total)}
          </p>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-center pt-[12px]" data-node-id="1026:2534">
          <button
            type="button"
            onClick={openPurchaseConfirm}
            disabled={selectedIds.length === 0}
            className={`relative flex w-[361px] shrink-0 items-center justify-center rounded-[15px] py-[14px] transition-colors ${
              selectedIds.length > 0 ? 'bg-header-dark' : 'bg-disabled-bg'
            }`}
            data-node-id="1026:2535"
            data-testid="cart-checkout"
          >
            <span
              className={`whitespace-nowrap text-center font-sans text-[16px] font-semibold leading-[24px] ${
                selectedIds.length > 0 ? 'text-white' : 'text-disabled-text'
              }`}
            >
              {t.cart.purchase}
            </span>
          </button>
        </div>
      </div>
    </Screen>
  );
}
