import { useT } from '@/i18n';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';
import MarketHeader from '@/components/market/MarketHeader';
import PostCard from '@/components/market/PostCard';
import { findProductByKey } from '@/constants/marketScreens';
import { productKey, useWishlistStore } from '@/store/wishlistStore';
import chevronSmall from '@/assets/figma/chevron-small.svg';

/**
 * 마켓 - 찜 (Figma 870:5089).
 * 카드 규격은 마켓 1 과 같고, 찜한 상품만 2열 격자로 다시 배치한다.
 * 배너·카테고리 탭·필터는 없고 상단에 선택/배송방법 도구 행이 있다.
 *
 * 상품은 **피쓰 서울·윔 스토어 전체**에서 찾는다. 예전에는 마켓 1 목록만
 * 훑어서 윔 스토어나 수부지·피부탄력 화면에서 찜한 상품이 저장은 되면서도
 * 이 화면에 나타나지 않았다.
 */

/** 상단 고정 헤더 높이 */
const HEADER_HEIGHT = 129;
const TAB_BAR_HEIGHT = 96;

/** Figma 격자 규격: 2열, 카드 167x272 */
const GRID = { left: [22, 206], top: 231, rowGap: 294 };

export default function WishlistScreen() {
  const t = useT();
  const navigate = useNavigate();
  const keys = useWishlistStore((s) => s.keys);
  const removeMany = useWishlistStore((s) => s.removeMany);
  /** 개별 선택된 상품 키 목록 (전체 선택은 이 목록이 전부 찬 상태로 표현한다) */
  const [selectedKeys, setSelectedKeys] = useState([]);

  /**
   * 찜한 상품을 스토어 구분 없이 찾아 2열로 재배치한다.
   * 찜한 순서(keys 순서)를 그대로 유지해 방금 담은 상품이 뒤에 붙는다.
   * (Figma 는 6개 고정 좌표였지만, 실제로는 개수가 변하므로 격자로 계산한다)
   */
  const products = useMemo(
    () =>
      keys
        .map((key) => findProductByKey(key))
        .filter(Boolean)
        .map((product, i) => ({
          ...product,
          left: GRID.left[i % 2],
          top: GRID.top + Math.floor(i / 2) * GRID.rowGap,
        })),
    [keys],
  );

  const rows = Math.ceil(products.length / 2);
  /** 마지막 카드 아래로 24px 여유를 둔 콘텐츠 끝 */
  const contentBottom = Math.max(GRID.top + rows * GRID.rowGap + 24, 852);

  /**
   * 찜 목록에서 상품이 사라지면(찜 해제) 선택 목록에서도 빼 준다.
   * 없는 상품이 선택된 채로 남아 "선택삭제" 개수가 어긋나는 걸 막는다.
   */
  const visibleKeys = products.map(productKey);
  const activeSelected = selectedKeys.filter((k) => visibleKeys.includes(k));

  const allChecked = activeSelected.length > 0 && activeSelected.length === visibleKeys.length;
  const someChecked = activeSelected.length > 0 && !allChecked;

  /** 개별 선택 토글 */
  const toggleSelect = (product) => {
    const key = productKey(product);
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  /** 전체 선택 토글 — 하나라도 선택돼 있으면 전부 해제, 아니면 전부 선택 */
  const toggleAll = () => {
    setSelectedKeys(activeSelected.length > 0 ? [] : visibleKeys);
  };

  const deleteSelected = () => {
    if (activeSelected.length === 0) return;
    removeMany(products.filter((p) => activeSelected.includes(productKey(p))));
    setSelectedKeys([]);
  };

  return (
    <Screen
      className="bg-white"
      height={contentBottom + TAB_BAR_HEIGHT}
      nodeId="870:5089"
      name="마켓 - 찜"
      headerHeight={HEADER_HEIGHT}
      header={<MarketHeader onWish={() => navigate('/market/wishlist')} onCart={() => navigate('/market/cart')} />}
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={contentBottom}
    >
      {/* MY 찜 */}
      <div
        className="absolute left-[24px] top-[154px] flex h-[24px] w-[345px] items-center justify-between"
        data-node-id="870:5198"
      >
        <div className="relative flex shrink-0 flex-col items-start">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[20px] font-bold leading-[19.5px] text-text-strong [word-break:break-word]">
            {t.market.wishlist}
          </p>
        </div>
      </div>

      {/*
        도구 행. Figma 원문은 "전체" 와 "배송방법 변경" 을 한 텍스트에 넓은 공백으로 붙여
        간격이 밀려 있었다. 좌측 그룹(체크박스·전체·배송방법 변경)과 우측 선택삭제로 나눠
        같은 baseline 에 정렬한다.
      */}
      <div className="absolute left-[24px] top-[186px] flex h-[20px] w-[345px] items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked ? 'true' : someChecked ? 'mixed' : 'false'}
            aria-label={t.common.selectAll}
            onClick={toggleAll}
            className={`flex size-[13px] shrink-0 items-center justify-center rounded-[3px] border-[1.1px] border-solid border-tool-gray ${
              activeSelected.length > 0 ? 'bg-tool-gray' : 'bg-transparent'
            }`}
            data-node-id="870:5201"
          >
            {/* 전부 선택이면 체크, 일부만 선택이면 하이픈으로 구분한다 */}
            {allChecked ? (
              <svg viewBox="0 0 10 10" className="size-[8px]" aria-hidden>
                <path d="M1 5.2 3.6 7.8 9 2.4" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : someChecked ? (
              <svg viewBox="0 0 10 10" className="size-[8px]" aria-hidden>
                <path d="M2 5h6" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : null}
          </button>

          <span className="whitespace-nowrap font-sans text-[12px] font-medium leading-[19.5px] text-tool-gray">
            {t.filter.all}
          </span>

          <button type="button" className="ml-[12px] flex items-center gap-[6px]">
            <span className="whitespace-nowrap font-sans text-[12px] font-medium leading-[19.5px] text-tool-gray">
              {t.market.changeDelivery}
            </span>
            {/* Figma 는 아래 방향 셰브론을 90도 돌려 오른쪽 화살표로 쓴다 */}
            <span className="relative block h-[10px] w-[5px]" data-node-id="870:5204">
              <span
                className="absolute left-1/2 top-1/2 block"
                style={{ width: 13.18, height: 5.53, transform: 'translate(-50%, -50%) rotate(-90deg)' }}
              >
                <img alt="" src={chevronSmall} className="block size-full max-w-none" />
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={deleteSelected}
          disabled={activeSelected.length === 0}
          className={`whitespace-nowrap font-sans text-[12px] font-medium leading-[19.5px] transition-colors ${
            activeSelected.length > 0 ? 'text-ink' : 'text-tool-gray opacity-60'
          }`}
          data-node-id="870:5203"
        >
          {t.market.selectDelete}
          {activeSelected.length > 0 ? ` (${activeSelected.length})` : ''}
        </button>
      </div>

      {products.length ? (
        products.map((product) => (
          <PostCard
            key={productKey(product)}
            product={product}
            selectable
            selected={activeSelected.includes(productKey(product))}
            onToggleSelect={toggleSelect}
            onOpen={(p) => navigate(`/market/product/${encodeURIComponent(productKey(p))}`)}
          />
        ))
      ) : (
        <p className="absolute left-0 top-[380px] w-[393px] text-center font-sans text-[13px] font-normal leading-[20px] text-body">
          {t.market.emptyWishlist}
        </p>
      )}
    </Screen>
  );
}
