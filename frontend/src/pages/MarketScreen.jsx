import { useMemo } from 'react';
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

/** 필터 행의 각 드롭다운이 여는 바텀시트. 번역되는 라벨이 아니라 안정적인 key 로 찾는다. */
const FILTER_ROUTE_BY_KEY = {
  gender: '/market/filter/gender',
  age: '/market/filter/age',
  diagnosis: '/market/filter/diagnosis',
};

/**
 * 상단 고정 헤더 높이.
 * 솔루션을 받은 뒤 홈 헤더(루틴 헤더 870:3773)와 같은 157 로 맞춘다.
 * Figma 마켓 헤더(870:5080)는 129 였는데, 홈에서 마켓으로 넘어갈 때 상단바가
 * 줄어들어 화면이 튀었다. 마켓에는 요일 스트립이 없어 아래쪽이 빈 배경으로 남는데,
 * 그 공백은 의도한 것이다(높이를 맞추는 쪽이 전환이 자연스럽다).
 */
const MARKET_HEADER_HEIGHT = 157;
/** Figma 원본(129) 대비 늘어난 만큼 — 아래 블록 좌표에 더한다 */
const HEADER_GROWTH = MARKET_HEADER_HEIGHT - 129;
/** 하단 고정 탭바 높이 */
const TAB_BAR_HEIGHT = 96;

/**
 * 스토어 전환 토글이 놓이는 y — 상단 고정 헤더(129) 바로 아래, 제목 위.
 * 어느 스토어를 보고 있는지가 화면에서 가장 먼저 읽혀야 해서 맨 위로 올렸다.
 */
const TOGGLE_TOP = 145 + HEADER_GROWTH;
/**
 * 토글이 차지하는 높이(56) + 아래 여백 — 제목 이하 모든 요소를 이만큼 밀어낸다.
 * 헤더가 129 → 157 로 커진 만큼(HEADER_GROWTH)도 함께 더한다.
 * (TOGGLE_TOP 은 자기 좌표에 이미 HEADER_GROWTH 를 갖고 있어 중복으로 더하지 않는다)
 */
const CONTENT_SHIFT = 68 + HEADER_GROWTH;

/**
 * 배너 설정의 y 좌표를 한꺼번에 내린다.
 * 배너는 프레임·상품명·가격·태그가 각각 Figma 실측 절대 좌표라
 * 토글이 위로 들어온 만큼 전부 같이 밀어야 어긋나지 않는다.
 */
function shiftBanner(banner, dy) {
  return {
    ...banner,
    frame: [banner.frame[0], banner.frame[1] + dy, banner.frame[2], banner.frame[3]],
    nameAt: [banner.nameAt[0], banner.nameAt[1] + dy],
    priceAt: [banner.priceAt[0], banner.priceAt[1] + dy],
    tags: banner.tags.map((slot) => ({ ...slot, y: slot.y + dy })),
  };
}

export default function MarketScreen({ variant = 'all' }) {
  const navigate = useNavigate();
  const t = useT();
  const config = MARKET_SCREENS[variant];
  const hasCaptureToday = useCareStore((s) => s.hasCaptureToday);

  const isWim = config.store === 'wim';

  /**
   * 촬영·자가진단 전이면 추천 배너에 다른 상품이 올라간다.
   * 화면 구성 자체는 촬영 여부와 무관하게 같다 — 오프라인 정밀진단·시술 데이터만으로도
   * 추천·판매가 되므로 마켓을 잠글 이유가 없다. 달라지는 건 추천 근거뿐이다.
   */
  const beforeSolution = !hasCaptureToday;
  const bannerSlides = beforeSolution
    ? (config.preSolutionSlides ?? config.bannerSlides)
    : config.bannerSlides;

  /** 토글이 위로 들어온 만큼 배너 좌표를 전부 내린다 */
  const banner = useMemo(() => {
    const shifted = shiftBanner(config.banner, CONTENT_SHIFT);
    const first = bannerSlides[0];
    // 배너의 대표 이미지·이름·가격은 첫 슬라이드와 맞춰 둔다 (슬라이드가 교체됐을 수 있다)
    return first
      ? { ...shifted, image: first.image, imageInner: first.imageInner, name: first.name, price: first.price }
      : shifted;
  }, [config.banner, bannerSlides]);

  const openDetail = (product) =>
    navigate(`/market/product/${encodeURIComponent(productKey(product))}`);

  return (
    <Screen
      className="bg-white"
      height={config.frameHeight + CONTENT_SHIFT}
      nodeId={config.nodeId}
      name={config.name}
      headerHeight={MARKET_HEADER_HEIGHT}
      header={
        <MarketHeader
          height={MARKET_HEADER_HEIGHT}
          showHeart={config.showHeart}
          onWish={() => navigate('/market/wishlist')}
          onCart={() => navigate('/market/cart')}
        />
      }
      tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={config.tabBarTop + CONTENT_SHIFT}
    >
      {/* 스토어 전환 토글 — 상단바 바로 아래, 제목 위 */}
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

      {/* 제목 */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: config.title.x,
          top: config.title.y + CONTENT_SHIFT,
          width: config.title.width,
          height: config.title.height,
        }}
      >
        <div className="relative flex shrink-0 flex-col items-start">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[20px] font-bold leading-[19.5px] text-text-strong [word-break:break-word]">
            {beforeSolution ? t.market.recommendationPre : t.market.recommendation}
          </p>
        </div>
      </div>

      {/* 맞춤 추천 배너 */}
      <FeaturedBanner banner={banner} slides={bannerSlides} onOpen={openDetail} />

      {/*
        카테고리 탭.
        윔 스토어에는 수부지·피부탄력 카테고리 라우트가 없다. 예전에는 그 탭을 누르면
        피쓰 서울 화면으로 튕겨 나가 스토어가 바뀌어 버렸다. 그래서 윔에서는 두 탭을
        스태틱(누를 수 없음)으로 두고 '전체'만 남긴다.
      */}
      <div
        className="absolute"
        style={{ left: config.tabs.x, top: config.tabs.y + CONTENT_SHIFT, width: config.tabs.width }}
      >
        <CategoryTabs
          value={config.category}
          staticKeys={isWim ? ['all', 'oily', 'skin'] : undefined}
          onChange={(next) => navigate(ROUTE_BY_CATEGORY[next])}
        />
      </div>

      <FilterRow
        top={config.filters.top + CONTENT_SHIFT}
        items={config.filters.items}
        onOpen={(item) => navigate(FILTER_ROUTE_BY_KEY[item.key])}
      />

      {/* 상품 카드 — 촬영 여부와 무관하게 항상 보여준다 */}
      {config.products.map((product) => (
        <PostCard
          key={product.nodeId}
          product={{ ...product, top: product.top + CONTENT_SHIFT }}
          onOpen={openDetail}
        />
      ))}
    </Screen>
  );
}
