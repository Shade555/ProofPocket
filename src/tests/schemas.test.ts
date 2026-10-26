import { describe, it, expect } from "vitest";
import {
  requirementSchema,
  requirementsListSchema,
  evidenceMatchSchema,
  projectCreateSchema,
  projectUpdateSchema,
} from "@/lib/schemas";

describe("Zod Runtime Schemas", () => {
  it("validates a complete Requirement object", () => {
    const validReq = {
      id: "req_1",
      title: "Academic Transcript",
      description: "University transcript showing GPA >= 3.5",
      documentType: "Academic Transcript",
      mandatory: true,
      deadline: "2026-11-15",
      validationRules: [
        { field: "gpa", rule: "not_empty", description: "Must have GPA" },
      ],
      evidenceNeeded: "Cumulative GPA >= 3.5",
      status: "satisfied",
    };

    const parsed = requirementSchema.safeParse(validReq);
    expect(parsed.success).toBe(true);
    expect(requirementsListSchema.safeParse([validReq]).success).toBe(true);
    expect(projectUpdateSchema.safeParse({ name: "Updated" }).success).toBe(true);
  });

  it("rejects an invalid requirement status", () => {
    const invalidReq = {
      id: "req_1",
      title: "Transcript",
      description: "Desc",
      documentType: "Doc",
      mandatory: true,
      evidenceNeeded: "Evidence",
      status: "approved_by_ai", // invalid status enum!
    };

    const parsed = requirementSchema.safeParse(invalidReq);
    expect(parsed.success).toBe(false);
  });

  it("validates EvidenceMatch schema with confidence enum", () => {
    const match = {
      id: "m_1",
      requirementId: "req_1",
      documentId: "doc_1",
      documentFilename: "transcript.pdf",
      supportingExcerpt: "GPA: 3.84",
      pageReference: 1,
      explanation: "Document satisfies GPA requirement.",
      confidence: "high",
      status: "satisfied",
      userDecision: "pending",
      missingFields: [],
    };

    const parsed = evidenceMatchSchema.safeParse(match);
    expect(parsed.success).toBe(true);
  });

  it("validates project creation constraints", () => {
    const valid = projectCreateSchema.safeParse({
      name: "Scholarship 2026",
      instructionsText: "Must submit a transcript and resume by Nov 15.",
    });
    expect(valid.success).toBe(true);

    const tooShort = projectCreateSchema.safeParse({
      name: "S",
      instructionsText: "Short",
    });
    expect(tooShort.success).toBe(false);
  });
});
