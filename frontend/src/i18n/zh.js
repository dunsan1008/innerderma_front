/**
 * 中文翻译 (简体中文).
 */
export default {
  common: {
    today: '今天',
    tomorrow: '明天',
    home: '首页',
    market: '商城',
    capture: '拍摄',
    mypage: '我的',
    close: '关闭',
    apply: '应用',
    reset: '重置',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    selectAll: '全选',
    language: 'Language',
    select: '选择',
    viewDetail: '查看详情',
    selectLanguage: '选择语言',
    cart: '购物车',
    back: '返回',
    share: '分享',
    selectedCount: (n) => `已选${n}件`,
  },

  weekdays: { mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日' },

  onboarding: {
    serviceDiagOnly: '我只接受了皮肤诊断！',
    serviceBoth: '我接受了皮肤诊断和治疗！',
    connecting: '正在连接就诊记录\n请稍候',
    connectingSub: '正在查找您的WHS就诊信息。',
    connected: '连接完成',
    connectedSub: 'WHS就诊信息已保存',
    goHome: '前往首页',
    signupQuestion: 'Q. 您在Wellness House首尔\n接受了哪些服务？',
    signupHint: '请选择您就诊时使用的服务。\n我们将为您准备定制护理方案。',
    purpose: '护理目的',
  },

  home: {
    firstVisitTitle: '您好！通过拍摄\n开始今天的日常护理吧！',
    tonight: '今晚',
    tomorrowMorning: '明早',
    recovery: '修复',
    protection: '防护',
  },

  calendar: {
    fullCalendar: '完整日历',
    closeCalendar: '关闭日历',
    openCalendar: '打开日历',
    prevMonth: '上月',
    nextMonth: '下月',
    prevYear: '上年',
    nextYear: '下年',
    yearMonth: (y, m) => `${y}年${m}月`,
    yearLabel: (y) => `${y}年`,
    monthLabel: (m) => `${m}月`,
    selectYearMonth: '选择年月',
    dayAria: (day) => `${day}日`,
  },

  solution: {
    dermaCare: 'DERMA CARE',
    todaySkincare: '今日护肤',
    nightRoutineTitle: '夜间修复护理方案',
    morningRoutineTitle: '晨间保湿护理方案',
    innerCare: 'INNER CARE',
    todayIntake: '今日口服护理',
    intakeSolution1: '为您的肌肤状态',
    intakeSolution2: '今日口服方案',
    etc: 'ETC',
    avoidToday: '今日请避免',
    whyThisRoutine: '为什么推荐这个方案？',
    whyDescription: '今天的皮肤有轻微干燥和泛红。结合WHS治疗后的恢复阶段，推荐了减少刺激并帮助皮肤屏障恢复的护理方案。',
    todayPhoto: '今日皮肤照片',
    whsDiagnosis: 'WHS诊断数据',
    afterTreatment: '术后第7天',
    completeBtn: '完成',
    completedBtn: '已完成',
    completeBtnDisabledTip: '只能在当天记录完成',
    todayRecommend: '今日推荐',
    supplementWarning: '⚠ 空腹服用可能引起不适。',
    recommendTitle: '搭配今日方案的推荐商品',
  },

  skinAnalysis: {
    title: '每日肌肤分析',
    routineButton: '查看每日护理流程',
    reopenAria: '再次查看每日肌肤分析',
    factors: {
      pigmentation: '色素',
      pore: '毛孔',
      wrinkle: '皱纹',
      redness: '泛红',
      texture: '肤质',
    },
  },

  noSolution: {
    title: '尚未生成护理方案',
    description: '护理方案基于当天拍摄的皮肤状态分析生成。\n到达该日期后即可查看当天的护理方案。',
  },

  nightSteps: [
    { title: '化妆水·爽肤水 补水第一层', tag: '补水', desc: '洁面后用手掌轻轻按压吸收，整理肌肤纹理。' },
    { title: '精华液深层滋养', tag: '营养', desc: '沿肌肤纹理轻柔滚动，使其深层吸收。' },
    { title: '晚霜 修护保湿屏障', tag: '锁水', desc: '取适量，用包裹式按压法涂抹全脸。' },
    { title: '睡眠面膜 锁住水分', tag: '封存', desc: '最后一步薄薄涂抹，第二天早上清洗。' },
  ],

  morningSteps: [
    { title: '清水洁面', tag: '清洁', desc: '用温水轻轻冲洗，去除夜间分泌物。' },
    { title: '化妆水·精华 补充水分', tag: '补水', desc: '不用化妆棉，用手掌轻轻拍打吸收。' },
    { title: '凝胶面霜 形成保湿屏障', tag: '锁水', desc: '轻拍吸收，全天保护皮肤屏障。' },
    { title: '防晒霜 SPF 50+', tag: '防晒', desc: '阴天也要防晒，最后一步仔细涂抹。' },
  ],

  nightAvoid: ['强效去角质产品', '高酒精含量爽肤水', '刺激性香料成分'],
  morningAvoid: ['封闭性强的油性防晒', '厚重粉底产品', '合成香料·香水成分'],

  eveningWash: {
    title: '晚间洁面护理',
    tag: '清洁',
    description: '基本使用弱酸性洗面奶。若涂了防晒或化妆品，请使用卸妆油。',
    note: '第一泵油请确保双手干燥，充分按摩后用温水乳化冲洗干净。',
    footnote: '3-4泵 · 用干净的双手使用',
  },

  supplements: [
    { title: 'WIM海洋胶原蛋白', desc: '每日1包，早餐后混合水或饮料服用。' },
    { title: 'WIM皮肤益生菌', desc: '每日1粒，晚餐后用水服用。' },
  ],

  whyTags: ['屏障修复', '轻微泛红', '水分不足'],

  camera: {
    lastRecord: (days) => `距上次记录${days}天`,
    compareMessage: '看看有什么变化',
    recognized: '已识别',
    recognizing: '识别中',
    guideRecognized: '已识别面部。请按拍摄按钮。',
    guideDefault: '请摘下眼镜，将面部居中。\n光线越亮越准确。',
    noCameraSupport: '此浏览器不支持摄像头。',
    noCameraFound: '未找到可用摄像头。',
    needsSecureContext: '摄像头仅在 HTTPS 或 localhost 环境下可用。',
    permissionNeeded: '需要摄像头权限。请在浏览器地址栏的摄像头图标中允许。',
    openError: '打开摄像头时出现问题。请稍后重试。',
  },

  washCheck: {
    question: '回家后洗脸了吗？',
    subQuestion: '请再确认一下！',
    done: '已完成！',
    notYet: '还没有！',
    ariaLabel: '洗脸确认',
  },

  solutionSummary: {
    title: '今日护理方案',
    headline: '今天请专注于\n皮肤屏障修复。',
  },

  market: {
    emptyWishlist: '还没有收藏的商品。在商城点击爱心即可收藏。',
    recommendation: '每日分析定制商品推荐',
    recommendationPre: '定制商品推荐',
    wishlist: '我的收藏',
    changeDelivery: '更改配送方式',
    selectDelete: '删除选中',
    addWish: '收藏',
    removeWish: '取消收藏',
    wishlistAria: '收藏列表',
    bannerIndicatorAria: (n) => `推荐商品第${n}个`,
    categoryOily: '缺水出油',
    categoryElasticity: '弹力',
  },

  filter: {
    gender: '性别',
    age: '年龄',
    diagnosis: '每日皮肤分析',
    all: '全部',
    female: '女',
    male: '男',
    teens: '10代',
    twenties: '20代',
    thirties: '30代',
    forties: '40代',
    diagnosisComplete: '已诊断',
    moisture: '水分/保湿',
    pigment: '色素/美白',
    elasticity: '弹力/皱纹',
    pore: '毛孔/皮脂',
    closeAria: '关闭筛选',
  },

  cart: {
    title: '我的购物车',
    shippingMethodAria: '配送方式',
    decreaseQtyAria: '减少数量',
    increaseQtyAria: '增加数量',
    emptyMessage: '购物车是空的。快去商城挑选商品吧。',
    purchase: '去购买',
    changeDeliveryBulkAria: '批量修改所选商品的配送方式',
  },

  productDetail: {
    buyNow: '立即购买',
    comboCollapseAria: '收起最佳组合',
    comboExpandAria: '展开最佳组合',
    comboTitle: '热门最佳组合',
    comboCta: '直接加入购物车',
    detailFeaturesTitle: '产品特点',
    detailUsageTitle: '使用方法',
    detailCareTitle: '保存及注意事项',
    skincareIntro: '可以轻松加入日常护肤程序。',
    skincareUsageSteps: ['洁面后取适量', '轻轻涂抹于全脸', '轻拍至吸收'],
    skincareCare: '请避光置于阴凉处保存，使用后请拧紧瓶盖。使用过程中如出现泛红或刺激感，请停止使用并咨询医生。',
    supplementIntro: '再忙也能轻松坚持。',
    supplementUsageSteps: ['每日1次，按标示量摄入', '与水或饮品充分混合', '坚持摄入效果更佳'],
    supplementCare: '请避光置于阴凉干燥处保存。如有基础疾病或处于孕期、哺乳期，摄入前请咨询医生。过敏体质者请确认原料成分。',
  },

  selfCheck: {
    title: '每日自我检测',
    directCheck: '手动勾选',
    saveItems: '保存',
  },
  selfCheckItems: {
    tight: '皮肤非常紧绷',
    hot: '感觉发烫、有灼热感',
    sting: '有刺痛感',
    rough: '皮肤粗糙干燥',
    none: '没有任何不适。',
    other: '其他',
  },

  solutionLoading: {
    deriving: '正在生成护理方案。\n请稍候',
    aggregating: '正在汇总数据。',
  },

  errorBoundary: {
    message: '渲染页面时出现问题',
    retry: '重试',
  },

  mypage: {
    accountMasked: '新韩 123-***-*******',
    member: 'InnerDerma会员',
    myInfo: '我的信息',
    nickname: '修改昵称',
    password: '修改密码',
    account: '修改账号',
    treatmentMgmt: '治疗管理',
    visitHistory: '就诊记录',
    appSettings: '应用设置',
    notification: '通知设置',
    privacy: '隐私政策',
    logout: '退出登录',
  },

  lang: {
    title: 'Language',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
    en: 'English',
  },
};
