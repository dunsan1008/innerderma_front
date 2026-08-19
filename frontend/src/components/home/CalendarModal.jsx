import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import StatusBar from '@/components/layout/StatusBar';
import chevron from '@/assets/figma/calendar-chevron.svg';
import {
  WEEKDAY_HEADER,
  addDays,
  buildMonthWeeks,
  parseDateKey,
  shiftMonth,
  shiftYear,
  todayKey,
} from '@/lib/calendar';

/**
 * 전체 캘린더 모달 (Figma 870:5803 "홈화면 상단 검은 배경 클릭 시").
 * 홈·루틴 화면의 어두운 헤더를 누르면 그 달 전체가 펼쳐진다.
 *
 * 레이아웃은 Figma 실측 그대로.
 *  - 프레임 아래쪽은 rgba(0,0,0,0.7) 딤 (누르면 닫힘)
 *  - 위에 393x536 짜리 #16161a 패널, 상단 라운드 44
 *  - 상태바는 컴포넌트 인스턴스라 노치가 없다
 *  - 요일 헤더 y196, 날짜 행은 y274 부터 57px 간격
 *
 * 날짜 칸은 실제 달력에서 계산한다. 셰브론으로 월을 옮기고,
 * 가운데 '2026년 8월' 을 누르면 연·월 피커로 바뀐다(Figma 에 없는 화면이라 기본 모습은 그대로 유지).
 */

/** 칸 x 오프셋 (Figma Group 8 / Group 6 내부 기준). 셀 폭 32. */
const COLUMN_X = [0, 53.5, 107, 160.5, 214, 267.5, 321];
/** 요일 헤더 y (그 아래 21px 지점에 1주차 칩이 붙는다) */
const HEADER_ROW_TOP = 196;
/** 2주차부터의 y 와 행 간격 */
const FIRST_ROW_TOP = 274;
const ROW_GAP = 57;

const CHIP = {
  record: 'bg-chip-green',
  empty: 'bg-white-20',
  today: 'bg-white',
  future: 'bg-transparent',
};

function DayChip({ day, state, selected }) {
  return (
    <div
      className={`absolute inset-0 rounded-[16px] transition-colors duration-200 ${CHIP[state]}`}
      data-name="Container"
      data-state={state}
    >
      {/* 선택한 날은 앰버 테두리로 강조한다 */}
      {selected ? (
        <span className="absolute inset-[-3px] rounded-[19px] border-2 border-solid border-chip-select" data-name="Selected" />
      ) : null}
      <div className="absolute left-[12px] top-[6px] h-[20px] w-[8px]" data-name="Paragraph">
        <p
          className={`absolute left-[4px] top-0 -translate-x-1/2 whitespace-nowrap text-center font-sans text-[13px] font-bold leading-[19.5px] [word-break:break-word] ${
            state === 'today' ? 'text-ink-70' : 'text-white'
          }`}
        >
          {day}
        </p>
      </div>
    </div>
  );
}

/** 월 이동 줄 (Figma 870:5821). 라벨을 누르면 연·월 피커가 열린다. */
function MonthNav({ view, onPrev, onNext, onTogglePicker, pickerOpen }) {
  const t = useT();
  return (
    <div
      className="absolute flex h-[27px] items-start justify-center gap-[4px] pr-[110px]"
      style={{ left: 116.07, top: 144 }}
      data-node-id="870:5821"
    >
      <button
        type="button"
        aria-label={t.calendar.prevMonth}
        onClick={onPrev}
        className="relative h-[27px] w-[31px] shrink-0"
      >
        <img alt="" src={chevron} className="absolute left-[10.52px] top-[6px] block h-[17px] w-[10px] max-w-none" />
      </button>

      <button
        type="button"
        onClick={onTogglePicker}
        aria-expanded={pickerOpen}
        aria-label={`${t.calendar.yearMonth(view.year, view.month)} — 연·월 선택`}
        className="relative h-[19px] w-[81.929px] shrink-0"
      >
        <span className="absolute left-0 top-0 whitespace-nowrap font-sans text-[16px] font-bold leading-[25px] text-white [word-break:break-word]">
          {t.calendar.yearMonth(view.year, view.month)}
        </span>
      </button>

      <div className="relative flex shrink-0 items-center justify-center">
        {/* Figma 는 같은 셰브론을 180도 회전해 다음 달 버튼으로 쓴다 */}
        <div className="flex-none rotate-180 -scale-y-100">
          <button
            type="button"
            aria-label={t.calendar.nextMonth}
            onClick={onNext}
            className="relative flex h-[27px] w-[26px] items-center justify-center"
          >
            <img alt="" src={chevron} className="relative h-[17px] w-[10px] shrink-0 max-w-none" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** 연·월 피커 — 날짜 격자 자리에 겹쳐 그린다 */
function MonthYearPicker({ view, onChangeYear, onPickMonth }) {
  const t = useT();
  /** 1월~12월 라벨. 이 컴포넌트 안에서 만들어야 한다(밖에서 만든 값은 여기 스코프에 없다). */
  const monthLabels = Array.from({ length: 12 }, (_, i) => t.calendar.monthLabel(i + 1));

  return (
    <div
      className="absolute left-[20px] w-[353px]"
      style={{ top: HEADER_ROW_TOP }}
      data-name="MonthYearPicker"
    >
      <div className="flex h-[40px] items-center justify-center gap-[24px]">
        <button
          type="button"
          aria-label={t.calendar.prevYear}
          onClick={() => onChangeYear(-1)}
          className="flex size-[32px] items-center justify-center rounded-full bg-white-10"
        >
          <img alt="" src={chevron} className="block h-[15px] w-[9px] max-w-none" />
        </button>
        <span className="min-w-[72px] text-center font-sans text-[18px] font-bold leading-[27px] text-white">
          {t.calendar.yearLabel(view.year)}
        </span>
        <button
          type="button"
          aria-label={t.calendar.nextYear}
          onClick={() => onChangeYear(1)}
          className="flex size-[32px] items-center justify-center rounded-full bg-white-10"
        >
          <span className="block rotate-180">
            <img alt="" src={chevron} className="block h-[15px] w-[9px] max-w-none" />
          </span>
        </button>
      </div>

      <div className="mt-[16px] grid grid-cols-4 gap-[12px]">
        {monthLabels.map((label, i) => {
          const active = view.month === i + 1;
          return (
            <button
              type="button"
              key={label}
              onClick={() => onPickMonth(i + 1)}
              aria-pressed={active}
              className={`h-[44px] rounded-[12px] font-sans text-[14px] font-semibold transition-colors duration-200 ${
                active ? 'bg-white text-ink-90' : 'bg-white-10 text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarModal({
  selectedDate,
  completedDates = [],
  onClose,
  onSelectDate,
  entered = true,
}) {
  const t = useT();
  const today = todayKey();
  /** 보고 있는 달 — 선택한 날짜의 달에서 시작한다 */
  const [view, setView] = useState(() => {
    const { year, month } = parseDateKey(selectedDate);
    return { year, month };
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  // 밖에서 날짜가 바뀌면(다른 화면에서 선택) 그 달로 따라간다
  useEffect(() => {
    const { year, month } = parseDateKey(selectedDate);
    setView((prev) => (prev.year === year && prev.month === month ? prev : { year, month }));
  }, [selectedDate]);

  const weeks = buildMonthWeeks(view, completedDates, today);

  /**
   * 이틀 묶음 판정.
   * 한 번 촬영으로 그날 나이트 + 다음날 모닝 솔루션을 제공하므로,
   * "선택한 날 + 다음 날"을 쌍으로 묶어 흰색 외곽선을 그린다.
   * 기본값은 오늘. 다른 날짜를 선택하면 그 날짜 기준으로 바뀐다.
   */
  const pairedDay1 = selectedDate;
  const pairedDay2 = addDays(selectedDate, 1);
  const isPaired = (dateKey) => dateKey === pairedDay1 || dateKey === pairedDay2;

  /** 주 행 안에서 이틀묶음 캡슐이 필요한지 확인하고 span 을 반환한다 */
  const pairCapsuleFor = (week) => {
    const i1 = week.findIndex((c) => c && c.dateKey === pairedDay1);
    const i2 = week.findIndex((c) => c && c.dateKey === pairedDay2);
    if (i1 < 0 || i2 < 0) return null;
    const left = COLUMN_X[Math.min(i1, i2)] - 6;
    const right = COLUMN_X[Math.max(i1, i2)] + 32 + 6;
    return (
      <span
        className="pointer-events-none absolute top-[-4px] rounded-full border-[1.5px] border-solid border-white-60"
        style={{ left, width: right - left, height: 40 }}
        data-name="PairCapsule"
      />
    );
  };


  /**
   * 캘린더 패널 높이를 주 수에 따라 조절한다.
   * 5주 달: 536px(Figma 기본), 6주 달: 593px, 4주 달: 479px
   * = HEADER_ROW_TOP(196) + 요일헤더+1주차(53+21=74) + 나머지주 × ROW_GAP(57) + 하단패딩(30)
   * 단, MonthYearPicker 가 열려 있을 때는 고정값(480)으로 충분하다.
   */
  const weekCount = weeks.length;
  const panelHeight = pickerOpen ? 480 : HEADER_ROW_TOP + 53 + 21 + (weekCount - 1) * ROW_GAP + 30;
  /** 첫 주는 요일 헤더 칸 안쪽(+21px)에 들어간다 */
  const [firstWeek, ...restWeeks] = weeks;

  const pick = (cell) => {
    if (!cell) return;
    onSelectDate(cell.dateKey);
  };

  return (
    <div
      className="absolute inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={t.calendar.fullCalendar}
      data-node-id="870:5803"
    >
      {/* 패널 밖을 누르면 닫힌다. 딤은 페이드로 들어온다 */}
      <button
        type="button"
        aria-label={t.calendar.closeCalendar}
        onClick={onClose}
        data-testid="calendar-backdrop"
        className={`absolute inset-0 bg-overlay transition-opacity duration-[280ms] ease-out ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 패널은 위에서 아래로 부드럽게 펼쳐진다 */}
      <div
        className={`absolute left-0 top-0 w-[393px] overflow-hidden rounded-tl-[44px] rounded-tr-[44px] rounded-bl-[16px] rounded-br-[16px] bg-header-dark transition-[transform,opacity,height] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entered ? 'translate-y-0 opacity-100' : '-translate-y-[24px] opacity-0'
        }`}
        style={{ height: panelHeight }}
        data-node-id="870:5805"
      >
        <StatusBar className="absolute left-[13px] top-[5px] h-[44px] w-[366px]" tone="white" />

        {/* 로고 줄 */}
        <div
          className="absolute left-0 top-[49px] flex h-[55px] w-[393px] items-center justify-between px-[20px] pb-[16px] pt-[20px]"
          data-node-id="870:5809"
        >
          <div className="relative flex shrink-0 items-center justify-center pl-[5px] pr-[20px] pt-[5px]">
            <div className="relative flex shrink-0 items-center justify-center pr-[100px]">
              <p className="relative h-[13px] w-[123px] shrink-0 font-logo text-[20px] font-bold not-italic leading-[16.5px] text-white [word-break:break-word]">
                InnerDerma
              </p>
            </div>
          </div>
          <div className="relative flex h-[19px] w-[52px] shrink-0 items-center justify-between" data-node-id="870:5813">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><ellipse cx="12" cy="12" rx="5" ry="10" stroke="#fff" strokeWidth="1.5"/><path d="M2 12h20M3.5 7h17M3.5 17h17" stroke="#fff" strokeWidth="1.3"/></svg>
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><circle cx="8" cy="5" r="3.5" stroke="#fff" strokeWidth="1.5"/><path d="M1 16.5c0-3 3-5.5 7-5.5s7 2.5 7 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>

        <MonthNav
          view={view}
          pickerOpen={pickerOpen}
          onPrev={() => setView((v) => shiftMonth(v, -1))}
          onNext={() => setView((v) => shiftMonth(v, 1))}
          onTogglePicker={() => setPickerOpen((v) => !v)}
        />

        {pickerOpen ? (
          <MonthYearPicker
            view={view}
            onChangeYear={(delta) => setView((v) => shiftYear(v, delta))}
            onPickMonth={(month) => {
              setView((v) => ({ ...v, month }));
              setPickerOpen(false);
            }}
          />
        ) : (
          <>
            {/* 요일 헤더 + 1주차 */}
            <div
              className="absolute left-[20px] h-[53px] w-[353px]"
              style={{ top: HEADER_ROW_TOP }}
              data-node-id="870:5829"
            >
              {pairCapsuleFor(firstWeek)}
              {WEEKDAY_HEADER.map((label, i) => {
                const cell = firstWeek[i];
                return (
                  <div key={label} className="absolute top-0 h-[53px] w-[32px]" style={{ left: COLUMN_X[i] }}>
                    <p className="absolute left-[16px] top-0 -translate-x-1/2 whitespace-nowrap text-center font-sans text-[13px] font-medium leading-[16.5px] text-white [word-break:break-word]">
                      {label}
                    </p>
                    {cell ? (
                      <button
                        type="button"
                        onClick={() => pick(cell)}
                        aria-label={`${cell.day}일`}
                        aria-current={cell.dateKey === selectedDate ? 'date' : undefined}
                        className="absolute left-0 top-[21px] size-[32px]"
                      >
                        <DayChip day={cell.day} state={cell.state} selected={cell.dateKey === selectedDate} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* 2주차 이후 */}
            {restWeeks.map((week, wi) => (
              <div
                key={`week-${wi}`}
                className="absolute left-[20px] h-[32px] w-[353px]"
                style={{ top: FIRST_ROW_TOP + wi * ROW_GAP }}
              >
                {pairCapsuleFor(week)}
                {week.map((cell, i) =>
                  cell ? (
                    <button
                      type="button"
                      key={cell.day}
                      onClick={() => pick(cell)}
                      aria-label={`${cell.day}일`}
                      aria-current={cell.dateKey === selectedDate ? 'date' : undefined}
                      className="absolute top-0 size-[32px]"
                      style={{ left: COLUMN_X[i] }}
                    >
                      <DayChip day={cell.day} state={cell.state} selected={cell.dateKey === selectedDate} />
                    </button>
                  ) : null,
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
