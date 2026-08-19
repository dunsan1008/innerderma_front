/**
 * 日本語翻訳.
 */
export default {
  common: {
    today: '今日',
    tomorrow: '明日',
    home: 'ホーム',
    market: 'ショップ',
    capture: '撮影',
    mypage: 'マイページ',
    close: '閉じる',
    apply: '適用',
    reset: 'リセット',
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    selectAll: '全選択',
    language: 'Language',
  },

  weekdays: { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' },

  onboarding: {
    serviceDiagOnly: '肌診断のみ受けました！',
    serviceBoth: '肌診断と施術を受けました！',
    connecting: '来院記録を接続中です\n少々お待ちください',
    connectingSub: 'WHS来院情報を検索中です。',
    connected: '接続が完了しました',
    connectedSub: 'WHS来院情報が保存されました',
    goHome: 'ホームへ移動',
    signupQuestion: 'Q. Wellness House ソウルで\nどのサービスを受けましたか？',
    signupHint: '来院時にご利用のサービスを選択してください。\nカスタムケアルーティンをご用意します。',
    purpose: 'ケア目的',
  },

  home: {
    firstVisitTitle: 'こんにちは！撮影から\n今日のデイリールーティンを始めましょう！',
    tonight: '今夜',
    tomorrowMorning: '明朝',
    recovery: '回復',
    protection: '保護',
  },

  calendar: {
    fullCalendar: 'カレンダー全体',
    closeCalendar: 'カレンダーを閉じる',
    openCalendar: 'カレンダーを開く',
    prevMonth: '前月',
    nextMonth: '翌月',
    prevYear: '前年',
    nextYear: '翌年',
    yearMonth: (y, m) => `${y}年${m}月`,
    yearLabel: (y) => `${y}年`,
    monthLabel: (m) => `${m}月`,
  },

  solution: {
    dermaCare: 'DERMA CARE',
    todaySkincare: '今日のスキンケア',
    nightRoutineTitle: '回復のためのナイトルーティン',
    morningRoutineTitle: '保湿維持のモーニングルーティン',
    innerCare: 'INNER CARE',
    todayIntake: '今日の摂取ケア',
    intakeSolution1: '肌コンディションのための',
    intakeSolution2: '今日の摂取ソリューション',
    etc: 'ETC',
    avoidToday: '今日は避けてください',
    whyThisRoutine: 'なぜこのルーティン？',
    whyDescription: '今日の肌は軽い乾燥と赤みが見られます。WHS施術後の回復段階を考慮し、刺激を減らし肌バリア回復を助けるルーティンをお勧めしました。',
    todayPhoto: '今日の肌写真',
    whsDiagnosis: 'WHS診断データ',
    afterTreatment: '施術後7日目',
    completeBtn: '完了',
    completedBtn: '完了済み',
    completeBtnDisabledTip: '当日のみ完了記録ができます',
    todayRecommend: '今日のおすすめ',
    supplementWarning: '⚠ 空腹時に不快感が生じる場合があります。',
  },

  noSolution: {
    title: 'まだソリューションが生成されていません',
    description: 'ソリューションはその日の撮影した肌状態を分析して作成されます。\n該当日になればケアルーティンを確認できます。',
  },

  nightSteps: [
    { title: '化粧水 水分ファーストレイヤー', tag: '水分補給', desc: '洗顔後、手のひらで軽く押して吸収させ、肌のキメを整えてください。' },
    { title: '集中栄養アンプルケア', tag: '成分供給', desc: '肌のキメに沿って優しくローリングし、深く浸透させてください。' },
    { title: 'ナイトクリーム バリア強化', tag: '保湿膜', desc: '適量を取り、顔全体を包み込むように押して吸収させてください。' },
    { title: 'スリーピングパック 水分仕上げ', tag: '水分密封', desc: '最後のステップで薄く塗り、翌朝洗顔してください。' },
  ],

  morningSteps: [
    { title: '水洗顔', tag: '老廃物除去', desc: 'ぬるま湯で優しく洗い流し、夜間の分泌物を除去してください。' },
    { title: '化粧水・エッセンス 水分補充', tag: '水分補給', desc: 'コットンを使わず手のひらで優しくパッティングしてください。' },
    { title: 'ジェルクリーム 保湿バリア形成', tag: '保湿膜', desc: '軽くパッティングして吸収させ、一日中肌バリアを保護してください。' },
    { title: '日焼け止め SPF 50+', tag: 'UV防止', desc: '曇りの日でもUV対策は必須。最後のステップでしっかり塗ってください。' },
  ],

  nightAvoid: ['強い角質除去製品', 'アルコール含有量の高いトナー', '刺激的な香料成分'],
  morningAvoid: ['密閉力の強いオイル日焼け止め', '厚いファンデーション製品', '合成香料・香水成分'],

  eveningWash: {
    title: '夕方洗顔ルーティン',
    tag: '老廃物除去',
    description: '基本的に弱酸性クレンジングフォームを使用してください。日焼け止めやメイクをした場合はクレンジングオイルを使ってください。',
    note: '最初のポンプは必ず乾いた手で。十分にマッサージした後、ぬるま湯で乳化させてきれいに洗い流してください。',
    footnote: '3-4プッシュ・清潔な素手で使用',
  },

  supplements: [
    { title: 'WIMマリンコラーゲンアンプル', desc: '1日1包、朝食後に水または飲料に混ぜて摂取してください。' },
    { title: 'WIM肌プロバイオティクス', desc: '1日1カプセル、夕食後に水と一緒に摂取してください。' },
  ],

  whyTags: ['バリア回復', '軽い赤み', '水分不足'],

  camera: {
    lastRecord: (days) => `最終記録から${days}日`,
    compareMessage: 'どう変わったか比較してみましょう',
    recognized: '認識済み',
    recognizing: '認識中',
    guideRecognized: '顔が認識されました。撮影ボタンを押してください。',
    guideDefault: 'メガネを外し、顔を中央に合わせてください。\n明るい照明ほど正確です。',
    noCameraSupport: 'このブラウザではカメラを使用できません。',
    noCameraFound: '使用可能なカメラが見つかりませんでした。',
    needsSecureContext: 'カメラは HTTPS または localhost でのみ使用できます。',
    permissionNeeded: 'カメラの権限が必要です。ブラウザのアドレスバーのカメラアイコンから許可してください。',
    openError: 'カメラを開く際に問題が発生しました。しばらくしてから再試行してください。',
  },

  washCheck: {
    question: '帰宅後、洗顔はお済みですか？',
    subQuestion: 'もう一度確認してみてください！',
    done: '完了しました！',
    notYet: 'まだです！',
  },

  solutionSummary: {
    title: '今日のソリューション',
    headline: '今日は肌バリアの\n回復に集中してください。',
  },

  market: {
    emptyWishlist: 'お気に入りの商品がありません。ショップでハートを押して追加してください。',
    recommendation: 'パーソナル商品おすすめ',
    wishlist: 'お気に入り',
    changeDelivery: '配送方法一括変更',
    selectDelete: '選択削除',
    addWish: 'お気に入り登録',
    removeWish: 'お気に入り解除',
  },

  filter: {
    gender: '性別',
    age: '年代',
    diagnosis: '診断',
    all: '全体',
    female: '女性',
    male: '男性',
    teens: '10代',
    twenties: '20代',
    thirties: '30代',
    forties: '40代',
    diagnosisComplete: '診断完了',
    moisture: '水分/保湿',
    pigment: 'シミ/美白',
    elasticity: '弾力/シワ',
    pore: '毛穴/皮脂',
  },

  mypage: {
    accountMasked: '新韓 123-***-*******',
    member: 'InnerDerma会員',
    myInfo: '基本情報',
    nickname: 'ニックネーム変更',
    password: 'パスワード変更',
    account: '口座番号変更',
    treatmentMgmt: '施術管理',
    visitHistory: '来院記録管理',
    appSettings: 'アプリ設定',
    notification: '通知設定',
    privacy: 'プライバシーポリシー',
    logout: 'ログアウト',
  },

  lang: {
    title: 'Language',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
    en: 'English',
  },
};
