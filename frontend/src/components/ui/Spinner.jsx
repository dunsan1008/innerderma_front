import base from '@/assets/figma/loading-base.svg';
import arc from '@/assets/figma/loading-arc.svg';

/**
 * 로딩 스피너.
 * Figma `base` + `loader` 두 개의 66x66 요소를 그대로 겹친 구조.
 * `loader` 원호는 66x66 박스 안에서 left 25.278 / top 0 / 38.909x25.476 위치를 차지한다.
 * 정지된 디자인이지만 실제 동작을 위해 박스 전체를 회전시킨다.
 *
 * 회전 한 바퀴에 2초. 원래 1초였는데 너무 빨라 조급해 보여서 절반 속도로 낮췄다.
 * 로딩 화면(연결 중 / 솔루션 도출 중)이 모두 이 컴포넌트를 쓰므로 여기만 바꾸면 된다.
 */
export default function Spinner({ className = 'absolute left-[163px] top-[302px] size-[66px]' }) {
  return (
    <div className={className}>
      <img alt="" src={base} className="absolute inset-0 block size-full max-w-none" data-node-id="870:3456" />
      <div className="absolute inset-0 animate-[spin_2s_linear_infinite]" data-node-id="870:3457">
        <img
          alt=""
          src={arc}
          className="absolute block max-w-none"
          style={{ left: 25.278, top: 0, width: 38.9088, height: 25.4758 }}
        />
      </div>
    </div>
  );
}
