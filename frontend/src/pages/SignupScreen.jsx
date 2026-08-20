import { useT } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import Screen from '@/components/layout/Screen';
import StatusBar from '@/components/layout/StatusBar';
import HomeIndicator from '@/components/layout/HomeIndicator';
import Button from '@/components/ui/Button';
import GlobeIcon from '@/components/ui/GlobeIcon';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUiStore } from '@/store/uiStore';

/**
 * 가입화면 (Figma 870:3426).
 * WHS 에서 받은 서비스 종류를 선택한다. 선택값에 따라 사용자 유형이 갈린다.
 *  - 피부 진단과 시술을 받았어요! → 진단·시술 사용자
 *  - 피부 진단만 받았어요!      → 진단 사용자
 */
export default function SignupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const setUserType = useOnboardingStore((s) => s.setUserType);
  const openLang = useUiStore((s) => s.openLang);

  const select = (userType) => {
    setUserType(userType);
    navigate('/connecting');
  };

  return (
    <Screen className="bg-white" nodeId="870:3426" name="가입화면">
      <StatusBar />

      <p
        className="absolute left-[24px] top-[82px] h-[12px] w-[143px] font-logo text-[20px] font-bold not-italic leading-[16.5px] text-ink [word-break:break-word]"
        data-node-id="870:3428"
      >
        InnerDerma
      </p>

      {/*
        언어 변경 — 이 화면이 앱의 첫 선택 화면이라 여기서 언어를 못 바꾸면
        외국인 사용자는 뜻을 모른 채 시술 여부를 골라야 한다.
        로고와 같은 줄 반대쪽에 두되 여백은 로고와 같은 24 를 쓴다(오른쪽 끝 369).
        aria-label 은 번역하지 않는다 — 언어를 바꾼 뒤에도 같은 앵커로 찾아야 한다
        (verify-i18n.mjs 가 이 라벨로 버튼을 집는다).
      */}
      <button
        type="button"
        aria-label="언어 선택"
        onClick={openLang}
        className="absolute left-[348px] top-[77.5px] flex size-[21px] items-center justify-center text-ink"
        data-name="LanguageButton"
      >
        <GlobeIcon />
      </button>

      <div
        className="absolute left-[82px] top-[299px] h-[55px] w-[226px] font-sans text-[20px] font-semibold leading-[0] text-ink [word-break:break-word] whitespace-pre-wrap"
        data-node-id="870:3431"
      >
        {t.onboarding.signupQuestion.split('\n').map((line, i) => (
          <p key={i} className={i === 0 ? 'mb-0 leading-[27px]' : 'leading-[27px]'}>
            {line}
          </p>
        ))}
      </div>

      <Button
        variant="enabled"
        nodeId="870:3432"
        className="absolute left-[23px] top-[418px] h-[52px] w-[343px]"
        onClick={() => select('DIAGNOSIS_AND_TREATMENT')}
      >
        {t.onboarding.serviceBoth}
      </Button>

      <Button
        variant="enabled2"
        nodeId="870:3433"
        className="absolute left-[23px] top-[492px] h-[52px] w-[343px]"
        onClick={() => select('DIAGNOSIS_ONLY')}
      >
        {t.onboarding.serviceDiagOnly}
      </Button>

      <p
        className="absolute left-[196px] top-[559px] h-[20px] w-[286px] -translate-x-1/2 text-center font-sans text-[9px] font-medium leading-[14px] text-muted [word-break:break-word] whitespace-pre-wrap"
        data-node-id="870:3434"
      >
        {t.onboarding.signupHint}
        <br aria-hidden />
        <br aria-hidden />
      </p>

      <HomeIndicator />
    </Screen>
  );
}
