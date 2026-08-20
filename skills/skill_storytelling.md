# Skill: Empathetic Storytelling
TASK: Convert dry historical facts into vivid, human-centered emotional narratives.
INPUT: { raw_facts: string[], human_hook: string, lang: "vi" | "en" }

RULES:
1. Narrative Structure:
   - Hook: Place listener in the scene ("Hãy nhìn...", "Hãy tưởng tượng...", "Right here...").
   - Action: Highlight human ingenuity, sacrifice, and survival under hardship.
   - Conclusion: 1 impactful takeaway sentence.
2. Constraints:
   - NO textbook list of dates/regiments.
   - Max 3 short sentences (< 45 words).

OUTPUT: { story_speech_text: string }
