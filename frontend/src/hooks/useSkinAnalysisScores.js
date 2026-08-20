import { useEffect, useState } from 'react';
import { getLatestSkinAnalysis } from '@/api/skinState';
import { useAuthStore } from '@/store/authStore';

/** 안전한 0~100 범위로 자른다 — 백엔드 값이 범위를 벗어나도 차트가 안 깨지게 */
const clamp = (v) => Math.max(0, Math.min(100, v));

/**
 * 데일리 스킨 분석 모달의 레이더 차트용 실제 점수.
 *
 * 백엔드 `SkinAnalysisResponse.metricScores`(색소/모공·피부결/주름/홍조, 0~100,
 * 높을수록 건강한 상태)를 가져온다. 로그인 전, 그날 분석이 아직 없거나(404),
 * 요청이 실패하면 `scores`는 `null`로 남는다 — `constants/skinAnalysis.js`의
 * 더미 점수로 자연스럽게 폴백하는 걸 전제로 한다(useCareSolution과 같은 패턴).
 *
 * `enabled` 가 false 면 요청을 건너뛴다 — 이 모달은 AppModals 에 항상 마운트돼
 * 있어서, 열릴 때만(그리고 열릴 때마다 최신값으로) 가져오게 하려는 용도다.
 */
export function useSkinAnalysisScores(enabled = true) {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const userCode = useAuthStore.getState().userCode;

    if (!enabled || !userCode) {
      setScores(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getLatestSkinAnalysis(userCode)
      .then((data) => {
        const m = data?.metricScores;
        if (cancelled || !m) {
          if (!cancelled) setScores(null);
          return;
        }
        setScores({
          pigmentation: clamp(m.pigmentationScore),
          poreTexture: clamp(m.poreTextureScore),
          wrinkle: clamp(m.wrinkleScore),
          redness: clamp(m.rednessScore),
        });
      })
      .catch((err) => {
        console.error('[useSkinAnalysisScores] fetch failed', err);
        if (!cancelled) setScores(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { scores, loading };
}
