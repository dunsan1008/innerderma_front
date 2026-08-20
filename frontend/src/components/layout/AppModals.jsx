import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CalendarModal from '@/components/home/CalendarModal';
import WashCheckModal from '@/components/home/WashCheckModal';
import LanguageModal from '@/components/layout/LanguageModal';
import SkinAnalysisModal from '@/components/routine/SkinAnalysisModal';
import PurchaseModal from '@/components/market/PurchaseModal';
import { useUiStore } from '@/store/uiStore';
import { useCareStore } from '@/store/careStore';
import { useCartStore } from '@/store/cartStore';
import useMountTransition from '@/lib/useMountTransition';

/**
 * 화면 위에 겹치는 오버레이 모음.
 * 캘린더와 세안 확인은 라우팅이 아니라 상태로 열고 닫으므로
 * DeviceFrame 안쪽 최상단에 한 번만 올려 둔다.
 */
export default function AppModals() {
  const navigate = useNavigate();
  const location = useLocation();

  const calendarOpen = useUiStore((s) => s.calendarOpen);
  const closeCalendar = useUiStore((s) => s.closeCalendar);
  const washCheckOpen = useUiStore((s) => s.washCheckOpen);
  const closeWashCheck = useUiStore((s) => s.closeWashCheck);
  const langOpen = useUiStore((s) => s.langOpen);
  const closeLang = useUiStore((s) => s.closeLang);
  const lang = useUiStore((s) => s.lang);
  const setLang = useUiStore((s) => s.setLang);
  const skinAnalysisOpen = useUiStore((s) => s.skinAnalysisOpen);
  const closeSkinAnalysis = useUiStore((s) => s.closeSkinAnalysis);
  const purchaseStep = useUiStore((s) => s.purchaseStep);
  const setPurchaseDone = useUiStore((s) => s.setPurchaseDone);
  const closePurchaseModal = useUiStore((s) => s.closePurchaseModal);
  const [purchaseBusy, setPurchaseBusy] = useState(false);

  const selectedDate = useCareStore((s) => s.selectedDate);
  const setSelectedDate = useCareStore((s) => s.setSelectedDate);
  const phase = useCareStore((s) => s.phase);
  const hasCaptureToday = useCareStore((s) => s.hasCaptureToday);
  const completedDates = useCareStore((s) => s.completedDates);

  /** 최초접속(촬영 전) 상태에서는 캘린더에 아무 추가 표기도 하지 않는다 */
  const calendarCompletedDates = hasCaptureToday ? completedDates : [];

  /** 닫힘 애니메이션이 끝날 때까지 마운트를 유지한다 */
  const calendar = useMountTransition(calendarOpen, 280);
  const washCheck = useMountTransition(washCheckOpen, 200);
  const purchase = useMountTransition(purchaseStep !== null, 200);

  /**
   * 구매 확인 → 실제로는 결제·주문 API가 없으므로(장바구니 담기까지만 연동돼 있다),
   * "구매했습니다"로 안내하고 **선택했던 상품만** 장바구니에서 지우는 것으로 갈음한다
   * (장바구니 화면의 "선택삭제"와 같은 동작 — removeSelected가 로컬 반영과 서버
   * 동기화(productCode/source 있는 실제 상품만)를 함께 처리한다). 선택 안 한 상품은
   * 그대로 남아 있어야 한다 — 예전에는 clear()로 장바구니 전체를 비워서, 일부만
   * 선택해 구매해도 나머지 상품까지 사라지는 버그가 있었다.
   */
  const confirmPurchase = () => {
    setPurchaseBusy(true);
    useCartStore.getState().removeSelected();
    setPurchaseBusy(false);
    setPurchaseDone();
  };

  /**
   * 날짜를 고르면 그 날짜의 솔루션 화면으로 이동한다.
   * 단, 아직 촬영하지 않은(최초접속) 상태면 날짜만 바꾸고 화면은 유지한다.
   */
  const selectDate = (dateKey) => {
    setSelectedDate(dateKey);
    closeCalendar();

    // 최초접속 상태에서는 솔루션 화면으로 보내지 않는다
    if (!hasCaptureToday) return;

    const target = phase === 'morning' ? '/solution/morning' : '/solution/night';
    if (location.pathname !== target) navigate(target);
  };

  return (
    <>
      {calendar.mounted ? (
        <CalendarModal
          selectedDate={selectedDate}
          completedDates={calendarCompletedDates}
          entered={calendar.entered}
          onClose={closeCalendar}
          onSelectDate={selectDate}
        />
      ) : null}

      {washCheck.mounted ? (
        <WashCheckModal
          entered={washCheck.entered}
          onConfirm={() => {
            closeWashCheck();
            navigate('/camera');
          }}
          onDismiss={closeWashCheck}
        />
      ) : null}

      <LanguageModal open={langOpen} onClose={closeLang} current={lang} onSelect={setLang} />

      <SkinAnalysisModal open={skinAnalysisOpen} onClose={closeSkinAnalysis} />

      {purchase.mounted ? (
        <PurchaseModal
          step={purchaseStep}
          entered={purchase.entered}
          busy={purchaseBusy}
          onCancel={closePurchaseModal}
          onConfirm={confirmPurchase}
          onClose={closePurchaseModal}
        />
      ) : null}
    </>
  );
}
