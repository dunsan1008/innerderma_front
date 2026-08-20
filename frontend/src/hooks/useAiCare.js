import { useEffect, useState } from 'react';
import { createAiCare } from '@/api/care';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

/**
 * 신규 AI Care 파이프라인(`POST /users/{userCode}/ai-care`) 결과를 가져온다.
 *
 * `/care-solutions`(기존, DB 영속·룰엔진)와 달리 이건 Rule Engine → LLM 으로 만들어지고
 * 같은 날 동일 조건이면 서버가 메모리 캐시를 돌려주는 구조라, 날짜별 조회(GET) API가
 * 없다 — 항상 "오늘" 기준으로만 생성/조회된다. 그래서 `enabled`(보통 오늘 날짜를 보고
 * 있는지)가 false 면 아예 부르지 않는다.
 *
 * 백엔드가 아직 이 파이프라인을 안정화하는 중이라(2026-08-21 기준 steps/추천이 빈
 * 배열로 오는 경우가 있음을 확인함) 결과가 비어 있을 수 있다 — 그건 이 훅이 판단할
 * 일이 아니라, 호출부(RoutineScreen)가 비어 있으면 기존 `/care-solutions`나 더미로
 * 자연스럽게 폴백한다.
 *
 * `validated`가 명시적으로 false면(서버 자체 검증 실패) 신뢰하지 않고 null 로 돌려준다.
 */
export function useAiCare(enabled) {
  const [aiCare, setAiCare] = useState(null);
  const [loading, setLoading] = useState(false);
  const lang = useUiStore((s) => s.lang);

  useEffect(() => {
    let cancelled = false;
    const userCode = useAuthStore.getState().userCode;

    if (!enabled || !userCode) {
      setAiCare(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    createAiCare(userCode, lang)
      .then((data) => {
        if (cancelled) return;
        setAiCare(data?.validated === false ? null : (data ?? null));
      })
      .catch((err) => {
        console.error('[useAiCare] fetch failed', err);
        if (!cancelled) setAiCare(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, lang]);

  return { aiCare, loading };
}
