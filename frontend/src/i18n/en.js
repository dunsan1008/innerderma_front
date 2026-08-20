/**
 * English translations.
 */
export default {
  common: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    home: 'Home',
    market: 'Shop',
    capture: 'Capture',
    mypage: 'My Page',
    close: 'Close',
    apply: 'Apply',
    reset: 'Reset',
    confirm: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    selectAll: 'Select All',
    language: 'Language',
    select: 'Select',
    viewDetail: 'View details',
    selectLanguage: 'Select language',
    cart: 'Cart',
    back: 'Back',
    share: 'Share',
    selectedCount: (n) => `${n} selected`,
  },

  weekdays: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },

  onboarding: {
    serviceDiagOnly: 'I only had a skin diagnosis!',
    serviceBoth: 'I had a skin diagnosis and treatment!',
    connecting: 'Connecting visit records\nPlease wait a moment',
    connectingSub: 'Looking for your WHS visit information.',
    connected: 'Connection complete',
    connectedSub: 'Your WHS visit information has been saved',
    goHome: 'Go to Home',
    signupQuestion: 'Q. What service did you receive\nat Wellness House Seoul?',
    signupHint: 'Please select the service you used during your visit.\nWe will prepare a personalized care routine for you.',
    purpose: 'Care Purpose',
  },

  home: {
    firstVisitTitle: 'Hello! Start your daily\nroutine with a skin capture!',
    tonight: 'Tonight',
    tomorrowMorning: 'Tomorrow AM',
    recovery: 'Recovery',
    protection: 'Protection',
  },

  calendar: {
    fullCalendar: 'Full Calendar',
    closeCalendar: 'Close Calendar',
    openCalendar: 'Open Calendar',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month',
    prevYear: 'Previous Year',
    nextYear: 'Next Year',
    yearMonth: (y, m) => `${m}/${y}`,
    yearLabel: (y) => `${y}`,
    monthLabel: (m) => {
      const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return names[m] || `${m}`;
    },
    selectYearMonth: 'Select year and month',
    dayAria: (day) => `${day}`,
  },

  solution: {
    dermaCare: 'DERMA CARE',
    todaySkincare: "Today's Skincare",
    nightRoutineTitle: 'Night Recovery Routine',
    morningRoutineTitle: 'Morning Hydration Routine',
    innerCare: 'INNER CARE',
    todayIntake: "Today's Supplements",
    intakeSolution1: 'For your skin condition,',
    intakeSolution2: "today's intake solution",
    etc: 'ETC',
    avoidToday: 'Avoid today',
    whyThisRoutine: 'Why this routine?',
    whyDescription: 'Your skin shows slight dryness and redness today. Considering the recovery stage after your WHS treatment, we recommend a routine that reduces irritation and supports skin barrier recovery.',
    todayPhoto: "Today's skin photo",
    whsDiagnosis: 'WHS diagnosis data',
    afterTreatment: '7 days after treatment',
    completeBtn: 'Mark Complete',
    completedBtn: 'Completed',
    completeBtnDisabledTip: 'You can only mark completion for today',
    todayRecommend: "Today's pick",
    supplementWarning: '⚠ May cause discomfort if taken on an empty stomach.',
    recommendTitle: "Products to pair with today's solution",
  },

  noSolution: {
    title: 'No solution generated yet',
    description: 'Solutions are created by analyzing your skin condition from that day\'s capture.\nYou can check your care routine when that date arrives.',
  },

  nightSteps: [
    { title: 'Toner — First Hydration Layer', tag: 'Hydration', desc: 'After cleansing, gently press with palms to absorb and smooth your skin texture.' },
    { title: 'Intensive Ampoule Care', tag: 'Nourishment', desc: 'Roll gently along your skin lines to help it absorb deeply.' },
    { title: 'Night Cream — Barrier Repair', tag: 'Moisture Seal', desc: 'Apply an adequate amount and press gently over your entire face.' },
    { title: 'Sleeping Pack — Final Seal', tag: 'Lock-in', desc: 'Apply a thin layer as the last step and wash off the next morning.' },
  ],

  morningSteps: [
    { title: 'Water Cleanse', tag: 'Impurity Removal', desc: 'Gently rinse with lukewarm water to remove overnight secretions.' },
    { title: 'Toner & Essence Hydration', tag: 'Hydration', desc: 'Pat gently with your palms without cotton pads.' },
    { title: 'Gel Cream Moisture Barrier', tag: 'Moisture Seal', desc: 'Pat gently to absorb and protect your skin barrier all day.' },
    { title: 'Sunscreen SPF 50+', tag: 'UV Protection', desc: 'UV protection is essential even on cloudy days. Apply thoroughly.' },
  ],

  nightAvoid: ['Strong exfoliating products', 'High-alcohol toners', 'Irritating fragrances'],
  morningAvoid: ['Heavy oil-based sunscreens', 'Thick foundation products', 'Synthetic fragrances'],

  eveningWash: {
    title: 'Evening Cleansing Routine',
    tag: 'Impurity Removal',
    description: 'Use a mild acidic cleansing foam by default. If you wore sunscreen or makeup, use a cleansing oil.',
    note: 'Always start with dry hands for the first pump of oil. Massage thoroughly, then emulsify with lukewarm water.',
    footnote: '3-4 pumps · Use with clean bare hands',
  },

  supplements: [
    { title: 'WIM Marine Collagen Ampoule', desc: '1 sachet daily, mix with water or beverage after breakfast.' },
    { title: 'WIM Skin Probiotics', desc: '1 capsule daily, take with water after dinner.' },
  ],

  whyTags: ['Barrier Recovery', 'Mild Redness', 'Dehydration'],

  camera: {
    lastRecord: (days) => `${days} days since last record`,
    compareMessage: "Let's see how things have changed",
    recognized: 'Detected',
    recognizing: 'Detecting',
    guideRecognized: 'Face detected. Press the capture button.',
    guideDefault: 'Remove glasses and center your face.\nBetter lighting means better accuracy.',
    noCameraSupport: 'Camera is not supported in this browser.',
    noCameraFound: 'No available camera found.',
    needsSecureContext: 'The camera only works over HTTPS or on localhost.',
    permissionNeeded: 'Camera access is required. Please allow it from the camera icon in your address bar.',
    openError: 'Something went wrong opening the camera. Please try again shortly.',
  },

  washCheck: {
    question: 'Have you washed your face\nafter coming home?',
    subQuestion: 'Please double-check!',
    done: 'Yes, done!',
    notYet: 'Not yet!',
    ariaLabel: 'Face-washing confirmation',
  },

  solutionSummary: {
    title: "Today's Solution",
    headline: 'Focus on skin barrier\nrecovery today.',
  },

  market: {
    emptyWishlist: 'No saved items yet. Tap the heart in the shop to save.',
    recommendation: 'Daily Analysis Product Picks',
    recommendationPre: 'Product Picks',
    wishlist: 'My Wishlist',
    // 앞의 "All" 은 체크박스 라벨(filter.all)이 따로 렌더한다
    changeDelivery: 'Change Delivery',
    selectDelete: 'Delete Selected',
    addWish: 'Add to Wishlist',
    removeWish: 'Remove from Wishlist',
    wishlistAria: 'Wishlist',
    bannerIndicatorAria: (n) => `Recommended item ${n}`,
    categoryOily: 'Oily & Dehydrated',
    categoryElasticity: 'Elasticity',
  },

  filter: {
    gender: 'Gender',
    age: 'Age',
    diagnosis: 'Daily Skin Analysis',
    all: 'All',
    female: 'Female',
    male: 'Male',
    teens: 'Teens',
    twenties: '20s',
    thirties: '30s',
    forties: '40s',
    diagnosisComplete: 'Diagnosed',
    moisture: 'Moisture',
    pigment: 'Pigmentation',
    elasticity: 'Elasticity',
    pore: 'Pore/Sebum',
    closeAria: 'Close filter',
  },

  cart: {
    title: 'My Cart',
    shippingMethodAria: 'Shipping method',
    decreaseQtyAria: 'Decrease quantity',
    increaseQtyAria: 'Increase quantity',
    emptyMessage: 'Your cart is empty. Add items from the shop.',
    purchase: 'Checkout',
    changeDeliveryBulkAria: 'Bulk-change shipping method for selected items',
  },

  productDetail: {
    buyNow: 'Buy Now',
    comboCollapseAria: 'Collapse best combo',
    comboExpandAria: 'Expand best combo',
    comboTitle: 'Best-Selling Combo',
    comboCta: 'Add Combo to Cart',
  },

  selfCheck: {
    title: 'Daily Self-Check',
    directCheck: 'Manual Check',
    saveItems: 'Save',
  },
  selfCheckItems: {
    tight: 'My skin feels very tight',
    hot: 'It feels hot and irritated',
    sting: 'It feels stinging',
    rough: 'My skin feels rough and dry',
    none: 'Nothing feels wrong.',
    other: 'Other',
  },

  solutionLoading: {
    deriving: 'Generating your solution.\nPlease wait a moment',
    aggregating: 'Aggregating your data.',
  },

  errorBoundary: {
    message: 'Something went wrong while rendering this screen',
    retry: 'Try Again',
  },

  mypage: {
    accountMasked: 'Shinhan 123-***-*******',
    member: 'InnerDerma Member',
    myInfo: 'My Info',
    nickname: 'Change Nickname',
    password: 'Change Password',
    account: 'Change Account',
    treatmentMgmt: 'Treatment Management',
    visitHistory: 'Visit History',
    appSettings: 'App Settings',
    notification: 'Notifications',
    privacy: 'Privacy Policy',
    logout: 'Logout',
  },

  lang: {
    title: 'Language',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
    en: 'English',
  },
};
