import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import TabBar from '@/components/layout/TabBar';

import avatarIcon from '@/assets/figma/profile-avatar.svg';
import chevronRight from '@/assets/figma/chevron-right.svg';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useCareStore } from '@/store/careStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';

/**
 * 마이페이지 (Figma 870:5963 "마이페이지 - {t.mypage.logout} 누르면 최초 접속").
 * Container(870:5964)는 y68 에서 시작하고 pt-20 px-20 플렉스 컬럼이다.
 * 프레임 이름대로 로그아웃을 누르면 첫 화면으로 돌아간다.
 */

/**
 * 섹션 구성. Figma 순서 그대로.
 * 라벨이 언어에 따라 바뀌므로 상수가 아니라 사전을 받아 만드는 함수로 둔다.
 */
const buildSections = (t) => [
  {
    label: t.mypage.myInfo,
    labelNodeId: '870:5976',
    items: [
      { text: t.mypage.nickname, nodeId: '870:5978' },
      { text: t.mypage.password, nodeId: '870:5984' },
      { text: t.mypage.account, nodeId: '870:5990' },
    ],
  },
  {
    label: t.mypage.treatmentMgmt,
    labelNodeId: '870:5996',
    items: [{ text: t.mypage.visitHistory, nodeId: '870:5998' }],
  },
  {
    label: t.mypage.appSettings,
    labelNodeId: '870:6004',
    items: [
      { text: t.mypage.notification, nodeId: '870:6006' },
      { text: t.mypage.privacy, nodeId: '870:6012' },
    ],
  },
];

function Divider({ nodeId }) {
  return <div className="relative h-[0.667px] w-full shrink-0 bg-line" data-node-id={nodeId} data-name="Divider" />;
}

function MenuItem({ text, nodeId }) {
  return (
    <button
      type="button"
      className="relative flex h-[55px] w-[353px] shrink-0 items-center justify-between py-[16px]"
      data-node-id={nodeId}
      data-name="MenuItem"
    >
      <span className="relative flex shrink-0 flex-col items-center" data-name="Text">
        <span className="relative shrink-0 whitespace-nowrap text-center font-sans text-[15px] font-normal leading-[22.5px] text-text-strong [word-break:break-word]">
          {text}
        </span>
      </span>
      <span className="relative h-[14px] w-[8px] shrink-0" data-name="ChevronRight">
        <img alt="" src={chevronRight} className="absolute inset-0 block size-full max-w-none" />
      </span>
    </button>
  );
}

/** Figma 에서 탭바가 놓인 y 와 높이 (하단 고정 레이어로 올려 쓴다) */
const TAB_BAR_TOP = 756;
const TAB_BAR_HEIGHT = 96;

export default function MyPageScreen() {
  const navigate = useNavigate();
  const t = useT();
  const sections = buildSections(t);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const resetCare = useCareStore((s) => s.reset);
  const startFresh = useCareStore((s) => s.startFresh);
  const clearCart = useCartStore((s) => s.clear);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const clearSession = useAuthStore((s) => s.clearSession);

  /**
   * 프레임 이름대로("로그아웃 누르면 최초 접속") 상태를 비우고 첫 화면으로.
   *
   * 장바구니·찜도 함께 비운다. 예전에는 온보딩·케어만 초기화해서, 로그아웃 뒤
   * 최초 접속 상태로 돌아왔는데도 이전에 담아 둔 상품이 장바구니에 남아 있었다
   * (담은 적 없는 상품이 들어 있는 것처럼 보였다).
   *
   * 인증 세션(userCode/토큰)도 비운다 — 안 비우면 스플래시가 이 userCode로
   * 재방문 처리해서 로그아웃해도 곧장 같은 계정 홈으로 되돌아간다.
   */
  const logout = () => {
    resetOnboarding();
    resetCare();
    startFresh();
    clearCart();
    clearWishlist();
    clearSession();
    navigate('/');
  };

  return (
    <Screen className="bg-white" nodeId="870:5963" name="마이페이지" tabBarHeight={TAB_BAR_HEIGHT}
      tabBar={<TabBar className="relative h-[96px] w-[393px]" />}
      contentBottom={TAB_BAR_TOP}>
      <StatusBar className="absolute left-[13px] top-[4px] h-[44px] w-[366px]" />

      <div
        className="absolute left-0 top-[68px] flex w-[393px] flex-col items-start px-[20px] pt-[20px]"
        data-node-id="870:5964"
        data-name="Container"
      >
        {/* 프로필 */}
        <div className="relative flex w-full shrink-0 items-center gap-[14px] pb-[20px]" data-node-id="870:5965">
          <div className="relative flex size-[56px] shrink-0 items-center justify-center rounded-[28px] bg-avatar">
            <div className="relative size-[28px] shrink-0" data-name="Icon">
              <img alt="" src={avatarIcon} className="absolute inset-0 block size-full max-w-none" />
            </div>
          </div>
          <div className="relative flex w-[118.219px] shrink-0 flex-col items-start" data-node-id="870:5970">
            <div className="relative flex w-full shrink-0 flex-col items-start">
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[18px] font-bold leading-[26px] text-text-strong [word-break:break-word]">
                {t.mypage.member}
              </p>
            </div>
            <div className="relative flex h-[22px] w-[118.219px] shrink-0 flex-col items-start pt-[2px]">
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[13px] font-normal leading-[19.5px] text-body [word-break:break-word]">
                {t.mypage.accountMasked}
              </p>
            </div>
          </div>
        </div>

        <Divider nodeId="870:5975" />

        {sections.map((section) => (
          <div key={section.label} className="contents">
            <div
              className="relative flex h-[44px] w-full shrink-0 flex-col items-start pb-[4px] pt-[20px]"
              data-node-id={section.labelNodeId}
              data-name="SectionLabel"
            >
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[13px] font-semibold leading-[19.5px] text-body [word-break:break-word]">
                {section.label}
              </p>
            </div>
            {section.items.map((item) => (
              <div key={item.text} className="contents">
                <MenuItem text={item.text} nodeId={item.nodeId} />
                {/* Figma 구조상 모든 MenuItem 뒤에 Divider 가 온다 */}
                <Divider nodeId={`${item.nodeId}-divider`} />
              </div>
            ))}
          </div>
        ))}

        {/* {t.mypage.logout} */}
        <button
          type="button"
          onClick={logout}
          className="relative flex h-[55px] w-[353px] shrink-0 items-center py-[16px]"
          data-node-id="870:6018"
          data-name="Button"
        >
          <span className="relative flex shrink-0 flex-col items-center" data-name="Text">
            <span className="relative shrink-0 whitespace-nowrap text-center font-sans text-[15px] font-normal leading-[22.5px] text-danger [word-break:break-word]">
              {t.mypage.logout}
            </span>
          </span>
        </button>
      </div>
    </Screen>
  );
}
