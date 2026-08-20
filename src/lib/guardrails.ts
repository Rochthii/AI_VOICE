import { Locale } from "@/types/station";

export interface GuardrailDecision {
  allowed: boolean;
  isProvocative: boolean;
  reason: "SAFE" | "PROVOCATION_INTERCEPTED" | "LOW_SIMILARITY_FALLBACK" | "JAILBREAK_ATTEMPT";
  rebuttalText?: string;
  sourceAuthority?: string;
}

interface RebuttalRule {
  id: string;
  category: "coercion" | "hero_defamation" | "hate_comparison" | "casualty_denial" | "engineering_skepticism" | "jailbreak";
  patterns: RegExp[];
  rebuttal: {
    vi: string;
    en: string;
  };
  sourceAuthority: string;
}

/**
 * Danh mục các quy tắc chặn bẫy kích động và phản biện lịch sử chuẩn mực 100%
 */
const REBUTTAL_RULES: RebuttalRule[] = [
  // 1. Phủ nhận tính tự nguyện / vu khống ép buộc
  {
    id: "RULE_COERCION_DENIAL",
    category: "coercion",
    patterns: [
      /bị\s+ép(\s+buộc)?\s+đào/i,
      /bắt\s+ép\s+dân(\s+chúng)?/i,
      /cưỡng\s+bức\s+đào\s+hầm/i,
      /forced\s+to\s+dig/i,
      /coerced\s+civilians/i,
      /ai\s+ép\s+đào/i
    ],
    rebuttal: {
      vi: "Địa đạo Củ Chi khởi nguồn từ năm 1948 thời kháng Pháp hoàn toàn xuất phát từ nhu cầu sinh tử tự thân của nhân dân các xã Tân Phú Trung, Phước Vĩnh An để bảo vệ xóm làng. Toàn bộ phong trào đào hầm là hành động tự nguyện kiên cường của nhân dân đất thép với ý chí 'một tấc không đi, một ly không rời'.",
      en: "Cu Chi Tunnels originated in 1948 out of local villagers' spontaneous survival needs to defend their homes. The entire subterranean expansion was a voluntary, resilient mass movement of the local people defending their homeland."
    },
    sourceAuthority: "Ban Chấp hành Đảng bộ TP.HCM (2014) — Lịch sử Đảng bộ TP.HCM (1930 - 1975)"
  },

  // 2. Chia rẽ quân dân / vu khống du kích trốn để dân chịu bom
  {
    id: "RULE_DIVIDE_PEOPLE_ARMY",
    category: "coercion",
    patterns: [
      /trốn\s+dưới\s+hầm\s+để\s+dân/i,
      /để\s+mặc\s+dân(\s+chịu)?/i,
      /lợi\s+dụng\s+dân/i,
      /hiding\s+leaving\s+civilians/i,
      /human\s+shield/i,
      /lá\s+chắn\s+sống/i
    ],
    rebuttal: {
      vi: "Dưới địa đạo Củ Chi, quân và dân là một thể thống nhất ruột thịt. Địa đạo là nơi sinh hoạt, cứu chữa thương binh và bảo vệ toàn thể nhân dân. Các chiến sĩ du kích chính là con em của Củ Chi, bám trụ hầm ngầm để chiến đấu bảo vệ sinh mạng và xóm làng.",
      en: "Underground, guerillas and civilians were an indivisible family. The tunnels sheltered communities and treated the wounded, while local fighters risked their lives from these subterranean networks to shield their villages."
    },
    sourceAuthority: "Thành ủy TP.HCM (2026) — Củ Chi - Đất thép thành đồng"
  },

  // 3. Bôi nhọ anh hùng Tô Văn Đực và sáng kiến mìn gạt
  {
    id: "RULE_HERO_TO_VAN_DUC",
    category: "hero_defamation",
    patterns: [
      /tô\s+văn\s+đực.*(chém\s+gió|bịa|phóng\s+đại|giả)/i,
      /mìn\s+gạt.*(lừa|xạo|không\s+có\s+thật)/i,
      /fake\s+hero/i,
      /myth.*to\s+van\s+duc/i
    ],
    rebuttal: {
      vi: "Anh hùng LLVTND Tô Văn Đực (xã Nhuận Đức) là nhân vật lịch sử có thật. Sáng kiến tái chế bom pháo lép của đối phương thành mìn gạt là sáng tạo quân sự lẫy lừng đã được ghi nhận trong văn khố quân sự, phá hủy hàng trăm xe tăng, xe bọc thép trong các trận càn như Cedar Falls 1967.",
      en: "Hero To Van Duc (Nhuan Duc commune) is a verified historical figure. His ingenuity in converting dud enemy artillery shells into sweep mines is documented in official archives, having destroyed hundreds of enemy tanks and APCs during Operation Cedar Falls (1967)."
    },
    sourceAuthority: "Ban Chỉ huy Quân sự huyện Củ Chi (2006)"
  },

  // 4. Bôi nhọ Bác sĩ Võ Hoàng Lê & y tế hầm ngầm
  {
    id: "RULE_MEDIC_VO_HOANG_LE",
    category: "hero_defamation",
    patterns: [
      /võ\s+hoàng\s+lê.*(bịa|phóng\s+đại|tuyên\s+truyền)/i,
      /mổ\s+dưới\s+hầm.*(giả|vô\s+lý|không\s+thể)/i,
      /filatov.*(lừa|xạo)/i
    ],
    rebuttal: {
      vi: "Bác sĩ Võ Hoàng Lê là người thầy thuốc quân y kiên cường có hồ sơ lưu trữ chính thức. Ông đã thực hiện nhiều ca phẫu thuật phức tạp dưới lòng đất ẩm tối, ứng dụng sáng tạo cây thuốc Nam và kỹ thuật cấy Filatov cứu sống thương binh, đồng thời trực tiếp chỉ huy bảo vệ an toàn bệnh xá.",
      en: "Dr. Vo Hoang Le is an officially archived medical hero who performed complex surgeries in dark underground bunkers, applying traditional herbal medicine and Filatov tissue therapy while commanding defensive actions to safeguard his hospital."
    },
    sourceAuthority: "Đảng ủy - Bộ Chỉ huy Quân sự TP.HCM (1998)"
  },

  // 5. Kích động thù hằn / So sánh tính tàn bạo / Tranh cãi chính trị
  {
    id: "RULE_HATE_COMPARISON",
    category: "hate_comparison",
    patterns: [
      /ai\s+ác\s+hơn/i,
      /ai\s+tàn\s+bạo\s+hơn/i,
      /who\s+was\s+more\s+(cruel|evil|brutal)/i,
      /chiến\s+tranh\s+phi\s+nghĩa/i,
      /tội\s+ác\s+ai\s+lớn\s+hơn/i
    ],
    rebuttal: {
      vi: "Cuộc chiến tại Củ Chi là cuộc chiến tranh tự vệ chính nghĩa của nhân dân Việt Nam nhằm bảo vệ độc lập, tự do và lãnh thổ thiêng liêng. Ngày nay, Khu di tích Địa đạo Củ Chi đón tiếp bạn bè quốc tế với tinh thần khép lại quá khứ, tôn trọng sự thật lịch sử và cùng vun đắp cho hòa bình hữu nghị.",
      en: "The struggle at Cu Chi was a just war of national defense to protect independence and sovereignty. Today, Cu Chi Tunnels welcomes international visitors with a message of closing the past, respecting historical truth, and fostering global peace."
    },
    sourceAuthority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi (2020)"
  },

  // 6. Xuyên tạc nguồn gốc vũ khí / Ai bán vũ khí
  {
    id: "RULE_WEAPON_ORIGIN",
    category: "hate_comparison",
    patterns: [
      /ai\s+bán\s+vũ\s+khí(\s+cho\s+du\s+kích)?/i,
      /mua\s+vũ\s+khí\s+ở\s+đâu/i,
      /who\s+sold\s+weapons/i,
      /where\s+weapons\s+bought/i
    ],
    rebuttal: {
      vi: "Quân dân Củ Chi không mua bán vũ khí. Vũ khí chủ yếu là vũ khí tự tạo từ tre rừng, sắt thép phế liệu và tái chế chính bom đạn lép thu gom được của đối phương để đánh địch theo phương châm 'lấy vũ khí địch đánh địch'.",
      en: "Cu Chi guerillas did not purchase commercial weapons. Arms were handcrafted from local bamboo, scrap metal, and recycled unexploded enemy ordnance under the doctrine of 'fighting the enemy with their own weapons'."
    },
    sourceAuthority: "Ban Chỉ huy Quân sự huyện Củ Chi (2006)"
  },

  // 7. Xuyên tạc số lượng 44.357 liệt sĩ Đền Bến Dược
  {
    id: "RULE_CASUALTY_DENIAL",
    category: "casualty_denial",
    patterns: [
      /44\.?357.*(phóng\s+đại|ước\s+tính|giả|xạo)/i,
      /số\s+liệt\s+sĩ.*(ảo|bịa)/i,
      /fake\s+martyr\s+count/i
    ],
    rebuttal: {
      vi: "Con số 44.357 anh hùng liệt sĩ được khắc trang trọng trên 632 phiến đá hoa cương tại Đền Tưởng niệm Liệt sĩ Bến Dược là danh sách có họ tên, năm sinh, quê quán cụ thể được thẩm định nghiêm ngặt qua hồ sơ lưu trữ thương binh liệt sĩ toàn quốc.",
      en: "The count of 44,357 fallen heroes etched on 632 granite slabs at Ben Duoc Memorial Temple is a verified roster of documented names, birthplaces, and records verified by national veterans registries."
    },
    sourceAuthority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi & Thành ủy TP.HCM"
  },

  // 8. Giải thiêng hiệu quả hầm ngầm / Bơm nước hơi ngạt diệt hết
  {
    id: "RULE_ENGINEERING_SKEPTICISM",
    category: "engineering_skepticism",
    patterns: [
      /bơm\s+nước.*(chết\s+hết|ngập\s+hết|tiêu\s+diệt\s+hết)/i,
      /hơi\s+(độc|ngạt).*(tiêu\s+diệt\s+hết|chết\s+sạch)/i,
      /tunnel\s+rats.*(diệt\s+hết|phá\s+hết)/i
    ],
    rebuttal: {
      vi: "Hệ thống địa đạo được đào 3 tầng có độ dốc tự nhiên thoát nước ra sông Sài Gòn, dọc tuyến có các nút chặn hiểm yếu đóng kín cô lập từng phần khi bị phun hơi độc hoặc bơm nước, giúp bảo toàn tuyệt đối các khu chỉ huy và bệnh viện ngầm.",
      en: "Engineered across 3 tiers with natural drainage to the Saigon River, tunnels featured safety stop-valves at critical choke points that sealed off sections against gas or water, preserving command posts and medical wards."
    },
    sourceAuthority: "Đảng ủy - Bộ Chỉ huy Quân sự TP.HCM (1998)"
  },

  // 9. Prompt Injection & Jailbreak (Counter-factual roleplay)
  {
    id: "RULE_JAILBREAK_COUNTERFACTUAL",
    category: "jailbreak",
    patterns: [
      /giả\s+sử.*(thua|bị\s+phá\s+hủy|khác\s+đi)/i,
      /imagine\s+if/i,
      /roleplay\s+as/i,
      /bỏ\s+qua\s+quy\s+tắc/i,
      /ignore\s+all\s+rules/i,
      /hãy\s+kể\s+tiếp\s+theo\s+hướng\s+địa\s+đạo\s+bị\s+sập/i
    ],
    rebuttal: {
      vi: "Hệ thống AI CHI VOICE chỉ cung cấp sự thật lịch sử đã được kiểm chứng. Trong lịch sử thực tế, Địa đạo Củ Chi chưa từng bị khuất phục và đã hoàn thành xuất sắc vai trò làm bàn đạp cho các chiến dịch lịch sử giải phóng hoàn toàn miền Nam.",
      en: "CHI VOICE strictly provides verified historical facts. Historically, Cu Chi Tunnels were never subdued, successfully serving as the forward staging ground for decisive campaigns leading to total victory."
    },
    sourceAuthority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi"
  }
];

/**
 * Đánh giá an toàn & Kích hoạt cơ chế phản biện sử liệu (Production Guardrail Evaluator)
 * @param query Câu hỏi từ du khách
 * @param lang Ngôn ngữ ('vi' | 'en')
 * @param cosineScore Điểm tương đồng RAG Cosine (0.0 -> 1.0)
 */
export function evaluateHistoricalGuardrail(
  query: string,
  lang: Locale = "vi",
  cosineScore: number = 1.0
): GuardrailDecision {
  const normalizedQuery = query.trim().toLowerCase();

  // Tier 1: Kiểm tra bẫy kích động & xuyên tạc theo mẫu định sẵn
  for (const rule of REBUTTAL_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalizedQuery)) {
        return {
          allowed: false,
          isProvocative: true,
          reason: rule.category === "jailbreak" ? "JAILBREAK_ATTEMPT" : "PROVOCATION_INTERCEPTED",
          rebuttalText: rule.rebuttal[lang],
          sourceAuthority: rule.sourceAuthority
        };
      }
    }
  }

  // Tier 2: Kiểm tra ngưỡng tương đồng RAG Cosine
  const COSINE_STRICT_THRESHOLD = 0.78;
  if (cosineScore < COSINE_STRICT_THRESHOLD) {
    const fallbackText =
      lang === "vi"
        ? "Xin lỗi quý khách, nội dung này nằm ngoài phạm vi tư liệu lịch sử chính thức của Ban Quản lý Di tích Địa đạo Củ Chi."
        : "I apologize, this topic is outside the official historical archives of the Cu Chi Tunnels Historical Site.";

    return {
      allowed: false,
      isProvocative: false,
      reason: "LOW_SIMILARITY_FALLBACK",
      rebuttalText: fallbackText,
      sourceAuthority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi"
    };
  }

  // Tier 3: Câu hỏi an toàn và hợp lệ
  return {
    allowed: true,
    isProvocative: false,
    reason: "SAFE"
  };
}
