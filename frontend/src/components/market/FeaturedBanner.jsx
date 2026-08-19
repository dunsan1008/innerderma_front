import { useCallback, useEffect, useRef, useState } from 'react';
import { clampSingleLine, joinNameLines } from '@/lib/productName';

/**
 * 추천 상품 배너 (Figma `Frame 74` 870:5061 / `Frame 77` 870:5523 / `Frame 78` 870:5342).
 * 사진(비율 229/143, 상단 라운드 15) + 흰 정보 띠 + 상품명·가격·태그로 구성된다.
 *
 * 여러 제품을 일정 주기로 자동 전환한다.
 *  - 4초마다 다음 슬라이드
 *  - 좌우 스와이프(드래그)로 수동 전환
 *  - 하단 인디케이터로 현재 위치 표시, 점을 눌러 이동
 *  - 포인터가 배너 위에 있으면 자동 전환을 멈춘다
 *
 * @param {object} banner 첫 슬라이드(Figma 실측 좌표 기준). slides 가 없으면 이 값만 쓴다.
 * @param {Array}  slides [{ image, imageInner, name, price, tags }] 추가 슬라이드
 */

/** 자동 전환 주기 */
const INTERVAL_MS = 4000;
/** 스와이프로 인정할 최소 이동 거리 */
const SWIPE_THRESHOLD = 40;

export default function FeaturedBanner({ banner, slides, onOpen }) {
  const [fx, fy, fw, fh] = banner.frame;
  const items = slides?.length ? slides : [banner];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef(null);

  const go = useCallback(
    (next) => setIndex(((next % items.length) + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || items.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  /**
   * 슬라이드 목록이 바뀌면 첫 장으로 되돌린다.
   * 피쓰 서울(3장) ↔ 윔 스토어(1장) 는 같은 컴포넌트를 재사용하므로 index 가 그대로 남는데,
   * 그러면 1장짜리 목록에서 index=2 를 읽어 `current` 가 undefined 가 되고 화면 전체가 죽는다.
   */
  const firstSlideName = items[0]?.name;
  useEffect(() => {
    setIndex(0);
  }, [items.length, firstSlideName]);

  /** 목록이 줄어드는 순간의 렌더까지 버티도록 범위를 한 번 더 조인다 */
  const current = items[Math.min(index, items.length - 1)] ?? items[0];

  const onPointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const onPointerUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    // 스와이프였으면 슬라이드를 넘기고, 제자리 탭이었으면 상세로 보낸다
    if (Math.abs(dx) < SWIPE_THRESHOLD) {
      onOpen?.(current);
      return;
    }
    go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <>
      <div
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? `${current.name} 상세보기` : undefined}
        onKeyDown={onOpen ? (e) => (e.key === 'Enter' || e.key === ' ') && onOpen(current) : undefined}
        className={`absolute flex flex-col items-start ${onOpen ? 'cursor-pointer' : ''}`}
        style={{ left: fx, top: fy, width: fw, height: fh }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        data-node-id={banner.nodeId}
        data-name="Frame 74"
        data-testid="featured-banner"
      >
        <div
          className="relative w-full shrink-0 overflow-clip rounded-tl-[15px] rounded-tr-[15px]"
          style={{ aspectRatio: '229 / 143' }}
        >
          {items.map((slide, i) => (
            <div
              key={slide.name}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              {slide.imageInner ? (
                /* 사진을 프레임 안에서 다시 확대·이동시키는 경우 (예: 마켓 3 image 59) */
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-tl-[15px] rounded-tr-[15px]">
                  <img
                    alt=""
                    src={slide.image}
                    className="absolute left-0 max-w-none"
                    style={{ width: slide.imageInner.w, height: slide.imageInner.h, top: slide.imageInner.top }}
                  />
                </div>
              ) : (
                <img
                  alt=""
                  src={slide.image}
                  className="pointer-events-none absolute inset-0 size-full max-w-none rounded-tl-[15px] rounded-tr-[15px] object-cover"
                />
              )}
            </div>
          ))}

          {/* 인디케이터 */}
          {items.length > 1 ? (
            <div className="absolute bottom-[10px] left-0 flex w-full items-center justify-center gap-[6px]">
              {items.map((slide, i) => (
                <button
                  key={slide.name}
                  type="button"
                  aria-label={`${i + 1}번째 추천 상품`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`h-[6px] rounded-full transition-all ${
                    i === index ? 'w-[16px] bg-white' : 'w-[6px] bg-white-50'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div
          className="relative w-full shrink-0 bg-white"
          style={{ height: banner.stripHeight, boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.25)' }}
        />
      </div>

      {/*
        상품명 — 두 줄까지 보여주고 넘치면 … (줄 수 판정은 CSS line-clamp)
        Figma 는 첫 줄에 폭 확보용 제로폭 공백을 넣어 두 줄 박스를 만든다. 그 구조는 유지하고
        내용만 바꾼다. (이름 박스가 찜·공유 버튼 위로 넘쳐 클릭을 막지 않게 pointer-events 도 끈다)
      */}
      <div
        className="pointer-events-none absolute flex flex-col items-start"
        style={{ left: banner.nameAt[0], top: banner.nameAt[1], width: 214, height: 46 }}
        data-name="Paragraph"
      >
        {/*
          이름 박스 — 두 줄 높이(33)를 잡고 **아래 정렬**한다.

          Figma 는 여기에 두 줄 박스를 두고 첫 줄을 빈 줄(제로폭 공백)로, 둘째 줄에
          이름을 넣어 놨다. 아래 정렬로 두면 그 둘째 줄 자리에 이름이 그대로 온다.

          이름은 **무조건 한 줄**이고 넘치면 … 으로 자른다. 두 줄이 되면 아래 태그를
          밀거나 덮어 버리기 때문이다. 폭은 부모(214)를 따른다 — 넘기면 오른쪽 가격
          위로 글자가 뻗는다.
        */}
        <div className="relative flex h-[33px] w-full shrink-0 flex-col justify-end font-sans text-[16px] font-semibold text-ink">
          <p
            className="leading-[16.5px]"
            style={clampSingleLine()}
            data-name="BannerProductName"
          >
            {joinNameLines(current)}
          </p>
        </div>
      </div>

      {/* 가격 — 42dot Sans Bold 15px */}
      <p
        className="absolute font-display text-[15px] font-bold leading-[13.5px] text-ink [word-break:break-word]"
        style={{ left: banner.priceAt[0], top: banner.priceAt[1], width: 64, height: 36 }}
      >
        {current.price}
      </p>

      {/*
        태그 3개.
        Figma 는 칩을 x=35 / 102 / 169 에 고정 폭(61/61/68)으로 놓았다. 그 폭은 시안의
        태그 길이에 맞춰진 값이라 더 긴 라벨이 들어오면 글자가 칩을 넘쳐 두 줄로 잘렸고,
        칩을 늘리면 다음 칩과 겹쳤다. 그래서 첫 칩 위치에서 시작하는 flex 행으로 바꿨다.
        간격 6px 은 실측값(102 - (35 + 61) = 6)이라 짧은 태그는 시안과 같은 자리에 오고,
        긴 태그는 칩이 늘어나면서 뒤 칩을 밀어낸다.
      */}
      <div
        className="absolute flex items-center gap-[6px] pt-[6px]"
        style={{ left: banner.tags[0].x, top: banner.tags[0].y, height: 29 }}
        data-name="Container"
      >
        {banner.tags.map((slot, i) => {
          const tag = current.tags[i];
          if (!tag) return null;
          return (
            <div
              key={slot.x}
              className="relative flex h-[23px] shrink-0 items-center justify-center rounded-full bg-ink px-[6px] py-[2px]"
              style={{ minWidth: slot.width }}
              data-name="Text"
            >
              <p className="relative shrink-0 whitespace-nowrap text-center font-sans text-[11px] font-medium leading-[13.5px] text-white">
                {tag.label ?? tag}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
