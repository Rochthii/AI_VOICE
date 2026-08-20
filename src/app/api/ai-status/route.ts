import { NextResponse } from "next/server";
import { getProviderHealthReport } from "@/lib/ai-provider-manager";

export const runtime = "nodejs";

/**
 * GET /api/ai-status
 *
 * Trả về trạng thái real-time của toàn bộ AI providers:
 *   - isHealthy: còn dùng được không
 *   - tier: độ ưu tiên (1=nhanh nhất)
 *   - failureCount: số lần thất bại liên tiếp
 *   - cooldownRemainingMs: còn bao lâu thì phục hồi
 */
export async function GET() {
  const report = getProviderHealthReport();

  const totalProviders = report.length;
  const healthyCount = report.filter((p) => p.isHealthy).length;
  const tierCounts = [1, 2, 3].map((tier) => ({
    tier,
    total: report.filter((p) => p.tier === tier).length,
    healthy: report.filter((p) => p.tier === tier && p.isHealthy).length
  }));

  return NextResponse.json({
    status: healthyCount > 0 ? "operational" : "degraded",
    summary: {
      totalProviders,
      healthyCount,
      degradedCount: totalProviders - healthyCount,
      tierBreakdown: tierCounts
    },
    providers: report,
    timestamp: new Date().toISOString()
  });
}
