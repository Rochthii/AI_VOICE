# 🗂️ USE CASE DIRECTORY INDEX: CỦ CHI VOICE GUIDE

Tất cả 16 kịch bản thực tế được module hóa thành từng file độc lập (1 file = 1 usecase duy nhất) để tối ưu hóa bộ nhớ và ngữ cảnh token:

---

## 🟢 NHÓM 1: HÀNH TRÌNH CHUẨN (GOLDEN PATHS)
* [`uc_01_qr_scan_autoprep.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_01_qr_scan_autoprep.md): Quét mã QR tại cửa hầm $\rightarrow$ Khởi chạy audio trong $150\text{ms}$.
* [`uc_02_voice_qa_interaction.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_02_voice_qa_interaction.md): Giữ Quả Cầu Âm Bản hỏi đáp giọng nói tại hầm rộng.
* [`uc_03_language_toggle.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_03_language_toggle.md): Chuyển đổi ngôn ngữ `[VI/EN]` không ngắt quãng audio.
* [`uc_04_station_transition.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_04_station_transition.md): Đi hết đoạn hầm $\rightarrow$ Fade out audio & dẫn đường sang trạm kế.

---

## 🟡 NHÓM 2: MÔI TRƯỜNG MẠNG & OFFLINE
* [`uc_05_network_drop_fallback.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_05_network_drop_fallback.md): Mất sóng khi đang gửi câu hỏi AI $\rightarrow$ Fallback FAQ cục bộ.
* [`uc_06_cold_offline_start.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_06_cold_offline_start.md): Quét QR lần đầu dưới hầm khi hoàn toàn không có mạng.
* [`uc_07_cache_quota_lru.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_07_cache_quota_lru.md): Thuật toán LRU dọn dẹp cache khi bộ nhớ máy đầy $< 15\text{MB}$.
* [`uc_08_flapping_low_bandwidth.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_08_flapping_low_bandwidth.md): Mạng chập chờn 2G $\rightarrow$ Tự động chuyển chế độ Text-Only TTS Client.

---

## 🔴 NHÓM 3: THỂ XÁC, TÂM LÝ & THỰC ĐỊA
* [`uc_09_panic_claustrophobia.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_09_panic_claustrophobia.md): Hoảng loạn không gian kín $\rightarrow$ Chạm 3 lần soi đèn & báo cửa thoát.
* [`uc_10_ghost_touch_filter.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_10_ghost_touch_filter.md): Lọc cảm ứng khi giọt mồ hôi/bùn đất rơi trên màn hình.
* [`uc_11_accidental_short_tap.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_11_accidental_short_tap.md): Du khách buông tay quá nhanh ($< 350\text{ms}$) $\rightarrow$ Không gửi API giả.
* [`uc_12_tunnel_noise_vad.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_12_tunnel_noise_vad.md): Lọc ồn quạt thông gió hầm bằng High-Pass Filter $150\text{Hz}$ & VAD.

---

## 🟣 NHÓM 4: THIẾT BỊ NGOẠI VI & HỆ THỐNG
* [`uc_13_headphone_disconnect.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_13_headphone_disconnect.md): Tai nghe Bluetooth bị rớt $\rightarrow$ Tạm dừng, không phát loa ngoài.
* [`uc_14_call_sms_interrupt.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_14_call_sms_interrupt.md): Cuộc gọi đến cắt ngang $\rightarrow$ Lưu vị trí và lùi $3\text{s}$ khi quay lại.
* [`uc_15_screen_sleep_background.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_15_screen_sleep_background.md): Màn hình khóa khi cất túi $\rightarrow$ Audio nền vẫn phát liên tục.
* [`uc_16_historical_guardrail_probe.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/uc_16_historical_guardrail_probe.md): Khách hỏi câu bẫy/nhạy cảm $\rightarrow$ Guardrail đính chính sự thật lịch sử.
