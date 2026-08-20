import { useEffect, useState } from 'react';
import { getDailyCareSolution } from '@/api/care';
import { useAuthStore } from '@/store/authStore';

/**
 * 특정 날짜의 케어 솔루션(CareSolutionResponse)을 가져온다.
 * 로그인 전, 그 날짜에 아직 솔루션이 없는 경우(404), 네트워크 실패 등에는
 * `solution`이 `null`로 남는다 — 화면단에서 더미 데이터로 자연스럽게
 * 폴백하는 걸 전제로 하며, 여기서 에러를 화면에 노출하지 않는다.
 */
export function useCareSolution(date) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const userCode = useAuthStore.getState().userCode;

    if (!userCode || !date) {
      setSolution(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getDailyCareSolution(userCode, date)
      .then((data) => {
        if (!cancelled) setSolution(data ?? null);
      })
      .catch((err) => {
        console.error('[useCareSolution] fetch failed', err);
        if (!cancelled) setSolution(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return { solution, loading };
}
