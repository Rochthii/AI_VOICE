# 🏛️ PHONG CÁCH THIẾT KẾ ĐỘC BẢN: "SONIC MONOLITH"
### *(Khối Âm Bản Thực Địa — Thiết Kế Đo Ni Đóng Giày Cho Không Gian Hầm Ngầm)*

---

## 1. TẠI SAO CÁC STYLE THIẾT KẾ APP THÔNG THƯỜNG (AI-STYLE) THẤT BẠI DƯỚI HẦM?
* ❌ **App thông thường:** Dùng nhiều card, nhiều chữ, thanh cuộn dài, nút bấm nhỏ $24-40\text{px}$, hộp chat bong bóng (chat bubbles).
* 🛑 **Thực tế người dùng dưới hầm:** Tay dính bùn đất/mồ hôi $\rightarrow$ bấm lệch nút nhỏ; đang bò khom lưng $\rightarrow$ vuốt màn hình bị trượt; mắt căng ra trong bóng tối $\rightarrow$ đọc bong bóng chat gây hoa mắt.

👉 **GIẢI PHÁP ĐỘC BẢN CỦA "SONIC MONOLITH":**
Biến toàn bộ màn hình điện thoại thành một **"Bảng Điều Khiển Âm Bản Khối Liền" (Zero-Scroll 100vh)**: Không cuộn trang, không nút nhỏ, không bong bóng chat. **Mọi thao tác đều thực hiện được bằng cảm giác xúc giác mà không cần nhìn chăm chú vào màn hình**.

---

## 2. BỐ CỤC 3 PHÂN VÙNG BẤT BIẾN (THE 3-ZONE MONOLITH LAYOUT)

```
┌─────────────────────────────────────────────────────────────┐
│  ZONE 1: BEACON AN TOÀN (Top 20% Viewport)                 │
│  ┌──────────────────────────┐  ┌─────────────────────────┐  │
│  │ 📏 ĐỘ DÀI: 15m           │  │ 🟢 CỬA THOÁT: TRƯỚC 5m  │  │
│  │ ⏳ THỜI GIAN: 2 PHÚT     │  │ 📡 OFFLINE CACHE: 100%  │  │
│  └──────────────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ZONE 2: QUẢ CẦU ÂM BẢN (Middle 50% Viewport)               │
│                                                             │
│                    ╭───────────────────╮                    │
│                    │                   │                    │
│                    │    (( 🎙️ ))       │                    │
│                    │                   │                    │
│                    │  CHẠM BẤT KỲ ĐÂU  │                    │
│                    │      ĐỂ HỎI       │                    │
│                    │                   │                    │
│                    ╰───────────────────╯                    │
│        (Vùng chạm khổng lồ 220px - Không thể bấm trượt)     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ZONE 3: DÒNG THỜI GIAN THUYẾT MINH (Bottom 30% Viewport)   │
│  ▶️ [01:14] ━━━━━━━━━━━━●━━━━━━━━━━━ [02:30]               │
│  📜 "Rãnh giấu khói chạy ngầm làm nguội khí..." (Ticker 1 dòng) │
│  [⏮️ Lùi 15s]     [ ⏸️ TẠM DỪNG / PHÁT ]     [⏭️ Tiếp 15s] │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. BA ĐẶC ĐIỂM "ĐO NI ĐÓNG GIÀY" KHÔNG ĐỤNG HÀNG

### ① Vùng Chạm Khổng Lồ 220px (The Giant Touch Surface)
* Nút "Hold-to-Talk" không phải là một icon nhỏ 40px. Nó là một **Khối cầu Âm bản chiếm trọn 50% chiều cao màn hình** ($220\text{px} \times 220\text{px}$).
* Người dùng dù tay dính mồ hôi, ngón cái quẹt bất kỳ đâu vào giữa màn hình đều kích hoạt thu âm thành công $100\%$.

### ② Zero-Scroll Policy (Không Cuộn Màn Hình Khi Đang Đi Hầm)
* Toàn bộ trạng thái của 1 trạm di tích nằm vừa khít trong đúng `100vh` (chiều cao màn hình).
* Không có thanh cuộn (No scrollbar), triệt tiêu hoàn toàn hiện tượng vuốt nhầm làm trôi màn hình khi đang khom lưng bò.

### ③ Ticker-Style Narrative (Phụ Đề Điện Ảnh 1 Dòng)
* Thay vì hiện một đoạn văn bản dài 200 chữ như sách giáo khoa, màn hình chỉ hiển thị đúng **1 câu thuyết minh đang phát** theo phong cách chữ chạy (Cinema Subtitle Ticker), kích thước chữ $20\text{px}$ siêu nét. Người dùng liếc mắt 0.2 giây là nắm được ý chính.

---

## 4. BẢNG MÀU ĐẶC BIỆT: "ĐẤT BAZAN NÉN & DẠ QUANG ĐÈN BÃO"

Khác biệt hoàn toàn với các bảng màu Dark Mode công nghiệp:

| Tên Màu | Mã HEX | Cảm Hứng Thực Địa | Tác Dụng Thực Tế |
| :--- | :--- | :--- | :--- |
| **Bazan Noir (Than Đất Nén)** | `#0D0E11` | Màu của đất sét Củ Chi nén chặt dưới tầng ngầm thứ 2. | Êm dịu cho đồng tử trong tối, không bị gắt như màu đen thuần. |
| **Phosphor Amber (Vàng Dạ Quang)** | `#E5A93C` | Ánh sáng vàng của đèn bão dầu hỏa thời chiến. | Phát quang dẫn hướng mắt vào quả cầu tương tác chính. |
| **Tactical Jade (Ngọc Dạ Quang)** | `#2DD4BF` | Màu sơn phát quang trên các biển chỉ dẫn thoát hiểm quân sự. | Báo hiệu thông số an toàn và trạng thái kết nối offline. |
| **Clay Rust (Đất Đỏ Khô)** | `#9A3412` | Màu đất bazan bề mặt địa đạo. | Màu viền phân tách các phân vùng cứng cáp. |
| **Chalk White (Trắng Vôi Hầm)** | `#F3F4F6` | Màu vạch vôi đánh dấu mốc trong địa đạo. | Chữ tiêu đề và thông số có độ tương phản $16:1$. |

---

## 5. BA HÌNH THÁI TRẠNG THÁI CỦA QUẢ CẦU ÂM BẢN (STATE MORPHING)

```
1. TRẠNG THÁI CHỜ (IDLE):
   Quả cầu phát xung ánh sáng nhẹ nhàng như nhịp thở chậm (Breathing 4s/chu kỳ).

2. TRẠNG THÁI LẮNG NGHE (LISTENING - ĐANG GIỮ TAY):
   Quả cầu mở rộng biên độ ra toàn màn hình, các vòng sóng âm (Ripple Rings) lan tỏa 
   theo âm lượng giọng nói thực của du khách, màn hình rung nhịp nhẹ 40ms.

3. TRẠNG THÁI TRẢ LỜI (SPEAKING):
   Quả cầu chuyển sang màu Vàng Dạ Quang (#E5A93C), phát xung nhịp ngắn theo 
   từng âm tiết của giọng nói AI, phụ đề 1 dòng chạy bên dưới.
```

---

## 6. CSS TOKENS THI CÔNG TRỰC TIẾP (TAILWIND EXTENSION)

```typescript
// tailwind.config.ts extension
export const sonicMonolithTheme = {
  colors: {
    tunnel: {
      base: '#0D0E11',     // Nền than đất nén
      surface: '#16181D',  // Khối card âm bản
      border: '#2A2D35',   // Viền khối
      amber: '#E5A93C',    // Vàng dạ quang đèn bão
      jade: '#2DD4BF',     // Ngọc dạ quang an toàn
      rust: '#9A3412',     // Đất đỏ Củ Chi
      chalk: '#F3F4F6',    // Trắng vôi tương phản cao
    }
  },
  boxShadow: {
    'lantern-pulse': '0 0 50px rgba(229, 169, 60, 0.35)',
    'jade-beacon': '0 0 20px rgba(45, 212, 191, 0.25)',
  }
};
```
