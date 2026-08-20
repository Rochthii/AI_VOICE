import { Locale } from "@/i18n/types";

export interface SuggestionGroup {
  stationId?: string;
  suggestions: Record<Locale, string[]>;
}

const STATION_SUGGESTIONS: Record<string, Record<Locale, string[]>> = {
  "01_hoang_cam_kitchen": {
    vi: [
      "Nấu ăn vào giờ nào để tránh máy bay trinh sát?",
      "Bộ đội Củ Chi ăn món gì chủ đạo dưới hầm?",
      "Khói bếp sau khi lọc thoát lên mặt đất như thế nào?"
    ],
    en: [
      "What times was cooking allowed to avoid aircraft?",
      "What was the staple food in the tunnels?",
      "How did filtered smoke appear on the surface?"
    ],
    fr: [
      "À quelles heures cuisinait-on pour éviter les avions ?",
      "Quelle était la nourriture principale dans les tunnels ?",
      "Comment la fumée filtrée apparaissait-elle en surface ?"
    ],
    ja: [
      "偵察機を避けるため何時に調理しましたか？",
      "地下トンネルでの主食は何でしたか？",
      "ろ過された煙は地上でどのように見えましたか？"
    ],
    ko: [
      "정찰기를 피하기 위해 언제 요리했나요?",
      "터널 안에서 주식은 무엇이었나요?",
      "여과된 연기는 지상에서 어떻게 보였나요?"
    ],
    zh: [
      "为了避开侦察机，通常在什么时间做饭？",
      "地道里的主要食物是什么？",
      "过滤后的烟雾在地面上看起来是怎样的？"
    ]
  },
  "02_field_hospital": {
    vi: [
      "Bác sĩ Võ Hoàng Lê gom ánh sáng mổ hầm tối thế nào?",
      "Kỹ thuật ghép da Filatov giúp ích gì cho thương binh?",
      "Dưới hầm ngầm lấy nước sạch ở đâu để phẫu thuật?"
    ],
    en: [
      "How did Dr. Vo Hoang Le illuminate dark surgeries?",
      "How did Filatov skin grafting help wounded soldiers?",
      "Where was fresh water sourced underground for surgery?"
    ],
    fr: [
      "Comment le Dr Vo Hoang Le éclairait-il les chirurgies ?",
      "Comment la greffe de peau Filatov aidait-elle les blessés ?",
      "D'où venait l'eau propre pour les chirurgies ?"
    ],
    ja: [
      "ヴォ・ホアン・レ医師はどのように手術の明かりを確保しましたか？",
      "フィラトフ皮膚移植はどのように負傷兵を助けましたか？",
      "手術用の清潔な水はどこから調達しましたか？"
    ],
    ko: [
      "보 황 레 의사는 어두운 수술실에서 어떻게 빛을 모았나요?",
      "필라토프 피부 이식은 부상병에게 어떤 도움이 되었나요?",
      "수술용 깨끗한 물은 어디서 구했나요?"
    ],
    zh: [
      "武黄黎医生在黑暗地道中是如何采光手术的？",
      "菲拉托夫植皮技术对伤员有什么帮助？",
      "地道手术所需的洁净水源从何而来？"
    ]
  },
  "03_command_bunker": {
    vi: [
      "Nút chặn kín hơi chống khí độc và nước hoạt động ra sao?",
      "Ngách bí mật thoát hiểm trổ ra sông Sài Gòn ở đâu?",
      "Hầm chỉ huy đóng vai trò gì trong Tết Mậu Thân 1968?"
    ],
    en: [
      "How did gas-proof and water-proof stop-valves work?",
      "Where does the secret escape corridor to Saigon River lead?",
      "What role did this bunker play in the 1968 Tet Offensive?"
    ],
    fr: [
      "Comment fonctionnaient les sas étanches anti-gaz ?",
      "Où mène le couloir d'évacuation secret vers la rivière Saigon ?",
      "Quel rôle a joué ce bunker lors de l'offensive du Têt 1968 ?"
    ],
    ja: [
      "毒ガスや水を遮断する密閉弁はどのように機能しましたか？",
      "サイゴン川への秘密の脱出路はどこに通じていますか？",
      "1968年のテト攻勢でこの司令部はどのような役割を果たしましたか？"
    ],
    ko: [
      "독가스와 물을 차단하는 밀폐 밸브는 어떻게 작동했나요?",
      "사이공강으로 통하는 비밀 탈출로는 어디에 있나요?",
      "1968년 구정 공세에서 이 지휘 벙커는 어떤 역할을 했나요?"
    ],
    zh: [
      "防毒气和防灌水的气密阀门是如何运作的？",
      "通往西贡河的秘密逃生通道位于何处？",
      "该指挥所部在1968年戊申春节攻势中发挥了什么作用？"
    ]
  },
  "04_ventilation_termite": {
    vi: [
      "Người Củ Chi dùng xà phòng Mỹ đánh lừa chó săn thế nào?",
      "Ống thông gió bằng tre rỗng đục ngầm như thế nào?",
      "Nguyên lý đối lưu nhiệt giúp hút khí sạch xuống hầm ra sao?"
    ],
    en: [
      "How did locals use American soap to fool tracking dogs?",
      "How were hollow bamboo air ducts bored underground?",
      "How did thermal convection draw fresh air into the tunnels?"
    ],
    fr: [
      "Comment trompait-on les chiens pisteurs avec du savon américain ?",
      "Comment les conduits en bambou étaient-ils forés sous terre ?",
      "Comment la convection thermique aspirait-elle l'air frais ?"
    ],
    ja: [
      "米軍の軍用犬を騙すためにどのように石鹸を使いましたか？",
      "竹の通気管はどのように地下に掘られましたか？",
      "熱対流の原理でどのように新鮮な空気を引き込みましたか？"
    ],
    ko: [
      "미국산 비누로 어떻게 군견의 후각을 속였나요?",
      "대나무 통기 파이프는 어떻게 지하에 설치되었나요?",
      "열 대류 원리로 어떻게 신선한 공기를 유입했나요?"
    ],
    zh: [
      "游击队员是如何利用美式肥皂迷惑军犬嗅觉的？",
      "空心竹通风管是如何在地底穿孔敷设的？",
      "热对流原理是如何将新鲜空气吸入地道的？"
    ]
  },
  "05_booby_traps": {
    vi: [
      "Anh hùng Tô Văn Đực chế tạo mìn gạt từ bom lép thế nào?",
      "Có bao nhiêu loại bẫy chông dã chiến ở Củ Chi?",
      "Vũ khí thô sơ đã phá hủy xe bọc thép M113 của địch ra sao?"
    ],
    en: [
      "How did Hero To Van Duc create mines from unexploded bombs?",
      "How many types of booby traps existed in Cu Chi?",
      "How did rudimentary weapons destroy M113 armored vehicles?"
    ],
    fr: [
      "Comment le héros To Van Duc a-t-il créé des mines à partir de bombes non explosées ?",
      "Combien de types de pièges existaient à Cu Chi ?",
      "Comment des armes rudimentaires ont-elles détruit des blindés M113 ?"
    ],
    ja: [
      "ト・ヴァン・ドゥック英雄は不発弾からどのように地雷を作りましたか？",
      "クチには何種類の罠（ブービートラップ）がありましたか？",
      "原始的な武器がどのようにM113装甲車を撃破しましたか？"
    ],
    ko: [
      "토 반 득 영웅은 불발탄으로 어떻게 지뢰를 만들었나요?",
      "구찌에는 몇 종류의 부비트랩이 있었나요?",
      "원시적인 무기로 어떻게 M113 장갑차를 파괴했나요?"
    ],
    zh: [
      "英雄苏文德是如何将未爆哑弹改造成地雷的？",
      "古芝地道有多少种竹签陷阱？",
      "土制武器是如何摧毁敌军M113装甲运兵车的？"
    ]
  },
  "global_overview": {
    vi: [
      "Địa đạo Củ Chi dài bao nhiêu kilomet và gồm mấy tầng?",
      "Quân dân Củ Chi đào địa đạo bằng những dụng cụ thô sơ nào?",
      "Cấu tạo đất sét pha đá ong giúp địa đạo không bị sập thế nào?"
    ],
    en: [
      "How long is Cu Chi tunnels network and how many levels does it have?",
      "What rudimentary tools were used to dig the tunnels by hand?",
      "How does the laterite clay soil prevent tunnels from collapsing?"
    ],
    fr: [
      "Quelle est la longueur des tunnels de Cu Chi et combien d'étages comportent-ils ?",
      "Quels outils rudimentaires ont été utilisés pour creuser à la main ?",
      "Comment le sol d'argile latéritique empêche-t-il l'effondrement ?"
    ],
    ja: [
      "クチトンネルの全長は何キロで何層構造ですか？",
      "手作業でトンネルを掘るためにどのような原始的な道具が使われましたか？",
      "ラテライト粘土質の土壌はどのようにトンネルの崩壊を防ぎますか？"
    ],
    ko: [
      "구찌 터널은 총 몇 킬로미터이며 몇 개 층으로 되어 있나요?",
      "어떤 원시적인 도구로 터널을 수작업으로  fanbase?",
      "홍토 점토질 토양은 어떻게 터널 붕괴를 막았나요?"
    ],
    zh: [
      "古芝地道总长多少公里？共有几层结构？",
      "当年军民是用什么原始工具手工挖掘地道的？",
      "红土粘土层是如何防止地道坍塌的？"
    ]
  }
};

/**
 * Lấy danh sách 2-3 câu hỏi gợi ý phù hợp nhất với trạm hiện tại và ngôn ngữ
 */
export function getSmartFollowUpSuggestions(stationId?: string, lang: Locale = "vi"): string[] {
  const targetKey = stationId && STATION_SUGGESTIONS[stationId] ? stationId : "global_overview";
  const localeMap = STATION_SUGGESTIONS[targetKey] || STATION_SUGGESTIONS["global_overview"];
  const list = localeMap[lang] || localeMap["vi"] || [];
  return list.slice(0, 3);
}
