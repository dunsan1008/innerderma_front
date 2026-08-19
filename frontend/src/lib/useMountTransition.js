import { useEffect, useState } from 'react';

/**
 * 열림/닫힘 애니메이션을 위한 마운트 지연 훅.
 *
 * `open` 이 false 로 바뀌어도 닫힘(exit) 트랜지션이 끝날 때까지 `mounted` 를 유지하고,
 * 열릴 때는 한 프레임 뒤에 `entered` 를 켜서 CSS 트랜지션이 실제로 동작하게 한다.
 *
 * @param {boolean} open
 * @param {number} duration 트랜지션 시간(ms)
 * @returns {{mounted: boolean, entered: boolean}}
 */
export default function useMountTransition(open, duration = 280) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // rAF 를 두 번 겹친다.
      // 한 번만 쓰면 브라우저가 시작 상태를 그리기 전에 클래스가 바뀌어 트랜지션이 생략된다.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setEntered(false);
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return { mounted, entered };
}
