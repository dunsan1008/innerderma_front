/**
 * 자체 i18n 시스템.
 * 외부 라이브러리 없이 zustand 의 lang 상태를 읽어 해당 언어 사전을 반환한다.
 *
 * 사용법:
 *   import { useT } from '@/i18n';
 *   const t = useT();
 *   t.home.tonight  // → '오늘 밤' (ko) / 'Tonight' (en) / ...
 *
 * 함수형 값(calendar.yearMonth 등)은 그대로 호출하면 된다:
 *   t.calendar.yearMonth(2026, 8)  // → '2026년 8월'
 */
import { useUiStore } from '@/store/uiStore';
import ko from './ko';
import en from './en';
import zh from './zh';
import ja from './ja';

const dictionaries = { ko, en, zh, ja };

/**
 * 현재 선택된 언어의 번역 사전을 반환하는 훅.
 * 컴포넌트 안에서 사용한다.
 */
export function useT() {
  const lang = useUiStore((s) => s.lang);
  return dictionaries[lang] || dictionaries.ko;
}

/**
 * 컴포넌트 밖(상수 파일 등)에서 현재 언어 사전을 읽을 때.
 * 리렌더가 자동으로 일어나지 않으므로 가능하면 useT()를 쓸 것.
 */
export function getT() {
  const lang = useUiStore.getState().lang;
  return dictionaries[lang] || dictionaries.ko;
}

export { dictionaries };
