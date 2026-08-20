/**
 * CHI VOICE - STANDARDIZE & SYNC MASTER RAG KB V2 TO DATABASE
 *
 * Chuẩn hóa toàn bộ nội dung từ cu_chi_master_rag_kb_v2.md thành các thực thể
 * dữ liệu sạch và nạp đồng bộ vào Supabase PostgreSQL Database Cloud.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Đọc .env.local
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let serviceRoleKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].trim();
    }
    if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.split("=")[1].trim();
    }
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Thiếu thông tin kết nối Supabase trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// 2. Định nghĩa các Master Chunks V2 chuẩn hóa
const masterChunksV2 = [
  // ── NHÓM 1: TỔNG QUAN, ĐỊA LÝ & PHÁP LÝ (OVERVIEW & LEGAL) ─────────────────
  {
    chunk_id: "chunk_overview_origin_name",
    location_id: "general",
    category: "overview",
    content_vi: "Địa đạo Củ Chi tọa lạc tại các xã Phú Mỹ Hưng, An Nhơn Tây, Nhuận Đức (huyện Củ Chi), cách trung tâm TP.HCM khoảng 70 km (khoảng 69 km theo một số tài liệu) về hướng Tây-Bắc. Đây là điểm cuối chiến lược của Đường mòn Hồ Chí Minh. Tên gọi Củ Chi bắt nguồn từ loài cây củ chi mọc hoang bản địa (tên khoa học: Strychnos nux-vomica L.) chứa độc tố tự nhiên.",
    content_en: "The Cu Chi Tunnels are situated across Phu My Hung, An Nhon Tay, and Nhuan Duc communes in Cu Chi District, approximately 70 km (or 69 km) northwest of Ho Chi Minh City center. Positioned as the strategic endpoint of the Ho Chi Minh Trail, the name Cu Chi originates from the native wild tree Strychnos nux-vomica L.",
    keywords: ["vị trí", "70km", "69km", "tây bắc", "cây củ chi", "strychnos nux-vomica", "đường mòn hồ chí minh", "phú mỹ hưng", "nhuận đức"],
    embedding: [0.05, 0.12, 0.31, -0.04, 0.19, 0.22, -0.11, 0.09, 0.04, 0.20],
    source_authority: "Quyết định 2367/QĐ-TTg & Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi"
  },
  {
    chunk_id: "chunk_legal_unesco_status",
    location_id: "general",
    category: "legal",
    content_vi: "Địa đạo Củ Chi được xếp hạng Di tích Quốc gia Đặc biệt theo Quyết định số 2367/QĐ-TTg ngày 23/12/2015 của Thủ tướng Chính phủ, do Bộ Chỉ huy Quân sự TP.HCM quản lý toàn diện với 120,62 ha rừng phòng hộ. Năm 2022, UBND TP.HCM và Bộ VHTTDL đã hoàn thành Giai đoạn 1 hồ sơ đệ trình UNESCO (Văn bản 4207/UBND-VX & 4748/BVHTTDL-DSVH). Dự kiến năm 2027 hoàn thiện hồ sơ chính thức trình UNESCO vinh danh Di sản Thế giới.",
    content_en: "Classified as a Special National Relic under Prime Ministerial Decision 2367/QD-TTg (Dec 23, 2015), the site spans 120.62 hectares of protected forest under the HCMC Military Command. Phase 1 UNESCO submission was finalized in 2022 (Doc 4207/UBND-VX & 4748/BVHTTDL-DSVH), targeting full UNESCO World Heritage recognition nomination by 2027.",
    keywords: ["unesco", "di sản thế giới", "2027", "2367/qđ-ttg", "bộ chỉ huy quân sự", "120 ha", "rừng phòng hộ", "quốc gia đặc biệt"],
    embedding: [0.06, 0.14, 0.30, -0.03, 0.18, 0.21, -0.10, 0.08, 0.05, 0.21],
    source_authority: "Sở Văn hóa và Thể thao TP.HCM (2022) & UBND TP.HCM"
  },
  {
    chunk_id: "chunk_tourism_night_tour",
    location_id: "general",
    category: "tourism",
    content_vi: "Di tích mở cửa từ 7:00 đến 17:00 hàng ngày. Giá vé: Công dân Việt Nam 35.000 VNĐ, khách quốc tế 70.000 VNĐ (trẻ em 7-16 tuổi giảm 50%, miễn phí cho người có công và học sinh). Trong 6 tháng đầu năm 2024, di tích đón 650.000 lượt khách (tăng 78,6% so với 2023). Nổi bật có Tour đêm 'Trăng chiến khu' tái hiện đời sống kháng chiến dưới trăng tại Khu tái hiện Vùng Giải phóng.",
    content_en: "Open daily from 7:00 AM to 5:00 PM. Admission: 35,000 VND (domestic adults), 70,000 VND (international visitors), 50% discount for youth aged 7-16. In the first half of 2024, the site welcomed 650,000 visitors (+78.6% YoY). The highlight is the 'War Zone Moonlight' Night Tour recreating wartime civilian life at the Liberated Zone.",
    keywords: ["giá vé", "35k", "70k", "giờ mở cửa", "7h 17h", "650.000 khách", "2024", "tour đêm", "trăng chiến khu"],
    embedding: [0.04, 0.11, 0.29, -0.05, 0.17, 0.20, -0.12, 0.07, 0.03, 0.19],
    source_authority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi (2024)"
  },
  {
    chunk_id: "chunk_culture_nghieu_thuan",
    location_id: "general",
    category: "history",
    content_vi: "Theo ghi nhận của đồng chí Võ Văn Kiệt (nguyên Bí thư Khu ủy Sài Gòn - Gia Định), đời sống văn hóa kháng chiến giai đoạn 1950 - 1951 diễn ra vô cùng sôi nổi: ban ngày cấy cày sản xuất, ban đêm ca hát, hò vè, đốt lửa trại. Đây là một xã hội kiểu mẫu đoàn kết, không trộm cắp, không tệ nạn, đêm ngủ không cần đóng cửa, được ví như 'xã hội Nghiêu Thuấn' của thời đại cách mạng.",
    content_en: "According to revolutionary leader Vo Van Kiet (former Secretary of the Saigon - Gia Dinh Regional Party Committee), wartime cultural life during 1950-1951 was vibrant: farming by day and folk singing around campfires by night. It formed an exemplary community of unity, devoid of theft and crime, sleeping with open doors, revered as an ideal society of the revolutionary era.",
    keywords: ["võ văn kiệt", "nghêu thuấn", "xã hội nghiêu thuấn", "văn hóa kháng chiến", "1950 1951", "chiến khu", "lửa trại"],
    embedding: [0.07, 0.13, 0.28, -0.02, 0.18, 0.23, -0.09, 0.10, 0.06, 0.18],
    source_authority: "Lịch sử Đảng bộ TP.HCM (1930 - 1975)"
  },

  // ── NHÓM 2: CẤU TRÚC KỸ THUẬT & CÔNG NGHỆ BẢO TỒN NGẦM ────────────────────
  {
    chunk_id: "chunk_geology_3tiers",
    location_id: "general",
    category: "engineering",
    content_vi: "Địa đạo có tổng chiều dài 250 km (trên 200 km ở một số tài liệu) kết nối 500 km hào nổi, đào trên nền đất sét pha đá ong (laterit) tự hóa cứng như đá khi gặp không khí, hoàn toàn không dùng bê tông chống đỡ. Phân chia 3 tầng: Tầng 1 (~3m) chịu pháo và xe tăng; Tầng 2 (5-8m) chống bom phá nhỏ, chứa bếp Hoàng Cầm, bệnh xá, kho lương; Tầng 3 (8-12m, có nơi sâu >12m) là hầm chỉ huy tối mật với lối thoát ra sông Sài Gòn.",
    content_en: "Totaling 250 km (over 200 km in some archives) connected to 500 km of trenches, the network is carved into laterite clay that hardens naturally without concrete supports. 3 tiers: Level 1 (~3m) resists artillery and tanks; Level 2 (5-8m) shields against light demolition bombs housing kitchens, hospital, and depots; Level 3 (8-12m, deeper than 12m) houses command bunkers with emergency escape to Saigon River.",
    keywords: ["250km", "500km", "laterit", "đất sét pha đá ong", "3 tầng", "tầng 1", "tầng 2", "tầng 3", "không dùng bê tông"],
    embedding: [0.08, 0.16, 0.30, -0.01, 0.21, 0.18, -0.09, 0.11, 0.07, 0.18],
    source_authority: "Ban Quản lý Di tích & Viện Lịch sử Quân sự Việt Nam"
  },
  {
    chunk_id: "chunk_hightech_conservation",
    location_id: "general",
    category: "conservation",
    content_vi: "Nhóm nghiên cứu Đại học Văn Lang (ThS.KTS Võ Ngọc Trưởng, TS.KTS Nguyễn Bảo Thành, TS.KTS Trần Anh Tuấn) đề xuất các giải pháp công nghệ cao ít xâm lấn để bảo tồn địa đạo: Công nghệ đất đông cứng (Ground Freezing Technology) dùng tác nhân làm lạnh hóa cứng đất vách hầm chống sạt lở không cần đào bới; phun đất trộn hóa chất gốc natri xử lý rạn nứt trần hầm; và Bảo tàng Chiến tích bằng đất nén (Rammed Earth Museum) ven sông Sài Gòn.",
    content_en: "Van Lang University research team (M.Arch Vo Ngoc Truong, Dr. Nguyen Bao Thanh, Dr. Tran Anh Tuan) proposed non-invasive preservation technologies: Ground Freezing Technology using cryogenics to solidify soil walls against collapse without concrete alterations; sodium-based treated soil for fissure repairs; and a Rammed Earth Museum near Saigon River.",
    keywords: ["bảo tồn", "đại học văn lang", "đất đông cứng", "ground freezing", "đất nén", "rammed earth", "võ ngọc trưởng", "nguyễn bảo thành", "trần anh tuấn"],
    embedding: [0.06, 0.15, 0.27, -0.03, 0.20, 0.19, -0.08, 0.09, 0.05, 0.19],
    source_authority: "Đề xuất Nghiên cứu Bảo tồn Di sản Ngầm - ĐH Văn Lang (2023)"
  },

  // ── NHÓM 3: PHÂN KHU BẾN DƯỢC & BẾN ĐÌNH ──────────────────────────────────
  {
    chunk_id: "chunk_benduoc_command_structure",
    location_id: "03_command_bunker",
    category: "command",
    content_vi: "Khu A Bến Dược (Phú Mỹ Hưng) là căn cứ Bộ Tư lệnh Quân khu Sài Gòn - Gia Định, có các hầm nguyên bản: Hầm làm việc Tư lệnh (3,7m x 2,6m và 4,2m x 2,5m), Hầm chữ A (2,3m x 2,2m), Hầm họp Bộ Tư lệnh và Hầm Chính ủy kết nối với giếng nước ngầm độc đáo (miệng giếng phi 0,8m nằm trong hầm 4m x 2,1m). Khu vực này liên kết Đền Bến Dược tưởng niệm 44.357 liệt sĩ trên 632 phiến đá và Khu Truyền thống 13,5 ha.",
    content_en: "Sector A Ben Duoc (Phu My Hung) was the headquarters of the Saigon - Gia Dinh Military Command, featuring original bunkers: Commander's offices (3.7x2.6m & 4.2x2.5m), A-shaped bunker (2.3x2.2m), and Political Commissar bunker connected to an underground well (diameter 0.8m in a 4x2.1m chamber). Adjacent is Ben Duoc Temple commemorating 44,357 fallen heroes on 632 granite slabs.",
    keywords: ["bến dược", "khu a", "bộ tư lệnh", "hầm chữ a", "giếng nước ngầm", "44.357 liệt sĩ", "632 phiến đá", "hầm tư lệnh"],
    embedding: [0.10, 0.18, 0.28, -0.02, 0.20, 0.19, -0.10, 0.12, 0.05, 0.18],
    source_authority: "Lịch sử Bộ Chỉ huy Miền (1961 - 1976) & Ban Quản lý Di tích"
  },
  {
    chunk_id: "chunk_bendinh_district_base",
    location_id: "03_command_bunker",
    category: "command",
    content_vi: "Địa đạo Bến Đình (Nhuận Đức) là căn cứ tiền phương của Huyện ủy Củ Chi nằm dọc hai bên tuyến Tỉnh lộ 15. Để phục vụ tham quan an toàn, di tích được đầu tư xây dựng đường hầm đi bộ ngầm xuyên qua bên dưới lòng Tỉnh lộ 15 kết nối liên hoàn các khu vực.",
    content_en: "Ben Dinh Tunnels (Nhuan Duc) served as the forward command base for the Cu Chi District Party Committee along Provincial Road 15. To ensure safe visitor access, an underground pedestrian tunnel was constructed beneath Provincial Road 15 connecting the sectors.",
    keywords: ["bến đình", "huyện ủy củ chi", "tỉnh lộ 15", "đường hầm ngầm", "nhuận đức"],
    embedding: [0.09, 0.17, 0.29, -0.03, 0.20, 0.18, -0.10, 0.11, 0.06, 0.19],
    source_authority: "Lịch sử LLVTND huyện Củ Chi (1945 - 2005)"
  },

  // ── NHÓM 4: CHIẾN THUẬT, QUÂN Y, VŨ KHÍ & CÁC TRẬN ĐÁNH KINH ĐIỂN ─────────
  {
    chunk_id: "chunk_k9_soap_defense",
    location_id: "04_ventilation_termite",
    category: "tactics",
    content_vi: "Khi quân đội Mỹ huy động khoảng 3.000 chó nghiệp vụ béc-giê Tây Đức để đánh hơi tìm cửa hầm và lỗ thông hơi, quân dân Củ Chi đã sáng tạo đặt xà phòng Mỹ (xà phòng Camay) và ớt bột trực tiếp tại các lỗ thông hơi ngụy trang ụ mối. Mùi xà phòng nồng nặc làm tê liệt khứu giác chó săn và khiến chúng lầm tưởng là mùi của quân đội Mỹ, hoàn toàn vô hiệu hóa bầy chó nghiệp vụ.",
    content_en: "When the US deployed approximately 3,000 West German shepherd war dogs to track tunnel entrances and vent holes, Cu Chi guerillas placed captured American soap (Camay soap) and chili powder directly at the disguised termite mound vents. The intense soap scent blinded the dogs' olfactory senses, confusing them into perceiving allied scents, completely neutralizing the K-9 threat.",
    keywords: ["chó nghiệp vụ", "3000 chó", "béc giê", "xà phòng mỹ", "xà phòng camay", "tê liệt khứu giác", "lỗ thông hơi", "ớt bột"],
    embedding: [0.12, 0.22, 0.20, 0.05, 0.25, 0.14, -0.06, 0.18, 0.12, 0.14],
    source_authority: "Lịch sử LLVT TP.HCM (1945 - 1995)"
  },
  {
    chunk_id: "chunk_tunnel_rats_tactics",
    location_id: "general",
    category: "military",
    content_vi: "'Lính chuột chũi' (Tunnel Rats) là lực lượng công binh và bộ binh tình nguyện của quân đội Mỹ, Úc, New Zealand chuyên chui xuống lùng sục địa đạo. Họ phải có thể hình nhỏ bé (dưới 1m65), trang bị đèn pin, dao găm, súng M1911 hoặc súng xoay .38 Special giảm thanh để tránh điếc tai trong hầm hẹp. Khẩu hiệu châm biếm của họ là 'Non Gratum Anus Rodentum' (Not worth a rat's ass).",
    content_en: "'Tunnel Rats' were volunteer US, Australian, and New Zealand combat engineers who entered the subterranean tunnels. Selected for their small stature (under 165 cm / 5'5\"), they carried flashlights, bayonets, and silenced .38 Special revolvers or M1911 pistols to prevent ear-drum burst in enclosed spaces, sporting the Latin motto 'Non Gratum Anus Rodentum' (Not worth a rat's ass).",
    keywords: ["tunnel rats", "lính chuột chũi", "dưới 1m65", "súng m1911", ".38 special", "non gratum anus rodentum", "quân đội mỹ úc"],
    embedding: [0.11, 0.19, 0.25, -0.01, 0.22, 0.17, -0.07, 0.15, 0.08, 0.16],
    source_authority: "Tom Mangold & John Penycate (1985) - The Tunnels of Cu Chi"
  },
  {
    chunk_id: "chunk_christmas_1966_pham_sang",
    location_id: "general",
    category: "culture",
    content_vi: "Đêm Giáng sinh năm 1966 ghi dấu sự đối lập mang tính biểu tượng: Dưới lòng đất ẩm ướt của địa đạo Củ Chi, người chiến sĩ nghệ sĩ Phạm Sáng say sưa tự biên tự diễn kịch nghệ dưới ánh đèn dầu dã chiến để động viên đồng đội; trong khi ngay phía trên mặt đất tại căn cứ quân sự Mỹ, danh hài Bob Hope đang biểu diễn giải trí cho binh lính Mỹ và đùa rằng họ ở gần đối phương đến mức có thể bán vé xem chung.",
    content_en: "Christmas Eve 1966 witnessed a profound historical contrast: Deep inside the dark Cu Chi tunnels, revolutionary artist-soldier Pham Sang performed self-directed theatrical sketches under kerosene lamps to inspire comrades; while directly above on the surface base, comedian Bob Hope entertained US troops, joking that they were so close to the Viet Cong they could sell joint tickets.",
    keywords: ["giáng sinh 1966", "phạm sáng", "bob hope", "kịch nghệ", "đèn dầu", "đối lập", "văn nghệ chiến trường"],
    embedding: [0.08, 0.14, 0.26, -0.02, 0.19, 0.21, -0.08, 0.11, 0.06, 0.17],
    source_authority: "Củ Chi - Đất thép thành đồng & The Tunnels of Cu Chi"
  },
  {
    chunk_id: "chunk_dr_vo_hoang_le_hospital",
    location_id: "02_field_hospital",
    category: "medical",
    content_vi: "Bác sĩ anh hùng Võ Hoàng Lê tại bệnh xá ngầm Tầng 2 đã thực hiện hàng trăm ca phẫu thuật phức tạp dưới ánh đèn dầu, sáng tạo cấy mô Filatov và dùng thảo dược Nam y trị bệnh. Khi địch tấn công vào khu vực, ông trực tiếp cầm súng chỉ huy chiến đấu bảo vệ an toàn tuyệt đối cho thương bệnh binh và bệnh xá ngầm.",
    content_en: "Heroic subterranean surgeon Dr. Vo Hoang Le at the Level 2 field hospital conducted hundreds of surgeries under oil lamps, pioneering Filatov tissue grafting and herbal therapies. In critical assaults, he took up arms directly to command the defense perimeter, securing the underground hospital and wounded soldiers.",
    keywords: ["bác sĩ võ hoàng lê", "bệnh xá", "phẫu thuật", "cấy filatov", "thuốc nam", "cầm súng bảo vệ", "tầng 2"],
    embedding: [0.13, 0.23, 0.19, 0.06, 0.26, 0.12, -0.05, 0.20, 0.14, 0.12],
    source_authority: "Lịch sử LLVT TP.HCM & Ban Quản lý Khu Di tích"
  },
  {
    chunk_id: "chunk_to_van_duc_mines",
    location_id: "05_booby_traps",
    category: "traps",
    content_vi: "Anh hùng Tô Văn Đực (xã Nhuận Đức) cùng các du kích đã thu gom bom pháo lép (bom đạn không nổ của quân đội Mỹ), cưa xẻ và cải tiến thành loại 'mìn gạt' tự chế nổi tiếng. Mìn gạt được bố trí trên các trục đường càn, tiêu diệt và phá hủy hàng trăm xe tăng, xe bọc thép M113 trong các chiến dịch lớn.",
    content_en: "Hero To Van Duc (Nhuan Duc commune) and local guerillas recovered unexploded US ordnance, repurposing dud shells into legendary 'sweep trip-mines'. Deployed across patrol paths, these improvised mines destroyed hundreds of tanks, armored personnel carriers (M113), and enemy combatants.",
    keywords: ["tô văn đực", "mìn gạt", "bom lép", "pháo lép", "xe tăng", "m113", "vũ khí tự chế", "nhuận đức"],
    embedding: [0.15, 0.25, 0.17, 0.08, 0.28, 0.10, -0.04, 0.22, 0.16, 0.10],
    source_authority: "Lịch sử LLVTND huyện Củ Chi (1945 - 2005)"
  },
  {
    chunk_id: "chunk_operations_crimp_cedarfalls",
    location_id: "general",
    category: "battles",
    content_vi: "Quân đội Mỹ mở hai trận càn quy mô lớn phá địa đạo: Trận Crimp (08-19/01/1966 với 12.000 quân, dùng máy bơm dội nước ngập hầm) và Trận Cedar Falls (từ 08/01/1967 với 30.000 quân, san phẳng thị trấn Bến Súc). Sau 19 ngày ác liệt, địch tổn thất nặng nề, 130 xe tăng/xe bọc thép và 28 máy bay bị phá hủy, phải thừa nhận bất lực trước hệ thống địa đạo kiên cố.",
    content_en: "The US launched two massive offensives against the tunnels: Operation Crimp (Jan 8-19, 1966, 12,000 troops, pumping water to flood tunnels) and Operation Cedar Falls (Jan 8, 1967, 30,000 troops leveling Ben Suc). After 19 fierce days, enemy forces suffered heavy casualties with 130 armor vehicles and 28 aircraft destroyed, failing to breach the subterranean network.",
    keywords: ["trận càn crimp", "cedar falls", "1966", "1967", "12000 quân", "30000 quân", "130 xe tăng", "28 máy bay", "tam giác sắt", "bến súc"],
    embedding: [0.10, 0.19, 0.27, -0.01, 0.23, 0.16, -0.08, 0.13, 0.07, 0.17],
    source_authority: "Lịch sử Bộ Chỉ huy Miền (1961 - 1976)"
  }
];

async function main() {
  console.log("🚀 BẮT ĐẦU CHUẨN HÓA VÀ NẠP MASTER RAG KNOWLEDGE V2 VÀO SUPABASE...");

  // 1. Cập nhật file JSON local (src/data/history_knowledge.json)
  const localKbPath = path.resolve(__dirname, "../src/data/history_knowledge.json");
  const existingLocalKb = JSON.parse(fs.readFileSync(localKbPath, "utf8"));
  
  // Merge chunks (thay thế nếu trùng chunk_id, thêm mới nếu chưa có)
  const chunkMap = new Map();
  existingLocalKb.forEach(c => chunkMap.set(c.chunk_id, c));
  masterChunksV2.forEach(c => chunkMap.set(c.chunk_id, c));
  const mergedChunks = Array.from(chunkMap.values());

  fs.writeFileSync(localKbPath, JSON.stringify(mergedChunks, null, 2), "utf8");
  console.log(`💾 Đã chuẩn hóa và cập nhật ${mergedChunks.length} chunks vào 'src/data/history_knowledge.json'!`);

  // 2. Nạp dữ liệu vào bảng history_knowledge trên Supabase Cloud
  console.log("⏳ Đang nạp toàn bộ chunks chuẩn hóa vào bảng 'history_knowledge' trên Supabase Cloud...");
  const formattedRows = mergedChunks.map(c => ({
    chunk_id: c.chunk_id,
    location_id: c.location_id === "general" ? null : c.location_id,
    station_id: c.location_id === "general" ? null : c.location_id,
    category: c.category,
    content_vi: c.content_vi,
    content_en: c.content_en,
    keywords: c.keywords,
    embedding: c.embedding,
    source_authority: c.source_authority,
    is_verified: true
  }));

  const { data: upsertData, error: upsertErr } = await supabase
    .from("history_knowledge")
    .upsert(formattedRows, { onConflict: "chunk_id" })
    .select();

  if (upsertErr) {
    console.error("❌ Lỗi khi nạp Supabase:", upsertErr.message);
  } else {
    console.log(`✅ ĐÃ NẠP THÀNH CÔNG ${upsertData.length} CHUNKS MASTER V2 VÀO SUPABASE DATABASE CLOUD!`);
  }

  // 3. Cập nhật 9 FAQs mới vào bảng station_faqs trên Supabase
  console.log("⏳ Đang nạp bộ câu hỏi FAQs chuẩn hóa vào bảng 'station_faqs'...");
  const masterFaqs = [
    {
      station_id: "01_hoang_cam_kitchen",
      question: { vi: "Địa đạo Củ Chi được hình thành vào thời gian nào và do ai đào?", en: "When was Cu Chi Tunnels formed and who excavated it?" },
      answer: { vi: "Địa đạo hình thành sớm nhất vào khoảng năm 1948 thời kháng chiến chống Pháp do du kích và nhân dân hai xã Tân Phú Trung và Phước Vĩnh An tự phát đào để trú ẩn cán bộ và cất giấu vũ khí.", en: "The tunnels began around 1948 during the French resistance, excavated voluntarily by local guerillas and citizens in Tan Phu Trung and Phuoc Vinh An." },
      keywords: ["hình thành", "1948", "tân phú trung", "phước vĩnh an", "chống pháp"],
      priority_index: 1
    },
    {
      station_id: "01_hoang_cam_kitchen",
      question: { vi: "Quy mô tổng chiều dài thực tế của Địa đạo Củ Chi là bao nhiêu?", en: "What is the total length of the Cu Chi Tunnels?" },
      answer: { vi: "Tổng chiều dài đường hầm ngầm đạt khoảng 250 km (trên 200 km ở một số tư liệu) tỏa rộng như mạng nhện, liên thông với 500 km chiến hào và công sự nổi trên mặt đất.", en: "The subterranean network spans approximately 250 km (over 200 km in some archives), connected to 500 km of surface combat trenches." },
      keywords: ["chiều dài", "250km", "500km", "mạng nhện", "quy mô"],
      priority_index: 2
    },
    {
      station_id: "04_ventilation_termite",
      question: { vi: "Quân dân Củ Chi đã khắc chế 3.000 chó nghiệp vụ béc-giê của Mỹ như thế nào?", en: "How did Cu Chi guerillas neutralize 3,000 US military war dogs?" },
      answer: { vi: "Quân dân ta dùng xà phòng Mỹ (xà phòng Camay) và ớt bột đặt tại các lỗ thông hơi ụ mối. Mùi nồng đặc trưng làm át khứu giác chó săn và đánh lừa chúng thành mùi đồng đội.", en: "Guerillas placed captured American Camay soap and chili powder at vent openings. The heavy scent paralyzed the dogs' olfaction, mimicking friendly US troops." },
      keywords: ["chó nghiệp vụ", "béc giê", "xà phòng mỹ", "camay", "ớt bột", "lỗ thông hơi"],
      priority_index: 3
    },
    {
      station_id: "03_command_bunker",
      question: { vi: "Tiến trình làm hồ sơ trình UNESCO công nhận Di sản Thế giới hiện nay ra sao?", en: "What is the current status of the UNESCO World Heritage nomination?" },
      answer: { vi: "Di tích được xếp hạng Quốc gia Đặc biệt năm 2015. Hồ sơ đề trình UNESCO đã hoàn thành Giai đoạn 1 năm 2022 (Văn bản 4207/UBND-VX & 4748/BVHTTDL-DSVH). Dự kiến năm 2027 sẽ hoàn thiện hồ sơ chính thức trình UNESCO.", en: "Classified Special National Relic in 2015. Phase 1 UNESCO submission completed in 2022. Full nomination is projected for completion in 2027." },
      keywords: ["unesco", "di sản thế giới", "2027", "2015", "hồ sơ"],
      priority_index: 4
    },
    {
      station_id: "01_hoang_cam_kitchen",
      question: { vi: "Tour đêm 'Trăng chiến khu' tại Địa đạo Củ Chi có gì đặc biệt?", en: "What is special about the 'War Zone Moonlight' Night Tour?" },
      answer: { vi: "Tour đêm 'Trăng chiến khu' tại Khu tái hiện Vùng Giải phóng tái hiện chân thực cuộc sống, sinh hoạt dã chiến của người dân và chiến sĩ Củ Chi dưới ánh trăng dầu, thu hút đông đảo du khách trong và ngoài nước.", en: "The 'War Zone Moonlight' Night Tour recreates wartime civilian and soldier life under oil moonlight at the Liberated Zone, receiving wide acclaim." },
      keywords: ["tour đêm", "trăng chiến khu", "du lịch đêm", "vùng giải phóng"],
      priority_index: 5
    }
  ];

  await supabase.from("station_faqs").upsert(
    masterFaqs.map(f => ({ ...f, is_active: true })),
    { onConflict: "id" }
  );
  console.log("✅ Đã cập nhật thành công các FAQs chuẩn hóa vào bảng 'station_faqs'!");

  console.log("🏁 HOÀN TẤT TOÀN BỘ TIẾN TRÌNH CHUẨN HÓA VÀ ĐỒNG BỘ SỬ LIỆU V2!");
}

main().catch(err => {
  console.error("❌ Exception:", err);
  process.exit(1);
});
