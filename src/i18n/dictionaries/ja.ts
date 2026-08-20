import { Dictionary } from "../types";

export const jaDictionary: Dictionary = {
  common: {
    station: "ステーション",
    offline: "オフライン",
    details: "詳細を見る",
    close: "閉じる",
    continue: "次へ",
    understood: "確認しました — 続ける",
    send: "送信",
    viewQr: "この地点のQRコード ↗",
    loading: "読み込み中...",
    language: "言語",
    selectLanguage: "音声ガイドの言語を選択"
  },
  beacon: {
    openGround: "地表エリア — 開放空間",
    time: "所要時間:",
    meters: "m",
    minutes: "分",
    historicalStory: "歴史的物語",
    verifiedFacts: "検証済みの歴史的事実",
    fieldFaq: "よくある質問と回答"
  },
  orb: {
    statusSearching: "史料を検索中",
    statusListening: "聞き取り中",
    statusNarrating: "解説を再生中",
    statusTapToAsk: "タップしてAIに質問",
    aiTitle: "AI音声案内センター",
    aiSubtitle: "クチトンネル公式歴史アーカイブ",
    inputPlaceholder: "トンネルに関する質問を入力...",
    promptSuite: "ワンクリック質問例:",
    oneClickQuery: "簡単質問",
    recPrefix: "[録音中]",
    defaultQuestion: "この地点の歴史的意義は何ですか？",
    sampleQuestions: [
      "ホアンカムかまどはどのように煙を隠しましたか？",
      "ヴォ・ホアン・レ医師とは誰ですか？",
      "住民は強制的にトンネルを掘らされたのですか？",
      "44,357名の戦没者数は確認されていますか？",
      "アリ塚の通気孔はどのように機能しましたか？",
      "ト・ヴァン・ドゥック氏の地雷はどのように作られましたか？"
    ]
  },
  ticker: {
    seekBackward: "15秒戻る",
    seekForward: "15秒進む",
    play: "解説を再生",
    pause: "一時停止",
    progressBar: "進行バー"
  },
  panic: {
    title: "緊急救助アシスト",
    safeZoneHeader: "安全な場所にいます",
    exitPathLabel: "非常脱出ルート:",
    reassuranceButton: "安全を確認しました — 続ける"
  }
};
