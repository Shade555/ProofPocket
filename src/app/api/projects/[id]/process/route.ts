import { NextRequest, NextResponse } from "next/server";
import { getProjectById, saveProject } from "@/lib/db";
import { GemmaProvider } from "@/lib/gemmaProvider";
import { traceProcessingStage } from "@/lib/telemetry";
import { Requirement, EvidenceMatch, RequirementStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
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

  try {
    const gemma = new GemmaProvider();

    // 1. Requirement Analysis Stage
    const requirements: Requirement[] = await traceProcessingStage(
      "requirement_analysis",
      {
        projectId: id,
        instructionsLength: project.instructionsText.length,
        modelIdentifier: gemma.providerName,
        isDemoMode: gemma.isDemoMode,
      },
      async () => gemma.analyzeRequirements(project.instructionsText)
    );

    // 2. Evidence Matching Stage
    const matches: EvidenceMatch[] = await traceProcessingStage(
      "document_matching",
      {
        projectId: id,
        requirementsCount: requirements.length,
        documentsCount: project.documents.length,
        modelIdentifier: gemma.providerName,
        isDemoMode: gemma.isDemoMode,
      },
      async () => gemma.matchDocumentsToRequirements(requirements, project.documents)
    );

    // 3. Update requirement statuses from matches
    for (const req of requirements) {
      const match = matches.find((m) => m.requirementId === req.id);
      if (match) {
        req.status = match.status as RequirementStatus;
        if (match.status === "needs_review" || match.status === "partially_satisfied") {
          req.uncertaintyExplanation = match.explanation;
        }
      } else {
        req.status = "missing";
        req.uncertaintyExplanation = "No matching uploaded document found.";
      }
    }

    // 4. Compute statistics
    const satisfied = requirements.filter((r) => r.status === "satisfied").length;
    const partiallySatisfied = requirements.filter((r) => r.status === "partially_satisfied").length;
    const missing = requirements.filter((r) => r.status === "missing").length;
    const needsReview = requirements.filter((r) => r.status === "needs_review").length;

    project.requirements = requirements;
    project.matches = matches;
    project.status = "ready_for_review";
    project.updatedAt = new Date().toISOString();
    project.stats = {
      totalRequirements: requirements.length,
      satisfied,
      partiallySatisfied,
      missing,
      needsReview,
      estimatedTimeSavedMinutes: Math.round(project.documents.length * 8 + 15),
    };

    await saveProject(project);

    return NextResponse.json({
      success: true,
      message: "Analysis and evidence matching completed successfully.",
      project,
      modelUsed: gemma.providerName,
      isDemoMode: gemma.isDemoMode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
