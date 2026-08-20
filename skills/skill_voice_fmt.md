# Skill: Voice Stream & Cinema Ticker Formatter
TASK: Format raw LLM text into clean, 1-line Cinema Ticker speech tokens.
INPUT: { raw_text: string, lang: "vi" | "en" }

RULES:
1. Strip Markdown & Symbols: Remove `*`, `#`, `_`, `-`, `[]`, `()`, `"`, `>`, `~`, `/`.
2. Monolith Cinema Ticker Constraint:
   - Output must fit into a punchy 1-line Ticker format.
   - Max 2 short sentences, total <= 35 words.
3. Pronunciation & Phonetics:
   - "250km" -> "250 ki-lô-mét" (vi) | "250 kilometers" (en)
   - "1951" -> "năm 1951" (vi) | "in 1951" (en)
   - "3-10m" -> "3 đến 10 mét" (vi) | "3 to 10 meters" (en)
4. Natural Breathing: Use only commas `,` and periods `.` for pacing.

OUTPUT: { speech_ready_text: string, ticker_display_text: string }
