import { useT } from '@/i18n';
/**
 * 촬영 확인 모달 (Figma 870:3565 "촬영 버튼 클릭 시 항상 등장").
 * 프레임 전체가 딤 배경(rgba(0,0,0,0.7)) + 흰 다이얼로그 327 폭으로 구성된다.
 *
 * 기획서 촬영 정책(귀가 후 세안 뒤 촬영)을 지키게 하는 확인 단계라 촬영 버튼을 누르면 항상 뜬다.
 *
 * 다이얼로그 밖(딤 영역)을 누르면 닫힌다.
 *
 * ── 높이는 내용에 따라 늘어난다 ──
 * 예전에는 다이얼로그를 185 고정 높이로 두고 자식을 y 37 / 65 / 108 / 168 에 절대배치했다.
 * 한국어 한 줄짜리 문장에는 맞았지만, 영어처럼 문장이 두 줄이 되면(en 의 question 은
 * 줄바꿈이 들어 있다) 첫 문장이 아래 문장과 버튼을 덮어 글자가 겹치고 밀렸다.
 *
 * 그래서 세로 흐름 배치로 바꿨다. Figma 실측값은 패딩·간격으로 옮겨 담아
 * 한국어 한 줄 상태에서는 예전과 똑같은 좌표가 나온다:
 *   pt 37 + 문장 24 + 간격 4 + 문장 24 + 간격 19 + 버튼 34 + 간격 6 + 링크 20 + pb 17 = 185
 * 문장이 늘어나면 그만큼 다이얼로그가 아래로 자란다.
 */
export default function WashCheckModal({ onConfirm, onDismiss, entered = true }) {
  const t = useT();
  return (
    <div
      /*
        다이얼로그를 Figma 와 같은 y(330) 에서 시작시키고, 길어지면 아래로 자라게 둔다.
        (딤 영역은 inset-0 이라 배경은 그대로 화면을 덮는다)
      */
      className="absolute inset-0 z-30 flex flex-col items-start px-[33px] pt-[330px]"
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
        className={`relative flex w-[327px] shrink-0 flex-col items-center rounded-[14px] bg-white pb-[17px] pt-[37px] transition-[transform,opacity] duration-200 ease-out ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        data-node-id="870:3566"
        data-testid="washcheck-dialog"
      >
        {/*
          질문 두 줄 — Figma 는 y37 / y65 로 붙여 두고(줄 간격 4) 버튼 앞에 19px 을 비운다.
          긴 문장은 어절 단위로만 끊기게 keep-all 을 쓴다(break-words 는 글자 중간에서 잘린다).
        */}
        <p
          className="w-[287px] whitespace-pre-line text-center font-sans text-[16px] font-medium leading-[24px] text-ink [word-break:keep-all]"
          data-node-id="870:3567"
        >
          {t.washCheck.question}
        </p>
        <p
          className="mt-[4px] w-[287px] whitespace-pre-line text-center font-sans text-[16px] font-medium leading-[24px] text-ink [word-break:keep-all]"
          data-node-id="870:3568"
        >
          {t.washCheck.subQuestion}
        </p>

        {/*
          버튼도 글자에 따라 높아진다 — 라벨이 길어지면 217 폭 안에서 줄바꿈된다.
          py 5 + leading 24 = 34 라 한 줄일 때 Figma 높이와 같다.
        */}
        <button
          type="button"
          onClick={onConfirm}
          className="mt-[19px] w-[217px] shrink-0 rounded-[14px] bg-ink px-[10px] py-[5px]"
          data-node-id="870:3569"
          data-name="Button"
        >
          <span
            className="block text-center font-sans text-[14px] font-semibold leading-[24px] text-white [word-break:keep-all]"
            data-node-id="870:3570"
          >
            {t.washCheck.done}
          </span>
        </button>

        {/*
          "아직 아니에요" 링크 — 폭을 고정하지 않는다.
          예전엔 w-55 로 박아 둬서 번역문이 길면 글자가 칩을 넘쳤다.
        */}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-[6px] flex h-[20px] w-fit max-w-[287px] shrink-0 flex-col justify-end font-sans text-[11px] font-normal leading-[0] text-body [word-break:keep-all]"
          data-node-id="870:3571"
        >
          <span className="text-center leading-[25px] underline decoration-solid [text-underline-position:from-font]">
            {t.washCheck.notYet}
          </span>
        </button>
      </div>
    </div>
  );
}
