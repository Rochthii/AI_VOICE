# 🔬 BẢN PHÂN RÃ NGUYÊN TỬ HỆ THỐNG & MA TRẬN 16 USE CASES CHI TIẾT
### *Dự án: Củ Chi Voice Guide (Hệ Thống Trải Nghiệm Không Gian Ngầm)*

---

# PHẦN I: PHÂN RÃ HẠT NGUYÊN TỬ (ATOMIC DECOMPOSITION)
Hệ thống được chia nhỏ thành 4 tầng phân tử độc lập, quản lý đến từng bit dữ liệu, mili-giây và node âm thanh.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TẦNG PHÂN TỬ HỆ THỐNG                              │
├───────────────────┬───────────────────┬─────────────────────────────────┤
│ 1. INPUT ATOMS    │ 2. COMPUTE ATOMS  │ 3. OUTPUT & SENSORY ATOMS       │
│ - Raw PCM 16kHz   │ - FFT 256 Bins    │ - AudioBufferSourceNode         │
│ - Touch Duration  │ - Cosine Dist F32 │ - navigator.vibrate([ms])       │
│ - QR Hex Hash     │ - Token Chunk SSE │ - CSS transform: matrix3d       │
│ - Net Navigator   │ - VAD RMS Energy  │ - Cinema Ticker Char Stream     │
└───────────────────┴───────────────────┴─────────────────────────────────┘
```

---

## 1. CÁC NGUYÊN TỬ DỮ LIỆU ĐẦU VÀO (INPUT ATOMS)

| Tên Nguyên Tử | Kiểu Dữ Liệu | Nguồn Thu Thập | Ý Nghĩa / Mục Đích Xử Lý |
| :--- | :--- | :--- | :--- |
| `Atom_MicStream` | `MediaStreamTrack` | Web Audio API / Hardware Mic | Thu âm giọng nói du khách, lấy mẫu $16\text{kHz}$ Mono 16-bit. |
| `Atom_TouchDuration` | `number` (ms) | `Date.now() - touchStartTime` | Xác định du khách bấm nhầm ($< 350\text{ms}$) hay thực sự muốn hỏi ($> 350\text{ms}$). |
| `Atom_StationKey` | `string` (UUID/Slug) | URL Query hoặc QR Scanner | Định danh trạm hiện tại (`01_hoang_cam_kitchen`). |
| `Atom_NetStatus` | `boolean` | `navigator.onLine` & Ping Test | Xác định lập tức chuyển sang Audio Cache hay mở luồng AI Q&A. |
| `Atom_LangLocale` | `'vi-VN' \| 'en-US'` | App State LocalStorage | Khóa chặt ngôn ngữ STT, TTS và nội dung hiển thị. |

---

## 2. CÁC NGUYÊN TỬ TÍNH TOÁN & XỬ LÝ (COMPUTE ATOMS)

| Tên Nguyên Tử | Thuật Toán / Công Thức | Thời Gian Thực Thi | Vai Trò |
| :--- | :--- | :--- | :--- |
| `Atom_VAD_RMS` | $\text{RMS} = \sqrt{\frac{1}{N} \sum x_i^2}$ | $< 16\text{ms}$ (Realtime) | Nhận diện mức năng lượng giọng nói, loại bỏ tạp âm quạt gió hầm ($< 0.02\text{ RMS}$). |
| `Atom_FFT_Bin` | Fast Fourier Transform (Size 256) | $60\text{ fps}$ RequestAnimationFrame | Trích xuất $32$ dải tần số âm thanh để vẽ sóng nước cho Quả Cầu Âm Bản. |
| `Atom_CosineScore` | $\text{Score} = \frac{A \cdot B}{\|A\| \|B\|}$ | $< 3\text{ms}$ (In-Memory Float32) | Đo độ tương đồng giữa câu hỏi và $50$ RAG Chunks lịch sử. Ngưỡng $\ge 0.78$. |
| `Atom_SSE_Chunk` | UTF-8 Text Stream Chunk | $\sim 50\text{ms}$ / token | Truyền từng từ ngữ từ LLM về Client để chạy chữ Ticker tức thì. |

---

## 3. CÁC NGUYÊN TỬ ĐẦU RA & GIÁC QUAN (OUTPUT & SENSORY ATOMS)

| Tên Nguyên Tử | Cơ Chế Xuất | Thời Lượng / Tần Số | Cảm Nhận Của Du Khách |
| :--- | :--- | :--- | :--- |
| `Atom_Haptic_Tap` | `navigator.vibrate(40)` | $40\text{ms}$ | Rung nhẹ khi ngón cái chạm giữ Quả Cầu. |
| `Atom_Haptic_Done`| `navigator.vibrate([20, 30, 20])`| $70\text{ms}$ tổng | Rung 2 nhịp êm báo hiệu đã gửi câu hỏi cho AI. |
| `Atom_SFX_Wood` | Web Audio Oscillator ($120\text{Hz}$) | $30\text{ms}$ (Decay mềm) | Tiếng gõ mõ tre tự nhiên báo bắt đầu thu âm. |
| `Atom_CinemaChar` | DOM String Concatenation | $30\text{ms}$ / ký tự | Chữ phụ đề chạy mượt mà theo nhịp đọc của giọng nói. |

---

# PHẦN II: MA TRẬN 16 USE CASES TOÀN DIỆN (TỪ BÌNH THƯỜNG ĐẾN CỰC ĐOAN)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHÂN LOẠI 16 TÌNH HUỐNG THỰC TẾ                      │
├──────────────────────────┬──────────────────────────────────────────────┤
│ NHÓM 1: CHUẨN (GOLDEN)   │ UC-01 đến UC-04: Quét, Nghe, Hỏi, Đổi Trạm   │
│ NHÓM 2: MẠNG & SÓNG      │ UC-05 đến UC-08: Rớt mạng, Mạng yếu, Cache   │
│ NHÓM 3: THỂ XÁC & TÂM LÝ │ UC-09 đến UC-12: Hoảng loạn, Mồ hôi, Ồn hầm │
│ NHÓM 4: THIẾT BỊ NGOẠI VI│ UC-13 đến UC-16: Rớt tai nghe, Cuộc gọi, Pin │
└──────────────────────────┴──────────────────────────────────────────────┘
```

---

## NHÓM 1: HÀNH TRÌNH CHUẨN (GOLDEN PATHS)

### 🟢 UC-01: Quét QR Tại Cửa Hầm $\rightarrow$ Nghe Ngay Lập Tức
* **Tác nhân:** Du khách quốc tế quét mã QR dán ở biển Bếp Hoàng Cầm.
* **Hành vi hệ thống:**
  1. Camera nhận diện chuỗi `https://cuchi.guide/s/01_kitchen`.
  2. PWA nạp Service Worker $\rightarrow$ Lập tức phát `01_kitchen_en.mp3` sau $150\text{ms}$.
  3. Zone 1 hiện thông số: `15m | 2 mins | Exit ahead 5m`.
  4. Du khách cất điện thoại vào túi, vừa khom lưng bước vào hầm vừa nghe thuyết minh.

### 🟢 UC-02: Giữ Quả Cầu Hỏi Đáp Khi Dừng Chân Tại Hầm Rộng
* **Tác nhân:** Du khách dừng chân tại Hầm Cấp Cứu, tò mò về ánh sáng phẫu thuật.
* **Hành vi hệ thống:**
  1. Du khách lấy điện thoại, ngón cái chạm giữ Quả Cầu Âm Bản.
  2. Điện thoại rung $40\text{ms}$ + phát tiếng click tre trầm. Quả cầu nở to $110\%$.
  3. Du khách nói: *"Bác sĩ dùng đèn gì để mổ?"*. Thả ngón tay.
  4. Hệ thống lọc ồn $\rightarrow$ RAG tìm kiếm chunk `chunk_hospital_03` (Điểm $0.91$).
  5. AI stream câu trả lời ngắn: *"Bác sĩ dùng đèn pin bọc vải đỏ hoặc chai bắt đom đóm để gom ánh sáng mổ dưới hầm."* $\rightarrow$ Phát ra tai nghe + Ticker 1 dòng chạy bên dưới.

### 🟢 UC-03: Chuyển Đổi Song Ngữ Giữa Chặng (Language Toggle)
* **Tác nhân:** Một gia đình người Việt đi cùng một người bạn nước ngoài bấm đổi sang `EN`.
* **Hành vi hệ thống:**
  1. Giao diện đổi ngay lập tức không reload trang.
  2. Audio thuyết minh chuyển sang bản tiếng Anh tại đúng số giây đang phát (`currentTime`).

### 🟢 UC-04: Tự Động Kết Thúc Đoạn Hầm $\rightarrow$ Chúc Mừng & Gợi Ý Trạm Kế
* **Tác nhân:** Audio thuyết minh phát hết thời lượng $2\text{ phút }30\text{s}$.
* **Hành vi hệ thống:**
  1. Audio giảm âm lượng dần (Fade out $1.5\text{s}$).
  2. Zone 1 chuyển sang màu xanh ngọc: *"Bạn đã đến cuối đoạn hầm an toàn."*
  3. Màn hình tự động hiển thị mũi tên chỉ đường đến trạm tiếp theo: `02. Hầm Cấp Cứu`.

---

## NHÓM 2: MÔI TRƯỜNG MẠNG & SÓNG NGẦM (CONNECTIVITY EDGE CASES)

### 🟡 UC-05: Mất Sóng Đột Ngột Khi Đang Gửi Câu Hỏi AI
* **Bối cảnh:** Du khách vừa bấm hỏi xong thì bước sâu vào tầng hầm thứ 2 (4G rớt về No Service).
* **Hành vi hệ thống:**
  1. Fetch API tới `/api/ask` timeout sau $3.0\text{s}$.
  2. Hệ thống **không báo lỗi sập màn hình**.
  3. Tự động kích hoạt cơ chế Local Fallback: Tìm câu hỏi gần nhất trong danh mục `faqs` có sẵn của trạm đó trong `stations.json`.
  4. Trình duyệt dùng giọng đọc offline `window.speechSynthesis` hoặc phát audio FAQ có sẵn.

### 🟡 UC-06: Du Khách Quét QR Lần Đầu Tiên Dưới Hầm (Không Có Mạng Sẵn)
* **Bối cảnh:** Khách không mở web ở trên bờ, chui thẳng xuống hầm rồi mới quét QR.
* **Hành vi hệ thống:**
  1. Service Worker đã đăng ký từ lúc vào cổng di tích $\rightarrow$ Tự động phục vụ App Shell từ Cache.
  2. Nếu trạm đó chưa kịp tải MP3 $\rightarrow$ Hệ thống tự động chuyển sang chế độ **"Text-to-Speech Tổng Hợp Nội Bộ"** đọc dữ liệu văn bản đã cache từ trước.

### 🟡 UC-07: Bộ Nhớ Điện Thoại Đầy (Cache Quota Exceeded)
* **Bối cảnh:** Điện thoại giá rẻ của du khách chỉ còn trống dưới $50\text{MB}$ dung lượng.
* **Hành vi hệ thống:**
  1. Thuật toán `LRU (Least Recently Used)` tự động xóa file audio của trạm xa nhất, chỉ giữ lại file của trạm hiện tại và trạm kế tiếp.
  2. Khống chế tổng dung lượng Cache luôn dưới $15\text{MB}$.

### 🟡 UC-08: Sóng Chập Chờn 1 Vạch (High Latency Flapping)
* **Bối cảnh:** Sóng EDGE/2G chập chờn nhảy liên tục.
* **Hành vi hệ thống:**
  1. Giao diện ưu tiên hiển thị badge `🟡 MẠNG YẾU - ƯU TIÊN OFFLINE`.
  2. Khóa tính năng streaming nặng, chuyển toàn bộ sang chế độ tiết kiệm băng thông (chỉ gửi text nhận text, TTS xử lý trên client).

---

## NHÓM 3: THỂ XÁC, TÂM LÝ & MÔI TRƯỜNG THỰC ĐỊA (PHYSICAL & PSYCHOLOGICAL)

### 🔴 UC-09: Du Khách Bị Hoảng Sợ Trong Không Gian Hẹp (Panic / Claustrophobia Attack)
* **Bối cảnh:** Khách thấy tức ngực, thở dốc, muốn thoát ra ngoài ngay lập tức.
* **Hành vi hệ thống:**
  * **Hành động người dùng:** Chạm nhanh liên tiếp 3 lần vào bất kỳ đâu trên màn hình (Panic Triple-Tap).
  * **Phản ứng khẩn cấp của hệ thống:**
    1. Lập tức ngắt toàn bộ thuyết minh lịch sử.
    2. Phát âm thanh trấn an bằng giọng điềm tĩnh với âm lượng lớn hơn $20\%$:
       * *VI: "Bạn đang an toàn. Hãy hít thở sâu. Lối thoát hiểm gần nhất nằm bên tay phải của bạn, cách 4 mét. Hãy bò chậm rãi về phía ánh sáng."*
       * *EN: "You are safe. Take a deep breath. The nearest exit is on your right, 4 meters away. Move slowly toward the light."*
    3. Màn hình phát sáng màu xanh ngọc dạ quang `#2DD4BF` toàn phần để hỗ trợ soi đường khẩn cấp.

### 🔴 UC-10: Mồ Hôi & Bùn Đất Rơi Lên Màn Hình (Ghost Touches)
* **Bối cảnh:** Giọt mồ hôi rơi vào màn hình cảm ứng tạo ra các điểm chạm giả.
* **Hành vi hệ thống:**
  1. Áp dụng thuật toán **Touch Surface Area Filter**: Điểm chạm có diện tích $< 10\text{px}$ hoặc thời gian chạm $< 100\text{ms}$ sẽ bị bỏ qua (Debounced).
  2. Chỉ chấp nhận tương tác khi vùng tiếp xúc lớn (ngón tay cái $\ge 40\text{px}$) và giữ liên tục $> 350\text{ms}$.

### 🔴 UC-11: Du Khách Vô Tình Buông Tay Quá Nhanh (< 300ms)
* **Bối cảnh:** Khách chỉ định chạm nhẹ xem giờ nhưng trúng Quả Cầu Âm Bản.
* **Hành vi hệ thống:**
  1. `Atom_TouchDuration < 350ms` $\rightarrow$ Hủy lệnh ghi âm, không gửi request lên Server.
  2. Hiện nhẹ gợi ý: *"Nhấn và GIỮ ngón tay để đặt câu hỏi"*.

### 🔴 UC-12: Tiếng Quạt Thông Gió Hầm & Tiếng Người Ồn Ào (Low SNR)
* **Bối cảnh:** Tiếng quạt hút gió trong hầm kêu ù ù rất lớn.
* **Hành vi hệ thống:**
  1. Áp dụng bộ lọc dải thông cao (High-pass filter $150\text{Hz}$) triệt tiêu tiếng ù trầm của quạt.
  2. Thuật toán VAD chỉ kích hoạt thu âm khi năng lượng giọng nói người vượt ngưỡng trung bình của phòng $6\text{dB}$.

---

## NHÓM 4: THIẾT BỊ & HỆ THỐNG NGOẠI VI (HARDWARE & SYSTEM INTERRUPTS)

### 🟣 UC-13: Tai Nghe Bluetooth Bị Rớt / Hết Pin Giữa Chừng
* **Bối cảnh:** Tai nghe AirPods bị rơi ra hoặc hết pin khi đang nghe.
* **Hành vi hệ thống:**
  1. Web Audio API bắt sự kiện `audioDestination.onstatechange` $\rightarrow$ Tự động **TẠM DỪNG (PAUSE)** âm thanh ngay lập tức.
  2. **Không tự ý phát loa ngoài** của điện thoại (tránh làm ồn và vang dội trong đường hầm kín).
  3. Khi cắm lại tai nghe $\rightarrow$ Chạm nhẹ để tiếp tục nghe.

### 🟣 UC-14: Có Cuộc Gọi Đến Hoặc Tin Nhắn Cắt Ngang
* **Bối cảnh:** Du khách có cuộc gọi thoại đến.
* **Hành vi hệ thống:**
  1. Hệ điều hành tự động ngắt kênh âm thanh.
  2. PWA lưu lại `current_timestamp` vào LocalStorage.
  3. Khi kết thúc cuộc gọi quay lại Web $\rightarrow$ Audio tự động lùi lại $3\text{s}$ so với điểm dừng để du khách bắt kịp lại mạch câu chuyện.

### 🟣 UC-15: Chế Độ Tiết Kiệm Pin Tự Động Tắt Màn Hình (Screen Sleep)
* **Bối cảnh:** Du khách cất máy vào túi, màn hình tự động khóa sau 30 giây.
* **Hành vi hệ thống:**
  1. Service Worker duy trì luồng phát âm thanh nền qua Web Audio API (đã được cấp quyền từ cử chỉ chạm ban đầu).
  2. Audio tiếp tục phát mượt mà vào tai nghe du khách mà không bị hệ điều hành đóng tab.

### 🟣 UC-16: Du Khách Hỏi Câu Bẫy / Lạc Đề / Xuyên Tạc Lịch Sử
* **Bối cảnh:** Khách hỏi: *"Ai bán vũ khí cho du kích Củ Chi để đánh nhau?"*.
* **Hành vi hệ thống:**
  1. RAG Vector Search phát hiện câu hỏi mang tính suy đoán, không khớp sử liệu BQL.
  2. Kích hoạt `skill_guardrail.md` $\rightarrow$ Trả lời trung thực, khách quan và đanh thép:
     > *"Phần lớn vũ khí của quân dân Củ Chi là vũ khí thô sơ tự tạo như chông tre, bẫy gài, cùng vũ khí thu được từ chính đối phương qua các trận đánh để cải tiến sử dụng."*
