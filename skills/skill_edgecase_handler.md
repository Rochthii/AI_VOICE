# Skill: Edge-Case & Fault-Tolerance Handler
TASK: Handle hardware interrupts, panic triggers, ghost touches, and network drops.
INPUT: { event_type: "panic_tap" | "ghost_touch" | "audio_interrupted" | "offline_drop", payload: any }

RULES:
1. Panic Trigger (`panic_tap` - 3 taps within 600ms):
   - Immediately mute standard audio tour.
   - Screen: Light up `bg-[#2DD4BF]` (Tactical Jade Torch).
   - Audio: Play calm emergency exit guidance at +20% volume.
2. Ghost Touch Filter (`ghost_touch`):
   - Ignore touch if `duration < 350ms` OR `contact_area < 10px`.
3. Audio Interruption (`audio_interrupted` - call/headphone disconnect):
   - Save `currentTime` to localStorage.
   - DO NOT switch to loudspeaker automatically.
   - On resume: rewound by 3 seconds for narrative continuity.
4. Offline Drop (`offline_drop` during `/api/ask`):
   - Never show crash modal.
   - Fallback to station pre-cached FAQ answer via `window.speechSynthesis`.

OUTPUT: Resilient state transition, zero unhandled errors, maximum tourist safety.
