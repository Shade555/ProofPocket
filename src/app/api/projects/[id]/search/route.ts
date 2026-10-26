import { NextRequest, NextResponse } from "next/server";
import { retrieveProjectEvidence, getProjectById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json(
      { success: false, error: `Project "${id}" not found.` },
      { status: 404 }
    );
  }

  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query.trim()) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const results = await retrieveProjectEvidence(id, query);
    return NextResponse.json({
      success: true,
      query,
      resultsCount: results.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evidence retrieval failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
