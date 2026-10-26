import { describe, it, expect } from "vitest";
import { GemmaProvider } from "@/lib/gemmaProvider";
import {
  SYNTHETIC_INSTRUCTIONS,
  SYNTHETIC_REQUIREMENTS,
  SYNTHETIC_DOCUMENTS,
} from "@/fixtures/syntheticDemo";

describe("Document Matching & Evidence Linkage", () => {
  const gemma = new GemmaProvider(); // operates in deterministic demo mode

  it("extracts requirements from instructions in Demo Mode", async () => {
    const reqs = await gemma.analyzeRequirements(SYNTHETIC_INSTRUCTIONS);
    expect(reqs.length).toBeGreaterThanOrEqual(5);

    const transcriptReq = reqs.find((r) => r.id.includes("transcript"));
    expect(transcriptReq).toBeDefined();
    expect(transcriptReq?.mandatory).toBe(true);
  });

  it("links transcript evidence and marks requirement as satisfied", async () => {
    const matches = await gemma.matchDocumentsToRequirements(
      SYNTHETIC_REQUIREMENTS,
      SYNTHETIC_DOCUMENTS
    );

    const transcriptMatch = matches.find((m) => m.requirementId.includes("transcript"));
    expect(transcriptMatch).toBeDefined();
    expect(transcriptMatch?.status).toBe("satisfied");
    expect(transcriptMatch?.documentFilename).toContain("Transcript");
    expect(transcriptMatch?.supportingExcerpt).toContain("3.84");
  });

  it("flags partially satisfied requirement when only 1 of 2 recommendation letters is present", async () => {
    const matches = await gemma.matchDocumentsToRequirements(
      SYNTHETIC_REQUIREMENTS,
      SYNTHETIC_DOCUMENTS
    );

    const recMatch = matches.find((m) => m.requirementId.includes("two_rec"));
    expect(recMatch).toBeDefined();
    expect(recMatch?.status).toBe("partially_satisfied");
    expect(recMatch?.missingFields.length).toBeGreaterThan(0);
    expect(recMatch?.conflictingEvidence).toContain("1 recommendation letter");
  });

  it("flags ambiguous tuition receipt as needs_review for registrar enrollment requirement", async () => {
    const matches = await gemma.matchDocumentsToRequirements(
      SYNTHETIC_REQUIREMENTS,
      SYNTHETIC_DOCUMENTS
    );

    const enrollmentMatch = matches.find((m) => m.requirementId.includes("enrollment"));
    expect(enrollmentMatch).toBeDefined();
    expect(enrollmentMatch?.status).toBe("needs_review");
    expect(enrollmentMatch?.explanation).toContain("Registrar");
  });

  it("correctly identifies missing documents when no file matches", async () => {
    const matches = await gemma.matchDocumentsToRequirements(
      SYNTHETIC_REQUIREMENTS,
      SYNTHETIC_DOCUMENTS
    );

    const needMatch = matches.find((m) => m.requirementId.includes("financial"));
    expect(needMatch).toBeDefined();
    expect(needMatch?.status).toBe("missing");
    expect(needMatch?.documentId).toBeNull();
    expect(needMatch?.documentFilename).toBeNull();
  });
});
