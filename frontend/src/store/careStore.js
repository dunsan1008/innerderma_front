import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_COMPLETED_KEYS, TODAY_KEY } from '@/lib/calendar';

/**
 * 케어 사이클 화면 상태.
 * 기획서 5장 케어 사이클(귀가 후 저녁 → 다음 날 아침)에 맞춰
 *  - 지금 보고 있는 사이클 구간(phase)
 *  - 캘린더에서 선택한 날짜
 *  - 촬영 완료 여부(홈 화면이 최초 접속 상태인지 판단)
 *  - 날짜별 루틴 수행 완료 기록(completedDates) → 캘린더 초록 표시의 근거
 *  - 방금 촬영한 사진(미리보기용 data URL)
 *
 * 새로고침해도 유지되도록 localStorage 에 저장한다.
 * (촬영한 사진 data URL 은 용량이 커서 저장 대상에서 제외한다)
 */

/**
 * `hasCaptureToday` 기본값을 true 로 둔다.
 * 홈의 기본 모습은 오늘의 케어 루틴이고, "촬영 기록이 없는 최초 접속 상태"는
 * 온보딩(연결 완료 → 홈으로 이동)에서 리셋될 때와 /home/first-visit 에서 볼 수 있다.
 */
const DEFAULTS = {
  phase: 'night',
  selectedDate: TODAY_KEY,
  hasCaptureToday: true,
  captureDataUrl: null,
  /** 루틴을 수행 완료한 날짜 키 목록 */
  completedDates: INITIAL_COMPLETED_KEYS,
};

/** 저장 형식이 바뀔 때 올린다. */
const PERSIST_VERSION = 1;

/**
 * 옛 저장값 판별.
 * `completedDates` 는 이번 형식에서 처음 추가된 필드이므로, 이게 없으면 이전 버전이 남긴 값이다.
 * 그때는 `hasCaptureToday` 기본값이 false 였어서 한 번이라도 접속한 브라우저에 false 가 남아 있고,
 * 그 값 때문에 홈이 계속 "최초 접속" 상태(솔루션 안 보임)로 열렸다.
 *
 * zustand 의 `migrate` 는 저장값에 `version` 이 **숫자로** 들어있을 때만 호출되는데
 * (zustand 5.0.3 middleware: `typeof deserializedStorageValue.version === 'number'`),
 * 옛 저장값에는 version 자체가 없어서 migrate 를 타지 않는다. 그래서 항상 실행되는 merge 에서 처리한다.
 */
const isLegacy = (saved) => !Array.isArray(saved?.completedDates);

/**
 * localStorage 에 남아 있는 값을 신뢰하지 않고 형태를 맞춘다.
 * 스토어 필드가 늘어나기 전에 저장된 값이 그대로 병합되면
 * `completedDates` 가 없거나 null 인 상태로 화면이 렌더돼 터진다.
 *
 * @param {object} saved 저장된 상태
 * @param {boolean} resetCaptureFlag 촬영 여부를 기본값으로 되돌릴지
 */
function normalize(saved, resetCaptureFlag = false) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const captureOk = !resetCaptureFlag && typeof s.hasCaptureToday === 'boolean';
  return {
    phase: s.phase === 'morning' ? 'morning' : 'night',
    selectedDate: /^\d{4}-\d{2}-\d{2}$/.test(s.selectedDate) ? s.selectedDate : DEFAULTS.selectedDate,
    hasCaptureToday: captureOk ? s.hasCaptureToday : DEFAULTS.hasCaptureToday,
    completedDates: Array.isArray(s.completedDates)
      ? s.completedDates.filter((d) => typeof d === 'string')
      : DEFAULTS.completedDates,
  };
}

export const useCareStore = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      /** 'night' | 'morning' */
      setPhase: (phase) => set({ phase }),

      /** 선택된 날짜 (YYYY-MM-DD) */
      setSelectedDate: (selectedDate) => set({ selectedDate }),

      /** 촬영 완료 → 홈이 오늘의 루틴을 보여준다 */
      markCaptured: (captureDataUrl = null) => set({ hasCaptureToday: true, captureDataUrl }),

      /** 그날 루틴을 수행 완료로 기록한다 (캘린더에 초록으로 표시된다) */
      markCompleted: (dateKey) =>
        set((state) =>
          state.completedDates.includes(dateKey)
            ? state
            : { completedDates: [...state.completedDates, dateKey] },
        ),

      /** 수행 완료 취소 */
      unmarkCompleted: (dateKey) =>
        set((state) => ({ completedDates: state.completedDates.filter((d) => d !== dateKey) })),

      isCompleted: (dateKey) => get().completedDates.includes(dateKey),

      /** 온보딩 직후처럼 아직 촬영하지 않은 상태로 되돌린다 */
      startFresh: () => set({ hasCaptureToday: false, captureDataUrl: null }),

      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'innerderma.care',
      version: PERSIST_VERSION,
      partialize: (state) => ({
        phase: state.phase,
        selectedDate: state.selectedDate,
        hasCaptureToday: state.hasCaptureToday,
        completedDates: state.completedDates,
      }),

      /** 버전이 숫자로 들어있는 저장값 처리 */
      migrate: (saved, fromVersion) => {
        const from = Number.isFinite(fromVersion) ? fromVersion : 0;
        return normalize(saved, from < 1);
      },

      /**
       * 항상 실행되는 단계.
       * 저장값이 깨져 있어도 화면이 죽지 않게 정리하고, 옛 형식이면 촬영 여부를 기본값으로 되돌린다.
       */
      merge: (saved, current) => ({ ...current, ...normalize(saved, isLegacy(saved)) }),
    },
  ),
);
