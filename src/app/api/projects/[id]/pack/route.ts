import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/db";
import { generateApplicationPackZip } from "@/lib/zipGenerator";
import { traceProcessingStage } from "@/lib/telemetry";
import { sanitizeSafeFilename } from "@/lib/security";

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

  const searchParams = req.nextUrl.searchParams;
  const isPreview = searchParams.get("preview") === "true";

  try {
    const packResult = await traceProcessingStage(
      "pack_generation",
      {
        projectId: id,
        requirementsCount: project.requirements.length,
        documentsCount: project.documents.length,
        isPreview,
      },
      async () => generateApplicationPackZip(project)
    );

    // If preview requested, return structure without binary payload
    if (isPreview) {
      return NextResponse.json({
        success: true,
        fileManifest: packResult.fileManifest,
        reports: packResult.reports,
        stats: project.stats,
      });
    }

    // Binary ZIP download
    const safeProjectName = sanitizeSafeFilename(project.name).replace(/\.[^/.]+$/, "");
    const downloadFilename = `ProofPocket_${safeProjectName || "Pack"}.zip`;

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", `attachment; filename="${downloadFilename}"`);
    headers.set("Content-Length", packResult.zipBuffer.length.toString());

    return new NextResponse(new Uint8Array(packResult.zipBuffer), {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate application pack";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
