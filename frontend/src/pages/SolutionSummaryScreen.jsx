import { useT } from '@/i18n';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';

/**
 * 솔루션 한 줄 정리 (Figma 870:3761).
 * 촬영·분석 직후 오늘의 관리 목적을 한 문장으로 먼저 보여주는 화면.
 * 상태바가 없고 배경은 #16161a. 하단 태그 3개는 분석 결과 키워드다.
 *
 * 기획 안전 원칙에 따라 진단이 아니라 '관리 목적' 표현을 쓴다.
 */
const TAGS = [
  { label: '피부 장벽 회복', nodeId: '870:3765', textNodeId: '870:3766' },
  { label: '약한 붉어짐', nodeId: '870:3767', textNodeId: '870:3768' },
  { label: '수분 부족', nodeId: '870:3769', textNodeId: '870:3770' },
];

export default function SolutionSummaryScreen() {
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/solution/night'), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Screen className="bg-header-dark" nodeId="870:3761" name="솔루션 한 줄 정리">
      <p
        className="absolute left-[42px] top-[315px] h-[19px] w-[70px] font-sans text-[11px] font-normal leading-[16.5px] text-white-50 [word-break:break-word]"
        data-node-id="870:3762"
      >
        {t.solutionSummary.title}
      </p>

      <div
        className="absolute left-[39px] top-[334px] w-[254px] font-display text-[28px] font-bold leading-[0] text-white [word-break:break-word]"
        data-node-id="870:3763"
      >
        <p className="mb-0 leading-[32px]">오늘은 피부장벽 회복에</p>
        <p className="leading-[32px]">집중해 주세요.</p>
      </div>

      <div className="absolute left-[39px] top-[417px] h-[22px] w-[378px]" data-node-id="870:3764" data-name="Container">
        {/* 첫 태그만 Figma 에서 중앙 정렬 기준(left calc(50% - 151px) + translateX(-50%)) 으로 배치돼 있다 */}
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-start rounded-full bg-white-10 px-[8px] py-[2px]"
          style={{ left: 'calc(50% - 151px)' }}
          data-node-id={TAGS[0].nodeId}
          data-name="Text"
        >
          <p
            className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-normal leading-[15px] text-white-70 [word-break:break-word]"
            data-node-id={TAGS[0].textNodeId}
          >
            {TAGS[0].label}
          </p>
        </div>

        {[
          { ...TAGS[1], left: 84 },
          { ...TAGS[2], left: 157 },
        ].map((tag) => (
          <div
            key={tag.label}
            className="absolute top-0 flex flex-col items-start rounded-full bg-white-10 px-[8px] py-[2px]"
            style={{ left: tag.left }}
            data-node-id={tag.nodeId}
            data-name="Text"
          >
            <p
              className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-normal leading-[15px] text-white-70 [word-break:break-word]"
              data-node-id={tag.textNodeId}
            >
              {tag.label}
            </p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
