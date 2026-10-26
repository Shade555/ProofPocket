import { z } from "zod";

export const requirementStatusSchema = z.enum([
  "satisfied",
  "partially_satisfied",
  "missing",
  "needs_review",
]);

export const matchConfidenceSchema = z.enum(["high", "medium", "low", "none"]);

export const userMatchDecisionSchema = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "manually_overridden",
]);

export const extractionMethodSchema = z.enum([
  "pdf-text",
  "ocr",
  "text-native",
  "fixture",
]);

export const validationRuleSchema = z.object({
  field: z.string(),
  rule: z.enum(["contains", "regex", "date_before", "date_after", "not_empty"]),
  expected: z.string().optional(),
  description: z.string(),
});

export const requirementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  documentType: z.string(),
  mandatory: z.boolean().default(true),
  deadline: z.string().nullable().optional().default(null),
  validationRules: z.array(validationRuleSchema).default([]),
  evidenceNeeded: z.string(),
  status: requirementStatusSchema.default("needs_review"),
  uncertaintyExplanation: z.string().optional(),
  sourceQuote: z.string().optional(),
});

export const requirementsListSchema = z.array(requirementSchema);

export const extractedFieldSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
  evidenceSnippet: z.string().optional(),
  flaggedForReview: z.boolean().optional().default(false),
});

export const extractedFieldsMapSchema = z.record(extractedFieldSchema);

export const evidenceMatchSchema = z.object({
  id: z.string(),
  requirementId: z.string(),
  documentId: z.string().nullable(),
  documentFilename: z.string().nullable(),
  supportingExcerpt: z.string().nullable(),
  pageReference: z.number().nullable().optional().default(null),
  explanation: z.string(),
  confidence: matchConfidenceSchema,
  status: requirementStatusSchema,
  userDecision: userMatchDecisionSchema.default("pending"),
  missingFields: z.array(z.string()).default([]),
  conflictingEvidence: z.string().optional(),
});

export const evidenceMatchesListSchema = z.array(evidenceMatchSchema);

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters").max(120),
  instructionsText: z.string().trim().min(10, "Instructions must be at least 10 characters"),
  deadline: z.string().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  deadline: z.string().nullable().optional(),
  notes: z.string().max(1000).optional(),
  matches: z.array(evidenceMatchSchema).optional(),
  requirements: z.array(requirementSchema).optional(),
});

export const settingsSchema = z.object({
  gemmaApiBaseUrl: z.string().url().optional().or(z.literal("")),
  gemmaApiKey: z.string().optional().or(z.literal("")),
  gemmaModelName: z.string().min(1).default("google/gemma-2-9b-it"),
  isLocalOllama: z.boolean().default(false),
  consentExternalInference: z.boolean().default(false),
});

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().optional().default("3000"),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB_NAME: z.string().default("proofpocket"),
  GEMMA_API_KEY: z.string().optional(),
  GEMMA_API_BASE_URL: z.string().optional(),
  GEMMA_MODEL_NAME: z.string().default("google/gemma-2-9b-it"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_ENABLED: z.string().optional().default("true"),
  MAX_UPLOAD_FILE_SIZE_MB: z.string().default("15"),
  MAX_UPLOAD_FILES_COUNT: z.string().default("10"),
});
