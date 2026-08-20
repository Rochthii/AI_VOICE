# Use Case: UC-15 Màn Hình Tự Động Khóa Khi Cất Túi (Screen Sleep)
ACTOR: Du khách bỏ điện thoại vào túi quần sau khi quét QR
TRIGGER: Hệ điều hành tắt màn hình (`document.visibilityState === 'hidden'`)
STATE: `BACKGROUND_PLAYBACK`

STEPS:
1. PWA phát hiện sự kiện tab bị ẩn (`document.hidden === true`).
2. Tắt toàn bộ vòng lặp vẽ Canvas Waveform để tiết kiệm pin tối đa.
3. Kênh âm thanh Web Audio API (đã được Unlock quyền từ cử chỉ chạm ban đầu) tiếp tục duy trì luồng phát audio nền.
4. Thuyết minh tiếp tục phát đều đặn vào tai nghe du khách khi màn hình đang tắt hoàn toàn.

OUTCOME: Tiết kiệm tối đa pin OLED, du khách rảnh tay 100% khi bò dưới hầm.
