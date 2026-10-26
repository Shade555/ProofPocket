import { Requirement, EvidenceMatch } from "@/types";
import { SYNTHETIC_INSTRUCTIONS, SYNTHETIC_DOCUMENTS } from "./syntheticDemo";

export interface EvaluationGroundTruth {
  instructions: string;
  expectedRequirementCount: number;
  expectedRequirements: Array<{
    idSubstring: string;
    mandatory: boolean;
    expectedStatus: string;
    mustMention: string[];
  }>;
  expectedMatches: Array<{
    requirementIdSubstring: string;
    expectedDocFilename: string | null;
    expectedStatus: string;
    expectedConfidence: string;
    isAmbiguousOrPartial: boolean;
  }>;
}

export const GROUND_TRUTH_EVAL_SET: EvaluationGroundTruth = {
  instructions: SYNTHETIC_INSTRUCTIONS,
  expectedRequirementCount: 6,
  expectedRequirements: [
    {
      idSubstring: "transcript",
      mandatory: true,
      expectedStatus: "satisfied",
      mustMention: ["Transcript", "GPA", "3.5"]
    },
    {
      idSubstring: "resume",
      mandatory: true,
      expectedStatus: "satisfied",
      mustMention: ["CV", "Resume", "leadership"]
    },
    {
      idSubstring: "two_rec",
      mandatory: true,
      expectedStatus: "partially_satisfied",
      mustMention: ["Recommendation", "2", "Two"]
    },
    {
      idSubstring: "photo_id",
      mandatory: true,
      expectedStatus: "satisfied",
      mustMention: ["Identification", "Passport"]
    },
    {
      idSubstring: "enrollment",
      mandatory: true,
      expectedStatus: "needs_review",
      mustMention: ["Enrollment", "Registrar", "Fall 2026"]
    },
    {
      idSubstring: "financial",
      mandatory: false,
      expectedStatus: "missing",
      mustMention: ["Financial", "Need"]
    }
  ],
  expectedMatches: [
    {
      requirementIdSubstring: "transcript",
      expectedDocFilename: "Alex_Mercer_Academic_Transcript_2026.pdf",
      expectedStatus: "satisfied",
      expectedConfidence: "high",
      isAmbiguousOrPartial: false
    },
    {
      requirementIdSubstring: "resume",
      expectedDocFilename: "Alex_Mercer_Curriculum_Vitae_2026.pdf",
      expectedStatus: "satisfied",
      expectedConfidence: "high",
      isAmbiguousOrPartial: false
    },
    {
      requirementIdSubstring: "two_rec",
      expectedDocFilename: "Recommendation_Letter_Prof_Patel.pdf",
      expectedStatus: "partially_satisfied",
      expectedConfidence: "medium",
      isAmbiguousOrPartial: true
    },
    {
      requirementIdSubstring: "photo_id",
      expectedDocFilename: "Passport_Scan_Alex_Mercer.jpg",
      expectedStatus: "satisfied",
      expectedConfidence: "high",
      isAmbiguousOrPartial: false
    },
    {
      requirementIdSubstring: "enrollment",
      expectedDocFilename: "Spring_Tuition_Receipt_2026.pdf",
      expectedStatus: "needs_review",
      expectedConfidence: "low",
      isAmbiguousOrPartial: true
    },
    {
      requirementIdSubstring: "financial",
      expectedDocFilename: null,
      expectedStatus: "missing",
      expectedConfidence: "none",
      isAmbiguousOrPartial: false
    }
  ]
};

export interface BenchmarkMetrics {
  timestamp: string;
  modelIdentifier: string;
  isDemoMode: boolean;
  totalRequirementsExtracted: number;
  expectedRequirementsCount: number;
  requirementExtractionAccuracyPct: number;
  totalMatchesEvaluated: number;
  matchCorrectnessAccuracyPct: number;
  falsePositiveSatisfiedCount: number;
  ambiguityDetectionAccuracyPct: number;
  processingDurationMs: number;
  estimatedUserMinutesSaved: number;
}

/**
 * Runs deterministic comparison between extracted requirements/matches and the Ground Truth evaluation set.
 */
export function evaluateOutputs(
  requirements: Requirement[],
  matches: EvidenceMatch[],
  durationMs: number,
  modelName: string,
  isDemoMode: boolean
): BenchmarkMetrics {
  const gt = GROUND_TRUTH_EVAL_SET;

  // 1. Evaluate requirement extraction
  let reqsMatched = 0;
  for (const expected of gt.expectedRequirements) {
    const found = requirements.find(
      (r) =>
        r.id.toLowerCase().includes(expected.idSubstring) ||
        expected.mustMention.every((kw) =>
          (r.title + " " + r.description).toLowerCase().includes(kw.toLowerCase())
        )
    );
    if (found && found.mandatory === expected.mandatory) {
      reqsMatched++;
    }
  }
  const reqAccuracy = (reqsMatched / gt.expectedRequirements.length) * 100;

  // 2. Evaluate match correctness & false positives
  let matchesCorrect = 0;
  let falsePositiveSatisfied = 0;
  let ambiguityDetectedCorrectly = 0;
  let ambiguityTargetCount = 0;

  for (const expectedMatch of gt.expectedMatches) {
    const match = matches.find((m) =>
      m.requirementId.toLowerCase().includes(expectedMatch.requirementIdSubstring)
    );

    if (match) {
      const docMatches =
        expectedMatch.expectedDocFilename === null
          ? match.documentFilename === null
          : match.documentFilename?.toLowerCase() === expectedMatch.expectedDocFilename.toLowerCase();

      const statusMatches = match.status === expectedMatch.expectedStatus;

      if (docMatches && statusMatches) {
        matchesCorrect++;
      }

      // Check false positive: if ground truth is missing or needs_review, but model flagged "satisfied"
      if (
        (expectedMatch.expectedStatus === "missing" ||
          expectedMatch.expectedStatus === "needs_review" ||
          expectedMatch.expectedStatus === "partially_satisfied") &&
        match.status === "satisfied"
      ) {
        falsePositiveSatisfied++;
      }

      if (expectedMatch.isAmbiguousOrPartial) {
        ambiguityTargetCount++;
        if (match.status === "needs_review" || match.status === "partially_satisfied") {
          ambiguityDetectedCorrectly++;
        }
      }
    }
  }

  const matchAccuracy = (matchesCorrect / gt.expectedMatches.length) * 100;
  const ambiguityAccuracy =
    ambiguityTargetCount > 0 ? (ambiguityDetectedCorrectly / ambiguityTargetCount) * 100 : 100;

  // Estimated user minutes saved: 8 mins per document manual verification + 15 mins drafting checklist
  const estimatedUserMinutesSaved = Math.round(SYNTHETIC_DOCUMENTS.length * 8 + 15);

  return {
    timestamp: new Date().toISOString(),
    modelIdentifier: modelName,
    isDemoMode,
    totalRequirementsExtracted: requirements.length,
    expectedRequirementsCount: gt.expectedRequirementCount,
    requirementExtractionAccuracyPct: Math.round(reqAccuracy * 10) / 10,
    totalMatchesEvaluated: matches.length,
    matchCorrectnessAccuracyPct: Math.round(matchAccuracy * 10) / 10,
    falsePositiveSatisfiedCount: falsePositiveSatisfied,
    ambiguityDetectionAccuracyPct: Math.round(ambiguityAccuracy * 10) / 10,
    processingDurationMs: durationMs,
    estimatedUserMinutesSaved
  };
}
