import { useCallback, useEffect, useRef, useState } from 'react';
import { getT } from '@/i18n';

/**
 * 웹 카메라 훅.
 * getUserMedia 로 전면 카메라 스트림을 얻어 <video> 에 붙이고,
 * 셔터를 누르면 canvas 로 한 프레임을 캡처해 data URL 을 돌려준다.
 *
 * 기획서 7.1 촬영 정책에 맞춰 전면(사용자) 카메라를 기본으로 요청한다.
 * 권한 거부·미지원 상황은 status 로 구분해 화면에서 안내한다.
 *
 * status: 'idle' | 'starting' | 'ready' | 'denied' | 'unsupported' | 'error'
 */
export default function useCamera({ enabled = true } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        /*
          getUserMedia 는 보안 컨텍스트(HTTPS 또는 localhost)에서만 노출된다.
          다른 기기에서 http://LAN-IP 로 접속하면 OS 와 무관하게 API 자체가 없으므로
          "브라우저 미지원" 과 "http 접속" 을 구분해 안내한다.
        */
        setErrorMessage(
          window.isSecureContext
            ? getT().camera.noCameraSupport
            : getT().camera.needsSecureContext,
        );
        return;
      }

      setStatus('starting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        // 권한 거부와 그 외 오류를 구분한다.
        if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
          setStatus('denied');
          setErrorMessage(getT().camera.permissionNeeded);
        } else if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
          setStatus('unsupported');
          setErrorMessage(getT().camera.noCameraFound);
        } else {
          setStatus('error');
          setErrorMessage(getT().camera.openError);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, stop]);

  /**
   * 현재 프레임을 정사각형으로 잘라 캡처한다.
   * 미리보기가 좌우 반전(거울)이라 캡처도 같은 방향으로 맞춘다.
   */
  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  return { videoRef, status, errorMessage, capture, stop };
}
