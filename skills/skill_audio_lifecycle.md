# Skill: Web Audio Lifecycle & iOS Autoplay
TASK: Manage browser audio context, hardware microphone, and prevent memory leaks.

RULES:
1. Unlock iOS Autoplay:
   - On first touch/gesture (`touchstart` / `click`), instantiate singleton `AudioContext` and play 0.01s silent buffer.
2. Hardware Mic Release:
   - On recording stop: call `mediaRecorder.stop()`, then `stream.getTracks().forEach(t => t.stop())`.
3. Tab Visibility Power-Saving:
   - When `document.visibilityState === 'hidden'`: call `audioContext.suspend()` and cancel `requestAnimationFrame`.
   - When `document.visibilityState === 'visible'`: call `audioContext.resume()`.

OUTPUT: Zero memory leak, clean mic icon release, 100% iOS Safari compatibility.
