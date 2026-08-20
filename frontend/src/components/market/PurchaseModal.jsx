import { useT, useWrapClass } from '@/i18n';

/**
 * 장바구니 구매 확인 / 완료 모달.
 * Figma에 정의된 화면이 아니라, `WashCheckModal`과 같은 톤(딤 배경 + 흰 다이얼로그 +
 * 진한 버튼)으로 새로 디자인했다. `step`으로 두 단계를 오간다:
 *  - 'confirm' : "구매하시겠습니까?" — 예/아니오
 *  - 'done'    : "구매했습니다!" — 확인
 *
 * 열림/닫힘은 부모(AppModals)가 `useMountTransition`으로 관리해 `entered`로 넘긴다.
 */
export default function PurchaseModal({ step, entered, busy = false, onCancel, onConfirm, onClose }) {
  const t = useT();
  const wrap = useWrapClass();
  const confirming = step === 'confirm';

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-[33px]"
      role="dialog"
      aria-modal="true"
      data-testid="purchase-modal"
    >
      <button
        type="button"
        aria-label={t.common.close}
        onClick={confirming ? onCancel : onClose}
        data-testid="purchase-modal-backdrop"
        className={`absolute inset-0 bg-overlay transition-opacity duration-200 ease-out ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`relative flex w-[327px] shrink-0 flex-col items-center rounded-[14px] bg-white px-[24px] pb-[17px] pt-[37px] transition-[transform,opacity] duration-200 ease-out ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        data-testid="purchase-modal-dialog"
      >
        <p className={`w-[279px] text-center font-sans text-[16px] font-medium leading-[24px] text-ink ${wrap}`}>
          {confirming ? t.cart.confirmPurchaseQuestion : t.cart.purchaseDoneMessage}
        </p>

        {confirming ? (
          <div className="mt-[19px] flex w-full shrink-0 items-center gap-[8px]">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="flex-1 rounded-[14px] border border-solid border-line bg-white px-[10px] py-[13px] disabled:opacity-50"
              data-testid="purchase-modal-no"
            >
              <span className="block text-center font-sans text-[14px] font-semibold leading-[20px] text-ink">
                {t.common.no}
              </span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="flex-1 rounded-[14px] bg-ink px-[10px] py-[13px] disabled:opacity-50"
              data-testid="purchase-modal-yes"
            >
              <span className="block text-center font-sans text-[14px] font-semibold leading-[20px] text-white">
                {t.common.yes}
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-[19px] w-[217px] shrink-0 rounded-[14px] bg-ink px-[10px] py-[5px]"
            data-testid="purchase-modal-ok"
          >
            <span className="block text-center font-sans text-[14px] font-semibold leading-[24px] text-white">
              {t.common.confirm}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
