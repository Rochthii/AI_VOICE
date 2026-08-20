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
* **Safety:** Dài 15m | Đi bộ khom lưng | Cao 1.4m | Cửa thoát thoáng gió ngay trước mặt.
* **Trấn an:** *"Không gian tại bếp tương đối thoáng mát, có lỗ thoát khí tự nhiên."*
* **Story Hook:** *"Hãy nhìn lớp đất trên trần bếp, nơi người lính nuôi quân đã thức trắng đêm đào từng mét rãnh chỉ để đồng đội có được bữa cơm nóng mà không bị máy bay phát hiện."*

### 📍 Trạm 2: `02_field_hospital` (Hầm Cấp Cứu & Giải Phẫu)
* **Safety:** Nằm ở tầng 2 (sâu 6m) | Bò trườn 10m | Cao 1.2m | Lối thoát dẫn thẳng lên giếng nước.
* **Trấn an:** *"Hầm nằm sâu và rất kiên cố, nhiệt độ mát hơn bên ngoài 2-3 độ C."*
* **Story Hook:** *"Dưới ánh đèn dầu chai tù mù và những đợt bom rung chuyển mặt đất, các bác sĩ đã phẫu thuật bằng kìm tự chế và nước muối sát trùng..."*

### 📍 Trạm 3: `03_command_bunker` (Hầm Chỉ Huy Khu Ủy)
* **Safety:** Dài 25m | Đi khom | Cao 1.5m | Có cửa thoát bí mật hướng ra sông Sài Gòn.
* **Trấn an:** *"Hầm chỉ huy có diện tích rộng nhất, có băng ghế nghỉ chân cho du khách."*
* **Story Hook:** *"Từ căn phòng đất nhỏ bé này, những quyết sách làm thay đổi cục diện chiến trường miền Nam đã được truyền đi qua mạng lưới giao liên ngầm."*

### 📍 Trạm 4: `04_ventilation_termite` (Lỗ Thông Hơi Ụ Mối)
* **Safety:** Đoạn hầm chuyển tiếp 18m | Bò sát đất | Cao 0.8m | Cửa thoát hiểm sau 8m.
* **Trấn an:** *"Bạn đang ở gần mặt đất nhất, luồng gió tươi liên tục thổi qua lỗ thông hơi."*
* **Story Hook:** *"Một ụ mối vô tri trên mặt đất nhưng là lá phổi cứu sống hàng trăm con người bên dưới; rắc một chút ớt bột để đánh lừa cả đàn chó săn thiện chiến nhất."*

### 📍 Trạm 5: `05_booby_traps` (Khu Vực Bẫy Chông Du Kích)
* **Safety:** Khu vực trên mặt đất râm mát | Đi bộ tự do | Không gian mở.
* **Trấn an:** *"Bạn đã hoàn thành hành trình ngầm và trở lại mặt đất an toàn."*
* **Story Hook:** *"Những thanh tre rừng vạt nhọn thô sơ biến thành vũ khí khuất phục những đội quân tối tân nhất thế giới."*
