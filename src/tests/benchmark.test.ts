import { describe, it, expect } from "vitest";
import { evaluateOutputs } from "@/fixtures/evalSet";
import { GemmaProvider } from "@/lib/gemmaProvider";
import {
  SYNTHETIC_INSTRUCTIONS,
  SYNTHETIC_DOCUMENTS,
} from "@/fixtures/syntheticDemo";

describe("Benchmark Evaluation Suite", () => {
  it("evaluates requirements and matches against Ground Truth with 0 false positives", async () => {
    const gemma = new GemmaProvider();
    const startTime = Date.now();

    const reqs = await gemma.analyzeRequirements(SYNTHETIC_INSTRUCTIONS);
    const matches = await gemma.matchDocumentsToRequirements(reqs, SYNTHETIC_DOCUMENTS);
    const duration = Date.now() - startTime;

    const metrics = evaluateOutputs(
      reqs,
      matches,
      duration,
      gemma.providerName,
      gemma.isDemoMode
    );

    expect(metrics.totalRequirementsExtracted).toBe(6);
    expect(metrics.requirementExtractionAccuracyPct).toBe(100);
    expect(metrics.matchCorrectnessAccuracyPct).toBe(100);
    expect(metrics.falsePositiveSatisfiedCount).toBe(0); // Zero hallucinations!
    expect(metrics.ambiguityDetectionAccuracyPct).toBe(100);
    expect(metrics.estimatedUserMinutesSaved).toBeGreaterThan(30);
  });
});
