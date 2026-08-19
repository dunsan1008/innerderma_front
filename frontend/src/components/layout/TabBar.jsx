import { useLocation, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import cameraButton from '@/assets/figma/tabbar-center.svg';

/**
 * 하단 탭바.
 * Figma `Group 68` 구조 그대로: 393x96 영역.
 *
 * 현재 경로에 따라 홈/마켓 아이콘의 활성 상태를 바꾼다.
 *  - 활성: 검정(#000)
 *  - 비활성: 회색(#C0C0C0)
 *
 * SVG 아이콘을 인라인으로 그려 CSS color(currentColor)로 제어한다.
 */

/** 현재 경로가 홈 계열인지 */
function isHomeActive(pathname) {
  return (
    pathname === '/home' ||
    pathname.startsWith('/home/') ||
    pathname.startsWith('/solution') ||
    pathname === '/mypage'
  );
}

/** 현재 경로가 마켓 계열인지 */
function isMarketActive(pathname) {
  return pathname.startsWith('/market');
}

/** 홈 아이콘 (인라인 SVG, stroke=currentColor) */
function HomeIcon() {
  return (
    <svg
      width="25"
      height="26"
      viewBox="0 0 27 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <path
        d="M8.44864 22.5994H17.9469M2.88317 10.3409C2.88317 10.3409 8.67172 4.55346 11.1846 2.0311C12.5474 0.663718 14.0801 0.712305 15.2212 1.84647L22.9431 9.51698C24.9412 11.3876 26.0008 13.0541 26.0008 15.9138V21.8373C26.0024 22.5157 25.8801 23.1877 25.6411 23.8147C25.402 24.4418 25.0509 25.0116 24.6079 25.4913C24.1649 25.971 23.6388 26.3513 23.0597 26.6102C22.4806 26.8691 21.86 27.0016 21.2335 27H5.77039C5.14387 27.0016 4.52324 26.8691 3.94415 26.6102C3.36505 26.3513 2.8389 25.971 2.39591 25.4913C1.95293 25.0116 1.60183 24.4418 1.3628 23.8147C1.12376 23.1877 1.00149 22.5157 1.00301 21.8373V15.9138C1.00301 13.0541 0.860702 12.1802 2.88317 10.3409Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 마켓(장바구니) 아이콘 (인라인 SVG, fill=currentColor) */
function BagIcon() {
  return (
    <svg
      width="26"
      height="30"
      viewBox="0 0 26.2 30.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <path
        d="M3.10114 30.1C2.24562 30.1 1.53186 29.8433 0.959857 29.33C0.387857 28.8167 0.101238 28.1761 0.1 27.4083V9.45833C0.1 8.69167 0.386619 8.05167 0.959857 7.53833C1.5331 7.025 2.24686 6.76778 3.10114 6.76667H6.6V5.93333C6.6 4.31333 7.23205 2.93611 8.49614 1.80167C9.76024 0.667222 11.2949 0.1 13.1 0.1C14.9051 0.1 16.4398 0.667222 17.7039 1.80167C18.968 2.93611 19.6 4.31333 19.6 5.93333V6.76667H23.1007C23.955 6.76667 24.6681 7.02389 25.2401 7.53833C25.8121 8.05278 26.0988 8.69333 26.1 9.46V27.4083C26.1 28.175 25.8134 28.8156 25.2401 29.33C24.6669 29.8444 23.9538 30.1011 23.1007 30.1H3.10114ZM3.10114 28.4333H23.1007C23.3855 28.4333 23.6473 28.3267 23.8863 28.1133C24.1252 27.9 24.2441 27.6644 24.2429 27.4067V9.46C24.2429 9.20333 24.124 8.96778 23.8863 8.75333C23.6486 8.53889 23.3861 8.43222 23.0989 8.43333H19.6V12.6C19.6 12.8378 19.5115 13.0361 19.3344 13.195C19.1574 13.3539 18.9364 13.4333 18.6714 13.4333C18.4065 13.4333 18.1855 13.3539 18.0084 13.195C17.8314 13.0361 17.7429 12.8378 17.7429 12.6V8.43333H8.45714V12.6C8.45714 12.8378 8.36862 13.0361 8.19157 13.195C8.01453 13.3539 7.79352 13.4333 7.52857 13.4333C7.26362 13.4333 7.04262 13.3539 6.86557 13.195C6.68852 13.0361 6.6 12.8378 6.6 12.6V8.43333H3.10114C2.81514 8.43333 2.55267 8.54 2.31371 8.75333C2.07476 8.96667 1.95591 9.20222 1.95714 9.46V27.4083C1.95714 27.6639 2.076 27.8989 2.31371 28.1133C2.55143 28.3278 2.81329 28.4344 3.09929 28.4333M8.45714 6.76667H17.7429V5.93333C17.7429 4.76 17.2959 3.77222 16.402 2.97C15.5081 2.16778 14.4074 1.76667 13.1 1.76667C11.7926 1.76667 10.6919 2.16778 9.798 2.97C8.9041 3.77222 8.45714 4.76 8.45714 5.93333V6.76667Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 활성=검정, 비활성=회색 */
const ACTIVE_COLOR = '#000000';
const INACTIVE_COLOR = '#C0C0C0';

export default function TabBar({ className = 'absolute left-0 top-[756px] z-20 h-[96px] w-[393px]' }) {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const openWashCheck = useUiStore((s) => s.openWashCheck);

  const homeActive = isHomeActive(pathname);
  const marketActive = isMarketActive(pathname);

  return (
    <div className={className} data-node-id="870:6024" data-name="Group 68">
      <div
        className="absolute left-0 top-[10px] h-[86px] w-[393px] border-t-[0.667px] border-solid border-line bg-white"
        data-name="Container"
      >
        {/* 홈 */}
        <button
          type="button"
          aria-label={t.common.home}
          aria-current={homeActive ? 'page' : undefined}
          onClick={() => navigate('/home')}
          className="absolute left-[60px] top-[18.33px] flex h-[26px] w-[28px] items-center justify-center transition-colors duration-200"
          style={{ color: homeActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
        >
          <HomeIcon />
        </button>

        {/* Frame 65 : 디자인상 비어 있는 슬롯 */}
        <div className="absolute left-[94px] top-[14.33px] h-[30px] w-[26px]" data-name="Frame 65" />

        {/* Button : 아이콘 없는 터치 영역 */}
        <div className="absolute left-[309px] top-[2.33px] h-[40px] w-[24px]" data-name="Button" />

        {/* 마켓(장바구니) */}
        <button
          type="button"
          aria-label={t.common.market}
          aria-current={marketActive ? 'page' : undefined}
          onClick={() => navigate('/market')}
          className="absolute left-[305px] top-[14.33px] flex h-[30px] w-[26px] items-center justify-center transition-colors duration-200"
          style={{ color: marketActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
        >
          <BagIcon />
        </button>
      </div>

      {/* Group 65 : 중앙 촬영 버튼 */}
      <button
        type="button"
        aria-label={t.common.capture}
        onClick={openWashCheck}
        className="absolute left-[162px] top-0 size-[68px]"
        data-name="Group 65"
      >
        <img alt="" src={cameraButton} className="absolute inset-0 block size-full max-w-none" />
      </button>
    </div>
  );
}
