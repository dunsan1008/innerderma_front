/**
 * 루틴 화면용 번역된 텍스트를 반환하는 훅.
 * constants/routines.js 의 레이아웃 정보(nodeId, titleFlex 등)는 그대로 두고
 * 텍스트 내용만 현재 언어 사전으로 덮어쓴다.
 */
import { useT } from '@/i18n';
import {
  NIGHT_STEPS as NIGHT_LAYOUT,
  MORNING_STEPS as MORNING_LAYOUT,
  SUPPLEMENT_CARDS as SUPP_LAYOUT,
} from '@/constants/routines';

export function useRoutineText() {
  const t = useT();

  /** 스텝 목록: 레이아웃 구조 + 번역 텍스트 합치기 */
  const nightSteps = NIGHT_LAYOUT.map((step, i) => ({
    ...step,
    title: t.nightSteps[i]?.title ?? step.title,
    tag: t.nightSteps[i]?.tag ?? step.tag,
    description: t.nightSteps[i]?.desc ?? step.description,
  }));

  const morningSteps = MORNING_LAYOUT.map((step, i) => ({
    ...step,
    title: t.morningSteps[i]?.title ?? step.title,
    tag: t.morningSteps[i]?.tag ?? step.tag,
    description: t.morningSteps[i]?.desc ?? step.description,
  }));

  const supplementCards = SUPP_LAYOUT.map((card, i) => ({
    ...card,
    title: t.supplements[i]?.title ?? card.title,
    description: t.supplements[i]?.desc ?? card.description,
    recommend: t.solution.todayRecommend,
    warning: i === 1 ? t.solution.supplementWarning : card.warning,
  }));

  const eveningWash = {
    badge: 'N',
    title: t.eveningWash.title,
    tag: t.eveningWash.tag,
    description: t.eveningWash.description,
    note: t.eveningWash.note,
    footnote: t.eveningWash.footnote,
  };

  const whyText = t.solution.whyDescription;
  const whyTags = t.whyTags;
  const nightAvoid = t.nightAvoid;
  const morningAvoid = t.morningAvoid;

  return {
    nightSteps,
    morningSteps,
    supplementCards,
    eveningWash,
    whyText,
    whyTags,
    nightAvoid,
    morningAvoid,
    sectionTitle: (night) => night ? t.solution.nightRoutineTitle : t.solution.morningRoutineTitle,
    sectionLabel: t.solution.dermaCare,
    sectionSub: t.solution.todaySkincare,
    innerCareLabel: t.solution.innerCare,
    innerCareSub: t.solution.todayIntake,
    innerCareLine1: t.solution.intakeSolution1,
    innerCareLine2: t.solution.intakeSolution2,
    etcLabel: t.solution.etc,
    avoidLabel: t.solution.avoidToday,
    whyLabel: t.solution.whyThisRoutine,
  };
}
