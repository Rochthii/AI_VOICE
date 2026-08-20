# Skill: In-Memory Vector Math & Fast Cosine Ranking
TASK: Perform zero-dependency Float32 Cosine Similarity search over 50 pre-embedded history chunks.
INPUT: { query_vector: number[], knowledge_chunks: Array<{ chunk_id: string, embedding: number[], content: string }>, top_k: number }

RULES:
1. Pure Math Cosine Formula (No external vector libraries):
   - `dot_product(A, B) = sum(A[i] * B[i])`
   - `magnitude(A) = sqrt(sum(A[i]^2))`
   - `cosine_similarity(A, B) = dot_product(A, B) / (magnitude(A) * magnitude(B))`
2. Performance & Memory Contract:
   - Must execute in < 1ms for 50 chunks on mobile CPU.
   - Bundle size impact: 0 KB (Native TypeScript implementation).
3. Score Thresholding:
   - Filter matches with `score >= 0.78`.
   - If highest score < 0.78 -> return empty array (Trigger Historical Refusal).

OUTPUT: { top_matches: Array<{ chunk_id: string, score: number, content: string }> }
