# 📜 HISTORICAL DATA SCHEMA & STATION KNOWLEDGE BASE

Tài liệu định nghĩa cấu trúc dữ liệu JSON cho 5 trạm di tích Củ Chi, tích hợp sâu **Chỉ dẫn An toàn Không gian ngầm (Safety Briefing)** và **Nội dung Kể chuyện Xúc động (Emotional Human Narrative)**.

---

## 1. SCHEMA ĐỊNH NGHĨA TRẠM DI TÍCH (`station.schema.json`)

```typescript
export interface StationSafety {
  tunnel_length_meters: number;       // Chiều dài đoạn hầm (VD: 20m)
  avg_crawl_time_seconds: number;     // Thời gian di chuyển ước tính (VD: 120s)
  ceiling_height_cm: number;          // Chiều cao trần hầm (VD: 80 - 120cm)
  emergency_exit_note: {
    vi: string;                       // "Cửa thoát hiểm bên phải sau 10m"
    en: string;                       // "Emergency exit on the right after 10m"
  };
  reassurance_message: {
    vi: string;                       // Câu trấn an tâm lý người đi hầm
    en: string;
  };
}

export interface Station {
  id: string;                         // "01_hoang_cam_kitchen"
  qr_code_key: string;                // "QR_KITCHEN_01"
  order_index: number;                // 1 -> 5
  title: { vi: string; en: string };
  short_summary: { vi: string; en: string };
  
  // Trấn an tâm lý & An toàn thể xác
  safety: StationSafety;

  // Câu chuyện con người xúc động (Storytelling Hook)
  human_story_hook: {
    vi: string;
    en: string;
  };

  // Tài nguyên âm thanh ngoại tuyến (Pre-rendered MP3)
  audio_assets: {
    vi: { url: string; duration_seconds: number; file_size_bytes: number };
    en: { url: string; duration_seconds: number; file_size_bytes: number };
  };

  key_facts: string[];                // 3 facts cốt lõi
  faqs: Array<{
    question: { vi: string; en: string };
    answer: { vi: string; en: string };
  }>;
}
```

---

## 2. BỘ DỮ LIỆU THỰC TẾ 5 TRẠM MVP (TÍCH HỢP TÂM LÝ DU KHÁCH)

### 📍 Trạm 1: `01_hoang_cam_kitchen` (Bếp Hoàng Cầm)
* **Safety:** Tầng 2 (sâu 5m - 8m) | Dài 15m | Đi lom khom | Cao 1.4m | Cửa thoát thoáng gió ngay trước mặt.
* **Trấn an:** *"Khu vực bếp tương đối thoáng mát ở Tầng 2, trần hầm cao 1.4 mét. Bạn hãy thở đều và di chuyển thong thả."*
* **Story Hook:** *"Bếp Hoàng Cầm đỏ lửa nấu chín những củ khoai mì dẻo thơm chấm muối mè, cùng các hầm sinh hoạt biến lòng địa đạo thành một xã hội thu nhỏ kiên cường giữa vùng chiến sự khốc liệt."*

### 📍 Trạm 2: `02_field_hospital` (Bệnh Xá & Hầm Phẫu Thuật Dã Chiến)
* **Safety:** Tầng 2 (sâu 5m – 8m) | Đi lom khom 10m | Cao 1.4m | Lối thoát hiểm dẫn thẳng lên giếng nước ngầm.
* **Trấn an:** *"Hầm bệnh xá nằm ở Tầng 2 sâu 5m - 8m, an toàn trước bom phá thông thường. Chiều cao hầm chỉ vừa đủ đi lom khom, xin quý khách di chuyển chậm và cẩn thận."*
* **Story Hook:** *"Hình tượng Bác sĩ Võ Hoàng Lê quả cảm thực hiện những ca phẫu thuật ngoại khoa phức tạp dưới ngọn đèn dầu le lói trong lòng đất ẩm tối, vừa cầm dao mổ vừa chỉ huy bảo vệ toàn vẹn khu bệnh viện ngầm."*

### 📍 Trạm 3: `03_command_bunker` (Hầm Chỉ Huy Đầu Não)
* **Safety:** Tầng 3 (sâu 8m – 12m) | Dài 25m | Đi khom | Cao 1.5m | Ngách thoát hiểm cơ mật trổ thẳng ra sát mép sông Sài Gòn.
* **Trấn an:** *"Hầm chỉ huy ở Tầng 3 sâu 8m - 12m là tầng kiên cố nhất, có khả năng chịu lực nén tự nhiên tuyệt vời trước các loại bom đạn lớn."*
* **Story Hook:** *"Tại quần thể hầm chỉ huy Bến Dược và Bến Đình, các quyết sách quân sự táo bạo đã được ban hành, biến nơi đây thành bàn đạp lịch sử cho cuộc Tổng tiến công Tết Mậu Thân 1968."*

### 📍 Trạm 4: `04_ventilation_termite` (Lỗ Thông Hơi Ụ Mối & Đối Phó Chó Nghiệp Vụ)
* **Safety:** Đoạn hầm chuyển tiếp 18m | Đi lom khom | Cao 0.8m | Cửa thoát hiểm sau 8m.
* **Trấn an:** *"Đoạn hầm này có chiều cao hạn chế cần đi lom khom, nhưng hệ thống đối lưu nhiệt tự nhiên liên tục hút dưỡng khí mới xuống hầm."*
* **Story Hook:** *"Sáng kiến đặt xà phòng Mỹ tại cửa hầm và lỗ thông hơi đã vô hiệu hóa hoàn toàn khứu giác đàn chó săn béc-giê của đối phương trong các trận càn quét khốc liệt."*

### 📍 Trạm 5: `05_booby_traps` (Trận Đồ Bẫy Chông & Vũ Khí Du Kích)
* **Safety:** Khu vực trưng bày trên mặt đất rộng rãi, thoáng mát, đi lại tự do.
* **Trấn an:** *"Chúc mừng bạn đã hoàn thành hành trình ngầm và trở lại mặt đất an toàn!"*
* **Story Hook:** *"Sáng kiến tái chế bom pháo lép thành mìn gạt của Anh hùng Tô Văn Đực đã biến vũ khí hủy diệt của đối phương thành vũ khí bảo vệ quê hương, phá hủy hàng trăm xe tăng, xe bọc thép trong trận càn Cedar Falls 1967."*
