export type RequirementStatus = "satisfied" | "partially_satisfied" | "missing" | "needs_review";

export type MatchConfidence = "high" | "medium" | "low" | "none";

export type UserMatchDecision = "pending" | "confirmed" | "rejected" | "manually_overridden";

export type ExtractionMethod = "pdf-text" | "ocr" | "text-native" | "fixture";

export interface ValidationRule {
  field: string;
  rule: "contains" | "regex" | "date_before" | "date_after" | "not_empty";
  expected?: string;
  description: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  documentType: string;
  mandatory: boolean;
  deadline: string | null;
  validationRules: ValidationRule[];
  evidenceNeeded: string;
  status: RequirementStatus;
  uncertaintyExplanation?: string;
  sourceQuote?: string;
}

export interface ExtractedField {
  value: string;
  confidence: number;
  evidenceSnippet?: string;
  flaggedForReview?: boolean;
}

export interface DocumentMetadata {
  id: string;
  projectId: string;
  originalFilename: string;
  safeFilename: string;
  suggestedFilename?: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  pageCount?: number;
  extractionMethod: ExtractionMethod;
  rawText: string;
  textSnippet: string;
  extractedFields: Record<string, ExtractedField>;
  fileBufferBase64?: string; // used for generating the final pack
}

export interface EvidenceMatch {
  id: string;
  requirementId: string;
  documentId: string | null;
  documentFilename: string | null;
  supportingExcerpt: string | null;
  pageReference: number | null;
  explanation: string;
  confidence: MatchConfidence;
  status: RequirementStatus;
  userDecision: UserMatchDecision;
  missingFields: string[];
  conflictingEvidence?: string;
}

export interface ProjectStats {
  totalRequirements: number;
  satisfied: number;
  partiallySatisfied: number;
  missing: number;
  needsReview: number;
  estimatedTimeSavedMinutes: number;
}

export interface Project {
  id: string;
  name: string;
  instructionsText: string;
  deadline: string | null;
  notes?: string;
  status: "draft" | "processing" | "ready_for_review" | "completed";
  createdAt: string;
  updatedAt: string;
  documents: DocumentMetadata[];
  requirements: Requirement[];
  matches: EvidenceMatch[];
  isSyntheticDemo?: boolean;
  stats: ProjectStats;
}

export interface ApplicationPackReports {
  markdownChecklist: string;
  jsonReport: string;
  missingItemsReport: string;
  provenanceReport: string;
}

export interface GemmaProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
  timeoutMs?: number;
  isLocalOllama?: boolean;
}

export interface GemmaModelAdapter {
  providerName: string;
  isDemoMode: boolean;
  analyzeRequirements(instructionsText: string): Promise<Requirement[]>;
  extractDocumentFields(doc: {
    filename: string;
    text: string;
    mimeType: string;
  }): Promise<Record<string, ExtractedField>>;
  matchDocumentsToRequirements(
    requirements: Requirement[],
    documents: DocumentMetadata[]
  ): Promise<EvidenceMatch[]>;
  explainUncertainty(
    requirement: Requirement,
    candidateDoc?: DocumentMetadata
  ): Promise<string>;
  generateApplicationPackReport(project: Project): Promise<ApplicationPackReports>;
}
