import divider from '@/assets/figma/step-divider.svg';

/**
 * 루틴 단계 목록.
 * Figma `StepList` (870:3855 / 870:4086) 구조 그대로.
 *  - 래퍼: pt-12 px-20
 *  - StepCard: border-2 #e5e9f0, radius 16, w353, 내부 px-12 py-14 gap-8
 *  - 번호 배지 24x24 검정 원 / 제목 14px Bold / 카테고리 태그 / 설명 12px Medium
 *  - 마지막 카드를 뺀 나머지 뒤에는 StepDivider(이중 셰브론 25x14, py-4)가 붙는다
 */

/** 카테고리 태그 색 쌍. Figma 에서 카테고리별로 고정되어 있다. */
const TAG_STYLE = {
  '수분 공급': 'bg-tag-moist-bg text-tag-moist-text',
  '성분 공급': 'bg-tag-nutrient-bg text-tag-nutrient-text',
  '보습막 형성': 'bg-tag-barrier-bg text-tag-barrier-text',
  '수분 잠금': 'bg-tag-lock-bg text-tag-lock-text',
  '노폐물 제거': 'bg-tag-waste-bg text-tag-waste-text',
  '자외선 차단': 'bg-tag-uv-bg text-tag-uv-text',
};

function StepCard({ step, nodeId }) {
  return (
    <div
      className="relative flex w-[353px] shrink-0 flex-col items-start rounded-[16px] border-2 border-solid border-line"
      data-node-id={nodeId}
      data-name="StepCard"
    >
      <div className="relative flex w-full shrink-0 flex-col items-start gap-[8px] px-[12px] py-[14px]">
        <div className="relative flex w-full shrink-0 items-start gap-[8px]">
          <div className="relative flex min-w-px items-center gap-[8px]" style={{ flex: `${step.titleFlex} 0 0` }}>
            <div className="relative flex size-[24px] shrink-0 items-center justify-center rounded-full bg-text-strong">
              <div className="relative flex shrink-0 flex-col items-start">
                <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-bold leading-[10px] text-white [word-break:break-word]">
                  {step.no}
                </p>
              </div>
            </div>
            <div className="relative flex shrink-0 flex-col items-start">
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[14px] font-bold leading-[21px] text-text-strong [word-break:break-word]">
                {step.title}
              </p>
            </div>
          </div>
          <div
            className={`relative flex shrink-0 flex-col items-start rounded-full px-[8px] py-[2px] ${TAG_STYLE[step.tag]}`}
            data-name="CategoryTag"
          >
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-medium leading-[15px] [word-break:break-word]">
              {step.tag}
            </p>
          </div>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start">
          <p className="relative shrink-0 whitespace-nowrap font-sans text-[12px] font-medium leading-[18px] text-text-strong [word-break:break-word]">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {number} height Figma StepList 프레임 높이.
 *   모닝(870:4086)은 435 인데 카드 합계는 406 이어서 아래에 29px 여백이 남는다.
 *   이 여백까지 재현해야 이후 섹션의 y 좌표가 어긋나지 않는다.
 */
export default function StepList({ steps, nodeId, height }) {
  return (
    <div
      className="relative flex w-full flex-col items-start px-[20px] pt-[12px]"
      style={height ? { height } : undefined}
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
