# Skill: Route & Intent Resolver
TASK: Resolve user voice/text query to target location_id & language.
INPUT: { query: string, current_station: string, lang: "vi" | "en" }

RULES:
1. Entity Keyword Match:
   - "bếp", "khói", "nấu ăn", "hoàng cầm" -> "01_hoang_cam_kitchen"
   - "cấp cứu", "giải phẫu", "bệnh viện", "y tế", "thuốc" -> "02_field_hospital"
   - "chỉ huy", "bộ tư lệnh", "họp", "bản đồ", "điện đài" -> "03_command_bunker"
   - "thông hơi", "ụ mối", "lỗ thở", "chó", "ớt bột", "xà phòng" -> "04_ventilation_termite"
   - "bẫy", "chông", "hố sập", "cần bật", "vũ khí" -> "05_booby_traps"
2. Fallback:
   - If no station entity matched -> keep `current_station`.
   - If query is general history (e.g. "địa đạo dài bao nhiêu") -> return "general".

OUTPUT: { station_id: string, is_general: boolean }
