import { useT } from '@/i18n';
import StatusBar from '@/components/layout/StatusBar';
import outlineHeartIcon from '@/assets/figma/market-heart-outline.svg';
import cartIcon from '@/assets/figma/market-cart-icon.svg';

/**
 * 마켓 상단 헤더 (Figma `Group 4` 870:5079).
 *  - 배경 #16161a, 높이 129
 *  - 상태바 366x44 (흰 톤, 컴포넌트 인스턴스라 노치 없음)
 *
 * 상태바·로고 줄·우측 아이콘 줄은 **루틴 헤더(870:3773) 규격에 맞춘다.**
 * 홈에서 마켓으로 넘어갈 때 로고와 아이콘이 튀지 않아야 해서다.
 * 예전에는 상태바를 pl-13 pt-7 로 밀고 로고를 (20,23)에 절대배치 + 고정 h-13/w-123,
 * 아이콘을 left 307 / 343.97 에 박아 둬서 홈 헤더와 어긋났다
 * (로고 left 25 vs 20 / top 79 vs 48, 아이콘 우측 끝 363.97 vs 373).
 *
 * 아이콘 자체(찜·장바구니)는 홈의 언어·마이페이지와 기능이 전혀 달라 그대로 둔다.
 * 바꾸는 건 위치와 정렬뿐이다.
 */
/**
 * @param {number} height 헤더 높이. 기본 157 — 솔루션을 받은 뒤 홈 헤더와 같은 값이다.
 *   마켓에는 요일 스트립이 없어 로고 줄 아래가 빈 배경으로 남는데, 화면을 옮길 때
 *   상단바가 줄어드는 것보다 그 공백이 낫다고 판단해 높이를 맞췄다.
 */
export default function MarketHeader({ showHeart = false, onWish, onCart, height = 157 }) {
  const t = useT();
  return (
    <div
      className="relative flex w-[393px] flex-col items-start overflow-clip bg-header-dark"
      style={{ height }}
      data-node-id="870:5080"
      data-name="Container"
    >
      {/* 상태바는 프레임 전체 폭 — 내부 시간·신호 아이콘이 기준 헤더와 같은 x 에 온다 */}
      <div className="relative h-[44px] w-full shrink-0" data-node-id="870:5081">
        <StatusBar tone="white" className="absolute left-0 top-0 h-[44px] w-[393px]" />
      </div>

      <div
        className="relative flex w-full shrink-0 items-center justify-between px-[20px] pb-[16px] pt-[4px]"
        data-node-id="870:5083"
      >
        <div className="relative flex shrink-0 flex-col items-start">
          <p className="relative shrink-0 whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[20px] text-white [word-break:break-word]">
            InnerDerma
          </p>
        </div>

        {/*
          우측 아이콘 그룹 — 홈 헤더의 아이콘 그룹(52x19, justify-between)과 같은 규격.
          아이콘 원본 비율이 서로 달라(찜 19.945x17.966 / 장바구니 20x20) 세로 중심이
          어긋나므로, 같은 크기의 정렬 상자 안에 넣고 object-contain 으로 담는다.
        */}
        <div className="relative flex h-[19px] w-[52px] shrink-0 items-center justify-between">
          <button
            type="button"
            aria-label={t.market.wishlistAria}
            onClick={onWish}
            className="flex size-[21px] items-center justify-center"
            data-name="Vector"
          >
            <img alt="" src={outlineHeartIcon} className="block h-[17.97px] w-[19.94px] max-w-none object-contain" />
          </button>

          <button
            type="button"
            aria-label={t.common.cart}
            onClick={onCart}
            className="flex size-[19px] items-center justify-center"
            data-name="Vector"
          >
            <img alt="" src={cartIcon} className="block size-[20px] max-w-none object-contain" />
          </button>
        </div>
      </div>

      {/*
        마켓 2·3 에는 `boxicons:heart` 프레임(24x24 @ 283,20)이 있지만
        Figma 에서 자식이 없는 빈 프레임이라 아무것도 그려지지 않는다.
        실측(프레임 렌더)으로 확인했으므로 아이콘을 임의로 채우지 않는다.
      */}
      {showHeart ? <div className="absolute left-[283px] top-[64px] size-[24px]" data-name="boxicons:heart" /> : null}
    </div>
  );
}
