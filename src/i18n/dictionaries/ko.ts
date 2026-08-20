import { Dictionary } from "../types";

export const koDictionary: Dictionary = {
  common: {
    station: "정류장",
    offline: "오프라인",
    details: "상세 정보",
    close: "닫기",
    continue: "계속",
    understood: "확인했습니다 — 계속",
    send: "전송",
    viewQr: "이 지점 QR 코드 ↗",
    loading: "로딩 중...",
    language: "언어",
    selectLanguage: "오디오 가이드 언어 선택"
  },
  beacon: {
    openGround: "지상 구역 — 개방된 공간",
    time: "소요 시간:",
    meters: "m",
    minutes: "분",
    historicalStory: "역사 이야기",
    verifiedFacts: "검증된 역사적 사실",
    fieldFaq: "현장 질문 및 답변"
  },
  orb: {
    statusSearching: "역사 자료 검색 중",
    statusListening: "듣는 중",
    statusNarrating: "해설 재생 중",
    statusTapToAsk: "탭하여 AI에게 질문하기",
    aiTitle: "AI 음성 안내 센터",
    aiSubtitle: "구찌 터널 공식 역사 아카이브",
    inputPlaceholder: "역사 관련 질문을 입력하세요...",
    promptSuite: "빠른 질문 예시:",
    oneClickQuery: "원클릭 질문",
    recPrefix: "[녹음 중]",
    defaultQuestion: "이 유적지의 역사적 의미는 무엇인가요?",
    sampleQuestions: [
      "호앙껌 취사장은 연기를 어떻게 숨겼나요?",
      "보 호앙 레 의사는 누구인가요?",
      "주민들이 강제로 땅굴을 팠나요?",
      "44,357명의 전사자 수는 확인되었나요?",
      "개미집 통풍구는 어떻게 작동했나요?",
      "또 반 득 지뢰는 어떻게 제작되었나요?"
    ]
  },
  ticker: {
    seekBackward: "15초 뒤로",
    seekForward: "15초 앞으로",
    play: "해설 재생",
    pause: "일시 정지",
    progressBar: "재생 진행률"
  },
  panic: {
    title: "긴급 구조 지원",
    safeZoneHeader: "현재 안전한 구역에 있습니다",
    exitPathLabel: "비상 탈출 경로:",
    reassuranceButton: "안전을 확인했습니다 — 계속"
  }
};
