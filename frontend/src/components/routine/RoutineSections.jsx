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

/**
 * INNER CARE 섹션 헤더 (Figma 870:3923) — 제목이 두 줄이고 상단 패딩이 24
 *
 * label/sub/lines 는 옵셔널이다. 넘기지 않으면 기존 useT() 값을 그대로 쓰므로
 * 촬영 후 솔루션(RoutineScreen)의 렌더 결과는 이 prop 추가 전과 동일하다.
 * 기본 솔루션처럼 사전에 없는 문구가 필요한 화면만 prop 으로 넘긴다.
 */
export function InnerCareHeader({ label, sub, lines, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  const headLabel = label ?? t.solution.innerCare;
  const headSub = sub ?? t.solution.todayIntake;
  const titleLines = lines ?? [t.solution.intakeSolution1, t.solution.intakeSolution2];
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pb-[4px] pt-[24px]"
      data-node-id={nodeId}
      data-name="NightContent"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <p className="relative shrink-0 font-sans text-[12px] font-bold leading-[18px] tracking-[0.25px] text-accent-green [word-break:break-word]">
          {headLabel}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[2px]">
        <p className="relative shrink-0 font-sans text-[11px] font-normal leading-[16.5px] text-label-sub [word-break:break-word]">
          {headSub}
        </p>
      </div>
      <div className="relative flex w-[353px] shrink-0 flex-col items-start pt-[4px]">
        {titleLines.map((line, i) => (
          <div key={`${i}-${line}`} className="relative flex w-full shrink-0 flex-col items-start">
            <p className={`relative shrink-0 font-sans text-[18px] font-bold leading-[26px] text-text-strong ${wrap}`}>
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 섭취 추천 카드 목록 (Figma 870:3933).
 * 기획 안전 원칙에 따라 복용량을 판단하지 않고 제조사 공식 섭취 방법만 그대로 노출한다.
 * (이 원칙은 recommendLabel 을 넘기는 화면에도 동일하게 적용된다 — card.howTo 는 항상
 *  제조사 공식 문구를 그대로 받는다. 라벨만 prop 으로 열려 있고 문구 가공 경로는 없다.)
 *
 * recommendLabel 은 옵셔널이며 기본값이 기존 useT() 값이라 기존 호출부는 무변경이다.
 */
export function SupplementCards({ cards, recommendLabel, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  const cardLabel = recommendLabel ?? t.solution.todayRecommend;
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
              {cardLabel}
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

/**
 * ETC · 오늘은 피해주세요 (Figma 870:3952)
 *
 * label/title 은 옵셔널이다. 기본값은 기존 사전 값(t.solution.etc / t.solution.avoidToday)이며
 * 4개 언어 모두 etc 가 'ETC' 라서 prop 미전달 시 렌더 결과가 이전과 같다.
 */
export function AvoidBox({ items, label, title, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  const headLabel = label ?? t.solution.etc;
  const headTitle = title ?? t.solution.avoidToday;
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-start px-[20px] pt-[20px]"
      data-node-id={nodeId}
      data-name="NightContent"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <p className="relative shrink-0 font-sans text-[12px] font-bold leading-[18px] tracking-[0.25px] text-accent-brown [word-break:break-word]">
          {headLabel}
        </p>
      </div>
      <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]" data-name="Container:margin">
        <div className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] border border-solid border-warn-line bg-warn-bg p-[16px]">
          <div className="relative flex w-full shrink-0 flex-col items-start">
            <p className={`relative shrink-0 font-sans text-[13px] font-semibold leading-[19.5px] text-accent-brown ${wrap}`}>
              {headTitle}
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
 *
 * label 은 옵셔널이며 기본값이 기존 useT() 값이라 기존 호출부는 무변경이다.
 */
export function WhyBox({ text, tags, label, paddingBottom = 32, nodeId }) {
  const t = useT();
  const wrap = useWrapClass();
  const heading = label ?? t.solution.whyThisRoutine;
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
            {heading}
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
