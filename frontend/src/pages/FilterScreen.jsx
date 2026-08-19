import { useState } from 'react';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import FilterSheet, { SheetLine } from '@/components/filter/FilterSheet';

/**
 * 마켓 필터 바텀시트 3종.
 *  - gender    : filter 1 (Figma 870:4853) — 단일 선택
 *  - age       : filter 2 (Figma 870:4826) — 중복 선택 가능
 *  - diagnosis : 피부 진단 기본 요소 (Figma 870:4877)
 */

/** 공용 옵션 버튼. 선택 시 회색 배경으로 표시한다. */
function OptionRow({ label, selected, onClick, top, bold }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`absolute left-[15px] right-[15px] flex h-[44px] items-center rounded-[10px] px-[6px] font-sans text-[17px] leading-[24px] text-text-strong transition-colors duration-150 [word-break:break-word] ${
        selected ? 'bg-[#f2f2f7]' : ''
      } ${bold ? 'font-bold' : ''}`}
      style={{ top, fontWeight: bold ? undefined : 350 }}
    >
      {label}
    </button>
  );
}

/** 성별 (filter 1) — 단일 선택 */
function GenderOptions({ selected, onSelect }) {
  const t = useT();
  const options = [
    { value: 'all', label: t.filter.all, top: 450, bold: true },
    { value: 'female', label: t.filter.female, top: 505, bold: false },
    { value: 'male', label: t.filter.male, top: 563, bold: false },
  ];

  return (
    <>
      {options.map((opt) => (
        <OptionRow
          key={opt.value}
          label={opt.label}
          selected={selected === opt.value}
          onClick={() => onSelect(opt.value)}
          top={opt.top}
          bold={opt.bold}
        />
      ))}
      <SheetLine top={499} />
      <SheetLine top={559} />
      <SheetLine left={1} top={617} />
    </>
  );
}

/** 연령대 (filter 2) — 중복 선택 가능 */
function AgeOptions({ selected, onToggle }) {
  const t = useT();
  const options = [
    { value: 'all', label: t.filter.all, top: 447, bold: true },
    { value: '10s', label: t.filter.teens, top: 504 },
    { value: '20s', label: t.filter.twenties, top: 564 },
    { value: '30s', label: t.filter.thirties, top: 624 },
    { value: '40s', label: t.filter.forties, top: 684 },
  ];

  return (
    <>
      {options.map((opt) => (
        <OptionRow
          key={opt.value}
          label={opt.label}
          selected={selected.includes(opt.value)}
          onClick={() => onToggle(opt.value)}
          top={opt.top}
          bold={opt.bold}
        />
      ))}
      <SheetLine left={-1} top={495.94} />
      <SheetLine left={-1} top={555.94} />
      <SheetLine left={-1} top={615.93} />
      <SheetLine left={-1} top={675.92} />
    </>
  );
}

/** 맞춤형 진단 — 피부 진단 기본 요소 */
function DiagnosisPanel() {
  const t = useT();
  const METRICS = [
    { label: t.filter.moisture, labelTop: 53, barTop: 74, value: '76%' },
    { label: t.filter.pigment, labelTop: 113, barTop: 130, value: '76%' },
    { label: t.filter.elasticity, labelTop: 169, barTop: 186, value: '76%' },
    { label: t.filter.pore, labelTop: 225, barTop: 242, value: '76%' },
  ];
  return (
    <div
      className="absolute bg-white"
      style={{ left: 1, top: 449, width: 391, height: 295 }}
      data-node-id="870:4895"
      data-name="Container"
    >
      <div
        className="absolute flex h-[19px] items-center justify-between"
        style={{ left: 28, right: 27, top: 16 }}
        data-node-id="870:4896"
      >
        <p className="font-sans text-[20px] font-bold leading-[18px] text-text-strong">8/15</p>
        <div className="flex items-center rounded-full bg-text-strong px-[8px] py-[2px]">
          <p className="font-sans text-[10px] font-semibold leading-[15px] text-white">{t.filter.diagnosisComplete}</p>
        </div>
      </div>

      {METRICS.map((m) => (
        <div key={m.label} className="contents">
          <p
            className="absolute left-[20px] font-sans text-[11px] font-normal leading-[16.5px] text-body"
            style={{ top: m.labelTop }}
          >
            {m.label}
          </p>
          <div
            className="absolute left-[20px] flex h-[25px] items-center gap-[8px] pt-[8px]"
            style={{ right: 19, top: m.barTop }}
          >
            <div className="relative flex h-[6px] min-w-px flex-col items-start overflow-clip rounded-full bg-line" style={{ flex: '289 0 0' }}>
              <div className="relative h-[6px] w-[220px] shrink-0 rounded-full bg-header-dark" />
            </div>
            <p className="font-sans text-[11px] font-bold leading-[16.5px] text-header-dark">{m.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const VARIANTS = {
  gender: { nodeId: '870:4853', name: 'filter 1' },
  age: { nodeId: '870:4826', name: 'filter 2' },
  diagnosis: { nodeId: '870:4877', name: '피부 진단 기본 요소' },
};

export default function FilterScreen({ variant = 'gender' }) {
  const config = VARIANTS[variant];
  const t = useT();

  // ─ 성별: 단일 선택 ('all' | 'female' | 'male')
  const [gender, setGender] = useState('all');

  // ─ 연령대: 중복 선택 (배열)
  const [ages, setAges] = useState(['all']);
  const toggleAge = (value) => {
    if (value === 'all') {
      setAges(['all']);
      return;
    }
    setAges((prev) => {
      const without = prev.filter((v) => v !== 'all' && v !== value);
      const toggled = prev.includes(value) ? without : [...without, value];
      return toggled.length === 0 ? ['all'] : toggled;
    });
  };

  /** 필터가 초기값(전체)에서 변경됐는지 */
  const hasChanges = gender !== 'all' || !(ages.length === 1 && ages[0] === 'all');

  const resetFilters = () => {
    setGender('all');
    setAges(['all']);
  };

  let content;
  if (variant === 'gender') {
    content = <GenderOptions selected={gender} onSelect={setGender} />;
  } else if (variant === 'age') {
    content = <AgeOptions selected={ages} onToggle={toggleAge} />;
  } else {
    content = <DiagnosisPanel />;
  }

  return (
    <Screen className="bg-white" nodeId={config.nodeId} name={config.name}>
      <FilterSheet
        active={variant}
        nodeId={config.nodeId}
        name={config.name}
        hasChanges={hasChanges}
        onReset={resetFilters}
      >
        {content}
      </FilterSheet>
    </Screen>
  );
}
