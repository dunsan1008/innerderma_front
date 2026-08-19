import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DeviceFrame from '@/components/layout/DeviceFrame';
import AppModals from '@/components/layout/AppModals';
import SplashScreen from '@/pages/SplashScreen';
import SignupScreen from '@/pages/SignupScreen';
import ConnectingScreen from '@/pages/ConnectingScreen';
import ConnectedScreen from '@/pages/ConnectedScreen';
import HomeFirstVisitScreen from '@/pages/HomeFirstVisitScreen';
import HomeRoute from '@/pages/HomeRoute';
import CameraScreen from '@/pages/CameraScreen';
import SolutionSummaryScreen from '@/pages/SolutionSummaryScreen';
import RoutineScreen from '@/pages/RoutineScreen';
import MyPageScreen from '@/pages/MyPageScreen';
import MarketScreen from '@/pages/MarketScreen';
import WishlistScreen from '@/pages/WishlistScreen';
import FilterScreen from '@/pages/FilterScreen';
import SelfCheckScreen from '@/pages/SelfCheckScreen';
import SolutionLoadingScreen from '@/pages/SolutionLoadingScreen';
import CartScreen from '@/pages/CartScreen';
import ProductDetailScreen from '@/pages/ProductDetailScreen';

/**
 * 라우트는 Figma mcp_frontend 페이지의 플로우 배치 순서를 따른다.
 * 첫 화면 → 가입 → 방문기록 연결(로딩) → 연결 완료 → 홈 → (세안 확인 모달) → 카메라 → 솔루션
 *
 * 캘린더와 세안 확인은 화면 전환이 아니라 오버레이라서 라우트가 없다(AppModals + uiStore).
 */
export default function App() {
  return (
    <BrowserRouter>
      <DeviceFrame>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/connecting" element={<ConnectingScreen />} />
          <Route path="/connected" element={<ConnectedScreen />} />
          <Route path="/home" element={<HomeRoute />} />
          {/* 검증용: 최초 접속 홈화면(촬영 기록 없는 상태)을 직접 확인하는 경로 */}
          <Route path="/home/first-visit" element={<HomeFirstVisitScreen />} />
          <Route path="/camera" element={<CameraScreen />} />
          <Route path="/solution-summary" element={<SolutionSummaryScreen />} />
          {/*
            night / morning 을 한 라우트로 묶는다.
            라우트를 나누면 사이클을 오갈 때 화면이 매번 리마운트돼서
            세그먼트 선택 표시가 미끄러지지 않고 툭 튄다.
          */}
          <Route path="/solution/:cycle" element={<RoutineScreen />} />
          {/* 데일리 자가 진단 → 솔루션 도출 로딩 → 솔루션 요약 */}
          <Route path="/self-check" element={<SelfCheckScreen />} />
          <Route path="/solution-loading" element={<SolutionLoadingScreen />} />
          <Route path="/mypage" element={<MyPageScreen />} />
          <Route path="/market" element={<MarketScreen variant="all" />} />
          <Route path="/market/oily" element={<MarketScreen variant="oily" />} />
          <Route path="/market/elasticity" element={<MarketScreen variant="skin" />} />
          {/* 윔 스토어 — 마켓 4. 레이아웃은 마켓 1 과 동일하고 상품만 다르다 */}
          <Route path="/market/wim" element={<MarketScreen variant="wim" />} />
          <Route path="/market/wishlist" element={<WishlistScreen />} />
          <Route path="/market/cart" element={<CartScreen />} />
          {/* 상세는 더미 상품 1종이라 id 없이도 열리게 둔다 */}
          <Route path="/market/product" element={<ProductDetailScreen />} />
          <Route path="/market/product/:id" element={<ProductDetailScreen />} />
          <Route path="/market/filter/gender" element={<FilterScreen variant="gender" />} />
          <Route path="/market/filter/age" element={<FilterScreen variant="age" />} />
          <Route path="/market/filter/diagnosis" element={<FilterScreen variant="diagnosis" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AppModals />
      </DeviceFrame>
    </BrowserRouter>
  );
}
