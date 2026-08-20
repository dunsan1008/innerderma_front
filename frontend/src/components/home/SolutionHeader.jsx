import { useT } from '@/i18n';
import StatusBar from '@/components/layout/StatusBar';

/**
 * 홈(솔루션) 화면 상단 어두운 헤더.
 * Figma `Container` (870:3574) 구조 그대로.
 *  - 배경 #16161a, 높이 219, 상단 라운드 44
 *  - pl-13 pt-7 안에 상태바(366x44, 흰색 톤)
 *  - 로고 줄: pt-20 pb-16 pl-20 pr-30, 좌측 InnerDerma / 우측 아이콘 그룹 52x19
 *  - 요일 스트립: pt-30 px-20, 7칸 justify-between (32x32 원형 칩)
 *
 * @param {Array<{label:string,day:number,dateKey:string,state:'record'|'empty'|'today'|'future'}>} days
 * @param {string} selectedDate 선택한 날짜 키 — 해당 칩에 테두리를 그린다
 * @param {number} height 헤더 높이. 화면에 따라 219 / 157 로 다르다.
 */
export default function SolutionHeader({
  days,
  selectedDate,
  height = 219,
  onDaySelect,
  onOpenCalendar,
  onOpenMyPage,
  onOpenLang,
}) {
  const t = useT();
  const weekdayLabels = [t.weekdays.mon, t.weekdays.tue, t.weekdays.wed, t.weekdays.thu, t.weekdays.fri, t.weekdays.sat, t.weekdays.sun];

  return (
    <div
      className="absolute left-0 top-0 flex w-[393px] flex-col items-start overflow-clip rounded-tl-[44px] rounded-tr-[44px] bg-header-dark"
      style={{ height }}
      data-node-id="870:3574"
      data-name="Container"
    >
      {/*
        프레임 이름 "홈화면 상단 검은 배경 클릭 시" 대로, 헤더의 검은 배경을 누르면
        그 달 전체 캘린더가 펼쳐진다. 로고·아이콘·요일 칩보다 아래에 깔아 둔다.
      */}
      <button type="button" aria-label={t.calendar.openCalendar} onClick={onOpenCalendar} className="absolute inset-0" />
      {/*
        상태바·로고 줄은 루틴 헤더(870:3773)와 같은 규격을 쓴다.
        예전에는 상태바를 pl-13 pt-7 로 밀고 로고에 고정 h-13/w-123 과 pl-5/pr-20/pt-5,
        줄 자체에 pr-30 을 줘서, 솔루션을 받은 뒤 헤더와 로고·아이콘 위치가 어긋났다
        (로고 left 25 vs 20 / top 76.5 vs 48, 아이콘 우측 끝 363 vs 373).
      */}
      {/*
        상태바를 프레임 전체 폭으로 둔다. 366 폭을 left 13 에 놓으면 내부 시간이
        frame x=34 로 밀려 기준 헤더(x=21)와 어긋난다. 전체 폭이면 내부 좌표가
        그대로 기준과 맞는다 (시간 21 / 우측 아이콘 오른쪽 끝 378.33).
      */}
      <div className="relative h-[44px] w-full shrink-0" data-node-id="870:3575">
        <StatusBar tone="white" className="absolute left-0 top-0 h-[44px] w-[393px]" />
      </div>

      <div
        className="relative flex w-full shrink-0 items-center justify-between px-[20px] pb-[16px] pt-[4px]"
        data-node-id="870:3577"
      >
        <div className="relative flex shrink-0 flex-col items-start" data-node-id="870:3578">
          <p
            className="relative shrink-0 whitespace-nowrap font-logo text-[20px] font-bold not-italic leading-[20px] text-white [word-break:break-word]"
            data-node-id="870:3580"
          >
            InnerDerma
          </p>
        </div>
        <div className="relative flex h-[19px] w-[52px] shrink-0 items-center justify-between" data-node-id="870:3581" data-name="Group 3">
          {/* 번역(지구본) 아이콘. aria-label은 의도적으로 번역하지 않는다 —
              언어 전환 후에도 "언어 선택"으로 이 버튼을 다시 찾을 수 있어야
              하므로 현재 언어와 무관한 고정 앵커로 둔다 (verify-i18n.mjs 참고). */}
          <button type="button" aria-label="언어 선택" onClick={onOpenLang} className="flex size-[21px] items-center justify-center">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><ellipse cx="12" cy="12" rx="5" ry="10" stroke="#fff" strokeWidth="1.5"/><path d="M2 12h20M3.5 7h17M3.5 17h17" stroke="#fff" strokeWidth="1.3"/></svg>
          </button>
          {/* 마이페이지 아이콘 */}
          <button type="button" aria-label={t.common.mypage} onClick={onOpenMyPage} className="flex size-[19px] items-center justify-center">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><circle cx="8" cy="5" r="3.5" stroke="#fff" strokeWidth="1.5"/><path d="M1 16.5c0-3 3-5.5 7-5.5s7 2.5 7 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      <div
        className="relative flex w-[393px] shrink-0 items-start justify-between px-[20px] pb-[20px]"
        data-node-id="870:3587"
      >
        {/* 이틀묶음 캡슐 */}
        {(() => {
          if (!selectedDate) return null;
          const idx = days.findIndex((d) => d.dateKey === selectedDate);
          if (idx < 0 || idx >= 6) return null;
          const gap = (353 - 7 * 32) / 6;
          const left = idx * (32 + gap);
          const width = 32 * 2 + gap + 16;
          return (
            <span
              className="pointer-events-none absolute rounded-full border-[1.5px] border-solid border-white-60"
              style={{ left: 20 + left - 8, width, bottom: 15, height: 42 }}
              data-name="PairCapsule"
            />
          );
        })()}
        {days.map((d, _di) => (
          <button
            type="button"
            key={d.label}
            onClick={() => (onDaySelect ? onDaySelect(d) : onOpenCalendar?.())}
            className="relative flex shrink-0 flex-col items-center gap-[4px]"
            data-name="Button"
          >
            <span className="relative shrink-0 whitespace-nowrap text-center font-sans text-[11px] font-normal leading-[16.5px] text-white-50 [word-break:break-word]">
              {weekdayLabels[_di]}
            </span>
            <span
              className={`relative flex size-[32px] shrink-0 items-center justify-center rounded-[16px] transition-colors duration-200 ${
                d.state === 'today'
                  ? 'bg-white'
                  : d.state === 'record'
                    ? 'bg-chip-dark'
                    : d.state === 'future'
                      ? 'bg-transparent'
                      : 'bg-white-20'
              } ${d.dimmed ? 'opacity-90' : ''}`}
              data-state={d.state}
            >
              {/* 선택한 날은 앰버 테두리로 강조한다 */}
              {selectedDate && d.dateKey === selectedDate ? (
                <span className="absolute inset-[-3px] rounded-[19px] border-2 border-solid border-chip-select" data-name="Selected" />
              ) : null}
              <span className="relative flex shrink-0 flex-col items-center">
                <span
                  className={`relative shrink-0 whitespace-nowrap text-center font-sans text-[13px] font-bold leading-[19.5px] [word-break:break-word] ${
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
