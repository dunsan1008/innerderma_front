import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken } from '@/api/client';

/**
 * 인증 세션 상태.
 * 비밀번호 없이 userCode 만으로 인증한다 — 최초 가입(register) 이후에는
 * 같은 userCode 로 토큰만 재발급(issueToken)받아 재사용한다.
 *
 * 토큰 자체는 axios 인터셉터가 읽는 client.js 의 localStorage 키로도 동기화해둔다
 * (client.js 는 이 스토어를 몰라도 되게, 이 스토어가 client.js 를 알고 맞춰주는 방향).
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      /** 없으면 미가입 상태 — SplashScreen 이 이 값으로 가입/재방문 분기한다 */
      userCode: null,
      name: null,
      token: null,

      setSession: ({ userCode, name, token }) => {
        setAccessToken(token);
        set({ userCode, name, token });
      },

      clearSession: () => {
        setAccessToken(null);
        set({ userCode: null, name: null, token: null });
      },
    }),
    {
      name: 'innerderma.auth',
      partialize: (state) => ({ userCode: state.userCode, name: state.name, token: state.token }),

      /** 새로고침 시 저장된 토큰을 axios 인터셉터에도 반영한다 */
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAccessToken(state.token);
      },
    },
  ),
);
