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

/**
 * 문장형(설명·안내) 텍스트의 줄바꿈 규칙. `다국어 텍스트 줄바꿈 규칙.md` 참고.
 *
 * 한국어만 어절 단위로 끊는다(keep-all) — 나머지 언어에 그대로 적용하면
 * 중국어·일본어처럼 띄어쓰기가 없는 언어는 끊을 지점을 못 찾아 줄바꿈 자체가
 * 안 되고 컨테이너 밖으로 흘러넘친다. 영어·중국어·일본어는 각 언어의 기본
 * 줄바꿈(word-break: normal)에 맡기고, 컨테이너 폭을 넘는 단어만
 * overflow-wrap: break-word 로 강제 개행한다.
 *
 * 버튼 라벨처럼 애초에 한 줄로 두는 짧은 문구에는 적용하지 않는다 —
 * 여러 줄로 접힐 수 있는 문장·설명형 텍스트에만 쓴다.
 */
export function useWrapClass() {
  const lang = useUiStore((s) => s.lang);
  return lang === 'ko'
    ? '[word-break:keep-all] [overflow-wrap:break-word]'
    : '[word-break:normal] [overflow-wrap:break-word]';
}

export { dictionaries };
