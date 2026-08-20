import { NextResponse } from "next/server";
import { getProviderHealthReport } from "@/lib/ai-provider-manager";
import { semanticCache } from "@/lib/semantic-cache";

export const runtime = "nodejs";

/**
 * GET /api/ai-status
 * Dashboard monitoring: provider health + cache stats + token budget info
 */
export async function GET() {
  const providers = getProviderHealthReport();
  const cache = semanticCache.stats();

  const healthyCount = providers.filter((p) => p.isHealthy).length;
  const tierBreakdown = [1, 2, 3].map((tier) => ({
    tier,
    total: providers.filter((p) => p.tier === tier).length,
    healthy: providers.filter((p) => p.tier === tier && p.isHealthy).length
  }));

  return NextResponse.json({
    status: healthyCount > 0 ? "operational" : "degraded",
    summary: {
      totalProviders: providers.length,
      healthyCount,
      degradedCount: providers.length - healthyCount,
      tierBreakdown
    },
    providers,
    cache: {
      ...cache,
      ttlMinutes: 30,
      description: "Semantic Cache — lưu câu trả lời để tái dùng, tiết kiệm token"
    },
    tokenBudget: {
      targetPerRequest: "≤ 600 tokens",
      breakdown: {
        systemRole: "≤ 120 tokens",
        contextInjection: "≤ 250 tokens (1 section liên quan)",
        historyCompressed: "≤ 60 tokens (tóm tắt, không raw turns)",
        userQuery: "≤ 50 tokens",
        aiResponse: "≤ 120 tokens (max_tokens)"
      },
      groqFreeCapacity: "~14.400 tokens/phút → 24+ requests/phút"
    },
    pipeline: [
      { step: 0, name: "Guardrail", latency: "0ms", tokens: 0 },
      { step: 1, name: "Semantic Cache", latency: "0ms", tokens: 0 },
      { step: 2, name: "Query Classifier", latency: "1ms", tokens: 0 },
      { step: 3, name: "RAG In-Memory", latency: "0.2ms", tokens: 0 },
      { step: 4, name: "Streaming AI", latency: "1-1.5s", tokens: "≤600" },
      { step: 5, name: "RAG Offline Fallback", latency: "0ms", tokens: 0 }
    ],
    timestamp: new Date().toISOString()
  });
}
