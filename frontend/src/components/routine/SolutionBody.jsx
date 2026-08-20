import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useWrapClass } from '@/i18n';
import PostCard from '@/components/market/PostCard';
import { productKey } from '@/store/wishlistStore';
import StepList from '@/components/routine/StepList';
import {
  AvoidBox,
  InnerCareHeader,
  SectionHeader,
  SupplementCards,
  WhyBox,
} from '@/components/routine/RoutineSections';

/**
 * 솔루션 본문. 촬영 전 기본 솔루션(depth 'basic')과 촬영 후 솔루션(depth 'full')이
 * **같은 렌더 구조**를 공유한다.
 *
 * 이 파일의 렌더 순서가 항목 파리티(Property 1)의 **단일 정의점**이다.
 * 항목을 더하거나 빼려면 여기를 고쳐야 하고, 그러면 두 화면에 동시에 반영된다.
 * 한쪽 화면만 항목이 빠지는 상황이 구조적으로 발생하지 않는다.
 *
 *   1. SectionHeader   — DERMA CARE
 *   2. StepList        — 스텝 카드
 *   3. EveningWashCard — 모닝 사이클 전용
 *   4. InnerCareHeader — INNER CARE
 *   5. SupplementCards — 섭취 카드
 *   6. AvoidBox        — 오늘은 피해주세요
 *   7. WhyBox          — 왜 이 루틴인가요
 *   8. 추천 제목 + 추천 그리드
 *   9. cta 슬롯        — basic: 촬영하기 / full: 수행 완료
 *
 * depth 는 **항목 수에 영향을 주지 않는다.** 줄어드는 것은 각 항목의 글자 수,
 * 부가 안내 박스(note/footnote), 추천 카드 장수뿐이다.
 *
 * 블록 좌표는 `RoutineScreen` 이 갖고 있던 Figma 실측치를 문자 그대로 옮겼다.
 * 절대좌표를 섞지 않고 세로 흐름(flex column)으로만 쌓는다 — 텍스트가 길어지면
 * 아래 블록이 겹치지 않고 밀려야 하고, 그래야 scrollHeight 측정값이 실제 내용
 * 높이와 일치한다(커밋 9528047 에서 절대좌표를 걷어낸 이유).
 */

/**
 * '왜 이 루틴인가요?' 박스 아래 여백.
 *
 * Figma 는 나이트 32 / 모닝 0 으로 서로 달라서, 모닝에서 바로 아래
 * '오늘의 솔루션과 어울리는 제품 추천' 제목이 붙어 답답했다.
 * 두 사이클 모두 나이트 값(32)으로 통일한다.
 */
const WHY_BOTTOM_GAP = 32;

/** 추천 카드 2x2 그리드 — 마켓 1 과 같은 열 좌표·행 간격을 쓴다 */
const RECOMMEND_COLUMNS = [20, 204];
const RECOMMEND_ROW_GAP = 294;
/** PostCard 실측 높이 (마켓 카드와 동일) */
const POST_CARD_HEIGHT = 272;

/**
 * 아래 세 값은 Figma 실측 좌표에서 뽑은 "블록 사이 간격"이다.
 * 흐름 배치로 바꾸면서 절대 y 대신 간격으로 표현했다.
 *  - 추천 제목 끝(1508) → 카드 시작(1517) = 9
 *  - 카드 끝(모닝 2311) → 완료 버튼(2337) = 26, 버튼 블록 높이 50 + 아래 여백 22
 */
const RECOMMEND_TITLE_GAP = 9;
const CTA_GAP = 26;
const CTA_BLOCK = 72;

/**
 * 모닝 전용 — 저녁 세안 루틴 안내 카드 (Figma 870:4154).
 *
 * `RoutineScreen` 에 있던 정의를 그대로 옮긴 것이다. 달라진 점은 두 가지뿐이다.
 *  - `nodeId` / `name` 을 prop 으로 받는다 (기본 솔루션은 Figma 원본 노드가 없다)
 *  - `note` / `footnote` 가 null 이면 해당 블록을 아예 렌더하지 않는다
 *    (basic 은 부가 안내 박스를 두지 않는다 — 빈 박스를 그리면 안 된다)
 */
function EveningWashCard({ data: ew, nodeId, name = 'MorningContent' }) {
  const wrap = useWrapClass();
  return (
    <div className="flex w-full flex-col items-start px-[20px] pt-[16px]" data-node-id={nodeId} data-name={name}>
      {/*
        번호 배지가 스텝 카드와 같은 자리에 오도록 테두리·padding 을 스텝 카드에 맞춘다.
        예전에는 border 1 + px-16 pt-12 라 배지가 스텝 카드보다 오른쪽으로 3px,
        위로 3px 어긋나 있었다 (스텝 카드는 border-2 + px-12 py-14 → 배지 left 14 / top 16).
      */}
      <div className="relative flex w-full shrink-0 flex-col items-start rounded-[16px] border-2 border-solid border-line bg-white px-[12px] pb-[14px] pt-[14px]">
        <div className="relative flex w-full shrink-0 items-start justify-between">
          <div className="relative flex shrink-0 items-center gap-[8px]">
            <div className="relative flex size-[24px] shrink-0 items-center justify-center rounded-full bg-text-strong">
              <div className="relative flex shrink-0 flex-col items-start">
                <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-bold leading-[10px] text-white [word-break:break-word]">
                  {ew.badge}
                </p>
              </div>
            </div>
            <div className="relative flex shrink-0 flex-col items-start">
              <p className="relative shrink-0 whitespace-nowrap font-sans text-[14px] font-bold leading-[21px] text-text-strong [word-break:break-word]">
                {ew.title}
              </p>
            </div>
          </div>
          <div
            className="relative flex shrink-0 flex-col items-start rounded-full bg-tag-waste-bg px-[8px] py-[2px]"
            data-name="CategoryTag"
          >
            <p className="relative shrink-0 whitespace-nowrap font-sans text-[10px] font-medium leading-[15px] text-tag-waste-text [word-break:break-word]">
              {ew.tag}
            </p>
          </div>
        </div>

        {/*
          한국어는 어절 단위로 줄바꿈한다.
          Figma 가 문자 단위로 접어 둬서 break-all 로 맞춰 놨었는데,
          "메이크업과 외|출하신" 처럼 단어 중간이 잘려 읽기 나빴다.
          한국어 외 언어는 keep-all 을 쓰면 안 된다 — 중국어·일본어는 끊을 지점을
          못 찾아 컨테이너 밖으로 흘러넘친다. 그래서 언어별 규칙을 `useWrapClass()`
          로 주입한다 (`다국어 텍스트 줄바꿈 규칙.md`).
        */}
        <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
          <p className={`relative w-full shrink-0 font-sans text-[12px] font-normal leading-[18px] text-text-strong ${wrap}`}>
            {ew.description}
          </p>
        </div>

        {ew.note ? (
          <div className="relative flex w-full shrink-0 flex-col items-start pt-[12px]" data-name="Container:margin">
            <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-note-line bg-note-bg px-[12px] py-[8px]">
              <div className="relative flex w-full shrink-0 flex-col items-start">
                {/* 한국어는 어절 단위로만 줄바꿈한다. 나머지 언어는 각 언어 기본 규칙에 맡긴다 */}
                <p className={`relative w-full shrink-0 font-sans text-[11px] font-normal leading-[16px] text-accent-green ${wrap}`}>
                  {ew.note}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/*
          "3~4 펌프 · 깨끗한 맨손으로 사용" 은 한 줄로 둔다.
          Figma 실측 폭(135)을 그대로 박아 두면 브라우저 폰트가 더 넓어서 두 줄로 접히고,
          컨테이너 높이(23)에 잘려 아랫줄이 반쯤 보였다.
        */}
        {ew.footnote ? (
          <div className="relative flex w-full shrink-0 flex-col items-start pt-[8px]">
            <p className="relative h-[15px] shrink-0 whitespace-nowrap font-sans text-[10px] font-normal leading-[15px] text-body">
              {ew.footnote}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @param {object} view `toBasicView()` / `toFullView()` 가 만든 표시 모델
 * @param {'night'|'morning'} cycle
 * @param {(height:number) => void} [onMeasure] 본문 높이 변경 알림
 * @param {React.ReactNode} [cta] 하단 CTA 슬롯 (화면이 주입한다)
 */
export default function SolutionBody({ view, cycle, onMeasure, cta }) {
  /**
   * 본문 높이 측정. `RoutineScreen` 이 갖고 있던 로직을 **그대로** 옮긴 것이다.
   * (측정 대상 scrollHeight, 즉시 1회 측정 → ResizeObserver → fonts.ready, 의존성 [cycle, 표시모델])
   *
   * 흐름 배치라 텍스트/스텝 개수가 실제 데이터에 따라 달라지면 본문이 자라거나 줄어드는데,
   * `Screen` 은 높이를 숫자로 받으므로 화면이 실측값을 알아야 스크롤이 잘리거나 탭바 위에
   * 빈 여백이 남지 않는다. 높이를 쓸 주체는 화면이므로 여기서는 재기만 하고 알려 준다.
   *
   * scrollHeight 는 레이아웃 값이라 DeviceFrame 의 transform: scale 에 영향받지 않는다.
   * 웹폰트가 늦게 로드되면 줄 수가 바뀌므로 document.fonts.ready 이후 한 번 더 잰다.
   */
  const bodyRef = useRef(null);

  /**
   * 최신 `onMeasure` 를 담아 두는 상자.
   *
   * 콜백을 effect 안에서 직접 참조하면 화면이 인라인 화살표 함수를 넘길 때마다
   * 옵저버를 끊고 다시 붙여야 한다(또는 붙이지 않으면 옛 콜백을 계속 부른다).
   * ref 로 최신 값만 갈아끼우면 옵저버는 DOM 노드 수명에만 묶이고,
   * 화면이 콜백을 memo 했는지 여부와 무관하게 항상 최신 콜백이 호출된다.
   * prop 을 아예 넘기지 않은 경우(`undefined`)는 옵셔널 호출로 흘려 보낸다.
   */
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;
    /**
     * 언마운트(또는 사이클 전환으로 이 노드가 교체된) 뒤 늦게 도착하는 fonts.ready 콜백이
     * 화면의 setState 를 부르지 못하게 막는다. 떼어낸 노드의 scrollHeight 는 0 이라
     * 그대로 통과시키면 화면 높이가 0 으로 접힌다.
     */
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      onMeasureRef.current?.(el.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => {
      disposed = true;
      ro.disconnect();
    };
    /*
      cycle 이 바뀌면 아래 래퍼가 key 때문에 **새 DOM 노드로 교체**된다.
      그래서 cycle 을 의존성에 반드시 둬야 한다 — 두지 않으면 옵저버가 사라진 옛 노드를
      계속 붙들고 있어 측정이 멈춘다. effect 는 DOM 커밋 뒤에 실행되므로 재실행 시점의
      bodyRef.current 는 이미 새 노드다.
      view 는 `RoutineScreen` 이 쓰던 rt 자리다(둘 다 렌더마다 새 객체일 수 있고, 그때는
      매 렌더 재측정 → 값이 같으면 화면의 setState 가 bail out 하므로 루프가 생기지 않는다).
    */
  }, [cycle, view]);

  const navigate = useNavigate();
  const t = useT();
  const night = cycle !== 'morning';
  /** 기본 솔루션은 Figma 원본 노드가 없다 — data-name 만 붙이고 없는 node id 를 발명하지 않는다 */
  const basic = view.depth === 'basic';
  /**
   * `nodeIds` 는 full 에만 있다(basic 은 null). 옵셔널 체이닝으로 읽어 undefined 가 되면
   * React 가 속성 자체를 렌더하지 않으므로 basic 블록에는 data-node-id 가 붙지 않는다.
   */
  const ids = view.nodeIds;

  /**
   * 라벨 전달 규칙: **view 에 값이 있을 때만** prop 으로 넘긴다.
   * 값이 없으면(full 은 null) 아예 넘기지 않아 `RoutineSections` 내부의 `useT()` 폴백이
   * 동작하고, 이미 번역된 촬영 후 화면의 문구가 그대로 유지된다(Property 10).
   *
   * `null` 을 그대로 넘겨도 컴포넌트 내부가 `label ?? t.solution.xxx` 라 결과는 같지만,
   * "값이 없으면 넘기지 않는다"를 코드로 드러내 두면 나중에 기본값 처리를 바꿀 때
   * 의도가 흔들리지 않는다. 그래서 조건부 스프레드로 명시한다.
   */
  const innerCareProps = view.innerCare
    ? { label: view.innerCare.label, sub: view.innerCare.sub, lines: view.innerCare.lines }
    : {};
  const avoidLabelProps = {
    ...(view.avoid.label ? { label: view.avoid.label } : {}),
    ...(view.avoid.title ? { title: view.avoid.title } : {}),
  };
  const whyLabelProps = view.why.label ? { label: view.why.label } : {};

  /**
   * 섭취 카드의 '오늘 추천' 라벨은 표시 모델에 필드가 없다 → prop 을 넘기지 않는다.
   * 두 depth 모두 기존 `useT()` 라벨을 쓴다. 이 라벨은 카드 내용이 아니라 블록 머리말이고,
   * 사전에 4개 언어가 이미 들어 있어 basic 에서도 그대로 쓰는 편이 낫다.
   * (제조사 공식 섭취 문구인 `card.howTo` 는 view 가 준 값을 가공 없이 그대로 넘긴다)
   */

  /** 추천 제목은 basic 만 자체 문구를 갖는다. full 은 기존 번역 문구로 폴백한다 */
  const recommendTitle = view.recommend.title ?? t.solution.recommendTitle;

  /** 추천 그리드 높이 — PostCard 가 absolute 라 감싸는 상자가 높이를 가져야 한다 */
  const recommendProducts = view.recommend.products;
  const recommendRows = Math.ceil(recommendProducts.length / 2);
  const recommendGridHeight = recommendRows === 0 ? 0 : (recommendRows - 1) * RECOMMEND_ROW_GAP + POST_CARD_HEIGHT;

  return (
    /*
      본문은 세로 흐름이다. 절대 좌표를 쓰지 않으므로 각 블록의 간격은 컴포넌트 자신의
      padding 이 갖고 있다. 화면(Screen) 안에서의 위치는 호출부가 이 컴포넌트를 감싼
      상자로 정한다 — 여기서는 본문 자체의 높이만 만든다.

      사이클이 바뀌면 이 래퍼가 새로 마운트되며 페이드 인 한다(key 를 cycle 로 줘서 CSS
      애니메이션이 다시 재생되게 한다 — `RoutineScreen` 이 CycleBody 에 쓰던 방식 그대로다).
      세그먼트 컨트롤은 이 래퍼 밖(화면 쪽)에 있어야 선택 표시가 끊기지 않고 미끄러진다.
    */
    <div
      key={cycle}
      ref={bodyRef}
      className="flex w-[393px] flex-col items-start animate-fade-in"
      data-name={basic ? 'BasicSolutionBody' : 'CycleBody'}
    >
      <SectionHeader
        label={view.section.label}
        sub={view.section.sub}
        title={view.section.title}
        nodeId={ids?.sectionHeader}
      />

      <StepList steps={view.steps} nodeId={ids?.stepList} />

      {/* 저녁 세안 카드는 모닝 전용. 표시 모델이 나이트에서 null 을 주므로 그것을 근거로 판단한다 */}
      {night || !view.eveningWash ? null : (
        <EveningWashCard
          data={view.eveningWash}
          nodeId={ids?.eveningWash}
          name={basic ? 'BasicEveningWash' : 'MorningContent'}
        />
      )}

      <InnerCareHeader {...innerCareProps} nodeId={ids?.innerCare} />

      <SupplementCards cards={view.supplements} nodeId={ids?.supplements} />

      <AvoidBox items={view.avoid.items} {...avoidLabelProps} nodeId={ids?.avoid} />

      <WhyBox
        text={view.why.text}
        tags={view.why.tags}
        {...whyLabelProps}
        paddingBottom={WHY_BOTTOM_GAP}
        nodeId={ids?.why}
      />

      {/*
        오늘의 솔루션과 어울리는 제품 추천 (Figma 833:3029 · 989:1220 + Group 85 / Frame 88).
        마켓 목록의 상품을 그대로 참조하므로 여기서 누른 하트가 마켓·상세와 함께 움직인다.
      */}
      <div
        className="flex w-full shrink-0 flex-col items-start px-[20px]"
        data-node-id={ids?.recommendTitle}
        data-name={basic ? 'BasicRecommendTitle' : undefined}
      >
        <p className="relative shrink-0 whitespace-nowrap font-sans text-[18px] font-bold leading-[26px] text-text-strong">
          {recommendTitle}
        </p>
      </div>

      {/* PostCard 는 absolute 라 상대 좌표를 가진 상자 안에 넣는다 */}
      <div
        className="relative w-full shrink-0"
        style={{ height: recommendGridHeight, marginTop: RECOMMEND_TITLE_GAP }}
        data-name={basic ? 'BasicRecommendGrid' : 'RecommendGrid'}
      >
        {recommendProducts.map((product, i) => (
          <PostCard
            key={`recommend-${product.nodeId}`}
            product={{
              ...product,
              left: RECOMMEND_COLUMNS[i % 2],
              top: Math.floor(i / 2) * RECOMMEND_ROW_GAP,
            }}
            onOpen={(p) => navigate(`/market/product/${encodeURIComponent(productKey(p))}`)}
          />
        ))}
      </div>

      {/*
        CTA 슬롯. 간격·블록 높이는 모닝 프레임의 수행 완료 버튼 실측치(26 / 72)를 쓴다.
        슬롯이 비어 있으면(나이트) 상자를 만들지 않는다 — 빈 72px 이 남으면 탭바 위 여백이
        원본과 달라진다.
      */}
      {cta ? (
        <div className="relative w-full shrink-0" style={{ marginTop: CTA_GAP, height: CTA_BLOCK }}>
          {cta}
        </div>
      ) : null}
    </div>
  );
}
