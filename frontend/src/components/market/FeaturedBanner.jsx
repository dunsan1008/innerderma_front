import { useCallback, useEffect, useRef, useState } from 'react';
import { truncateProductName } from '@/lib/productName';

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

  const current = items[index];

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
        상품명 — 공백 포함 18자 제한 + …
        Figma 는 첫 줄에 폭 확보용 제로폭 공백을 넣어 두 줄 박스를 만든다. 그 구조는 유지하고
        내용만 잘린 이름으로 바꾼다. (이름 박스가 찜·공유 버튼 위로 넘쳐 클릭을 막지 않게 pointer-events 도 끈다)
      */}
      <div
        className="pointer-events-none absolute flex flex-col items-start"
        style={{ left: banner.nameAt[0], top: banner.nameAt[1], width: 214, height: 46 }}
        data-name="Paragraph"
      >
        <div className="relative h-[44px] w-[338px] shrink-0 font-sans text-[16px] font-semibold leading-[0] text-ink [word-break:break-word]">
          <p className="mb-0 leading-[16.5px]">&#8203;</p>
          <p className="leading-[16.5px]" data-name="BannerProductName">
            {truncateProductName(current.name)}
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

      {/* 태그 3개 — 좌표는 Figma 실측 그대로 두고 라벨만 바뀐다 */}
      {banner.tags.map((slot, i) => {
        const tag = current.tags[i];
        if (!tag) return null;
        return (
          <div
            key={slot.x}
            className="absolute flex items-center pt-[6px]"
            style={{ left: slot.x, top: slot.y, width: slot.width, height: 29 }}
            data-name="Container"
          >
            <div
              className="relative flex h-[23px] shrink-0 flex-col items-start rounded-full bg-ink px-[6px] py-[2px]"
              style={{ width: slot.width }}
              data-name="Text"
            >
              <div className="relative flex shrink-0 items-center justify-center pt-[3px]">
                <p
                  className="relative shrink-0 text-right font-sans text-[11px] font-medium leading-[13.5px] text-white [word-break:break-word]"
                  style={{ width: slot.textWidth }}
                >
                  {tag.label ?? tag}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
