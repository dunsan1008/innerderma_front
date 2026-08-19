import { useT } from '@/i18n';
import StatusBar from '@/components/layout/StatusBar';
import outlineHeartIcon from '@/assets/figma/market-heart-outline.svg';
import cartIcon from '@/assets/figma/market-cart-icon.svg';

/**
 * 마켓 상단 헤더 (Figma `Group 4` 870:5079).
 *  - 배경 #16161a, 높이 129
 *  - pl-13 pt-7 안에 상태바(366x44, 흰 톤, 컴포넌트 인스턴스라 노치 없음)
 *  - 로고: (20, 23) 기준 pl-5 pr-20 pt-5 → pr-100
 *  - 우측 아이콘: 카트 19.945x17.966 @ (307, 28.98), 검색 20x20 @ (343.97, 28)
 *  - 마켓 2·3·찜 화면에는 boxicons:heart 24x24 @ (283, 20) 가 하나 더 붙는다
 */
export default function MarketHeader({ showHeart = false, onWish, onCart }) {
  const t = useT();
  return (
    <div
      className="relative flex h-[129px] w-[393px] flex-col items-start overflow-clip bg-header-dark"
      data-node-id="870:5080"
      data-name="Container"
    >
      <div className="relative flex shrink-0 flex-col items-start pl-[13px] pt-[7px]" data-node-id="870:5081">
        <StatusBar tone="white" className="relative h-[44px] w-[366px] shrink-0" />
      </div>

      <div className="relative h-[60px] w-full shrink-0" data-node-id="870:5083">
        <div className="absolute left-[20px] top-[23px] flex items-center justify-center pl-[5px] pr-[20px] pt-[5px]">
          <div className="relative flex shrink-0 items-center justify-center pr-[100px]">
            <p className="relative h-[13px] w-[123px] shrink-0 font-logo text-[20px] font-bold not-italic leading-[16.5px] text-white [word-break:break-word]">
              InnerDerma
            </p>
          </div>
        </div>

        {/*
          마켓 2·3 에는 `boxicons:heart` 프레임(24x24 @ 283,20)이 있지만
          Figma 에서 자식이 없는 빈 프레임이라 아무것도 그려지지 않는다.
          실측(프레임 렌더)으로 확인했으므로 아이콘을 임의로 채우지 않는다.
        */}
        {showHeart ? <div className="absolute left-[283px] top-[20px] size-[24px]" data-name="boxicons:heart" /> : null}

        <button
          type="button"
          aria-label={t.market.wishlistAria}
          onClick={onWish}
          className="absolute"
          style={{ left: 307, top: 28.983642578125, width: 19.94499969482422, height: 17.966428756713867 }}
          data-name="Vector"
        >
          <img alt="" src={outlineHeartIcon} className="absolute inset-0 block size-full max-w-none" />
        </button>

        <button
          type="button"
          aria-label={t.common.cart}
          onClick={onCart}
          className="absolute left-[343.97px] top-[28px] size-[20px]"
          data-name="Vector"
        >
          <img alt="" src={cartIcon} className="absolute inset-0 block size-full max-w-none" />
        </button>
      </div>
    </div>
  );
}
