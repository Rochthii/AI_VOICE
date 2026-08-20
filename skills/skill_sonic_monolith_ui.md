# Skill: Sonic Monolith UI Enforcer
TASK: Enforce strict 3-Zone Monolith Layout & Zero-Scroll Tunnel Architecture.
INPUT: { component_type: "screen" | "widget", current_state: "idle" | "listening" | "speaking" }

RULES:
1. Zero-Scroll Constraint:
   - Root container MUST BE: `h-screen w-full overflow-hidden bg-[#0D0E11] select-none touch-none`.
   - NO vertical or horizontal scrollbars allowed.
2. 3-Zone Layout Contract:
   - ZONE 1 (Top 20% / `h-[20vh]`): Safety Beacon (Tunnel meters, duration, exit arrow, offline badge `#2DD4BF`).
   - ZONE 2 (Middle 50% / `h-[50vh]`): Giant 220px Sonic Orb (`w-[220px] h-[220px] rounded-full`, whole center is touchable).
   - ZONE 3 (Bottom 30% / `h-[30vh]`): Cinema Subtitle Ticker (1 line, text-xl, font-bold) + Audio scrubber bar.
3. Palette Contract:
   - Background: `#0D0E11` (Bazan Noir)
   - Accent / Orb: `#E5A93C` (Phosphor Amber)
   - Safety / Exit: `#2DD4BF` (Tactical Jade)
   - Text Primary: `#F3F4F6` (Chalk White)
4. State Morphing:
   - IDLE: Pulse glow `box-shadow: 0 0 30px rgba(229,169,60,0.2)`.
   - LISTENING: Expand scale-110, wave ripple effect, vibrate 40ms.
   - SPEAKING: Audio wave rhythm, Amber glow `#E5A93C`, 1-line ticker active.

OUTPUT: 100% compliant Sonic Monolith JSX layout & CSS classes.
