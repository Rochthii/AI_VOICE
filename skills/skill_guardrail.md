# Skill: Historical Guardrail & Anti-Hallucination
TASK: Prevent hallucination & enforce verified Cu Chi historical records.
INPUT: { query: string, rag_chunks: Array<{ content: string, score: number }>, lang: "vi" | "en" }

RULES:
1. Similarity Check:
   - IF rag_chunks is EMPTY OR max(score) < 0.78:
     * RETURN { allowed: false, response: lang === "vi" ? "Xin lỗi quý khách, thông tin này chưa có trong tư liệu chính thức của Ban Quản Lý Di Tích." : "I apologize, this detail is not available in our official historical records." }
2. Content Strictness:
   - Only synthesize answer from facts explicitly in rag_chunks.
   - REJECT: Modern politics, casualty debates, ghost stories, unrelated tech questions.
   - NO guessing numbers, dates, or military tactics.

OUTPUT: { allowed: boolean, final_answer: string }
