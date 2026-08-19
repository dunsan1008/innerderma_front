import { useT } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import line from '@/assets/figma/filter-line.svg';

/**
 * 마켓 필터 바텀시트의 공통 껍데기.
 * Figma `Frame 73 > Group 83` (filter 1 = 870:4855, filter 2 = 870:4855 대응, 피부 진단 = 동일 구조).
 *
 *  - 흰 바탕(393x852) 위에 rgba(0,0,0,0.7) 딤 393x868 @ (0,-10)
 *  - 시트: 흰색 393x492 @ (0,371)
 *  - 시트 헤더: 흰색 392x69 @ (1,370), shadow 0 1 1 rgba(0,0,0,0.25)
 *  - 탭: 성별(15,399) / 연령대(59,399) / 맞춤형 진단(118,399) — 17px Bold, 비활성은 #c4c4c4
 *  - 초기화(338,398) 13px Regular #6b7280 밑줄
 *  - 적용하기 버튼: 검정 252x52 @ (70,765) radius 15
 *  - Home Indicator/Light @ (-1,829) 394x34 — 이 인스턴스는 알약이 숨겨져 있어 비워 둔다(실측 확인)
 *  - 구분선 y736 두 개 + y735.92 하나가 겹쳐 있다(Figma 그대로)
 */

/** 393x1 짜리 #bcbcbc 라인. Figma 는 h0 박스에 inset -1px 로 넣는다. */
export function SheetLine({ left = 0, top }) {
  return (
    <div className="absolute h-0 w-[393px]" style={{ left, top }}>
      <div className="absolute inset-[-1px_0_0_0]">
        <img alt="" src={line} className="block size-full max-w-none" />
      </div>
    </div>
  );
}

const TABS = [
  { key: 'gender', label: '성별', left: 15, route: '/market/filter/gender' },
  { key: 'age', label: '연령대', left: 59, route: '/market/filter/age' },
  { key: 'diagnosis', label: '맞춤형 진단', left: 118, route: '/market/filter/diagnosis' },
];

export default function FilterSheet({ active, children, nodeId, name, hasChanges = false, onReset }) {
  const t = useT();
  const navigate = useNavigate();
  const close = () => navigate('/market');

  return (
    <div className="relative size-full overflow-clip bg-white" data-node-id={nodeId} data-name={name}>
      <div className="absolute left-0 top-0 h-[852px] w-[393px] overflow-clip bg-white" data-node-id="870:4854">
        {/* 딤 — 누르면 닫힌다 */}
        <button
          type="button"
          aria-label="필터 닫기"
          onClick={close}
          className="absolute left-0 top-[-10px] h-[868px] w-[393px] bg-overlay"
        />

        {/* 시트 본문 */}
        <div className="absolute left-0 top-[371px] h-[492px] w-[393px] bg-white" />

        <SheetLine top={736} />
        <SheetLine top={736} />

        {/* Home Indicator/Light — 알약 레이어가 숨겨진 인스턴스 */}
        <div className="absolute left-[-1px] top-[829px] h-[34px] w-[394px]" data-name="Home Indicator/Light" />

        {/* 시트 헤더 */}
        <div
          className="absolute left-px top-[370px] h-[69px] w-[392px] bg-white"
          style={{ boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.25)' }}
        />

        {TABS.map((tab) => {
          const on = tab.key === active;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => navigate(tab.route)}
              className={`absolute top-[399px] whitespace-nowrap font-sans text-[17px] font-bold leading-[24px] [word-break:break-word] ${
                on ? 'text-ink' : 'text-tab-off'
              }`}
              style={{ left: tab.left }}
            >
              {tab.label}
            </button>
          );
        })}

        <div className="absolute left-[338px] top-[398px] flex items-center justify-center" data-name="Paragraph">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasChanges}
            className={`relative shrink-0 whitespace-nowrap font-sans text-[13px] font-normal leading-[25px] underline decoration-solid [text-underline-position:from-font] [word-break:break-word] transition-colors duration-150 ${
              hasChanges ? 'text-text-strong' : 'text-body'
            }`}
          >
            {t.common.reset}
          </button>
        </div>

        <button
          type="button"
          onClick={close}
          className={`absolute left-[70px] top-[765px] h-[52px] w-[252px] rounded-[15px] transition-colors duration-150 ${
            hasChanges ? 'bg-ink' : 'bg-disabled-bg'
          }`}
          data-name="Button"
        >
          <span className={`absolute left-[126.5px] top-[14px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-semibold leading-[24px] [word-break:break-word] transition-colors duration-150 ${
            hasChanges ? 'text-white' : 'text-disabled-text'
          }`}>
            {t.common.apply}
          </span>
        </button>

        <SheetLine left={-1} top={735.92} />
      </div>

      {/* 탭별 내용 (Figma 에서 프레임 바로 아래 형제로 놓여 있다) */}
      {children}
    </div>
  );
}
