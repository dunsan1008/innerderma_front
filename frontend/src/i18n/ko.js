/**
 * 한국어 번역 사전 (기본 언어).
 * 키 구조: 화면/영역.항목
 */
export default {
  // ─── 공통 ───
  common: {
    today: '오늘',
    tomorrow: '내일',
    home: '홈',
    market: '마켓',
    capture: '촬영',
    mypage: '마이페이지',
    close: '닫기',
    apply: '적용하기',
    reset: '초기화',
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    selectAll: '전체 선택',
    language: 'Language',
    select: '선택',
    viewDetail: '상세보기',
    selectLanguage: '언어 선택',
    cart: '장바구니',
    back: '뒤로',
    share: '공유',
    selectedCount: (n) => `선택 ${n}개`,
  },

  // ─── 요일 ───
  weekdays: { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' },

  // ─── 온보딩 ───
  onboarding: {
    serviceDiagOnly: '피부 진단만 받았어요!',
    serviceBoth: '피부 진단과 시술을 받았어요!',
    connecting: '방문 기록 연결 중입니다\n잠시만 기다려주세요',
    connectingSub: 'WHS 방문 정보를 찾는 중입니다.',
    connected: '연결이 완료되었습니다',
    connectedSub: 'WHS 방문 정보가 저장되었습니다',
    goHome: '홈으로 이동',
    signupQuestion: 'Q. 웰니스하우스 서울에서\n어떤 서비스를 받으셨나요?',
    signupHint: '방문 시 이용한 서비스를 선택해 주세요.\n맞춤 관리 루틴을 준비해 드릴게요.',
    purpose: '관리 목적',
  },

  // ─── 홈 ───
  home: {
    firstVisitTitle: '안녕하세요! 촬영을 통해\n오늘의 데일리 루틴을 시작해 보세요!',
    tonight: '오늘 밤',
    tomorrowMorning: '내일 아침',
    recovery: '회복',
    protection: '보호',
  },

  // ─── 캘린더 ───
  calendar: {
    fullCalendar: '전체 캘린더',
    closeCalendar: '캘린더 닫기',
    openCalendar: '캘린더 열기',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
    prevYear: '이전 해',
    nextYear: '다음 해',
    yearMonth: (y, m) => `${y}년 ${m}월`,
    yearLabel: (y) => `${y}년`,
    monthLabel: (m) => `${m}월`,
    selectYearMonth: '연·월 선택',
    dayAria: (day) => `${day}일`,
  },

  // ─── 솔루션/루틴 ───
  solution: {
    dermaCare: 'DERMA CARE',
    todaySkincare: '오늘의 피부케어',
    nightRoutineTitle: '회복을 위한 나이트 루틴',
    morningRoutineTitle: '수분 유지를 위한 모닝 루틴',
    innerCare: 'INNER CARE',
    todayIntake: '오늘의 섭취 케어',
    intakeSolution1: '피부 컨디션을 위한',
    intakeSolution2: '오늘의 섭취 솔루션',
    etc: 'ETC',
    avoidToday: '오늘은 피해주세요',
    whyThisRoutine: '왜 이 루틴인가요?',
    whyDescription: '오늘 피부는 약간의 건조함과 붉어짐이 보여요. WHS에서 받은 시술 후 현재 회복 단계를 함께 고려해, 자극을 줄이고 피부 장벽 회복을 돕는 루틴을 추천했어요.',
    todayPhoto: '오늘 피부 사진',
    whsDiagnosis: 'WHS 진단 데이터',
    afterTreatment: '시술 후 7일차',
    completeBtn: '수행 완료',
    completedBtn: '수행 완료됨',
    completeBtnDisabledTip: '오늘 날짜에서만 수행 완료를 기록할 수 있어요',
    todayRecommend: '오늘의 추천',
    supplementWarning: '⚠ 공복 섭취 시 속 불편감이 생길 수 있어요.',
    recommendTitle: '오늘의 솔루션과 어울리는 제품 추천',
  },

  // ─── 데일리 스킨 분석 모달 ───
  skinAnalysis: {
    title: '데일리 스킨 분석',
    routineButton: '데일리 케어 루틴 보러가기',
    reopenAria: '데일리 스킨 분석 다시 보기',
    factors: {
      pigmentation: '색소',
      poreTexture: '모공·피부결',
      wrinkle: '주름',
      redness: '홍조',
    },
  },

  // ─── 솔루션 미생성 ───
  noSolution: {
    title: '아직 솔루션이 생성되지 않았어요',
    description: '솔루션은 그날 촬영한 피부 상태를 분석해 만들어져요.\n해당 날짜가 되면 그날의 케어 루틴을 확인할 수 있어요.',
  },

  // ─── 나이트 스텝 ───
  nightSteps: [
    { title: '스킨·토너 수분 첫 레이어', tag: '수분 공급', desc: '세안 후 손바닥으로 가볍게 눌러 흡수시켜 피부 결을 정돈하세요.' },
    { title: '집중 영양 앰플 케어', tag: '성분 공급', desc: '피부 결을 따라 부드럽게 롤링하며 깊숙이 스며들도록 해주세요.' },
    { title: '나이트 크림 보습 장벽 강화', tag: '보습막 형성', desc: '적당량을 덜어 얼굴 전체에 감싸듯 꾹꾹 눌러 흡수시켜 주세요.' },
    { title: '슬리핑 팩 수분 마무리', tag: '수분 잠금', desc: '마지막 단계에서 얇게 펴 바르고 다음 날 아침에 세안하세요.' },
  ],

  // ─── 모닝 스텝 ───
  morningSteps: [
    { title: '물 세안', tag: '노폐물 제거', desc: '뜨겁지 않은 미온수로 가볍게 씻어내어 밤새 분비물을 제거하세요.' },
    { title: '토너·에센스 수분 채움', tag: '수분 공급', desc: '화장솜 없이 손바닥으로 가볍게 두드려 흡수시켜 주세요.' },
    { title: '겔 크림으로 보습막 형성', tag: '보습막 형성', desc: '가볍게 두드리듯 흡수시켜 하루 종일 피부 장벽을 보호하세요.' },
    { title: '자외선 차단제 SPF 50+', tag: '자외선 차단', desc: '흐린 날에도 UV 차단은 필수, 마지막 단계에서 꼼꼼히 발라주세요.' },
  ],

  // ─── 나이트 피해 항목 ───
  nightAvoid: ['강한 각질 제거 제품', '알코올 함량이 높은 토너', '자극적인 향료 성분'],
  morningAvoid: ['밀폐력 강한 오일 선크림', '두꺼운 파운데이션 제품', '합성 향료·향수 성분'],

  // ─── 저녁 세안 ───
  eveningWash: {
    title: '저녁 세안 루틴',
    tag: '노폐물 제거',
    description: '기본적으로 클렌징폼은 약산성을, 선크림이나 메이크업과 함께 외출하신 경우에는 클렌징오일을 사용해 주세요.',
    note: '오일은 첫 펌프 시 꼭 물이 묻지 않은 손으로, 충분한 마사지 후 미온수로 유화 과정을 거쳐 깨끗이 씻어내 주세요.',
    footnote: '3~4 펌프 · 깨끗한 맨손으로 사용',
  },

  // ─── 보충제 ───
  supplements: [
    { title: 'WIM 마린 콜라겐 앰플', desc: '하루 1포, 아침 식후 물 또는 음료에 혼합해 섭취하세요.' },
    { title: 'WIM 피부 프로바이오틱스', desc: '하루 1캡슐, 저녁 식후 물과 함께 섭취하세요.' },
  ],

  // ─── WHY 태그 ───
  whyTags: ['피부 장벽 회복', '약한 붉어짐', '수분 부족'],

  // ─── 촬영 ───
  camera: {
    lastRecord: (days) => `마지막 기록 후 ${days}일`,
    compareMessage: '그동안 어떻게 달라졌는지 비교해 드려요',
    recognized: '인식됨',
    recognizing: '인식중',
    guideRecognized: '얼굴이 인식되었어요. 촬영 버튼을 눌러주세요.',
    guideDefault: '안경을 벗고, 얼굴을 가운데에 맞춰주세요.\n조명이 밝을수록 정확해요.',
    noCameraSupport: '이 브라우저에서는 카메라를 사용할 수 없어요.',
    noCameraFound: '사용할 수 있는 카메라를 찾지 못했어요.',
    needsSecureContext: '카메라는 HTTPS 또는 localhost 에서만 사용할 수 있어요.',
    permissionNeeded: '카메라 권한이 필요해요. 브라우저 주소창의 카메라 아이콘에서 허용해주세요.',
    openError: '카메라를 여는 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.',
  },

  // ─── 세안 확인 모달 ───
  washCheck: {
    question: '귀가 후 세안을 하고 오셨나요?',
    subQuestion: '다시 한번 확인해 보세요!',
    done: '완료했습니다!',
    notYet: '아직이에요!',
    ariaLabel: '귀가 후 세안 확인',
  },

  // ─── 솔루션 요약 ───
  solutionSummary: {
    title: '오늘의 솔루션',
    headline: '오늘은 피부장벽 회복에\n집중해 주세요.',
  },

  // ─── 마켓 ───
  market: {
    emptyWishlist: '찜한 상품이 없어요. 마켓에서 하트를 눌러 담아보세요.',
    recommendation: '데일리 분석 맞춤 상품 추천',
    recommendationPre: '맞춤 상품 추천',
    wishlist: 'MY 찜',
    // Figma(870:5202) 는 "전체       배송방법 변경" 한 줄이지만
    // 앞의 "전체" 는 체크박스 라벨(filter.all)이 따로 렌더한다. 여기엔 뒷부분만 둔다.
    changeDelivery: '배송방법 변경',
    selectDelete: '선택삭제',
    addWish: '찜하기',
    removeWish: '찜 해제',
    wishlistAria: '찜 목록',
    bannerIndicatorAria: (n) => `${n}번째 추천 상품`,
    categoryOily: '수부지',
    categoryElasticity: '피부탄력',
  },

  // ─── 필터 ───
  filter: {
    gender: '성별',
    age: '연령대',
    diagnosis: '데일리 스킨 분석',
    all: '전체',
    female: '여성',
    male: '남성',
    teens: '10대',
    twenties: '20대',
    thirties: '30대',
    forties: '40대',
    diagnosisComplete: '진단완료',
    moisture: '수분/보습',
    pigment: '기미/미백',
    elasticity: '탄력/주름',
    pore: '모공/피지',
    closeAria: '필터 닫기',
  },

  // ─── 장바구니 ───
  cart: {
    title: 'MY 장바구니',
    shippingMethodAria: '배송방법',
    decreaseQtyAria: '수량 줄이기',
    increaseQtyAria: '수량 늘리기',
    emptyMessage: '장바구니가 비었어요. 마켓에서 상품을 담아보세요.',
    purchase: '구매하기',
    changeDeliveryBulkAria: '선택 상품 배송방법 일괄 변경',
  },

  // ─── 상품 상세 ───
  productDetail: {
    buyNow: '바로구매',
    comboCollapseAria: '베스트 조합 접기',
    comboExpandAria: '베스트 조합 펼치기',
    comboTitle: '많이 구매하는 베스트 조합',
    comboCta: '장바구니에 바로 담기',
    detailFeaturesTitle: '제품 특징',
    detailUsageTitle: '사용 방법',
    detailCareTitle: '보관 및 주의사항',
    skincareIntro: '매일 사용하는 루틴에 부담 없이 더할 수 있어요.',
    skincareUsageSteps: ['세안 후 적당량을 덜어요', '얼굴 전체에 부드럽게 펴 발라요', '가볍게 두드려 흡수시켜요'],
    skincareCare:
      '직사광선을 피해 서늘한 곳에 보관하세요. 사용 후에는 뚜껑을 꼭 닫아주세요. 사용 중 붉어짐이나 자극이 느껴지면 사용을 멈추고 전문의와 상담하세요.',
    supplementIntro: '바쁜 하루에도 간편하게 챙길 수 있어요.',
    supplementUsageSteps: ['하루 1회, 표시된 양만큼 섭취해요', '물이나 음료에 잘 섞어요', '꾸준히 섭취하면 더 좋아요'],
    supplementCare:
      '직사광선을 피해 서늘하고 건조한 곳에 보관하세요. 특정 질환이 있거나 임신·수유 중이라면 섭취 전 전문의와 상담하세요. 알레르기 체질은 원재료를 꼭 확인해주세요.',
  },

  // ─── 데일리 자가 진단 ───
  selfCheck: {
    title: '데일리 자가 진단',
    directCheck: '직접 체크',
    saveItems: '항목 저장',
  },
  selfCheckItems: {
    tight: '피부가 심하게 당겨요',
    hot: '화끈거리고 열감이 느껴져요',
    sting: '따끔거려요',
    rough: '피부가 푸석해요',
    none: '아무 이상이 없어요.',
    other: '그 외',
  },

  // ─── 솔루션 로딩 ───
  solutionLoading: {
    deriving: '솔루션을 도출 중입니다.\n잠시만 기다려주세요',
    aggregating: '데이터를 취합 중입니다.',
    analysisFailedTitle: '얼굴 분석에 실패했어요',
    analysisFailedSub: '자가진단 정보로 루틴을 준비할게요.',
  },

  // ─── 에러 경계 ───
  errorBoundary: {
    message: '화면을 그리는 중 문제가 생겼어요',
    retry: '다시 시도',
  },

  // ─── 마이페이지 ───
  mypage: {
    accountMasked: '신한 123-***-*******',
    member: '이너더마 회원',
    myInfo: '내 정보',
    nickname: '닉네임 변경',
    password: '비밀번호 변경',
    account: '계좌번호 변경',
    treatmentMgmt: '내 시술 관리',
    visitHistory: '방문 기록 관리',
    appSettings: '앱 설정',
    notification: '알림 설정',
    privacy: '개인정보 처리방침',
    logout: '로그아웃',
  },

  // ─── 언어 모달 ───
  lang: {
    title: 'Language',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
    en: 'English',
  },
};
