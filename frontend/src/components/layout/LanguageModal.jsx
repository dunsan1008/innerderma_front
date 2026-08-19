import { useState } from 'react';
import useMountTransition from '@/lib/useMountTransition';
import { useT } from '@/i18n';

/**
 * 언어 선택 모달.
 * 번역 아이콘(지구본)을 누르면 뜬다. 프로토타입이라 선택만 받고 실제 번역은 적용하지 않는다.
 * 한국어 / 중국어 / 일본어 / English(미국어) 4개 옵션.
 */

const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export default function LanguageModal({ open, onClose, current = 'ko', onSelect }) {
  const t = useT();
  const { mounted, entered } = useMountTransition(open, 200);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="언어 선택">
      {/* 딤 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-overlay transition-opacity duration-200 ${entered ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* 리스트 카드 */}
      <div
        className={`absolute left-[60px] right-[60px] top-[200px] rounded-[20px] bg-white px-[8px] py-[12px] shadow-lg transition-[transform,opacity] duration-200 ease-out ${
          entered ? 'translate-y-0 opacity-100' : '-translate-y-[12px] opacity-0'
        }`}
      >
        <p className="px-[16px] pb-[8px] pt-[4px] font-sans text-[14px] font-bold leading-[20px] text-text-strong">
          Language
        </p>
        {LANGUAGES.map((lang) => {
          const active = lang.code === current;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => { onSelect(lang.code); onClose(); }}
              aria-pressed={active}
              className={`flex w-full items-center gap-[12px] rounded-[12px] px-[16px] py-[12px] text-left transition-colors duration-150 ${
                active ? 'bg-[#f2f2f7]' : ''
              }`}
            >
              <span className="text-[20px]">{lang.flag}</span>
              <span className="font-sans text-[15px] font-medium leading-[20px] text-text-strong">{lang.label}</span>
              {active ? (
                <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5L6.5 12L13 4" stroke="#327145" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
