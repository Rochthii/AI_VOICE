# Skill: UI/UX Micro-Interactions & State Physics
TASK: Enforce tactile physics, gesture handling, and state morphing for underground UX.
INPUT: { interaction_event: "touch_down" | "touch_up" | "cancel" | "ai_stream", current_state: string }

RULES:
1. Touch Gesture Engine:
   - `onTouchStart` / `onMouseDown` on Zone 2 Orb:
     * Haptic: `navigator.vibrate(40)`
     * Sound Cue: Play soft woodblock click (120Hz, 30ms).
     * Scale: Morph Orb from `scale-100` -> `scale-110` with `transition: transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)`.
     * State -> `LISTENING`.
   - `onTouchEnd` / `onMouseUp`:
     * Haptic: `navigator.vibrate([20, 30, 20])`.
     * State -> `PROCESSING` (Orb pulsates at 1.2Hz frequency).
2. Canvas Visualizer Physics:
   - FFT size: 256, smoothingTimeConstant: 0.8.
   - Ripple geometry: 3 concentric bezier circles radiating outward from center.
   - Color gradient: Inner `#E5A93C` -> Outer `rgba(229, 169, 60, 0)`.
3. Cinema Ticker Motion:
   - Single-line marquee or smooth cross-fade (`opacity 200ms ease-in-out`).
   - Font: `text-xl md:text-2xl font-bold tracking-wide text-[#F3F4F6]`.
4. Dark Vision Protection:
   - Never use pure white backgrounds or hard flashing white light (No white spinners/modals).
   - All transitions use smooth dark cross-fade (`duration-300`).

OUTPUT: Bulletproof reactive UI states, zero touch-lag, seamless tactile audio feedback.
