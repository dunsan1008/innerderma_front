/**
 * 디자인 토큰 단일 소스.
 * 값은 모두 Figma `InnerDerma / mcp_frontend` 페이지에서 추출한 실측치다.
 * 규칙: 컴포넌트에서 색상 리터럴(#fff 등)을 직접 쓰지 않고 여기 등록된 이름만 쓴다.
 * tailwind.config.js 가 이 파일을 읽어 유틸리티 클래스를 생성한다.
 */

/** 색상 */
export const COLORS = {
  /** 기본 검정. Figma 스타일 `MAIN` / `Label Color/Light/Primary` */
  ink: '#000000',
  white: '#ffffff',

  /** 제목 / 본문 진한 텍스트 (아웃라인 버튼 라벨 등) */
  'text-strong': '#1a1d23',
  /** 본문 보조 설명 텍스트 */
  body: '#6b7280',
  /** 아주 작은 안내 문구 */
  muted: '#938b8b',

  /** 원형 아이콘 배경 */
  'surface-muted': '#ebedf1',
  /** 로딩 스피너 트랙 */
  'ring-track': '#e5e7eb',

  /** 아웃라인 버튼 테두리 */
  'line-strong': '#8a8e95',
  /** 구분선 / 탭바 상단 보더 */
  line: '#e5e9f0',

  /** 비활성 버튼 배경 (Button / Property 1=disable) */
  'disabled-bg': '#e5e9f0',
  /** 비활성 버튼 라벨 */
  'disabled-text': '#b0b6c0',

  /** 홈 상단 어두운 헤더 */
  'header-dark': '#16161a',
  /** 헤더 요일 칩(비선택, 불투명) */
  'chip-dark': '#454548',
  /** 오늘 밤 / 내일 아침 세그먼트 트랙 */
  'segment-track': '#f4f5f7',
  /** 루틴 자리표시 카드 테두리 */
  'placeholder-line': '#f3f3f3',
  /** 루틴 자리표시 카드 배경 */
  placeholder: 'rgba(177,177,177,0.15)',

  /** 어두운 배경 위 반투명 흰색 */
  'white-10': 'rgba(255,255,255,0.1)',
  'white-15': 'rgba(255,255,255,0.15)',
  'white-20': 'rgba(255,255,255,0.2)',
  'white-35': 'rgba(255,255,255,0.35)',
  'white-50': 'rgba(255,255,255,0.5)',
  'white-60': 'rgba(255,255,255,0.6)',
  'white-70': 'rgba(255,255,255,0.7)',
  /** 흰 칩 위 검정 글씨 */
  'ink-70': 'rgba(0,0,0,0.7)',
  /** 모달 딤 배경 */
  overlay: 'rgba(0,0,0,0.7)',

  /** 어두운 배경 위 검정 반투명 */
  'ink-50': 'rgba(0,0,0,0.5)',
  'ink-90': 'rgba(0,0,0,0.9)',

  /** --- 루틴(솔루션) 화면 --- */
  /** 나이트/모닝 헤더의 기록 있는 요일 칩 */
  'chip-green': '#327145',
  /**
   * 캘린더에서 "선택한 날" 테두리.
   * 초록(수행)·흰색(오늘)·회색(미수행)과 겹치지 않게 앰버로 골랐다. 어두운 헤더/패널 위에서 잘 보인다.
   */
  'chip-select': '#e8a33d',
  /** 섹션 라벨 DERMA CARE */
  'accent-teal': '#027e70',
  /** 섹션 라벨 INNER CARE / 안내 박스 텍스트 */
  'accent-green': '#4a7c59',
  /** 섹션 라벨 ETC / 피해주세요 박스 */
  'accent-brown': '#b06020',
  /** 섹션 부제 */
  'label-sub': '#7a7e84',

  /** 피해주세요 박스 */
  'warn-bg': '#fff8f0',
  'warn-line': '#ffe0c0',
  /** 섭취 주의 안내 박스 */
  'note-bg': '#f2f7f3',
  'note-line': '#8fab96',

  /** 루틴 단계 카테고리 태그 (배경/글씨 쌍) */
  'tag-moist-bg': '#e5f2f3',
  'tag-moist-text': '#027e70',
  'tag-nutrient-bg': '#f0eaf8',
  'tag-nutrient-text': '#7b52b9',
  'tag-barrier-bg': '#fef3e2',
  'tag-barrier-text': '#a0600a',
  'tag-lock-bg': '#e8f0fd',
  'tag-lock-text': '#3b6abf',
  'tag-waste-bg': '#fbeae8',
  'tag-waste-text': '#9b3e2a',
  'tag-uv-bg': '#f4f8e8',
  'tag-uv-text': '#6b8a1e',

  /** --- 마켓 --- */
  /** 상품 이미지 영역 기본 배경 */
  'image-bg': '#dadada',
  /** 비활성 카테고리 칩 배경 */
  'chip-off': '#f7f9fc',
  /** 비활성 카테고리 칩 테두리(수부지 칩만 0.5px #e2e2e2) */
  'chip-off-line': '#e2e2e2',
  /** 찜 목록 도구 행(체크박스·보조 텍스트) */
  'tool-gray': '#959595',
  /** 필터 시트 비활성 탭 라벨 */
  'tab-off': '#c4c4c4',

  /** --- 자가진단 (Figma 970:1090) --- */
  /** 미선택 항목 배경 */
  'check-off': '#f8f8fb',
  /** 선택된 항목 배경 */
  'check-on': '#ededed',
  /** 선택된 항목 테두리 */
  'check-on-line': '#777777',
  /** 항목 라벨 */
  'check-label': '#717182',
  /** 세그먼트(직접 체크) 탭 배경 */
  'check-tab': '#eeeeee',
  /** 헤더 하단 구분선 (rgba(0,0,0,0.1)) */
  'hairline': 'rgba(0,0,0,0.1)',

  /** --- 장바구니 / 상품 상세 (Figma 1026:2397, 1026:2575) --- */
  /** 수량 스테퍼·배송방법 셀렉트 테두리 */
  'stepper-line': '#e5e5e5',
  /** 보조 설명 텍스트 */
  'cart-sub': '#6b7280',
  /** 장바구니 카드 · 체크박스 테두리 */
  'card-line': '#dfe4ea',
  /** 하단 고정 바 상단 구분선 */
  'bar-line': '#eaedf0',
  /** 상품 썸네일 배경 */
  'thumb-bg': '#f5f6f8',
  /** 상품 옵션 설명 텍스트 */
  'option-gray': '#8a909e',
  /** 배송방법 셀렉트 라벨 */
  'select-text': '#3d3f45',
  /** 상세 설명 자리표시 블록 배경 (ProductDetail Frame 60/61/62) */
  'detail-placeholder': 'rgba(177,177,177,0.46)',

  /** --- 스토어 전환 토글 (Figma 1104:1645) --- */
  /** 트랙 테두리 */
  'toggle-line': 'rgba(200,215,240,0.6)',
  /** 솔루션 전 회색 자리표시 배경 */
  'gray-static': '#e5e9f0',
  /** 필터 시트 구분선 (SVG stroke 와 동일) */
  'sheet-line': '#bcbcbc',

  /** 마이페이지 프로필 아바타 배경 */
  avatar: '#aaaaaa',
  /** 로그아웃 등 위험 동작 */
  danger: '#ef4444',

  /** 카메라 화면 배경 */
  'camera-bg': '#1a1a1a',
  /** 얼굴 인식 상태: 인식중(노랑) / 인식됨(초록) */
  'status-pending': '#eab308',
  'status-ok': '#22c55e',
  /** 카메라 하단 가이드 문구 */
  'guide-pending': '#fde047',
  'guide-ok': '#86efac',
};

/** 폰트 패밀리 */
export const FONTS = {
  /** 로고 전용. Figma: Palatino Linotype Bold */
  logo: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', '"Palatino LT STD"', 'Georgia', 'serif'],
  /** 본문 전용. Figma: Noto Sans KR */
  sans: ['"Noto Sans KR"', 'system-ui', '-apple-system', 'sans-serif'],
  /** 큰 카피 전용. Figma: 42dot Sans Bold */
  display: ['"42dot Sans"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
};

/** 아이폰 16 프레임 규격 (Figma 프레임 실측) */
export const FRAME = {
  width: 393,
  height: 852,
  /** Figma 프레임에 적용된 라운드 */
  radius: 44,
  /** Figma 프레임 그림자 */
  shadow: '0px 4px 50px 0px rgba(0,0,0,0.25)',
};
