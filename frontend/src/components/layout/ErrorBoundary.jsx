import { Component } from 'react';
import { getT } from '@/i18n';

/**
 * 렌더 에러 안전망.
 *
 * React 18 은 렌더 중 에러가 나면 트리 전체를 언마운트한다. 경계가 없으면
 * 화면이 그냥 백지가 되고(=프레임이 사라짐) 원인도 화면에 남지 않는다.
 * 실제로 스토어 전환에서 이 증상이 있었기에, 프레임 안쪽을 이 경계로 감싼다.
 *
 * - 에러를 화면에 보여 주고(개발 중 원인 파악용) 다시 시도 버튼을 준다
 * - `data-error-boundary` 로 검증 스크립트가 크래시를 잡아낼 수 있다
 * - `resetKey` 가 바뀌면(=라우트 이동) 자동으로 정상 상태로 되돌린다
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // 콘솔에 남겨야 Playwright 의 pageerror/console 로도 잡힌다
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    /**
     * 클래스 컴포넌트라 useT() 훅을 쓸 수 없어 getT() 로 현재 언어를 읽는다.
     * (zustand 상태를 구독하지 않으므로 에러 표시 중 언어를 바꿔도 다시 그리지는 않는다)
     */
    const t = getT();

    return (
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-[12px] bg-white px-[28px]"
        data-error-boundary="true"
        role="alert"
      >
        <p className="text-center font-sans text-[15px] font-semibold leading-[22px] text-text-strong">
          {t.errorBoundary.message}
        </p>
        <p className="max-h-[160px] overflow-auto text-center font-sans text-[11px] font-normal leading-[16px] text-body">
          {String(error?.message ?? error)}
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-[4px] h-[40px] w-[160px] rounded-[12px] bg-header-dark font-sans text-[13px] font-semibold text-white"
        >
          {t.errorBoundary.retry}
        </button>
      </div>
    );
  }
}
