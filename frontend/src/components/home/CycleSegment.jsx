import { useT } from '@/i18n';
/**
 * 오늘 밤 / 내일 아침 세그먼트 컨트롤.
 * 기획서의 케어 사이클(귀가 후 저녁 → 다음 날 아침)을 전환하는 컨트롤이다.
 *
 * Figma 에 두 변형이 있어 `variant` 로 구분한다.
 *  - 'home'    (870:3623) : 최초 접속 홈화면. 래퍼 pb-4, 라벨 leading 16.25, 보조값 leading 12.5
 *  - 'routine' (870:3836) : 나이트/모닝 루틴 화면. 래퍼 pb-8, 라벨 leading 13, 보조값은 h12 pt-2 w19 래퍼 안 leading 10
 *
 * 공통: 트랙 bg #f4f5f7 / radius 14 / p-4 / gap-4 / w353, 버튼 flex 170.5, h44, radius 11
 */
export default function CycleSegment({
  value = 'night',
  captions = { night: '-', morning: '-' },
  onChange,
  variant = 'home',
  className = '',
}) {
  const t = useT();
  const routine = variant === 'routine';

  const items = [
    { key: 'night', label: t.home.tonight, caption: captions.night },
    { key: 'morning', label: t.home.tomorrowMorning, caption: captions.morning },
  ];

  return (
    <div
      className={`flex flex-col items-start px-[20px] pt-[20px] ${routine ? 'pb-[8px]' : 'pb-[4px]'} ${className}`}
      data-node-id={routine ? '870:3836' : '870:3623'}
      data-name="Container"
    >
      <div
        className="relative flex w-[353px] shrink-0 items-start gap-[4px] rounded-[14px] bg-segment-track p-[4px] text-center [word-break:break-word] whitespace-nowrap"
        data-node-id={routine ? '870:3837' : '870:3624'}
      >
        {/*
          선택 표시는 버튼 배경이 아니라 미끄러지는 한 장으로 그린다.
          트랙 안쪽 여백 4 + 버튼 폭 170.5 + 버튼 사이 간격 4 → 오른쪽 칸은 174.5px 이동.
        */}
        <span
          aria-hidden="true"
          data-testid="segment-thumb"
          className="pointer-events-none absolute left-[4px] top-[4px] h-[44px] w-[170.5px] rounded-[11px] bg-text-strong transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${value === 'morning' ? 174.5 : 0}px)` }}
        />

        {items.map((item) => {
          const active = item.key === value;
          return (
            <button
              type="button"
              key={item.key}
              onClick={onChange ? () => onChange(item.key) : undefined}
              aria-pressed={active}
              className="relative z-10 flex h-[44px] min-w-px flex-col items-center justify-center rounded-[11px]"
              style={{ flex: '170.5 0 0' }}
              data-name="Button"
            >
              {routine ? (
                <>
                  <span className="relative flex shrink-0 flex-col items-center" data-name="Text">
                    <span
                      className={`relative shrink-0 whitespace-nowrap text-center font-sans text-[13px] font-semibold leading-[13px] transition-colors duration-[280ms] ${
                        active ? 'text-white' : 'text-body'
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span
                    className="relative flex h-[12px] w-[19px] shrink-0 flex-col items-center pt-[2px]"
                    data-name="Text"
                  >
                    <span
                      className={`relative shrink-0 whitespace-nowrap text-center font-sans text-[10px] font-normal leading-[10px] transition-colors duration-[280ms] ${
                        active ? 'text-white-60' : 'text-disabled-text'
                      }`}
                    >
                      {item.caption}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`relative shrink-0 font-sans text-[13px] font-semibold leading-[16.25px] transition-colors duration-[280ms] ${
                      active ? 'text-white' : 'text-body'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`relative shrink-0 font-sans text-[10px] font-normal leading-[12.5px] transition-colors duration-[280ms] ${
                      active ? 'text-white-60' : 'text-disabled-text'
                    }`}
                  >
                    {item.caption}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
