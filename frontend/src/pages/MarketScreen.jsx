import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import TabBar from '@/components/layout/TabBar';
import MarketHeader from '@/components/market/MarketHeader';
import CategoryTabs from '@/components/market/CategoryTabs';
import FilterRow from '@/components/market/FilterRow';
import FeaturedBanner from '@/components/market/FeaturedBanner';
import PostCard from '@/components/market/PostCard';
import StoreToggle from '@/components/market/StoreToggle';
import { MARKET_SCREENS } from '@/constants/marketScreens';
import { productKey } from '@/store/wishlistStore';
import { useCareStore } from '@/store/careStore';

/**
 * 마켓 화면.
 *  - 피쓰 서울 : Figma 마켓 1 / 2 / 3 (카테고리 전체 · 수부지 · 피부탄력)
 *  - 윔 스토어 : Figma 마켓 4 (좌표·카드 규격은 마켓 1 과 동일하게 통일)
 *
 * 두 스토어는 같은 레이아웃을 공유하고 `variant` 로 콘텐츠만 바뀐다.
 * 그래서 스토어 전환 토글이 항상 같은 자리(y=536)에 있고, 전환해도 배너·탭·카드가
 * 제자리에서 내용만 교체된다.
 *
 * 솔루션을 아직 받지 않았으면(최초 접속) 두 스토어 모두 맞춤 추천 배너 자리를
 * 회색 스태틱으로 대체하고 상품 목록을 감춘다. 추천은 촬영·분석 결과물이라
 * 그 전에는 보여줄 근거가 없다.
 */
const ROUTE_BY_CATEGORY = { all: '/market', oily: '/market/oily', skin: '/market/elasticity' };

/** 필터 행의 각 드롭다운이 여는 바텀시트 */
const FILTER_ROUTE_BY_LABEL = {
  성별: '/market/filter/gender',
  나이대: '/market/filter/age',
  '맞춤형 진단': '/market/filter/diagnosis',
};

/** 상단 고정 헤더 높이 (Figma Container 870:5080) */
const MARKET_HEADER_HEIGHT = 129;
/** 하단 고정 탭바 높이 */
const TAB_BAR_HEIGHT = 96;

/** 스토어 전환 토글이 놓이는 y (배너 아래 · 카테고리 탭 위) */
const TOGGLE_TOP = 536;
/** 토글이 차지하는 높이(56) + 위아래 여백 — 아래 요소를 이만큼 밀어낸다 */
const TOGGLE_BLOCK = 68;

export default function MarketScreen({ variant = 'all' }) {
  const navigate = useNavigate();
  const t = useT();
  const config = MARKET_SCREENS[variant];
  const hasCaptureToday = useCareStore((s) => s.hasCaptureToday);

  /** 솔루션 미수신(최초 접속) — 추천 영역을 회색 스태틱으로 대체한다 */
  const noSolution = !hasCaptureToday;
  const isWim = config.store === 'wim';

  const openDetail = (product) =>
    navigate(`/market/product/${encodeURIComponent(productKey(product))}`);

  return (
    <Screen
      className="bg-white"
      height={config.frameHeight + TOGGLE_BLOCK}
      nodeId={config.nodeId}
      name={config.name}
      headerHeight={MARKET_HEADER_HEIGHT}
      header={
        <MarketHeader
          showHeart={config.showHeart}
          onWish={() => navigate('/market/wishlist')}
          onCart={() => navigate('/market/cart')}
        />
      }
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={config.tabBarTop + TOGGLE_BLOCK}
    >
      {/* 제목 */}
      <div
        className="absolute flex items-center justify-between"
        style={{ left: config.title.x, top: config.title.y, width: config.title.width, height: config.title.height }}
      >
        <div className="relative flex shrink-0 flex-col items-start">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[20px] font-bold leading-[19.5px] text-text-strong [word-break:break-word]">
            {t.market.recommendation}
          </p>
        </div>
      </div>

      {/* 맞춤 추천 배너 — 솔루션 전에는 회색 스태틱 */}
      {noSolution ? (
        <div
          className="absolute flex flex-col items-center justify-center rounded-[15px] bg-gray-static"
          style={{
            left: config.banner.frame[0],
            top: config.banner.frame[1],
            width: config.banner.frame[2],
            height: config.banner.frame[3],
          }}
          data-name="NoSolutionBanner"
        >
          <p className="text-center font-sans text-[14px] font-medium leading-[21px] text-body">
            촬영 후 맞춤 진단 상품을 추천해 드려요
          </p>
        </div>
      ) : (
        <FeaturedBanner banner={config.banner} slides={config.bannerSlides} onOpen={openDetail} />
      )}

      {/* 스토어 전환 토글 — 피쓰 서울 / 윔 스토어 모두 같은 자리 */}
      <div
        className="absolute flex w-[393px] items-center justify-center"
        style={{ left: 0, top: TOGGLE_TOP }}
        data-name="StoreToggleContainer"
      >
        <StoreToggle
          wim={isWim}
          onChange={(next) => navigate(next ? '/market/wim' : '/market')}
        />
      </div>

      {/* 카테고리 탭 — 윔 스토어는 카테고리 라우트가 없어 피쓰 서울로 넘긴다 */}
      <div
        className="absolute"
        style={{ left: config.tabs.x, top: config.tabs.y + TOGGLE_BLOCK, width: config.tabs.width }}
      >
        <CategoryTabs value={config.category} onChange={(next) => navigate(ROUTE_BY_CATEGORY[next])} />
      </div>

      <FilterRow
        top={config.filters.top + TOGGLE_BLOCK}
        items={config.filters.items}
        onOpen={(item) => navigate(FILTER_ROUTE_BY_LABEL[item.label])}
      />

      {/* 상품 카드 — 솔루션 전에는 추천 근거가 없어 감춘다 */}
      {noSolution ? (
        <p
          className="absolute left-0 w-[393px] text-center font-sans text-[13px] font-normal leading-[20px] text-body"
          style={{ top: 700 + TOGGLE_BLOCK }}
          data-name="NoSolutionProducts"
        >
          촬영을 마치면 진단 결과에 맞는 상품을 보여드려요
        </p>
      ) : (
        config.products.map((product) => (
          <PostCard
            key={product.nodeId}
            product={{ ...product, top: product.top + TOGGLE_BLOCK }}
            onOpen={openDetail}
          />
        ))
      )}
    </Screen>
  );
}
