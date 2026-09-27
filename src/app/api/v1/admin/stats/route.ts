import { NextRequest, NextResponse } from "next/server";
import { getAdminOverviewStats } from "@/server/queries";
import { verifyAdminApiRequest } from "@/lib/api/auth";

// GET /api/v1/admin/stats
// AI Agent retrieves real-time dashboard admin metrics
export async function GET(req: NextRequest) {
  const auth = await verifyAdminApiRequest(req, "admin:manage");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const stats = await getAdminOverviewStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("GET /api/v1/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat statistik admin" },
      { status: 500 }
    );
  }
}
