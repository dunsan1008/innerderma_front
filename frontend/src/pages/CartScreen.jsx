import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';
import StatusBar from '@/components/layout/StatusBar';
import { useCartStore } from '@/store/cartStore';
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
 * 구조 (좌표는 프레임 기준 절대값)
 *  - Group 83 (1026:2399) 393x129 : bg #16161a, 상태바 white, 흰 로고 @ (25, 79)
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

const HEADER_HEIGHT = 129;
const TAB_BAR_HEIGHT = 96;
/** 첫 카드 top (Figma 216 + margin 8) */
const LIST_TOP = 224;
/** 카드 높이 */
const CARD_HEIGHT = 136.667;
/** 카드 사이 간격 */
const CARD_GAP = 12;
/** 합계 블록 높이 (Figma 1026:2528) */
const SUMMARY_HEIGHT = 108.667;
/** Figma 기본 상태의 합계 블록 top */
const SUMMARY_TOP_MIN = 728.333;

/** 배송방법 셀렉트 (Figma 1026:2444) — 디자인은 정적이지만 실제로 고를 수 있게 한다 */
function DeliverySelect({ value, onChange }) {
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
        aria-label="배송방법"
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
  return (
    <div
      className="relative flex h-[27.333px] w-[87.333px] shrink-0 items-center overflow-clip rounded-[6px] border-[0.667px] border-solid border-card-line"
      data-node-id="1026:2449"
    >
      <button
        type="button"
        aria-label="수량 줄이기"
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
        aria-label="수량 늘리기"
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
            aria-label={`${item.name} 선택`}
            onClick={() => onToggle(item.id)}
            className={`relative flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[0.667px] border-solid transition-colors ${
              selected ? 'border-header-dark bg-header-dark' : 'border-card-line bg-white'
            }`}
            data-name="SelectCheckbox"
          >
            {selected ? <img alt="" src={check} className="relative h-[8px] w-[10px] shrink-0" /> : null}
          </button>
        </div>

        {/* 썸네일 */}
        <div className="relative flex size-[72px] shrink-0 flex-col items-start overflow-clip rounded-[8px] bg-thumb-bg">
          <img alt="" src={item.image} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
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
          aria-label={`${item.name} 삭제`}
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
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const selectedIds = useCartStore((s) => s.selectedIds);
  const toggleSelect = useCartStore((s) => s.toggleSelect);
  const toggleSelectAll = useCartStore((s) => s.toggleSelectAll);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setDelivery = useCartStore((s) => s.setDelivery);
  const setDeliveryForSelected = useCartStore((s) => s.setDeliveryForSelected);
  const remove = useCartStore((s) => s.remove);
  const removeSelected = useCartStore((s) => s.removeSelected);

  const allChecked = items.length > 0 && selectedIds.length === items.length;
  const someChecked = selectedIds.length > 0 && !allChecked;
  const total = items
    .filter((it) => selectedIds.includes(it.id))
    .reduce((sum, it) => sum + it.price * it.quantity, 0);

  /** 카드 목록이 끝나는 y */
  const listBottom = LIST_TOP + items.length * (CARD_HEIGHT + CARD_GAP);
  const summaryTop = Math.max(listBottom + 12, SUMMARY_TOP_MIN);
  const contentBottom = summaryTop + SUMMARY_HEIGHT;

  return (
    <Screen
      className="bg-white"
      height={Math.max(contentBottom + TAB_BAR_HEIGHT, 933)}
      nodeId="1026:2397"
      name="MY 장바구니"
      headerHeight={HEADER_HEIGHT}
      header={
        <div className="relative h-[129px] w-[393px] overflow-clip bg-header-dark" data-node-id="1026:2399" data-name="Container">
          <StatusBar tone="white" />
          <div className="absolute left-0 top-[51px] h-[60px] w-[393px]" data-node-id="1026:2402">
            <p
              className="absolute left-[25px] top-[28px] h-[13px] w-[123px] whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[16.5px] text-white"
              data-node-id="1026:2405"
            >
              InnerDerma
            </p>
          </div>
        </div>
      }
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={contentBottom}
    >
      {/* 제목 */}
      <div
        className="absolute left-0 top-[129px] flex h-[53px] w-[393px] flex-col items-start px-[24px] pb-[8px] pt-[20px]"
        data-node-id="1026:2406"
        data-name="Heading 1"
      >
        <p className="relative shrink-0 whitespace-nowrap font-sans text-[20px] font-bold leading-[25px] text-text-strong">
          MY 장바구니
        </p>
      </div>

      {/* 도구 행 */}
      <div
        className="absolute left-0 top-[182px] flex h-[34px] w-[393px] items-center px-[24px] py-[8px]"
        data-node-id="1026:2408"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={allChecked ? 'true' : someChecked ? 'mixed' : 'false'}
          aria-label="전체 선택"
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
            전체
          </span>
        </button>

        {/* 선택된 상품의 배송방법을 한 번에 바꾼다 */}
        <div
          className="relative flex h-[18px] w-[95px] shrink-0 items-center gap-[4px] pl-[16px]"
          data-node-id="1026:2415"
        >
          <span className="whitespace-nowrap text-center font-sans text-[12px] font-normal leading-[18px] text-tool-gray">
            배송방법 변경
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
            aria-label="선택 상품 배송방법 일괄 변경"
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          >
            <option value="">선택</option>
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
          선택삭제
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
        <p className="absolute left-0 top-[380px] w-[393px] text-center font-sans text-[13px] font-normal leading-[20px] text-body">
          장바구니가 비었어요. 마켓에서 상품을 담아보세요.
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
            선택 {selectedIds.length}개
          </p>
          <p className="whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] text-header-dark">
            {formatPrice(total)}
          </p>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-center pt-[12px]" data-node-id="1026:2534">
          <button
            type="button"
            onClick={() => navigate('/market')}
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
              구매하기
            </span>
          </button>
        </div>
      </div>
    </Screen>
  );
}
