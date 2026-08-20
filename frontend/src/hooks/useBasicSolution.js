import { useEffect, useState } from 'react';
import { getTreatmentContext } from '@/api/procedures';
import { getLatestSkinDiagnosis } from '@/api/skinState';
import { SKIN_ANALYSIS_FACTORS } from '@/constants/skinAnalysis';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * 최초 접속(촬영 전) 기본 솔루션의 근거 데이터 정규화.
 *
 * 백엔드 연동 대상:
 *   GET /users/{userCode}/skin-diagnosis                 (api/skinState.js#getLatestSkinDiagnosis)
 *   GET /users/{userCode}/procedures/treatment-context   (api/procedures.js#getTreatmentContext)
 *
 * 두 응답 모두 아직 end-to-end 검증 전이라(api/AGENTS.md) 필드명·타입을 신뢰하지 않는다.
 * 모든 필드를 옵셔널로 읽고, 읽히지 않으면 null/[] 로 접는다. 어떤 입력에도 throw 하지 않는다.
 * 응답 필드명이 실제와 다르면 이 파일 한 곳만 고치면 된다.
 */

/**
 * 통과시킬 고민 키. 데일리 스킨 분석(촬영 후)이 쓰는 어휘를 그대로 재사용해
 * 촬영 전후 태그 표기가 갈라지지 않게 한다.
 * 현재 값: 'pigmentation' | 'pore' | 'wrinkle' | 'redness' | 'texture'
 */
export const KNOWN_CONCERN_KEYS = SKIN_ANALYSIS_FACTORS.map((factor) => factor.key);

/**
 * 다른 어휘로 내려오는 코드를 알려진 키로 접는 대응표.
 * SkinAge 의 ConcernType 은 모공과 피부결을 'pore_texture' 하나로 합쳐 내려준다.
 */
const CONCERN_ALIASES = {
  pore_texture: 'pore',
};

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 배열이 아닌 객체인지 (배열·null 은 제외) */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 문자열 필드. 문자열이 아니거나 내용이 없으면 null.
 * 통과한 값은 **가공하지 않고 원문 그대로** 반환한다 (trim 도 하지 않는다).
 */
function asString(value) {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/** 'YYYY-MM-DD' 형식만 통과. 그 외(형식 오류·타입 오류)는 null */
function asDateKey(value) {
  if (typeof value !== 'string') return null;
  return DATE_KEY_RE.test(value) ? value : null;
}

/** 0 이상의 정수. 음수·비숫자·NaN·Infinity 는 null */
function asNonNegativeInt(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

/**
 * 문자열 배열. 내용 없는 항목만 걸러내고 **남은 문자열은 원문 그대로** 담는다.
 * 시술 주의사항은 안전 문구라 말줄임·요약·trim 을 하지 않는다.
 */
function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim() !== '');
}

/** 원시 고민 코드 → 알려진 키. 대응되지 않으면 null (조용히 버린다) */
function mapConcernKey(raw) {
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  const mapped = CONCERN_ALIASES[key] ?? key;
  return KNOWN_CONCERN_KEYS.includes(mapped) ? mapped : null;
}

/**
 * 시술 맥락에 쓸 만한 값이 하나라도 있는지.
 * false 면 `treatment` 를 null 로 남겨 **시술 없는 사용자와 빈/깨진 응답이 같은 경로**로 처리된다.
 * 원시 payload 의 키 존재 여부가 아니라 정규화 결과를 보는 이유는, 필드가 있어도 타입이
 * 어긋나 전부 버려지면 화면에 붙일 근거가 없기 때문이다.
 */
function hasAnyTreatmentField(treatment) {
  return (
    treatment.name !== null ||
    treatment.date !== null ||
    treatment.daysSince !== null ||
    treatment.cautions.length > 0
  );
}

/** 모든 필드가 빈 BasicSolutionSource. 정규화는 항상 여기서 시작한다 */
export function emptyBasicSolutionSource() {
  return {
    skinType: null,
    concerns: [],
    diagnosisSummary: null,
    diagnosedAt: null,
    treatment: null,
  };
}

/**
 * 신뢰할 수 없는 서버 payload 두 개를 BasicSolutionSource 로 정규화한다.
 *
 * @param {unknown} diagnosisRaw  GET /skin-diagnosis 응답 (임의의 값일 수 있다)
 * @param {unknown} treatmentRaw  GET /procedures/treatment-context 응답 (임의의 값일 수 있다)
 * @returns {{
 *   skinType: string|null,
 *   concerns: string[],
 *   diagnosisSummary: string|null,
 *   diagnosedAt: string|null,
 *   treatment: {name: string|null, date: string|null, daysSince: number|null, cautions: string[]}|null,
 * }} 항상 완전한 객체. 부분적으로 정규화된 결과를 반환하지 않는다.
 *
 * 보장:
 * - `concerns ⊆ KNOWN_CONCERN_KEYS` 이고 중복이 없다
 * - `treatment` 는 null 이거나 4개 필드를 모두 가진 객체다
 * - `treatment.cautions` 의 각 문자열은 입력과 문자 단위로 동일하다
 * - 입력을 변경하지 않는다 (새 객체·새 배열만 만든다)
 */
export function normalizeBasicSource(diagnosisRaw, treatmentRaw) {
  const source = emptyBasicSolutionSource();

  if (isObject(diagnosisRaw)) {
    source.skinType = asString(diagnosisRaw.skinType);
    source.diagnosisSummary = asString(diagnosisRaw.summary);
    source.diagnosedAt = asDateKey(diagnosisRaw.diagnosedAt);

    // 알려진 고민 키만 통과. 미지의 코드가 태그로 새어 화면에 노출되는 것을 막는다.
    // 불변식: 매 반복 시작 시 source.concerns 의 모든 원소는 알려진 키이며 중복이 없다
    const rawConcerns = Array.isArray(diagnosisRaw.concerns) ? diagnosisRaw.concerns : [];
    for (const raw of rawConcerns) {
      const key = mapConcernKey(raw);
      if (key !== null && !source.concerns.includes(key)) {
        source.concerns.push(key);
      }
    }
  }

  if (isObject(treatmentRaw)) {
    const treatment = {
      name: asString(treatmentRaw.procedureName),
      date: asDateKey(treatmentRaw.procedureDate),
      daysSince: asNonNegativeInt(treatmentRaw.daysSince),
      cautions: asStringArray(treatmentRaw.cautions), // 문구 가공 금지
    };
    if (hasAnyTreatmentField(treatment)) {
      source.treatment = treatment;
    }
  }

  return source;
}

/**
 * allSettled 결과 하나를 payload 로 꺼낸다. 실패는 콘솔에만 남기고 null 로 접는다 —
 * 화면에 에러를 노출하지 않는다(useCareSolution / useMarketProducts 와 같은 계약).
 * 시술 조회의 404 는 "시술을 받지 않은 사용자"라는 정상 케이스와 같은 결과가 되는데,
 * 이는 의도된 것이다(설계 문서 Error Handling 시나리오 3).
 */
function settledPayload(result, label) {
  if (!result || result.status !== 'fulfilled') {
    if (result) console.error(`[useBasicSolution] ${label} fetch failed`, result.reason);
    return null;
  }
  return result.value ?? null;
}

/**
 * 촬영 전 기본 솔루션의 근거 데이터(오프라인 정밀 진단 + 시술 맥락)를 가져온다.
 *
 * 세션이 없거나 두 요청이 모두 실패하면 `source` 가 `null` 로 남는다 — 화면단에서
 * `toBasicView(source, cycle)` 가 폴백 더미로 전체를 채우는 걸 전제로 하며,
 * 여기서 에러를 화면에 노출하거나 throw 하지 않는다.
 *
 * 진단·시술 데이터는 렌더에만 쓰고 localStorage 에 저장하지 않는다(개인 건강 정보).
 * 매 진입 시 서버에서 다시 읽는다.
 *
 * @returns {{ source: ReturnType<typeof emptyBasicSolutionSource> | null, loading: boolean }}
 */
export function useBasicSolution() {
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const userCode = useAuthStore.getState().userCode;

    if (!userCode) {
      // 로그인 전 프리뷰 — 요청하지 않고 곧바로 폴백 경로로 보낸다
      setSource(null);
      setLoading(false);
      return undefined;
    }

    /**
     * userType 은 불필요한 요청을 건너뛰는 최적화 힌트일 뿐이다.
     * onboardingStore 는 persist 되지 않아 재접속하면 null 로 돌아가므로,
     * null 이면 (시술 사용자일 수 있으니) 반드시 조회한다.
     */
    const needTreatment = useOnboardingStore.getState().userType !== 'DIAGNOSIS_ONLY';

    setLoading(true);

    const tasks = [getLatestSkinDiagnosis(userCode)];
    if (needTreatment) tasks.push(getTreatmentContext(userCode));

    // 병렬 — 한쪽 실패가 다른 쪽을 막지 않는다. 최초 접속 홈은 체감 지연에 민감하다
    Promise.allSettled(tasks)
      .then(([diagnosisResult, treatmentResult]) => {
        // 실패 로그는 언마운트 여부와 무관하게 남긴다 (setState 만 건너뛴다)
        const diagnosisRaw = settledPayload(diagnosisResult, 'skin diagnosis');
        const treatmentRaw = needTreatment
          ? settledPayload(treatmentResult, 'treatment context')
          : null;

        if (cancelled) return;

        // 둘 다 없으면 근거가 하나도 없다 — null 로 두어 화면이 폴백 더미를 쓰게 한다
        if (diagnosisRaw === null && treatmentRaw === null) {
          setSource(null);
          return;
        }
        setSource(normalizeBasicSource(diagnosisRaw, treatmentRaw));
      })
      .catch((err) => {
        // allSettled 는 reject 하지 않으므로 여기 오는 건 정규화 버그뿐이다.
        // 그래도 화면이 깨지지 않게 폴백으로 넘긴다
        console.error('[useBasicSolution] normalize failed', err);
        if (!cancelled) setSource(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { source, loading };
}
