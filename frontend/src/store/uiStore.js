import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 앱 전역 오버레이 상태 + 표시 언어.
 * 캘린더와 세안 확인은 화면을 갈아타는 게 아니라 현재 화면 위에 겹쳐 뜨는 것이므로
 * 라우팅이 아니라 이 스토어로 관리한다.
 *
 * 언어(`lang`)만 localStorage 에 저장한다.
 * 외국인 대상 서비스라 새로고침·재접속마다 언어를 다시 고르게 하면 안 된다.
 * 모달 열림 상태는 저장하지 않는다(재접속 시 모달이 떠 있으면 안 되므로).
 */

/** 지원 언어 — src/i18n 의 사전 키와 일치해야 한다 */
export const SUPPORTED_LANGS = ['ko', 'zh', 'ja', 'en'];

const DEFAULT_LANG = 'ko';

/**
 * 브라우저 언어에서 초기 언어를 추론한다.
 * 저장된 값이 없을 때만 쓰인다(외국인이 처음 들어와도 자기 언어로 보이게).
 */
function detectLang() {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  for (const tag of navigator.languages || [navigator.language || '']) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(code)) return code;
  }
  return DEFAULT_LANG;
}

export const useUiStore = create(
  persist(
    (set) => ({
      /** 전체 캘린더 모달 */
      calendarOpen: false,
      openCalendar: () => set({ calendarOpen: true }),
      closeCalendar: () => set({ calendarOpen: false }),

      /** 촬영 전 "귀가 후 세안을 하고 오셨나요?" 확인 모달 */
      washCheckOpen: false,
      openWashCheck: () => set({ washCheckOpen: true }),
      closeWashCheck: () => set({ washCheckOpen: false }),

      /** 언어 선택 모달 */
      langOpen: false,
      openLang: () => set({ langOpen: true }),
      closeLang: () => set({ langOpen: false }),

      /** 표시 언어 — 저장된 값이 없으면 브라우저 언어에서 추론 */
      lang: detectLang(),
      setLang: (code) => set({ lang: SUPPORTED_LANGS.includes(code) ? code : DEFAULT_LANG }),

      closeAll: () => set({ calendarOpen: false, washCheckOpen: false, langOpen: false }),
    }),
    {
      name: 'innerderma.ui',
      version: 1,
      /** 언어만 저장한다 (모달 상태는 재접속 시 항상 닫힌 채로 시작) */
      partialize: (state) => ({ lang: state.lang }),
      /** 저장값이 깨져 있어도 화면이 죽지 않게 정리한다 */
      merge: (saved, current) => ({
        ...current,
        lang: SUPPORTED_LANGS.includes(saved?.lang) ? saved.lang : current.lang,
      }),
    },
  ),
);
