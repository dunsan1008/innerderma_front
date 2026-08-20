/**
 * 언어 선택(지구본) 아이콘.
 *
 * 어두운 헤더에서는 흰색, 흰 배경 화면에서는 잉크색으로 써야 해서
 * stroke 를 `currentColor` 로 두고 색은 부모의 text-* 클래스로 정한다.
 * (헤더들에는 같은 도형이 stroke="#fff" 로 인라인돼 있다 — 새로 쓰는 곳은 이걸 쓴다)
 *
 * @param {number} size 한 변 길이(px). 헤더 기준은 21.
 */
export default function GlobeIcon({ size = 21, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="5" ry="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20M3.5 7h17M3.5 17h17" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
