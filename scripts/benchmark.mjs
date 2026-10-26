#!/usr/bin/env node

/**
 * ProofPocket Benchmark & Ground-Truth Evaluation Suite
 * Evaluates requirements extraction, document matching, false-positive resistance,
 * and processing latency against ground-truth fixtures.
 */

import { evaluateOutputs } from "../src/fixtures/evalSet.js";
import { GemmaProvider } from "../src/lib/gemmaProvider.js";
import { SYNTHETIC_INSTRUCTIONS, SYNTHETIC_DOCUMENTS } from "../src/fixtures/syntheticDemo.js";

async function runBenchmark() {
  console.log("=========================================================");
  console.log("  ProofPocket: Open-Weight AI Paperwork Agent Benchmark  ");
  console.log("=========================================================\n");

  const gemma = new GemmaProvider();
  console.log(`Model Provider: ${gemma.providerName}`);
  console.log(`Demo Mode:      ${gemma.isDemoMode ? "YES (Synthetic Fixtures)" : "NO (Live Inference)"}`);
  console.log("\nStarting evaluation cycle against Ground-Truth Dataset...");

  const startTime = Date.now();
  const requirements = await gemma.analyzeRequirements(SYNTHETIC_INSTRUCTIONS);
  const matches = await gemma.matchDocumentsToRequirements(requirements, SYNTHETIC_DOCUMENTS);
  const durationMs = Date.now() - startTime;

  const metrics = evaluateOutputs(
    requirements,
    matches,
    durationMs,
    gemma.providerName,
    gemma.isDemoMode
  );

  console.log("\n--- BENCHMARK RESULTS ---");
  console.log(`- Requirements Extracted:            ${metrics.totalRequirementsExtracted} / ${metrics.expectedRequirementsCount}`);
  console.log(`- Requirement Extraction Accuracy:   ${metrics.requirementExtractionAccuracyPct}%`);
  console.log(`- Document Matches Evaluated:        ${metrics.totalMatchesEvaluated}`);
  console.log(`- Match Correctness Accuracy:        ${metrics.matchCorrectnessAccuracyPct}%`);
  console.log(`- Ambiguity Detection Accuracy:      ${metrics.ambiguityDetectionAccuracyPct}%`);
  console.log(`- False-Positive Satisfied Count:    ${metrics.falsePositiveSatisfiedCount} (Target: 0)`);
  console.log(`- Total Evaluation Duration:         ${metrics.processingDurationMs} ms`);
  console.log(`- Estimated User Effort Saved:       ~${metrics.estimatedUserMinutesSaved} minutes`);
  console.log("-------------------------\n");

  if (metrics.falsePositiveSatisfiedCount > 0) {
    console.error("❌ BENCHMARK FAILED: False-positive satisfied requirement detected!");
    process.exit(1);
  } else if (metrics.matchCorrectnessAccuracyPct < 80) {
    console.error(`❌ BENCHMARK FAILED: Match correctness below threshold: ${metrics.matchCorrectnessAccuracyPct}%`);
    process.exit(1);
  } else {
    console.log("✅ ALL BENCHMARK CRITERIA PASSED: Zero false positives, accurate evidence linkage.\n");
  }
}

// If running in TypeScript transpile environment or directly
runBenchmark().catch((err) => {
  console.error("Benchmark failed with error:", err);
  process.exit(1);
});
