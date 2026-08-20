import divider from '@/assets/figma/step-divider.svg';
import { useWrapClass } from '@/i18n';

/**
 * 루틴 단계 목록.
 * Figma `StepList` (870:3855 / 870:4086) 구조 그대로.
 *  - 래퍼: pt-12 px-20
 *  - StepCard: border-2 #e5e9f0, radius 16, w353, 내부 px-12 py-14 gap-8
 *  - 번호 배지 24x24 검정 원 / 제목 14px Bold / 카테고리 태그 / 설명 12px Medium
 *  - 마지막 카드를 뺀 나머지 뒤에는 StepDivider(이중 셰브론 25x14, py-4)가 붙는다
 */

/**
 * 카테고리 태그 색 쌍. Figma 에서 카테고리별로 고정되어 있다.
 * `step.tag` 는 useRoutineText() 가 현재 언어로 번역해 덮어쓰므로, 스타일은
 * 번역되지 않는 안정적인 `step.tagKey` 로 찾는다(번역 텍스트로 찾으면 한국어 외
 * 언어에서 클래스가 매칭되지 않는다).
 */
const TAG_STYLE = {
  moist: 'bg-tag-moist-bg text-tag-moist-text',
  nutrient: 'bg-tag-nutrient-bg text-tag-nutrient-text',
  barrier: 'bg-tag-barrier-bg text-tag-barrier-text',
  lock: 'bg-tag-lock-bg text-tag-lock-text',
  waste: 'bg-tag-waste-bg text-tag-waste-text',
  uv: 'bg-tag-uv-bg text-tag-uv-text',
};

function StepCard({ step, nodeId }) {
  const wrap = useWrapClass();
  return (
    <div
      className="relative flex w-[353px] shrink-0 flex-col items-start rounded-[16px] border-2 border-solid border-line"
      data-node-id={nodeId}
      data-name="StepCard"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start gap-[8px] px-[12px] py-[14px]">
        {/*
          제목 줄: 번호 배지 + 제목 + 카테고리 태그.
          제목이 길어지면 태그를 밀지 않고 **제목이 먼저 줄어들며 줄바꿈**되어야 한다.
          그래서 제목 쪽은 flex-1 + min-w-0 로 줄어들 수 있게 두고, 태그만 shrink-0 로 지킨다.
          (Figma 의 titleFlex 는 제목 영역의 기본 폭 비율을 잡아 둔 값이라 flex-grow 로 쓴다)
        */}
        <div className="relative flex w-full shrink-0 items-start gap-[8px]">
          <div className="relative flex min-w-0 flex-1 items-start gap-[8px]" style={{ flexGrow: step.titleFlex }}>
            <div className="relative flex size-[24px] shrink-0 items-center justify-center rounded-full bg-text-strong">
              <div className="relative flex shrink-0 flex-col items-start">
                <p className="relative shrink-0 font-sans text-[10px] font-bold leading-[10px] text-white [word-break:break-word]">
                  {step.no}
                </p>
              </div>
            </div>
            <div className="relative flex min-w-0 flex-col items-start">
              {/* 한국어는 어절 단위로, 나머지 언어는 각 언어 기본 규칙으로 줄바꿈한다 */}
              <p className={`relative font-sans text-[14px] font-bold leading-[21px] text-text-strong ${wrap}`}>
                {step.title}
              </p>
            </div>
          </div>
          <div
            className={`relative flex shrink-0 flex-col items-start rounded-full px-[8px] py-[2px] ${TAG_STYLE[step.tagKey]}`}
            data-name="CategoryTag"
          >
            <p className="relative shrink-0 font-sans text-[10px] font-medium leading-[15px] [word-break:break-word]">
              {step.tag}
            </p>
          </div>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start">
          <p className={`relative shrink-0 font-sans text-[12px] font-medium leading-[18px] text-text-strong ${wrap}`}>
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StepList({ steps, nodeId }) {
  return (
    <div
      className="relative flex w-full flex-col items-start px-[20px] pt-[12px]"
      data-node-id={nodeId}
      data-name="StepList"
    >
      {steps.map((step, i) =>
        i < steps.length - 1 ? (
          <div key={step.no} className="relative flex w-full shrink-0 flex-col items-start">
            <StepCard step={step} nodeId={step.nodeId} />
            <div className="relative flex w-full shrink-0 items-center justify-center py-[4px]" data-name="StepDivider">
              <div className="relative h-[14px] w-[25px] shrink-0">
                <img alt="" src={divider} className="absolute inset-0 block size-full max-w-none" />
              </div>
            </div>
          </div>
        ) : (
          <StepCard key={step.no} step={step} nodeId={step.nodeId} />
        ),
      )}
    </div>
  );
}
