import { NextResponse } from "next/server";
import { evaluateOutputs } from "@/fixtures/evalSet";
import { GemmaProvider } from "@/lib/gemmaProvider";
import { SYNTHETIC_INSTRUCTIONS, SYNTHETIC_DOCUMENTS } from "@/fixtures/syntheticDemo";

export const dynamic = "force-dynamic";

export async function POST() {
  const gemma = new GemmaProvider();
  const startTime = Date.now();

  try {
    // 1. Run extraction
    const requirements = await gemma.analyzeRequirements(SYNTHETIC_INSTRUCTIONS);

    // 2. Run matching
    const matches = await gemma.matchDocumentsToRequirements(requirements, SYNTHETIC_DOCUMENTS);

    const durationMs = Date.now() - startTime;

    // 3. Evaluate against ground truth
    const metrics = evaluateOutputs(
      requirements,
      matches,
      durationMs,
      gemma.providerName,
      gemma.isDemoMode
    );

    return NextResponse.json({
      success: true,
      message: "Benchmark suite executed successfully.",
      metrics,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Benchmark execution failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
