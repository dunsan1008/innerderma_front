import { useT } from '@/i18n';
import notch from '@/assets/figma/routine-notch.svg';
import right from '@/assets/figma/routine-right.svg';
import time from '@/assets/figma/routine-time.svg';

/**
 * 루틴(솔루션) 화면 상단 헤더.
 * Figma `Container` (870:3773) 구조 그대로. 최초 접속 홈화면 헤더(870:3574)와는 다른 헤더다.
 *  - 높이 157, 배경 #16161a, 상단 라운드 44
 *  - 상태바가 컴포넌트 인스턴스가 아니라 일반 프레임으로 그려져 있어 **노치가 보인다**
 *    (Notch 183x30 @ 105,-2 / Right 66.656x11.336 @ left 311.68,top 17.33 / Time 54x21 @ 21,12)
 *  - 로고 줄: pt-4 pb-16 px-20
 *  - 요일 스트립: pb-20 px-20, 기록 있는 날은 초록 칩(#327145)
 */
export default function RoutineHeader({
  days,
  selectedDate,
  onDaySelect,
  onOpenCalendar,
  onOpenMyPage,
  onOpenLang,
}) {
  const t = useT();
  const weekdayLabels = [t.weekdays.mon, t.weekdays.tue, t.weekdays.wed, t.weekdays.thu, t.weekdays.fri, t.weekdays.sat, t.weekdays.sun];

  return (
    <div
      className="relative flex w-full flex-col items-start rounded-tl-[44px] rounded-tr-[44px] bg-header-dark"
      data-node-id="870:3773"
      data-name="Container"
    >
      {/* 검은 배경을 누르면 그 달 전체 캘린더가 열린다 */}
      <button type="button" aria-label="캘린더 열기(배경)" onClick={onOpenCalendar} className="absolute inset-0" />
      <div className="relative h-[44px] w-full shrink-0 overflow-clip" data-node-id="870:3774">
        <div className="absolute left-[105px] top-[-2px] h-[30px] w-[183px]" data-node-id="870:3775">
          <img alt="" src={notch} className="absolute inset-0 block size-full max-w-none" />
        </div>
        <div className="absolute left-[311.68px] top-[17.33px] h-[11.336px] w-[66.656px]" data-node-id="870:3778">
          <img alt="" src={right} className="absolute inset-0 block size-full max-w-none" />
        </div>
        <div className="absolute left-[21px] top-[12px] h-[21px] w-[54px]" data-node-id="870:3785">
          <img alt="" src={time} className="absolute inset-0 block size-full max-w-none" />
        </div>
      </div>

      <div
        className="relative flex w-full shrink-0 items-center justify-between px-[20px] pb-[16px] pt-[4px]"
        data-node-id="870:3791"
      >
        <div className="relative flex shrink-0 flex-col items-start" data-node-id="870:3792">
          <p
            className="relative shrink-0 whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[20px] text-white [word-break:break-word]"
            data-node-id="870:3793"
          >
            InnerDerma
          </p>
        </div>
        <div className="relative flex h-[19px] w-[52px] shrink-0 items-center justify-between" data-node-id="870:3794">
          {/* 번역(지구본) 아이콘 */}
          <button type="button" aria-label="언어 선택" onClick={onOpenLang} className="flex size-[21px] items-center justify-center">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><ellipse cx="12" cy="12" rx="5" ry="10" stroke="#fff" strokeWidth="1.5"/><path d="M2 12h20M3.5 7h17M3.5 17h17" stroke="#fff" strokeWidth="1.3"/></svg>
          </button>
          {/* 마이페이지 아이콘 */}
          <button type="button" aria-label="마이페이지" onClick={onOpenMyPage} className="flex size-[19px] items-center justify-center">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><circle cx="8" cy="5" r="3.5" stroke="#fff" strokeWidth="1.5"/><path d="M1 16.5c0-3 3-5.5 7-5.5s7 2.5 7 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      <div
        className="relative flex w-full shrink-0 items-start justify-between px-[20px] pb-[20px]"
        data-node-id="870:3800"
      >
        {/*
          이틀묶음 캡슐: 선택한 날과 다음 날을 감싸는 흰색 외곽선 캡슐.
          스트립이 선택한 날부터 시작하므로 idx 는 사실상 항상 0 이지만,
          기준일이 스트립에 없는 예외 상황에 대비해 그대로 찾아 쓴다.
        */}
        {(() => {
          if (!selectedDate) return null;
          const idx = days.findIndex((d) => d.dateKey === selectedDate);
          if (idx < 0 || idx >= 6) return null; // 다음 날이 스트립 밖이면 그리지 않는다
          // 칩 7개가 353px(393-40) 안에서 등간격. 각 칩 32px.
          const gap = (353 - 7 * 32) / 6; // ≈21.5
          const left = idx * (32 + gap);
          const width = 32 * 2 + gap + 16; // 두 칩 + 간격 + 양쪽 패딩 8px씩
          return (
            <span
              className="pointer-events-none absolute rounded-full border-[1.5px] border-solid border-white-60"
              style={{ left: 20 + left - 8, width, bottom: 15, height: 42 }}
              data-name="PairCapsule"
            />
          );
        })()}
        {days.map((d) => (
          <button
            type="button"
            key={d.dateKey}
            onClick={() => (onDaySelect ? onDaySelect(d) : onOpenCalendar?.())}
            className="relative flex shrink-0 flex-col items-center gap-[4px]"
          >
            {/*
              요일 라벨은 칸의 실제 날짜에서 온다.
              스트립이 선택한 날부터 시작하므로 월요일 고정 인덱스를 쓸 수 없다.
            */}
            <span className="relative shrink-0 whitespace-nowrap font-sans text-[11px] font-normal leading-[16.5px] text-white-50 [word-break:break-word]">
              {weekdayLabels[(new Date(`${d.dateKey}T00:00:00`).getDay() + 6) % 7]}
            </span>
            <span
              className={`relative flex size-[32px] shrink-0 items-center justify-center rounded-[100px] transition-colors duration-200 ${
                d.state === 'today'
                  ? 'bg-white'
                  : d.state === 'record'
                    ? 'bg-chip-green'
                    : d.state === 'future'
                      ? 'bg-transparent'
                      : 'bg-white-20'
              }`}
              data-state={d.state}
            >
              {/* 선택한 날은 앰버 테두리로 강조한다 */}
              {selectedDate && d.dateKey === selectedDate ? (
                <span className="absolute inset-[-3px] rounded-[100px] border-2 border-solid border-chip-select" data-name="Selected" />
              ) : null}
              <span className="relative flex shrink-0 flex-col items-start">
                <span
                  className={`relative shrink-0 whitespace-nowrap font-sans text-[13px] font-bold leading-[13px] [word-break:break-word] ${
                    d.state === 'today' ? 'text-ink-70' : d.state === 'future' ? 'text-white-35' : 'text-white'
                  }`}
                >
                  {d.day}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
