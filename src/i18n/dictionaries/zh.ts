import { Dictionary } from "../types";

export const zhDictionary: Dictionary = {
  common: {
    station: "站点",
    offline: "离线",
    details: "查看详情",
    close: "关闭",
    continue: "继续",
    understood: "已了解 — 继续",
    send: "发送",
    viewQr: "本站点二维码 ↗",
    loading: "加载中...",
    language: "语言",
    selectLanguage: "选择导览语音语言"
  },
  beacon: {
    openGround: "地面区域 — 开放空间",
    time: "所需时间:",
    meters: "米",
    minutes: "分钟",
    historicalStory: "历史故事",
    verifiedFacts: "已验证历史事实",
    fieldFaq: "现场常见问答"
  },
  orb: {
    statusSearching: "检索历史档案",
    statusListening: "正在聆听",
    statusNarrating: "正在解说",
    statusTapToAsk: "点击向AI提问",
    aiTitle: "AI语音导览中心",
    aiSubtitle: "古芝地道官方历史档案",
    inputPlaceholder: "输入历史问题或测试提问...",
    promptSuite: "快捷提问建议:",
    oneClickQuery: "一键提问",
    recPrefix: "[录音中]",
    defaultQuestion: "该景点的历史意义是什么？",
    sampleQuestions: [
      "黄琴灶是如何隐藏烟雾的？",
      "武黄黎医生是谁？",
      "民众是被强迫挖地道的吗？",
      "44,357名烈士人数属实吗？",
      "蚁丘通风孔是如何工作的？",
      "苏文得扫雷是如何制造的？"
    ]
  },
  ticker: {
    seekBackward: "后退15秒",
    seekForward: "前进15秒",
    play: "播放解说",
    pause: "暂停播放",
    progressBar: "音频进度条"
  },
  panic: {
    title: "紧急救援协助",
    safeZoneHeader: "您当前处于安全区域",
    exitPathLabel: "紧急逃生路线:",
    reassuranceButton: "我已安心 — 继续"
  }
};
