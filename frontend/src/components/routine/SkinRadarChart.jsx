/**
 * 피부 분석 결과를 다각형 레이더 차트로 그린다.
 *
 * WHS 앱 캡처본은 오각형(5축) + 노란색이었다. 우리 서비스는 그 캡처를 그대로 쓰지 않고
 * 직접 그린 벡터로 대체해 차별성을 준다 — 축 개수는 넘겨받은 `items` 길이를 그대로 쓰므로
 * (지금은 5개), 분석 모델이 다루는 항목이 6개 이상으로 늘어나면 자동으로 육각형 이상이 된다.
 */
const RING_STEPS = 5;

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function SkinRadarChart({ items, color = '#027e70', size = 240 }) {
  const n = items.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const labelR = maxR + size * 0.15;
  const angleFor = (i) => (i * 360) / n;
  const ringPoints = (r) =>
    Array.from({ length: n }, (_, i) => polarPoint(cx, cy, r, angleFor(i)))
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  const dataPoints = items.map((item, i) => polarPoint(cx, cy, (maxR * item.score) / 100, angleFor(i)));

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

      {items.map((item, i) => {
        const p = polarPoint(cx, cy, maxR, angleFor(i));
        return <line key={item.key} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e9f0" strokeWidth={1} />;
      })}

      <polygon
        points={dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={items[i].key} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}

      {items.map((item, i) => {
        const p = polarPoint(cx, cy, labelR, angleFor(i));
        /*
          좌우 끝쪽 라벨을 middle 정렬로 두면 글자가 캔버스 경계 밖으로 잘린다.
          점이 중심보다 왼쪽에 있으면 글자가 오른쪽(중심 쪽)으로 자라도록 start,
          오른쪽에 있으면 왼쪽으로 자라도록 end 로 바꿔 항상 안쪽으로 뻗게 한다.
        */
        const dx = p.x - cx;
        const anchor = Math.abs(dx) < size * 0.08 ? 'middle' : dx < 0 ? 'start' : 'end';
        return (
          <text
            key={item.key}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fill="#7a7e84"
            fontFamily="inherit"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}
