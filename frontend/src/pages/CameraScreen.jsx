import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Screen from '@/components/layout/Screen';
import { useCareStore } from '@/store/careStore';
import { todayKey } from '@/lib/calendar';
import useCamera from '@/hooks/useCamera';
import noise from '@/assets/figma/camera-noise.png';
import maskDisable from '@/assets/figma/camera-mask-disable.svg';
import maskEnable from '@/assets/figma/camera-mask-enable.svg';
import closeIcon from '@/assets/figma/camera-close.svg';
import { uploadAndAnalyzeSkinCapture } from '@/api/skinCapture';
import { useAuthStore } from '@/store/authStore';

/**
 * 카메라 화면. Figma 프레임 두 개를 한 컴포넌트의 두 상태로 구현한다.
 *  - CameraScreen-disable (870:3677) : 얼굴 인식중 → 셔터 비활성
 *  - CameraScreen-enable  (870:3650) : 얼굴 인식됨 → 셔터 활성
 *
 * 기획서의 촬영 정책(하루 한 번, 품질 검사 통과분만 인정)에 따라
 * 인식 실패 시 별도 페이지로 보내지 않고 이 화면 안에서 안내만 바꾼다.
 */

/** Figma `Container` (870:3678) 의 방사형 그라디언트를 그대로 옮긴 배경 */
const RADIAL_BG =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 393 852' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -68.16 -27.51 0 196.5 391.92)'><stop stop-color='rgba(42,42,42,1)' offset='0'/><stop stop-color='rgba(30,30,30,1)' offset='0.3'/><stop stop-color='rgba(17,17,17,1)' offset='0.6'/><stop stop-color='rgba(9,9,9,1)' offset='0.8'/><stop stop-color='rgba(0,0,0,1)' offset='1'/></radialGradient></defs></svg>\")";

/** Figma 마스크의 얼굴 가이드 오벌 위치 (Vector 870:3657) */
const OVAL = { left: 58.5, top: 205, width: 276, height: 370 };

export default function CameraScreen({ initialDetected = false }) {
  const t = useT();
  const navigate = useNavigate();
  const markCaptured = useCareStore((s) => s.markCaptured);
  const setSelectedDate = useCareStore((s) => s.setSelectedDate);
  const { videoRef, status, errorMessage, capture } = useCamera();
  const [detected, setDetected] = useState(initialDetected);

  /**
   * 카메라가 열리고 잠시 뒤 "인식됨" 으로 바뀐다.
   * 얼굴 검출 모델은 아직 없으므로 스트림 준비를 기준으로 삼는다.
   * (기획서 7.1 품질 검사 자리 — 추후 실제 검출 결과로 교체)
   */
  useEffect(() => {
    if (initialDetected || status !== 'ready') return undefined;
    const timer = setTimeout(() => setDetected(true), 1500);
    return () => clearTimeout(timer);
  }, [initialDetected, status]);

  /** 촬영 → 프레임 캡처 후 오늘 기록으로 저장하고 자가진단으로 */
  const shoot = () => {
    const dataUrl = capture();
    markCaptured(dataUrl);
    // 촬영은 항상 "오늘"의 솔루션을 만드는 행위이므로 선택 날짜를 오늘로 되돌린다
    setSelectedDate(todayKey());

    /*
     * 업로드는 다음 화면 전환을 막지 않는다(자가진단은 촬영 결과와 무관하게
     * 바로 진행할 수 있어야 한다). 실패해도 콘솔에만 남기고 넘어간다 — 대회
     * 시연 중 흐름이 끊기지 않게 하기 위함(ConnectingScreen과 같은 패턴).
     */
    const userCode = useAuthStore.getState().userCode;
    if (userCode && dataUrl) {
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          return uploadAndAnalyzeSkinCapture(userCode, file);
        })
        .catch((err) => console.error('[CameraScreen] upload failed', err));
    }

    navigate('/self-check');
  };

  const cameraFailed = status === 'denied' || status === 'unsupported' || status === 'error';

  return (
    <Screen
      className="bg-camera-bg"
      nodeId={detected ? '870:3650' : '870:3677'}
      name={detected ? 'CameraScreen-enable' : 'CameraScreen-disable'}
    >
      {/* 방사형 그라디언트 배경 */}
      <div
        className="absolute left-0 top-0 h-[852px] w-[393px]"
        style={{ backgroundImage: RADIAL_BG }}
        data-node-id="870:3678"
      />

      {/* 실제 카메라 미리보기 — 얼굴 가이드 오벌 안쪽에만 보인다 */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: OVAL.left,
          top: OVAL.top,
          width: OVAL.width,
          height: OVAL.height,
          borderRadius: '50% / 50%',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="size-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* 노이즈 텍스처 (불투명도 4%) */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[852px] w-[393px]"
        style={{ opacity: 0.04 }}
        data-node-id="870:3679"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img alt="" src={noise} className="absolute left-0 top-0 h-[23.47%] w-[50.89%] max-w-none" />
        </div>
      </div>

      {/* 얼굴 가이드 오벌 마스크 */}
      <div className="pointer-events-none absolute left-0 top-0 h-[852px] w-[393px]" data-node-id="870:3680" data-name="Icon">
        <img alt="" src={detected ? maskEnable : maskDisable} className="absolute inset-0 block size-full max-w-none" />
      </div>

      {/* 상단 안내 + 인식 상태 + 닫기 */}
      <div
        className="absolute left-0 top-0 flex w-[393px] flex-col items-center px-[24px] pt-[64px]"
        data-node-id="870:3687"
      >
        <p
          className="relative w-full shrink-0 break-words text-center font-sans text-[20px] font-bold leading-[28px] text-white"
          data-node-id="870:3688"
        >
          {t.camera.lastRecord(10)}
        </p>

        <div className="relative flex shrink-0 flex-col items-start pt-[4px]" data-node-id="870:3689">
          <p
            className="relative w-full shrink-0 break-words text-center font-sans text-[13px] font-normal leading-[20px] text-white-60"
            data-node-id="870:3690"
          >
            {t.camera.compareMessage}
          </p>
        </div>

        <div
          className="relative flex h-[32px] w-[48px] shrink-0 items-center gap-[6px] pt-[12px]"
          data-node-id="870:3691"
        >
          <div
            className={`relative size-[6px] shrink-0 rounded-full ${detected ? 'bg-status-ok' : 'bg-status-pending'}`}
            style={{ boxShadow: `0px 0px 6px 0px ${detected ? '#22c55e' : '#eab308'}` }}
            data-node-id="870:3692"
          />
          <div className="relative flex shrink-0 flex-col items-start" data-node-id="870:3693">
            <p
              className={`relative shrink-0 whitespace-nowrap font-sans text-[13px] font-semibold leading-[19.5px] [word-break:break-word] ${
                detected ? 'text-status-ok' : 'text-status-pending'
              }`}
              data-node-id="870:3694"
            >
              {detected ? t.camera.recognized : t.camera.recognizing}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={t.common.close}
          onClick={() => navigate('/home')}
          className="absolute left-[337px] top-[64px] flex size-[32px] items-center justify-center rounded-full bg-white-15"
          data-node-id="870:3695"
        >
          <span className="relative size-[13px] shrink-0" data-node-id="870:3696">
            <img alt="" src={closeIcon} className="absolute inset-0 block size-full max-w-none" />
          </span>
        </button>
      </div>

      {/* 하단 가이드 문구 — 카메라를 못 열면 사유를 같은 자리에 보여준다 */}
      {cameraFailed ? (
        <div className="absolute left-0 top-[603px] flex w-[393px] flex-col items-center px-[32px]">
          <p className="w-[329px] text-center font-sans text-[13px] font-medium leading-[20px] text-guide-pending [word-break:break-word]">
            {errorMessage}
          </p>
        </div>
      ) : detected ? (
        <div
          className="absolute left-0 top-[603px] flex h-[20px] w-[393px] flex-col items-center px-[32px]"
          data-node-id="870:3672"
        >
          <p
            className="relative w-full shrink-0 whitespace-pre-line break-words text-center font-sans text-[13px] font-medium leading-[20px] text-guide-ok"
            data-node-id="870:3673"
          >
            {t.camera.guideRecognized}
          </p>
        </div>
      ) : (
        <div
          className="absolute left-0 top-[603px] flex w-[393px] flex-col items-center px-[32px]"
          data-node-id="870:3698"
        >
          <div
            className="relative w-[329px] shrink-0 text-center font-sans text-[13px] font-medium leading-[0] text-guide-pending [word-break:break-word] whitespace-pre-wrap"
            data-node-id="870:3699"
          >
            {t.camera.guideDefault.split('\n').map((line, i) => (
              <p key={i} className={i === 0 ? 'mb-0 leading-[20px]' : 'leading-[20px]'}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 셔터 */}
      <div
        className="absolute left-0 top-[732px] flex w-[393px] items-start justify-center"
        data-node-id={detected ? '870:3674' : '870:3700'}
      >
        {detected ? (
          <button
            type="button"
            aria-label={t.common.capture}
            onClick={shoot}
            className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full bg-white"
            style={{ filter: 'drop-shadow(0px 0px 0px rgba(255,255,255,0.25))' }}
            data-node-id="870:3675"
            data-name="Button - 촬영"
          >
            <span className="relative size-[54px] shrink-0 rounded-full bg-camera-bg" data-node-id="870:3676" />
          </button>
        ) : (
          <div
            className="relative flex size-[68px] shrink-0 flex-col items-start"
            data-node-id="870:3701"
            data-name="Button - 촬영:transform"
          >
            <div
              className="absolute left-[2.04px] top-[2.04px] flex size-[63.92px] items-center justify-center rounded-full bg-white-35"
              data-node-id="870:3702"
            >
              <div className="relative size-[50.76px] shrink-0 rounded-full bg-white-50" data-node-id="870:3703" />
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
