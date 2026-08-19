import pithLogo from '@/assets/figma/pith-logo.png';
import wimLogo from '@/assets/figma/wim-logo-white.png';

/**
 * 피쓰 서울 / 윔 스토어 전환 토글.
 * Figma 마켓 4 의 `StoreToggle` (1104:1645) 실측 그대로.
 *
 *  - 래퍼 361x56, 트랙은 left 8.13 / 344.736x55.104, radius 완전 pill
 *  - 트랙: bg rgba(255,255,255,0.85) + 0.672px rgba(200,215,240,0.6) 테두리
 *          + 그림자 0 1.344 16.128 rgba(30,40,80,.1) / 0 .672 2.688 rgba(30,40,80,.06)
 *          + 상단 inset 하이라이트 rgba(255,255,255,.9)
 *  - 활성 pill: 170.016x45.696, bg #000, 그림자 0 2.688 10.752 rgba(0,0,0,.3)
 *              left 4.704(피쓰) ↔ 170.688(윔) 로 이동
 *  - 로고: Pith 58.464x21.504 / WIM Store 69.216x21.504
 *
 * 전환 방식
 *  - `wim` **boolean** 하나로 흑백이 결정된다(피쓰=false / 윔=true).
 *  - pill 은 DOM 에서 하나뿐이고 `translateX` 로 미끄러진다. 좌우 버튼을 각각
 *    칠했다 지우면 배경색이 툭툭 끊겨서(= 뻑뻑함) 이동으로 처리했다.
 *  - 로고는 어두운 원본 1장을 쓰고, 활성 쪽만 `invert` 필터로 흰색을 만든다.
 *    변형 PNG 를 따로 두면 저해상도 파일이 섞여 흐려지므로 고해상도 1장으로 통일했다.
 */

/** 트랙 내부 좌표계 (Figma 실측) */
const TRACK = { left: 8.132, width: 344.736, height: 55.104 };
const PILL = { width: 170.016, height: 45.696, left: 4.704, travel: 170.688 - 4.704 };

/** 전환 곡선 — 처음 빠르게 밀리고 끝에서 부드럽게 멈춘다 */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION = '340ms';

/**
 * @param {boolean} wim  true = 윔 스토어 활성, false = 피쓰 서울 활성
 * @param {(wim: boolean) => void} onChange
 */
export default function StoreToggle({ wim = false, onChange }) {
  const select = (next) => {
    if (next !== wim) onChange?.(next);
  };

  return (
    <div className="relative h-[56px] w-[361px]" data-node-id="1104:1645" data-name="StoreToggle" data-wim={wim}>
      <div
        className="absolute top-0 h-[55.104px] rounded-full"
        style={{ left: TRACK.left, width: TRACK.width }}
      >
        {/* 트랙 배경 */}
        <div className="absolute inset-0 rounded-full bg-white/85" data-node-id="1104:1648" />
        {/* 트랙 테두리 + 그림자 */}
        <div
          className="absolute inset-0 rounded-full border-[0.672px] border-solid border-toggle-line"
          style={{
            boxShadow:
              '0px 1.344px 16.128px 0px rgba(30,40,80,0.1), 0px 0.672px 2.688px 0px rgba(30,40,80,0.06)',
          }}
          data-node-id="1104:1649"
        />

        {/* 활성 pill — boolean 에 따라 좌우로 미끄러진다 */}
        <div
          className="absolute rounded-full bg-ink will-change-transform"
          style={{
            left: PILL.left,
            top: 4.704,
            width: PILL.width,
            height: PILL.height,
            boxShadow: '0px 2.688px 10.752px 0px rgba(0,0,0,0.3)',
            transform: `translateX(${wim ? PILL.travel : 0}px)`,
            transition: `transform ${DURATION} ${EASE}`,
          }}
          data-node-id="1104:1650"
          data-name="ActivePill"
        />

        {/* 상단 inset 하이라이트 (pill 위에 얇게 얹힌다) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: 'inset 0px 0.672px 0px 0px rgba(255,255,255,0.9)' }}
          data-node-id="1104:1655"
        />

        {/* 피쓰 서울 */}
        <button
          type="button"
          aria-pressed={!wim}
          aria-label="Pith. Seoul"
          onClick={() => select(false)}
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: PILL.left, top: 4.704, width: PILL.width, height: PILL.height }}
          data-node-id="1104:1656"
          data-testid="store-toggle-pith"
        >
          <img
            alt="Pith."
            src={pithLogo}
            className="h-[21.504px] w-[58.464px] object-contain"
            style={{
              // 활성(검정 pill 위) 일 때만 흰색으로 반전
              filter: wim ? 'none' : 'brightness(0) invert(1)',
              transition: `filter ${DURATION} ${EASE}`,
            }}
          />
        </button>

        {/* 윔 스토어 */}
        <button
          type="button"
          aria-pressed={wim}
          aria-label="WIM Store"
          onClick={() => select(true)}
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 174.72, top: 4.704, width: PILL.width, height: PILL.height }}
          data-node-id="1104:1657"
          data-testid="store-toggle-wim"
        >
          <img
            alt="WIM Store"
            src={wimLogo}
            className="h-[21.504px] w-[69.216px] object-contain"
            style={{
              // 원본이 흰 로고라 비활성일 때만 검정으로 내린다
              filter: wim ? 'none' : 'brightness(0)',
              transition: `filter ${DURATION} ${EASE}`,
            }}
          />
        </button>
      </div>
    </div>
  );
}
