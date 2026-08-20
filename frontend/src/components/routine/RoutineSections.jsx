import { useT, useWrapClass } from '@/i18n';
/**
 * 루틴(솔루션) 화면의 반복 섹션들.
 * 나이트(870:3771) / 모닝(870:4002) 프레임에서 공통으로 쓰이는 블록을 그대로 옮긴 것.
 * 각 블록의 패딩·행 높이·글자 크기는 Figma 실측치다.
 */

/** DERMA CARE 섹션 헤더 (Figma 870:3848) */
export function SectionHeader({ label, sub, title, labelClass = 'text-accent-teal', nodeId }) {
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pb-[4px] pt-[20px]"
      data-node-id={nodeId}
      data-name="SectionHeader"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <p
          className={`relative shrink-0 font-sans text-[12px] font-bold leading-[18px] tracking-[0.25px] [word-break:break-word] ${labelClass}`}
        >
          {label}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[2px]">
        <p className="relative shrink-0 font-sans text-[11px] font-normal leading-[16.5px] text-label-sub [word-break:break-word]">
          {sub}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[4px]">
        <p className={`relative shrink-0 font-sans text-[18px] font-bold leading-[26px] text-text-strong ${wrap}`}>
          {title}
        </p>
      </div>
    </div>
  );
}

/** INNER CARE 섹션 헤더 (Figma 870:3923) — 제목이 두 줄이고 상단 패딩이 24 */
export function InnerCareHeader({ nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pb-[4px] pt-[24px]"
      data-node-id={nodeId}
      data-name="NightContent"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <p className="relative shrink-0 font-sans text-[12px] font-bold leading-[18px] tracking-[0.25px] text-accent-green [word-break:break-word]">
          {t.solution.innerCare}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[2px]">
        <p className="relative shrink-0 font-sans text-[11px] font-normal leading-[16.5px] text-label-sub [word-break:break-word]">
          {t.solution.todayIntake}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[4px]">
        <div className="relative flex w-full shrink-0 flex-col items-start">
          <p className={`relative shrink-0 font-sans text-[18px] font-bold leading-[26px] text-text-strong ${wrap}`}>
            {t.solution.intakeSolution1}
          </p>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start">
          <p className={`relative shrink-0 font-sans text-[18px] font-bold leading-[26px] text-text-strong ${wrap}`}>
            {t.solution.intakeSolution2}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 섭취 추천 카드 목록 (Figma 870:3933).
 * 기획 안전 원칙에 따라 복용량을 판단하지 않고 제조사 공식 섭취 방법만 그대로 노출한다.
 */
export function SupplementCards({ cards, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start gap-[8px] px-[20px] pt-[12px]"
      data-node-id={nodeId}
      data-name="NightContent"
    >
      {cards.map((card) => (
        <div
          key={card.name}
          className="relative flex w-[353px] shrink-0 flex-col items-start rounded-[16px] border border-solid border-line bg-white px-[16px] pb-[16px] pt-[12px]"
          data-name="SupplementCard"
        >
          <div className="relative flex w-full shrink-0 flex-col items-start">
            <p className="relative shrink-0 font-sans text-[10px] font-normal leading-[10px] text-body [word-break:break-word]">
              {t.solution.todayRecommend}
            </p>
          </div>
          <div className="relative flex w-[319px] shrink-0 flex-col items-start pt-[4px]">
            <p className={`relative shrink-0 font-sans text-[14px] font-bold leading-[21px] text-text-strong ${wrap}`}>
              {card.name}
            </p>
          </div>
          <div
            className={`relative flex w-[319px] shrink-0 flex-col items-start ${
              card.note ? 'pt-[6px]' : 'pb-[8px] pt-[6px]'
            }`}
          >
            <p className={`relative shrink-0 font-sans text-[12px] font-normal leading-[18px] text-text-strong ${wrap}`}>
              {card.howTo}
            </p>
          </div>
          {card.note ? (
            <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]" data-name="Container:margin">
              <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-note-line bg-note-bg px-[12px] py-[8px]">
                <div className="relative flex w-full shrink-0 flex-col items-start">
                  <p className={`relative shrink-0 font-sans text-[11px] font-normal leading-[16px] text-accent-green ${wrap}`}>
                    {card.note}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** ETC · 오늘은 피해주세요 (Figma 870:3952) */
export function AvoidBox({ items, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pt-[20px]"
      data-node-id={nodeId}
      data-name="NightContent"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <p className="relative shrink-0 font-sans text-[12px] font-bold leading-[18px] tracking-[0.25px] text-accent-brown [word-break:break-word]">
          ETC
        </p>
      </div>
      <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]" data-name="Container:margin">
        <div className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] border border-solid border-warn-line bg-warn-bg p-[16px]">
          <div className="relative flex w-full shrink-0 flex-col items-start">
            <p className={`relative shrink-0 font-sans text-[13px] font-semibold leading-[19.5px] text-accent-brown ${wrap}`}>
              {t.solution.avoidToday}
            </p>
          </div>
          {items.map((item, i) => (
            <div
              key={item}
              className={`relative flex w-[319px] shrink-0 items-center gap-[8px] ${
                i === 0 ? 'pt-[8px]' : 'pt-[4px]'
              }`}
            >
              <div className="relative size-[6px] shrink-0 rounded-full bg-accent-brown" />
              <div className="relative flex shrink-0 flex-col items-start">
                <p className={`relative shrink-0 font-sans text-[12px] font-normal leading-[18px] text-accent-brown ${wrap}`}>
                  {item}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 왜 이 루틴인가요? (Figma 870:3971)
 * 근거로 사용된 데이터 출처를 태그로 밝힌다. (사진 / WHS 진단 / 시술 경과일)
 */
export function WhyBox({ text, tags, paddingBottom = 32, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pt-[16px]"
      style={{ paddingBottom }}
      data-node-id={nodeId}
      data-name="NightContent"
    >
      <div
        className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] bg-white p-[20px]"
        style={{ filter: 'drop-shadow(0px 0px 1.25px rgba(0,0,0,0.25))' }}
      >
        <div className="relative flex w-full shrink-0 flex-col items-start">
          <p className="relative shrink-0 font-sans text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.275px] text-ink-50 [word-break:break-word]">
            {t.solution.whyThisRoutine}
          </p>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className={`relative w-[313px] shrink-0 font-sans text-[13px] font-normal leading-[20px] text-ink-90 ${wrap}`}>
            {text}
          </p>
        </div>
        <div className="relative flex w-[313px] shrink-0 flex-wrap items-start gap-[8px] pt-[12px]">
          {tags.map((tag) => (
            <div
              key={tag}
              className="relative flex shrink-0 flex-col items-start rounded-full bg-ink-50 px-[8px] py-[4px]"
              data-name="Text"
            >
              <p className="relative shrink-0 font-sans text-[10px] font-medium leading-[15px] text-white [word-break:break-word]">
                {tag}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
