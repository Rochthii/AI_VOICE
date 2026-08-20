import { Dictionary } from "../types";

export const enDictionary: Dictionary = {
  common: {
    station: "STATION",
    offline: "Offline",
    details: "VIEW DETAILS",
    close: "Close",
    continue: "CONTINUE",
    understood: "UNDERSTOOD — CONTINUE",
    send: "Send",
    viewQr: "STATION QR CODE ↗",
    loading: "Loading...",
    language: "Language",
    selectLanguage: "SELECT AUDIO GUIDE LANGUAGE"
  },
  beacon: {
    openGround: "Above-ground area — Open space",
    time: "Time:",
    meters: "m",
    minutes: "min",
    historicalStory: "HISTORICAL NARRATIVE",
    verifiedFacts: "VERIFIED HISTORICAL FACTS",
    fieldFaq: "FIELD QUESTIONS & ANSWERS"
  },
  orb: {
    statusSearching: "SEARCHING ARCHIVES",
    statusListening: "LISTENING",
    statusNarrating: "NARRATION ACTIVE",
    statusTapToAsk: "TAP TO ASK AI",
    aiTitle: "AI VOICE INTELLIGENCE",
    aiSubtitle: "Official Cu Chi Historical Archives",
    inputPlaceholder: "Type a historical or test query...",
    promptSuite: "Quick test prompt suite:",
    oneClickQuery: "1-CLICK QUERY",
    recPrefix: "[REC]",
    defaultQuestion: "What is the historical significance of this station?",
    sampleQuestions: [
      "How did Hoang Cam stove hide smoke?",
      "Who was Dr. Vo Hoang Le?",
      "Were civilians forced to dig the tunnels?",
      "Is the 44,357 martyr count verified?",
      "How do termite mound vents work?",
      "How were To Van Duc sweep mines built?"
    ]
  },
  ticker: {
    seekBackward: "Seek backward 15s",
    seekForward: "Seek forward 15s",
    play: "Play narration",
    pause: "Pause narration",
    progressBar: "Audio progress bar"
  },
  panic: {
    title: "EMERGENCY ASSIST",
    safeZoneHeader: "YOU ARE IN A SAFE ZONE",
    exitPathLabel: "EMERGENCY EXIT PATH:",
    reassuranceButton: "I AM SAFE — CONTINUE"
  }
};
