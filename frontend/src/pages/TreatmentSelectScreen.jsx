import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useWrapClass } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import GlobeIcon from '@/components/ui/GlobeIcon';
import { getAvailableTreatments, registerProcedure } from '@/api/procedures';
import { useAuthStore } from '@/store/authStore';

/**
 * 시술 종류 선택 (Figma 원본 없음 — 새로 추가된 백엔드 API에 맞춰 새로 디자인했다).
 *
 * 가입 직후(ConnectingScreen 에서 계정이 만들어진 뒤) "시술을 받았어요"를 고른
 * 사용자만 거친다. 목록·등록 API 둘 다 인증이 필요해서 SignupScreen 이 아니라
 * 가입이 끝난 뒤에 온다.
 *
 * 회복 기간·주의사항 등 임상 값은 절대 이 화면이 만들지 않는다 — treatmentCode 만
 * 골라 보내고, 나머지는 서버가 Treatment KB 에서 채운다(백엔드 설계 원칙).
 */
export default function TreatmentSelectScreen() {
  const t = useT();
  const lang = useUiStore((s) => s.lang);
  const openLang = useUiStore((s) => s.openLang);
  const wrap = useWrapClass();
  const navigate = useNavigate();

  /** 'loading' | 'error' | 'ready' | 'submitting' */
  const [status, setStatus] = useState('loading');
  const [treatments, setTreatments] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setStatus('loading');
    const userCode = useAuthStore.getState().userCode;
    getAvailableTreatments(userCode)
      .then((list) => {
        setTreatments(Array.isArray(list) ? list : []);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('[TreatmentSelectScreen] getAvailableTreatments failed', err);
        setStatus('error');
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 시술명은 한국어(treatmentName)/영어(treatmentNameEn)만 서버가 준다.
   * 일본어·중국어 화면에서는 없는 언어를 지어내는 대신 영어로 대체한다
   * (한국어보다는 대부분의 외국인 사용자에게 더 읽힌다).
   */
  const nameFor = (item) => (lang === 'ko' ? item.treatmentName : item.treatmentNameEn || item.treatmentName);

  const confirm = async () => {
    if (!selected || status === 'submitting') return;
    setStatus('submitting');
    const userCode = useAuthStore.getState().userCode;
    try {
      await registerProcedure(userCode, { hadProcedure: true, treatmentCode: selected });
    } catch (err) {
      // 시연 흐름이 끊기지 않도록, 등록 실패는 콘솔에만 남기고 다음 화면으로 넘어간다.
      console.error('[TreatmentSelectScreen] registerProcedure failed', err);
    }
    navigate('/connected');
  };

  return (
    <Screen className="bg-white" name="시술 선택">
      <StatusBar />

      {/* 로고 + 언어 변경 — SignupScreen과 같은 자리 */}
      <p
        className="absolute left-[24px] top-[82px] h-[12px] w-[143px] font-logo text-[20px] font-bold not-italic leading-[16.5px] text-ink [word-break:break-word]"
        data-name="Logo"
      >
        InnerDerma
      </p>
      <button
        type="button"
        aria-label="언어 선택"
        onClick={openLang}
        className="absolute left-[348px] top-[77.5px] flex size-[21px] items-center justify-center text-ink"
        data-name="LanguageButton"
      >
        <GlobeIcon />
      </button>

      {/* 안내 문구 */}
      <div className="absolute left-[24px] top-[130px] flex w-[345px] flex-col items-start gap-[8px]">
        <p className={`font-sans text-[20px] font-semibold leading-[28px] text-ink ${wrap}`}>
          {t.onboarding.treatmentSelectTitle}
        </p>
        <p className={`font-sans text-[13px] font-normal leading-[19px] text-body ${wrap}`}>
          {t.onboarding.treatmentSelectHint}
        </p>
      </div>

      {status === 'loading' ? (
        <>
          <Spinner />
          <p className="absolute left-0 top-[390px] w-[393px] text-center font-sans text-[13px] text-body">
            {t.onboarding.treatmentSelectLoading}
          </p>
        </>
      ) : status === 'error' ? (
        <div className="absolute left-0 top-[330px] flex w-[393px] flex-col items-center gap-[16px] px-[24px]">
          <p className={`text-center font-sans text-[14px] text-body ${wrap}`}>{t.onboarding.treatmentSelectError}</p>
          <Button variant="enabled2" className="h-[44px] w-[160px]" onClick={load}>
            {t.onboarding.treatmentSelectRetry}
          </Button>
        </div>
      ) : (
        /* 시술 목록 — 개수가 많아(약 27개) 이 영역만 자체 스크롤한다 */
        <div
          className="absolute left-[24px] top-[214px] w-[345px] overflow-y-auto"
          style={{ bottom: 92 }}
          data-name="TreatmentList"
        >
          <div className="flex w-full flex-col items-start gap-[8px] pb-[8px]">
            {treatments.map((item) => {
              const on = selected === item.treatmentCode;
              return (
                <button
                  key={item.treatmentCode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(item.treatmentCode)}
                  className={`flex w-full shrink-0 items-center rounded-[14px] px-[16px] py-[14px] text-left transition-colors ${
                    on ? 'bg-check-on shadow-[inset_0_0_0_1px_#777777]' : 'bg-check-off'
                  }`}
                >
                  <span className={`flex-1 font-sans text-[14px] font-medium text-check-label ${wrap}`}>
                    {nameFor(item)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 하단 고정 확인 버튼 */}
      <div className="absolute bottom-0 left-0 flex w-[393px] flex-col items-center border-t-[0.667px] border-solid border-hairline bg-white px-[20px] py-[20px]">
        <Button
          variant={selected && status !== 'submitting' ? 'enabled' : 'disable'}
          className="h-[52px] w-[353px]"
          onClick={confirm}
        >
          {t.onboarding.treatmentSelectConfirm}
        </Button>
      </div>
    </Screen>
  );
}
