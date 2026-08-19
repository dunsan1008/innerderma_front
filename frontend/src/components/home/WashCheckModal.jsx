import { useT } from '@/i18n';
/**
 * 촬영 확인 모달 (Figma 870:3565 "촬영 버튼 클릭 시 항상 등장").
 * 프레임 전체가 딤 배경(rgba(0,0,0,0.7)) + 흰 다이얼로그 327x185 로 구성된다.
 * 배치는 px-33 / pt-330 / pb-318 플렉스 그대로.
 *
 * 기획서 촬영 정책(귀가 후 세안 뒤 촬영)을 지키게 하는 확인 단계라 촬영 버튼을 누르면 항상 뜬다.
 *
 * 다이얼로그 밖(딤 영역)을 누르면 닫힌다.
 */
export default function WashCheckModal({ onConfirm, onDismiss, entered = true }) {
  const t = useT();
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-start px-[33px] pb-[318px] pt-[330px]"
      role="dialog"
      aria-modal="true"
      aria-label={t.washCheck.ariaLabel}
      data-node-id="870:3565"
      data-name="촬영 버튼 클릭 시 항상 등장"
    >
      {/* 다이얼로그 밖을 누르면 닫힌다 */}
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onDismiss}
        data-testid="washcheck-backdrop"
        className={`absolute inset-0 bg-overlay transition-opacity duration-200 ease-out ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`relative h-[185px] w-[327px] shrink-0 rounded-[14px] bg-white transition-[transform,opacity] duration-200 ease-out ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        data-node-id="870:3566"
      >
        {/*
          질문 두 줄 — Figma 는 y37 / y65 로 붙여 두고(줄 간격 4) 버튼 앞에 19px 을 비운다.
          이전에는 y30 / y80 이라 두 줄이 벌어지고 둘째 줄이 버튼에 붙어 보였다.
          긴 문장은 어절 단위로만 끊기게 keep-all 을 쓴다(break-words 는 글자 중간에서 잘린다).
        */}
        <p
          className="absolute left-[163.5px] top-[37px] w-[287px] -translate-x-1/2 whitespace-pre-line text-center font-sans text-[16px] font-medium leading-[24px] text-ink [word-break:keep-all]"
          data-node-id="870:3567"
        >
          {t.washCheck.question}
        </p>
        <p
          className="absolute left-[163.5px] top-[65px] w-[287px] -translate-x-1/2 text-center font-sans text-[16px] font-medium leading-[24px] text-ink [word-break:keep-all]"
          data-node-id="870:3568"
        >
          {t.washCheck.subQuestion}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="absolute left-[55px] top-[108px] h-[34px] w-[217px] rounded-[14px] bg-ink"
          data-node-id="870:3569"
          data-name="Button"
        >
          <span
            className="absolute left-[108.5px] top-[5px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[14px] font-semibold leading-[24px] text-white [word-break:break-word]"
            data-node-id="870:3570"
          >
            {t.washCheck.done}
          </span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="absolute left-[136px] top-[168px] flex h-[20px] w-[55px] -translate-y-full flex-col justify-end font-sans text-[11px] font-normal leading-[0] text-body [word-break:break-word]"
          data-node-id="870:3571"
        >
          <span className="leading-[25px] underline decoration-solid [text-underline-position:from-font]">
            {t.washCheck.notYet}
          </span>
        </button>
      </div>
    </div>
  );
}
