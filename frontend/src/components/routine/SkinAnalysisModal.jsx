import { useT } from '@/i18n';
import useMountTransition from '@/lib/useMountTransition';
import { SKIN_ANALYSIS_FACTORS } from '@/constants/skinAnalysis';
import SkinRadarChart from '@/components/routine/SkinRadarChart';

/**
 * 데일리 스킨 분석 모달 (Figma 1252:493).
 *
 * WHS 앱 화면을 그대로 캡처해 붙여넣은 참고 디자인이라 실제로는 정적 이미지였다.
 * 오각형·노란색 그대로 쓰지 않고, 우리 색(accent-teal)으로 다시 그린 벡터 차트로
 * 차별화했다 — SkinRadarChart 참고.
 *
 * 촬영·자가진단 후 "솔루션 도출 중" → "오늘의 솔루션 한 줄 정리" 화면을 지나 메인
 * 솔루션 화면에 도착하는 순간 어두운 배경 위에 겹쳐 한 번 뜨고(RoutineScreen 참고),
 * 이후에는 새로 추가한 재확인 버튼으로 언제든 다시 열 수 있다(RoutineScreen 의
 * 플로팅 버튼 참고).
 */
export default function SkinAnalysisModal({ open, onClose }) {
  const t = useT();
  const { mounted, entered } = useMountTransition(open, 220);

  if (!mounted) return null;

  const items = SKIN_ANALYSIS_FACTORS.map((f) => ({ ...f, label: t.skinAnalysis.factors[f.key] }));

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t.skinAnalysis.title}
      data-node-id="1252:493"
      data-name="데일리 스킨 분석"
    >
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        data-testid="skin-analysis-backdrop"
        className={`absolute inset-0 bg-overlay transition-opacity duration-[220ms] ease-out ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`relative flex w-[353px] flex-col items-stretch rounded-[28px] bg-white px-[20px] py-[20px] shadow-lg transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-sans text-[17px] font-bold leading-[24px] text-text-strong [word-break:break-word]">
            {t.skinAnalysis.title}
          </p>
          <button
            type="button"
            aria-label={t.common.close}
            onClick={onClose}
            data-testid="skin-analysis-close"
            className="flex size-[24px] items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2L14 14M14 2L2 14" stroke="#7a7e84" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="my-[16px] h-px w-full bg-line" />

        <div className="flex items-center justify-center py-[4px]">
          <SkinRadarChart items={items} size={232} />
        </div>

        <div className="my-[16px] h-px w-full bg-line" />

        <button
          type="button"
          onClick={onClose}
          data-testid="skin-analysis-routine-cta"
          className="h-[51px] w-full rounded-[16px] bg-header-dark font-sans text-[16px] font-semibold leading-[24px] text-white"
        >
          {t.skinAnalysis.routineButton}
        </button>
      </div>
    </div>
  );
}
