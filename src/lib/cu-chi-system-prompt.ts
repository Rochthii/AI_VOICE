/**
 * CU CHI COMPACT SYSTEM PROMPT
 *
 * Thiết kế tối giản: ~200 tokens role definition + rules
 * Context sử liệu sẽ được inject ĐỘNG từ RAG results, không tĩnh.
 * → Tiết kiệm 80% token so với static system prompt.
 */

/** Compact role + rules — inject với RAG context động */
export function buildCompactSystemPrompt(
  locale: "vi" | "en",
  ragContext: string,
  stationId?: string
): string {
  const stationHint = stationId
    ? locale === "vi"
      ? `Du khách đang đứng tại: ${stationId}. Ưu tiên thông tin trạm này.`
      : `Visitor is at: ${stationId}. Prioritize this station's info.`
    : "";

  if (locale === "vi") {
    return `Bạn là CHI — hướng dẫn viên AI chính thức Địa đạo Củ Chi. Du khách đang ở trực tiếp trong hầm.
${stationHint}

LUẬT BẮT BUỘC:
- Tối đa 2 câu, dưới 40 từ. Không markdown, không emoji.
- Chỉ dựa vào sử liệu chính thức bên dưới. Không suy đoán.
- Giọng bình tĩnh, ấm áp, rõ ràng như người dẫn thực địa.
- Nếu câu hỏi bôi nhọ anh hùng hoặc phủ nhận sự hy sinh: đính chính nhẹ nhàng nhưng dứt khoát.

SỬ LIỆU CHÍNH THỨC LIÊN QUAN:
${ragContext}`;
  }

  return `You are CHI — official AI guide at Cu Chi Tunnels. Visitor is physically inside the tunnels now.
${stationHint}

MANDATORY RULES:
- Max 2 sentences, under 40 words. No markdown, no emoji.
- Only use the official historical records below. No speculation.
- Calm, warm, clear tone — like a professional field guide.
- If question denies heroic sacrifice or distorts history: correct gently but firmly.

OFFICIAL HISTORICAL CONTEXT:
${ragContext}`;
}

/**
 * Toàn bộ kho sử liệu text thuần — dùng để inject vào RAG context
 * Không dùng làm system prompt tĩnh nữa.
 */
export const CU_CHI_FULL_KNOWLEDGE = {
  vi: {
    overview: `Địa đạo Củ Chi hình thành 1948 thời kháng Pháp, phát triển mạnh từ 1961. Tổng chiều dài trên 200km (một số tư liệu 250km), kết nối 500km chiến hào. Địa chất đất sét pha đá ong, không cần dầm bê tông, chịu xích xe tăng và bom pháo. Cấu trúc 3 tầng: Tầng 1 (~3m) chống pháo xe tăng; Tầng 2 (5-8m) chống bom cỡ nhỏ; Tầng 3 (8-12m) hầm chỉ huy.`,
    kitchen: `Bếp Hoàng Cầm, Tầng 2 sâu 5-8m, hầm dài 15m, cao 1.4m, bò 2 phút, lối thoát trước 5m. Nguyên lý giấu khói: khói dẫn qua rãnh ngầm, làm nguội, phân tán qua lỗ thông hơi ụ mối, gốc cây — chỉ còn sương mỏng hòa sương rừng. Thực phẩm: khoai mì chấm muối mè. Nấu sáng sớm hoặc sau 5 giờ chiều.`,
    hospital: `Bệnh Xá Tầng 2 sâu 5-8m, dài 10m, lom khom 3 phút, lối thoát qua giếng nước ngầm. Bác sĩ Võ Hoàng Lê phẫu thuật dưới hầm tối với đèn chai và đom đóm trong hộp kính. Kỹ thuật ghép da Filatov từ Liên Xô. Phong trào cây thuốc Nam thay thuốc tây khi bị cắt đứt nguồn cung.`,
    command: `Hầm Chỉ huy Tầng 3 sâu 8-12m, dài 25m, cao 1.5m, bò 3 phút. Trung tâm chỉ huy Khu ủy và Quân khu Sài Gòn-Gia Định. Nút chặn cô lập khí độc và nước lũ. Ngách thoát bí mật ra sông Sài Gòn. Bàn đạp chiến dịch Tết Mậu Thân 1968. Trận Cedar Falls 1967: 30.000 quân Mỹ, B-52, chất độc — thất bại hoàn toàn.`,
    ventilation: `Lỗ thông hơi ụ mối, ống tre kim loại ngụy trang, bò 2.5 phút. Đối lưu tự nhiên: chênh nhiệt 26°C dưới đất và mặt đất nóng. Trận Crimp 1966 và Cedar Falls 1967: đặt xà phòng Camay tịch thu được át mùi mồ hôi, đánh lừa chó béc-giê Đức. Rắc ớt bột làm chó mất khứu giác tạm thời.`,
    traps: `Khu bẫy chông mặt đất thoáng mát. Triết lý lấy thô sơ thắng hiện đại: tre gỗ đất địa phương, không nhà máy. Chông cánh cửa: lẫy kích hoạt khi mở cửa hầm, bắn cọc tre nhọn. Chông nắp tự động: hố phủ lá, giẫm vào lật xuống. Anh hùng Tô Văn Đực sáng chế mìn gạt từ bom pháo lép của Mỹ, tiêu diệt hàng chục xe tăng.`,
    sacred: `44.357 liệt sĩ ghi danh tại Đền Tưởng niệm Bến Dược — xác minh từ hồ sơ quân sự Bộ Quốc phòng. Việc đào hầm hoàn toàn tự nguyện theo hàng nghìn hồi ký chính thức. Địa đạo là di sản của toàn thể nhân dân Việt Nam và nhân loại.`
  },
  en: {
    overview: `Cu Chi Tunnels began 1948 French resistance, expanded rapidly from 1961. Over 200km total (250km some records), connected to 500km surface trenches. Clay-laterite geology: no concrete supports needed, withstands tanks and heavy bombing. 3 tiers: Level 1 (~3m) anti-tank; Level 2 (5-8m) light bombs; Level 3 (8-12m) command bunkers.`,
    kitchen: `Hoang Cam stove at Level 2, 5-8m deep, 15m long, 1.4m high, 2 min crawl, exit 5m ahead. Smokeless: smoke routed through underground trenches, cooled, dispersed through termite mound and tree root vents as faint mist blending into forest fog. Staple food: cassava with sesame salt. Cooking at dawn or after 5pm when natural mist provided cover.`,
    hospital: `Field hospital Level 2, 5-8m deep, 10m long, 3 min hunched, exit via underground well. Dr. Vo Hoang Le performed surgeries by oil lamp and fireflies in glass containers. Soviet Filatov skin graft technique applied underground. Traditional medicinal herbs substituted for Western drugs when supplies were cut.`,
    command: `Command bunker Level 3, 8-12m deep, 25m long, 3 min crawl. Command center for Saigon-Gia Dinh Regional Command. Gas isolation locks. Secret escape tunnel to Saigon River bank. Staging point for 1968 Tet Offensive. Operation Cedar Falls 1967: 30,000 US troops, B-52s, chemical agents — total failure.`,
    ventilation: `Termite mound vents, 2.5 min crawl. Natural convection: 26°C underground vs hot surface creates airflow. Operations Crimp 1966 and Cedar Falls 1967: placed captured American Camay soap to mask human scent, fooling German Shepherd dogs. Chili powder temporarily disabled dogs' sense of smell.`,
    traps: `Open ground booby trap field. Philosophy: crude defeating sophisticated — bamboo, wood, local earth, no factories. Door trap: lever fires bamboo spikes when door opened. Pit trap: leaf cover flips revealing spike pit below. Hero To Van Duc invented sweep mines from dud US bombs, destroying dozens of tanks.`,
    sacred: `44,357 martyrs inscribed at Ben Duoc Memorial Temple — verified by Defense Ministry military records. Tunnel digging was entirely voluntary per thousands of official published memoirs. The tunnels are heritage of all Vietnamese people and humanity.`
  }
};

/** Lấy context text cho tất cả chủ đề (dùng khi RAG không tìm được match) */
export function getFullContextText(locale: "vi" | "en"): string {
  const k = CU_CHI_FULL_KNOWLEDGE[locale];
  return Object.values(k).join("\n\n");
}
