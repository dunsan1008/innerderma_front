/**
 * 공용 버튼.
 * Figma 컴포넌트 세트 `Button` (643:1189) 의 3가지 variant 를 그대로 옮긴 것.
 *  - enabled  : 검정 배경 / 흰 글씨
 *  - enabled2 : 흰 배경 / #8a8e95 테두리 / #1a1d23 글씨
 *  - disable  : #e5e9f0 배경 / #b0b6c0 글씨 (클릭 불가)
 *
 * 기본 크기는 353x52, radius 14. 화면마다 폭이 달라 `className` 으로 덮어쓴다.
 */
const VARIANTS = {
  enabled: 'bg-ink text-white',
  enabled2: 'bg-white border border-solid border-line-strong text-text-strong',
  disable: 'bg-disabled-bg text-disabled-text',
};

export default function Button({
  variant = 'enabled',
  className = 'h-[52px] w-[353px]',
  onClick,
  children,
  nodeId,
  ...rest
}) {
  const disabled = variant === 'disable';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-center justify-center rounded-[14px] ${VARIANTS[variant]} ${className}`}
      data-node-id={nodeId}
      data-name="Button"
      {...rest}
    >
      <span className="shrink-0 whitespace-nowrap text-center font-sans text-[16px] font-semibold leading-[24px] [word-break:break-word]">
        {children}
      </span>
    </button>
  );
}
