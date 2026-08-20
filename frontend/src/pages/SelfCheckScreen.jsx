import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import chevron from '@/assets/figma/selfcheck-chevron.svg';
import { SELF_CHECK_ITEMS, SELF_CHECK_OTHER } from '@/constants/selfCheck';
import { submitSelfCheck, buildSelfCheckAnswers } from '@/api/selfCheck';
import { useAuthStore } from '@/store/authStore';

/**
 * 데일리 자가 진단 (Figma 970:1090).
 *
 * 구조
 *  - 상단 헤더 393x59 @ y48, 하단 0.667px rgba(0,0,0,0.1) 라인, 중앙 정렬 16px semibold
 *  - 본문 컨테이너 @ y135, px-16
 *      · 카드: 흰 배경, border 0.667px rgba(0,0,0,0.1), 상단 라운드 16
 *      · "직접 체크" 세그먼트 탭 h36 #eee, 상단 라운드 10, drop-shadow
 *      · 빈 줄 하나(970:1099) + 셰브론 18x18
 *      · 항목 목록 h429: 버튼 324x44 radius 14, 12px 좌측
 *          - 미선택 #f8f8fb / 선택 #ededed + 0.5px #777 테두리
 *          - 라벨 14px medium #717182, left 18.67 top 10.67
 *      · "그 외" 카드 319x49 radius 16 (Noto Sans 14px #1a1d23)
 *  - 하단 고정 바 420x93 @ (-13, 549+135=684) — 프레임 기준 y684
 *      · 저장 버튼 277x55 @ (72, 18.33) radius 16 #16161a
 *
 * 항목은 다중 선택이며 "아무 이상이 없어요."를 고르면 나머지가 해제된다.
 */

/**
 * Figma 항목 좌표 (컨테이너 970:1104 기준).
 *  - 970:1111 / 970:1113 은 같은 위치·같은 문구("피부가 푸석해요") 중복이라 한 번만 그린다
 *  - 970:1115("그 외") / 970:1117("아무 이상이 없어요.") 도 같은 위치에 겹쳐 있는데,
 *    뒤에 있는 970:1117 이 위로 그려지므로 실제로 보이는 건 "아무 이상이 없어요." 다.
 *    "그 외" 는 아래 970:1119 카드로 따로 존재한다.
 */
const ITEM_TOP = [0.333, 52, 104, 162.333, 220.333];
const ITEM_LEFT = [12, 12, 12, 12.333, 12.333];
/** "그 외" 카드 y (970:1119) */
const OTHER_TOP = 278.333;

export default function SelfCheckScreen() {
  const t = useT();
  const navigate = useNavigate();
  /** 선택된 항목 id 목록 (다중 선택) */
  const [selected, setSelected] = useState([]);
  /** "그 외" 자유 입력 */
  const [otherText, setOtherText] = useState('');

  const toggle = (id) => {
    setSelected((prev) => {
      // "이상 없음"은 단독 선택이다
      if (id === 'none') return prev.includes('none') ? [] : ['none'];
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev.filter((v) => v !== 'none'), id];
      return next;
    });
  };

  /** 아무것도 고르지 않으면 저장할 수 없다 */
  const canSave = selected.length > 0 || otherText.trim().length > 0;
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const userCode = useAuthStore.getState().userCode;
    if (userCode) {
      try {
        await submitSelfCheck(userCode, buildSelfCheckAnswers(selected, otherText));
      } catch (err) {
        // 대회 시연 중 흐름이 끊기지 않도록, 실패해도 다음 화면으로는 넘어간다.
        console.error('[SelfCheckScreen] submit failed', err);
      }
    }
    navigate('/solution-loading');
  };

  return (
    <Screen className="bg-white" nodeId="970:1090" name="자가진단">
      {/* 이 프레임의 상태바는 top 4 (다른 프레임은 7) — Figma 970:1091 */}
      <StatusBar className="absolute left-[13px] top-[4px] h-[44px] w-[366px]" />

      {/* 헤더 */}
      <div
        className="absolute left-0 top-[48px] flex h-[59px] w-[393px] items-center justify-center border-b-[0.667px] border-solid border-hairline bg-white py-[16px]"
        data-node-id="970:1092"
        data-name="Container"
      >
        <p
          className="relative shrink-0 whitespace-nowrap font-sans text-[16px] font-semibold leading-[24px] tracking-[-0.3125px] text-ink"
          data-node-id="970:1094"
        >
          {t.selfCheck.title}
        </p>
      </div>

      {/* 본문 */}
      <div className="absolute left-0 top-[135px] w-[393px] px-[16px]" data-node-id="970:1095" data-name="Container">
        <div
          className="relative flex w-full flex-col items-start overflow-clip rounded-tl-[16px] rounded-tr-[16px] border-[0.667px] border-solid border-hairline bg-white"
          data-node-id="970:1096"
        >
          {/* 직접 체크 세그먼트 */}
          <div
            className="relative flex h-[36px] w-full shrink-0 flex-col items-center justify-center rounded-tl-[10px] rounded-tr-[10px] bg-check-tab py-[8px]"
            style={{ filter: 'drop-shadow(0px 1px 1.5px rgba(0,0,0,0.1)) drop-shadow(0px 1px 1px rgba(0,0,0,0.1))' }}
            data-node-id="970:1097"
            data-name="Button"
          >
            <p className="relative shrink-0 whitespace-nowrap text-center font-sans text-[14px] font-semibold leading-[20px] tracking-[-0.1504px] text-black">
              {t.selfCheck.directCheck}
            </p>
          </div>

          {/* Figma 970:1099 — 라벨 없는 줄 + 셰브론 */}
          <div
            className="relative flex w-full shrink-0 items-center justify-between px-[16px] pb-[14px] pt-[20px]"
            data-node-id="970:1099"
          >
            <div className="relative h-[20px] w-[71px] shrink-0" data-node-id="970:1101" />
            <img alt="" src={chevron} className="relative size-[18px] shrink-0" data-node-id="970:1102" />
          </div>

          {/* 항목 목록 */}
          <div className="relative h-[429px] w-full shrink-0 overflow-clip" data-node-id="970:1104">
            {SELF_CHECK_ITEMS.map((item, i) => {
              const on = selected.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  aria-pressed={on}
                  className={`absolute h-[44px] w-[324px] rounded-[14px] text-left transition-[background-color,box-shadow] duration-150 ${
                    // 선택 테두리는 inset 그림자로 그린다. border 를 쓰면 0.5px 만큼 글자가 밀린다.
                    on ? 'bg-check-on shadow-[inset_0_0_0_0.5px_#777777]' : 'bg-check-off'
                  }`}
                  style={{ left: ITEM_LEFT[i], top: ITEM_TOP[i] }}
                  data-name="Button"
                  data-testid={`selfcheck-${item.id}`}
                >
                  {/* 선택돼도 글자 색은 그대로다 (Figma 970:1108) */}
                  <span
                    className="absolute left-[18.67px] top-[10.67px] whitespace-nowrap font-sans text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-check-label"
                  >
                    {t.selfCheckItems[item.id]}
                  </span>
                </button>
              );
            })}

            {/* 그 외 — 자유 입력 카드 */}
            <div
              className="absolute left-[12.33px] flex h-[49px] w-[319px] flex-col items-start overflow-clip rounded-[16px] border-[0.667px] border-solid border-check-off bg-check-off"
              style={{ top: OTHER_TOP, boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.06)' }}
              data-node-id="970:1119"
            >
              <div className="relative flex w-[318px] shrink-0 items-center px-[16px] py-[14px]" data-node-id="970:1120">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder={t.selfCheckItems[SELF_CHECK_OTHER.id]}
                  aria-label={t.selfCheckItems[SELF_CHECK_OTHER.id]}
                  className="w-full bg-transparent font-sans text-[14px] font-normal leading-[20px] text-text-strong outline-none placeholder:text-text-strong"
                  data-testid="selfcheck-other"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 저장 바 — Figma 는 컨테이너(y135) 기준 y549 이므로 프레임 기준 684 */}
      <div
        className="absolute left-[-13px] top-[684px] h-[93px] w-[420px] max-w-[420px] border-t-[0.667px] border-solid border-hairline bg-white"
        data-node-id="970:1125"
      >
        <button
          type="button"
          onClick={save}
          disabled={!canSave || saving}
          className={`absolute left-[72px] top-[19px] h-[55px] w-[277px] rounded-[16px] transition-colors duration-150 ${
            canSave && !saving ? 'bg-header-dark' : 'bg-disabled-bg'
          }`}
          data-node-id="970:1126"
          data-testid="selfcheck-save"
        >
          <span
            className={`absolute left-[132.5px] top-[16px] h-[28px] w-[73px] -translate-x-1/2 text-center font-sans text-[16px] font-bold leading-[24px] tracking-[-0.3125px] ${
              canSave && !saving ? 'text-white' : 'text-disabled-text'
            }`}
          >
            {t.selfCheck.saveItems}
          </span>
        </button>
      </div>
    </Screen>
  );
}
