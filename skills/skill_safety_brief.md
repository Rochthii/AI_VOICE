# Skill: Safety & Spatial Reassurance
TASK: Generate concise safety & spatial briefing for underground tunnel entry.
INPUT: { station_safety: StationSafety, lang: "vi" | "en" }

RULES:
1. Format template (<= 25 words):
   - VI: "Đoạn hầm này dài {length}m, mất khoảng {time} phút di chuyển. {exit_note}. Bạn hãy thở đều và đi thong thả."
   - EN: "This section is {length}m long, taking about {time} minutes. {exit_note_en}. Please breathe steadily and move calmly."
2. Tone: Calm, reassuring, steady pacing.

OUTPUT: { safety_speech_text: string }
