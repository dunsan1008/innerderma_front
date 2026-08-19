import { useT } from '@/i18n';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';

/**
 * 솔루션 한 줄 정리 (Figma 870:3761).
 * 촬영·분석 직후 오늘의 관리 목적을 한 문장으로 먼저 보여주는 화면.
 * 상태바가 없고 배경은 #16161a. 하단 태그 3개는 분석 결과 키워드다.
 *
 * 기획 안전 원칙에 따라 진단이 아니라 '관리 목적' 표현을 쓴다.
 */
const TAG_LAYOUT = [
  { nodeId: '870:3765', textNodeId: '870:3766' },
  { nodeId: '870:3767', textNodeId: '870:3768' },
  { nodeId: '870:3769', textNodeId: '870:3770' },
];

/**
 * 등장/퇴장 타이밍.
 * 머무는 시간(2.2s)은 그대로 두고 앞뒤로 전환 구간만 얹었다.
 *  0ms   진입 시작 (아래에서 위로 + 페이드 인, 요소별 120ms 씩 시차)
 *  1900ms 퇴장 시작 (살짝 위로 빠지며 페이드 아웃)
 *  2400ms 루틴 화면으로 이동
 */
const ENTER_MS = 560;
const LEAVE_AT = 1900;
const NAVIGATE_AT = 2400;
/** 요소별 진입 시차 */
const STAGGER = { label: 0, headline: 110, tags: 220 };

export default function SolutionSummaryScreen() {
  const t = useT();
  const navigate = useNavigate();
  /** 레이아웃(nodeId) + 현재 언어 라벨을 합친다 */
  const TAGS = TAG_LAYOUT.map((layout, i) => ({ ...layout, label: t.whyTags[i] }));
  const [headlineLine1, headlineLine2] = t.solutionSummary.headline.split('\n');
  /** 'enter' → 'hold' → 'leave' */
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // 첫 페인트 뒤에 켜야 트랜지션이 잘리지 않는다
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    const leaveTimer = setTimeout(() => setLeaving(true), LEAVE_AT);
    const navTimer = setTimeout(() => navigate('/solution/night'), NAVIGATE_AT);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(leaveTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  /** 진입/퇴장 공통 스타일 — delay 는 진입에만 준다 */
  const motion = (delay) => ({
    opacity: leaving ? 0 : shown ? 1 : 0,
    transform: `translateY(${leaving ? -14 : shown ? 0 : 18}px)`,
    transition: `opacity ${leaving ? 420 : ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${
      leaving ? 0 : delay
    }ms, transform ${leaving ? 420 : ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${leaving ? 0 : delay}ms`,
  });

  return (
    <Screen className="bg-header-dark" nodeId="870:3761" name="솔루션 한 줄 정리">
      <p
        className="absolute left-[42px] top-[315px] h-[19px] w-[70px] font-sans text-[11px] font-normal leading-[16.5px] text-white-50 [word-break:break-word]"
        style={motion(STAGGER.label)}
        data-node-id="870:3762"
        data-testid="summary-label"
      >
        {t.solutionSummary.title}
      </p>

      <div
        className="absolute left-[39px] top-[334px] w-[254px] font-display text-[28px] font-bold leading-[0] text-white [word-break:break-word]"
        style={motion(STAGGER.headline)}
        data-node-id="870:3763"
        data-testid="summary-headline"
      >
        <p className="mb-0 leading-[32px]">{headlineLine1}</p>
        <p className="leading-[32px]">{headlineLine2}</p>
      </div>

      <div
        className="absolute left-[39px] top-[417px] h-[22px] w-[378px]"
        style={motion(STAGGER.tags)}
        data-node-id="870:3764"
        data-name="Container"
        data-testid="summary-tags"
      >
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
