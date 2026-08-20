# 🎨 BRAND IDENTITY & DESIGN SYSTEM: CHI VOICE
### *(CHI VOICE — Hệ Thống Thuyết Minh Viên Giọng Nói AI Di Tích Lịch Sử Địa Đạo Củ Chi)*

---

## 1. ĐỊNH VỊ THƯƠNG HIỆU & Ý NGHĨA TÊN GỌI (BRAND IDENTITY)
* **Tên thương hiệu chính thức:** **CHI VOICE**
* **Ý nghĩa đa tầng:**
  * **C.H.I** = *Cu Chi Historical Intelligence* (Trí tuệ Lịch sử Củ Chi).
  * **Chữ "Chi" trong Địa đạo Củ Chi:** Gắn liền với di tích lịch sử anh hùng.
  * **Chữ "Chi" trong "Ý Chí":** Tôn vinh ý chí quật cường, mưu trí của quân dân miền Nam.
  * **Nhân vật "Chi":** Thuyết minh viên ảo êm dịu, ấm áp, đồng hành trong tai nghe du khách.
* **Phong cách thiết kế độc bản:** **"Sonic Monolith"** (Khối Âm Bản Thực Địa $100\text{vh}$).

---

## 2. NGUYÊN LÝ THIẾT KẾ CỐT LÕI (CORE PRINCIPLES)

```
┌─────────────────────────────────────────────────────────────┐
│                 5 TRỤ CỘT THIẾT KẾ HẦM TỐI                  │
├──────────────────────────┬──────────────────────────────────┤
│ 1. Pure OLED Black       │ Nền Than Đất Nén `#0D0E11`       │
│ 2. Single Lantern Glow   │ 1 Quả Cầu Vàng Đèn Bão `#E5A93C` │
│ 3. Glanceable Typography │ Chữ to, đọc lướt trong 0.5s      │
│ 4. One-Thumb Ergonomics  │ Thao tác 1 ngón cái ở 1/3 dưới   │
│ 5. Breathing Visualizer  │ Sóng âm thở theo nhịp giọng nói  │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 3. BẢNG MÀU THỰC ĐỊA & TAILWIND TOKENS

| Tên Token | Mã HEX | Tailwind Class | Vai Trò Trong Giao Diện |
| :--- | :--- | :--- | :--- |
| `tunnel-base` | `#0D0E11` | `bg-[#0D0E11]` | Nền than đất nén (tiết kiệm pin OLED, bảo vệ mắt). |
| `tunnel-surface`| `#16181D` | `bg-[#16181D]` | Thẻ chứa thông tin trạm và thanh an toàn. |
| `tunnel-border` | `#2A2D35` | `border-zinc-800` | Đường viền mảnh phân tách không gian. |
| `tunnel-amber` | `#E5A93C` | `bg-amber-500` | **Quả Cầu Âm Bản chính**, vầng sáng sóng âm Visualizer. |
| `tunnel-rust` | `#9A3412` | `text-amber-800` | Màu đất sét Củ Chi, viền thẻ nổi bật. |
| `tunnel-chalk` | `#F3F4F6` | `text-slate-100` | Tiêu đề trạm, thông tin chính (tương phản $\ge 15:1$). |
| `tunnel-muted` | `#94A3B8` | `text-slate-400` | Thời lượng audio, phụ đề, chú thích nhỏ. |
| `tunnel-jade` | `#2DD4BF` | `text-emerald-400` | Chỉ dẫn an toàn, cửa thoát hiểm, trạng thái đã cache. |
| `tunnel-alert` | `#EF4444` | `text-red-500` | Chỉ báo mất sóng (chuyển sang Offline Cache). |

---

## 4. CÔNG THÁI HỌC VÙNG CHẠM & TƯƠNG TÁC (TOUCH ERGONOMICS)

### 🔘 Quả Cầu Âm Bản Trung Tâm (The Sonic Orb)
* **Kích thước:** `220px x 220px` hình tròn tuyệt đối (`rounded-full`).
* **Vị trí:** Cố định ở 50% trung tâm màn hình (Zone 2).
* **Hiệu ứng khi giữ:** Sóng âm nước tỏa ra ngoài với hiệu ứng glow vàng đèn bão (`box-shadow: 0 0 50px rgba(229, 169, 60, 0.45)`).

### 📳 Xúc Giác & Âm Thanh (Sensory Feedback)
* Chạm nút: Rung $40\text{ms}$ + Tiếng gõ mõ tre $120\text{Hz}$.
* Nhận câu trả lời AI: Rung 2 nhịp $20\text{ms}$.
* Hoảng sợ trong hầm (Panic Triple-Tap): Chạm nhanh 3 lần $\rightarrow$ Sáng đèn ngọc `#2DD4BF`.
