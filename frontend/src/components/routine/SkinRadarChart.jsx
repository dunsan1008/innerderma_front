/**
 * 피부 분석 결과를 다각형 레이더 차트로 그린다.
 *
 * WHS 앱 캡처본은 오각형(5축) + 노란색이었다. 우리 서비스는 그 캡처를 그대로 쓰지 않고
 * 직접 그린 벡터로 대체해 차별성을 준다 — 축 개수는 넘겨받은 `items` 길이를 그대로 쓰므로
 * (지금은 4개), 분석 모델이 다루는 항목이 늘어나면 자동으로 오각형·육각형이 된다.
 */
const RING_STEPS = 5;
const LABEL_FONT_SIZE = 11;

/*
  ── 라벨이 viewBox 밖으로 잘리지 않게 하는 규칙 ──

  viewBox 는 항상 `0 0 size size` 이고 중심도 정확히 캔버스 정중앙(size/2)에 둔다.
  예전에는 정 위쪽 라벨이 잘리는 걸 cy 를 아래로 내려서 막았는데, 축이 짝수가 되어
  정 아래쪽에도 라벨이 생긴 순간 확보한 만큼 아래가 잘렸다. 한쪽을 밀어내는 보정은
  축 개수에 의존하므로 쓰지 않는다 — 대신 라벨이 차지할 여유를 먼저 계산해서
  그만큼 차트 반경(maxR)을 줄인다. 축이 3·4·5·6개로 바뀌어도 같은 식이 그대로 성립한다.

  viewBox 를 넓히는 방법도 가능하지만, 그러면 사용자 단위 1 이 1px 이 아니게 되어
  fontSize 11 이 실제로는 11px 보다 작게 그려진다. 렌더 크기(width/height=size)와
  좌표계를 1:1 로 유지하는 쪽이 라벨 크기를 정확히 지킨다.
*/
/** viewBox 경계에 글자가 딱 붙지 않도록 남기는 여유(px) */
const EDGE_PAD = 1;
/** 차트 바깥 테두리 ↔ 라벨 기준점 간격 (기존 size*0.15 유지) */
const LABEL_GAP_RATIO = 0.15;
/** 라벨 여유가 충분할 때 쓰는 기본 반경 비율 (기존 size*0.34 유지) */
const MAX_R_RATIO = 0.34;
/**
 * dominant-baseline="middle" 텍스트의 실측 세로 박스(Chromium, 11px):
 * 기준 y 위로 약 0.91em, 아래로 약 0.55em 으로 위아래가 비대칭이다.
 * 폰트에 따라 조금 달라질 수 있어 넉넉하게 잡는다.
 */
const TEXT_ASCENT_RATIO = 1;
const TEXT_DESCENT_RATIO = 0.7;
/** 수평 성분이 이보다 작은 축은 정 위/아래로 보고 middle 정렬한다 */
const VERTICAL_AXIS_EPS = 0.2;
const ZERO_EPS = 1e-6;

/**
 * 라벨 폭 추정치(px). 목적이 "캔버스 밖으로 안 나가게" 이므로 실제보다 크게 잡는다.
 * 한글·한자·가나는 전각(1em), 로마자는 글자별 평균 자폭으로 계산한다.
 * ('모공·피부결' 처럼 언어마다 길이가 크게 달라서 글자 수만으로는 부족하다.)
 */
function estimateTextWidth(text, fontSize) {
  let em = 0;
  for (const ch of String(text)) {
    if (/[\u1100-\u11ff\u2e80-\ua4cf\ua960-\ua97f\uac00-\ud7ff\uf900-\ufaff\uff00-\uff60]/.test(ch)) em += 1;
    else if (/[·・.,'’"!|:;]/.test(ch)) em += 0.35;
    else if (/[ijlt1[\]()]/.test(ch)) em += 0.4;
    else if (/[mwMW]/.test(ch)) em += 0.95;
    else em += 0.6;
  }
  return em * fontSize;
}

export default function SkinRadarChart({ items, color = '#027e70', size = 240 }) {
  const n = items.length;
  const cx = size / 2;
  const cy = size / 2;

  /*
    축별 단위 방향과 라벨 정렬을 먼저 확정한다 — 반경 계산과 실제 렌더가 같은 값을 써야 한다.
    좌우 끝쪽 라벨을 middle 정렬로 두면 글자가 캔버스 경계 밖으로 잘린다.
    축이 왼쪽을 향하면 글자가 오른쪽(중심 쪽)으로 자라도록 start,
    오른쪽을 향하면 왼쪽으로 자라도록 end 로 바꿔 항상 안쪽으로 뻗게 한다.
  */
  const axes = items.map((item, i) => {
    const rad = (((i * 360) / n - 90) * Math.PI) / 180;
    const ux = Math.cos(rad); // + 면 오른쪽
    const uy = Math.sin(rad); // - 면 위쪽
    const anchor = Math.abs(ux) < VERTICAL_AXIS_EPS ? 'middle' : ux < 0 ? 'start' : 'end';
    return { item, ux, uy, anchor, labelWidth: estimateTextWidth(item.label, LABEL_FONT_SIZE) };
  });

  /*
    라벨 기준점이 중심에서 최대 얼마나 떨어질 수 있는지 축마다 풀고 가장 빡빡한 값을 쓴다.
    - 세로: |uy|*labelR + 글자 위/아래 높이 ≤ 여유
    - 가로: start/end 라벨은 기준점에서 안쪽으로 자라므로 기준점만 들어오면 되고(폭 무관),
            middle 라벨은 좌우로 폭의 절반씩 퍼지므로 그만큼 더 빼준다.
  */
  const avail = size / 2 - EDGE_PAD;
  const labelRLimit = Math.min(
    ...axes.map(({ ux, uy, anchor, labelWidth }) => {
      const limits = [];
      if (Math.abs(uy) > ZERO_EPS) {
        const textPad = LABEL_FONT_SIZE * (uy < 0 ? TEXT_ASCENT_RATIO : TEXT_DESCENT_RATIO);
        limits.push((avail - textPad) / Math.abs(uy));
      }
      if (Math.abs(ux) > ZERO_EPS) {
        limits.push((avail - (anchor === 'middle' ? labelWidth / 2 : 0)) / Math.abs(ux));
      }
      return limits.length ? Math.min(...limits) : Infinity;
    }),
  );

  const labelGap = size * LABEL_GAP_RATIO;
  const maxR = Math.max(1, Math.min(size * MAX_R_RATIO, labelRLimit - labelGap));
  const labelR = Math.max(0, Math.min(maxR + labelGap, labelRLimit));

  const pointAt = ({ ux, uy }, r) => ({ x: cx + r * ux, y: cy + r * uy });
  const ringPoints = (r) =>
    axes
      .map((axis) => pointAt(axis, r))
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  const dataPoints = axes.map((axis) => pointAt(axis, (maxR * axis.item.score) / 100));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="skin-analysis-radar">
      {Array.from({ length: RING_STEPS }, (_, ring) => (
        <polygon
          key={ring}
          points={ringPoints((maxR * (ring + 1)) / RING_STEPS)}
          fill="none"
          stroke="#e5e9f0"
          strokeWidth={1}
        />
      ))}

      {axes.map((axis) => {
        const p = pointAt(axis, maxR);
        return <line key={axis.item.key} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e9f0" strokeWidth={1} />;
      })}

      <polygon
        points={dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={axes[i].item.key} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}

      {axes.map((axis) => {
        const p = pointAt(axis, labelR);
        return (
          <text
            key={axis.item.key}
            x={p.x}
            y={p.y}
            textAnchor={axis.anchor}
            dominantBaseline="middle"
            fontSize={LABEL_FONT_SIZE}
            fill="#7a7e84"
            fontFamily="inherit"
          >
            {axis.item.label}
          </text>
        );
      })}
    </svg>
  );
}
