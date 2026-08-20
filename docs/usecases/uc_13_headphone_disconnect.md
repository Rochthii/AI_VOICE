# Use Case: UC-13 Tai Nghe Bluetooth Bị Rơi / Hết Pin
ACTOR: Du khách đang bò thì tai nghe bị rơi ra hoặc hết pin
TRIGGER: Sự kiện `audioDestination.onstatechange` hoặc ngắt kết nối Audio Output Device
STATE: `AUDIO_DEVICE_CHANGED`

STEPS:
1. Web Audio Engine bắt sự kiện mất thiết bị đầu ra (Headphone Disconnected).
2. Lập tức **TẠM DỪNG (PAUSE)** âm thanh trong vòng < 20ms.
3. TUYỆT ĐỐI KHÔNG tự động chuyển sang phát loa ngoài điện thoại (để giữ trật tự và tránh vang dội trong đường hầm kín).
4. Lưu lại vị trí `currentTime` chính xác.
5. Khi kết nối lại tai nghe hoặc cắm dây: Hiện nút "Tiếp tục nghe".

OUTCOME: Bảo đảm tính riêng tư, không làm phiền đoàn khách xung quanh, không làm mất mạch nghe của du khách.
