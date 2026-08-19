import { create } from 'zustand';

/**
 * 온보딩 상태.
 * 가입화면에서 선택한 사용자 유형을 보관한다.
 * 기획서 기준 사용자 구분: 피부 분석 사용자 / 피부 분석·시술 사용자.
 * 추후 백엔드 연동 시 이 값을 방문 기록 연결 API 요청에 함께 보낸다.
 */
export const useOnboardingStore = create((set) => ({
  /** 'DIAGNOSIS_ONLY' | 'DIAGNOSIS_AND_TREATMENT' | null */
  userType: null,
  setUserType: (userType) => set({ userType }),
  reset: () => set({ userType: null }),
}));
