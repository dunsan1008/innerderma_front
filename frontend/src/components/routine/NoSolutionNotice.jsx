import { useT } from '@/i18n';
/**
 * 아직 오지 않은 날짜를 골랐을 때 솔루션 자리에 대신 보여주는 안내.
 *
 * 솔루션은 그날 촬영·분석이 끝난 뒤 만들어지므로 미래 날짜에는 내용이 없다.
 * 카드 모양은 최초 접속 홈화면의 자리표시 카드(Figma 870:3634)와 같은 규격을 따른다.
 * (radius 16 / bg #fbfbfb / 좌우 20 여백)
 *
 * @param {string} label 사람이 읽는 날짜 (예: '8월 20일 목요일')
 */
export default function NoSolutionNotice({ label }) {
  const t = useT();
  return (
    <div className="flex w-full flex-col items-start px-[20px] pt-[24px]" data-name="NoSolutionNotice">
      <div className="relative flex w-full shrink-0 flex-col items-center rounded-[16px] bg-placeholder px-[24px] pb-[32px] pt-[36px]">
        {/* 달력 위에 물음표를 얹은 단순한 표식 — 별도 에셋 없이 그린다 */}
        <div
          className="relative flex size-[56px] shrink-0 items-center justify-center rounded-[18px] border border-solid border-line bg-white"
          aria-hidden="true"
        >
          <span className="font-sans text-[24px] font-bold leading-[24px] text-disabled-text">?</span>
        </div>

        <p className="relative mt-[20px] shrink-0 whitespace-nowrap text-center font-sans text-[16px] font-bold leading-[24px] text-text-strong [word-break:break-word]">
          {t.noSolution.title}
        </p>

        {label ? (
          <p className="relative mt-[6px] shrink-0 whitespace-nowrap text-center font-sans text-[13px] font-semibold leading-[19.5px] text-body [word-break:break-word]">
            {label}
          </p>
        ) : null}

        {/* 언어마다 줄 수가 달라질 수 있어 사전의 개행을 그대로 렌더한다 */}
        <p className="relative mt-[12px] w-full shrink-0 whitespace-pre-line break-words text-center font-sans text-[13px] font-normal leading-[20px] text-label-sub">
          {t.noSolution.description}
        </p>
      </div>
    </div>
  );
}
