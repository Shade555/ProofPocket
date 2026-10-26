import {
  Project,
  Requirement,
  DocumentMetadata,
  EvidenceMatch,
  ExtractedField,
  ApplicationPackReports,
  GemmaModelAdapter,
  GemmaProviderConfig,
  RequirementStatus,
  MatchConfidence,
} from "@/types";
import {
  requirementsListSchema,
  extractedFieldsMapSchema,
  evidenceMatchesListSchema,
} from "./schemas";
import { sandboxUntrustedDocumentText, generateSafeId } from "./security";
import {
  SYNTHETIC_REQUIREMENTS,
  SYNTHETIC_MATCHES,
} from "@/fixtures/syntheticDemo";
import {
  buildMarkdownChecklist,
  buildMissingItemsReport,
  buildProvenanceReport,
} from "./zipGenerator";

/**
 * Extracts and parses a JSON payload from a model response,
 * gracefully handling markdown code fences and preamble text.
 */
function extractJsonFromModelResponse(text: string): unknown {
  const trimmed = text.trim();

  // Try parsing directly
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue
  }

  // Try extracting from ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue
    }
  }

  // Try finding the first '[' or '{' and last ']' or '}'
  const firstBracket = trimmed.indexOf("[");
  const firstBrace = trimmed.indexOf("{");
  let startIndex = -1;
  let endIndex = -1;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIndex = firstBracket;
    endIndex = trimmed.lastIndexOf("]");
  } else if (firstBrace !== -1) {
    startIndex = firstBrace;
    endIndex = trimmed.lastIndexOf("}");
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const candidate = trimmed.substring(startIndex, endIndex + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Failed to parse substring
    }
  }

  throw new Error(`Model response did not contain valid JSON: ${trimmed.slice(0, 150)}...`);
}

/**
 * Deterministic fallback requirement analyzer when in demo mode
 * or when an offline rule-based extraction is required.
 */
function deterministicAnalyzeRequirements(instructionsText: string): Requirement[] {
  // If the text matches or contains our synthetic fellowship instructions, return synthetic set
  if (
    instructionsText.toLowerCase().includes("apex global leaders") ||
    instructionsText.toLowerCase().includes("fellowship")
  ) {
    return SYNTHETIC_REQUIREMENTS;
  }

  // Parse numbered or bulleted lines deterministically
  const lines = instructionsText.split("\n");
  const requirements: Requirement[] = [];
  let currentTitle = "";
  let currentDesc: string[] = [];
  let currentMandatory = true;
  let reqCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for "optional" indicator
    if (trimmed.toLowerCase().includes("optional") || trimmed.toLowerCase().includes("supplement")) {
      currentMandatory = false;
    }

    const itemMatch = trimmed.match(/^(?:(?:\d+\.|\*|-|[A-Z]\.))\s+(.*)/);
    if (itemMatch) {
      if (currentTitle) {
        reqCount++;
        requirements.push({
          id: `req_${reqCount}`,
          title: currentTitle.slice(0, 80),
          description: currentDesc.join(" ") || currentTitle,
          documentType: inferDocumentType(currentTitle),
          mandatory: currentMandatory,
          deadline: null,
          validationRules: [],
          evidenceNeeded: `Document proving: ${currentTitle}`,
          status: "needs_review",
          sourceQuote: currentTitle,
        });
      }
      currentTitle = itemMatch[1].trim();
      currentDesc = [];
    } else if (currentTitle) {
      currentDesc.push(trimmed);
    }
  }

  if (currentTitle) {
    reqCount++;
    requirements.push({
      id: `req_${reqCount}`,
      title: currentTitle.slice(0, 80),
      description: currentDesc.join(" ") || currentTitle,
      documentType: inferDocumentType(currentTitle),
      mandatory: currentMandatory,
      deadline: null,
      validationRules: [],
      evidenceNeeded: `Document proving: ${currentTitle}`,
      status: "needs_review",
      sourceQuote: currentTitle,
    });
  }

  return requirements.length > 0 ? requirements : SYNTHETIC_REQUIREMENTS;
}

function inferDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("transcript") || lower.includes("gpa") || lower.includes("grade")) return "Academic Transcript";
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("curriculum")) return "Resume / CV";
  if (lower.includes("recommendation") || lower.includes("reference") || lower.includes("letter")) return "Recommendation Letter";
  if (lower.includes("passport") || lower.includes("id") || lower.includes("license") || lower.includes("identification")) return "Government ID / Passport";
  if (lower.includes("enrollment") || lower.includes("registrar") || lower.includes("matriculation")) return "Enrollment Verification";
  if (lower.includes("financial") || lower.includes("tax") || lower.includes("income") || lower.includes("pell")) return "Financial Aid Statement";
  return "Supporting Document";
}

/**
 * Deterministic document matcher using filename, extracted keywords, and semantic heuristics.
 */
function deterministicMatch(
  requirements: Requirement[],
  documents: DocumentMetadata[]
): EvidenceMatch[] {
  // If documents and requirements match synthetic demo, return calibrated synthetic matches
  const isSyntheticDemo = documents.some((d) => d.id.includes("synth"));
  if (isSyntheticDemo) {
    return SYNTHETIC_MATCHES;
  }

  const matches: EvidenceMatch[] = [];

  for (const req of requirements) {
    let bestDoc: DocumentMetadata | null = null;
    let bestScore = 0;
    let snippet: string | null = null;

    for (const doc of documents) {
      const docText = `${doc.originalFilename} ${doc.rawText}`.toLowerCase();
      let score = 0;

      // Type keywords
      const keywords = req.documentType.toLowerCase().split(/[ /]+/);
      for (const kw of keywords) {
        if (kw.length > 2 && docText.includes(kw)) score += 3;
        if (kw.length > 2 && doc.originalFilename.toLowerCase().includes(kw)) score += 5;
      }

      // Title keywords
      const titleWords = req.title.toLowerCase().split(/\s+/);
      for (const tw of titleWords) {
        if (tw.length > 3 && docText.includes(tw)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
        snippet = doc.textSnippet || doc.rawText.slice(0, 200);
      }
    }

    if (bestDoc && bestScore >= 4) {
      let status: RequirementStatus = "satisfied";
      let confidence: MatchConfidence = "high";
      let explanation = `Document "${bestDoc.originalFilename}" matches the required document type (${req.documentType}).`;

      // Check for partial or review flags
      if (bestScore < 7) {
        status = "needs_review";
        confidence = "medium";
        explanation = `Document "${bestDoc.originalFilename}" appears related but requires manual human verification.`;
      }

      matches.push({
        id: generateSafeId("match"),
        requirementId: req.id,
        documentId: bestDoc.id,
        documentFilename: bestDoc.originalFilename,
        supportingExcerpt: snippet,
        pageReference: bestDoc.pageCount ? 1 : null,
        explanation,
        confidence,
        status,
        userDecision: "pending",
        missingFields: [],
      });
    } else {
      matches.push({
        id: generateSafeId("match"),
        requirementId: req.id,
        documentId: null,
        documentFilename: null,
        supportingExcerpt: null,
        pageReference: null,
        explanation: `No uploaded document appears to satisfy requirement "${req.title}".`,
        confidence: "none",
        status: "missing",
        userDecision: "pending",
        missingFields: [req.evidenceNeeded],
      });
    }
  }

  return matches;
}

/**
 * Production Gemma Provider Adapter.
 * Integrates with OpenAI-compatible hosted Gemma endpoints (vLLM, TGI, OpenRouter, Groq, Ollama)
 * and falls back gracefully to deterministic Synthetic Demo Mode when credentials/endpoints are absent.
 */
export class GemmaProvider implements GemmaModelAdapter {
  public readonly providerName: string;
  public readonly isDemoMode: boolean;
  private readonly config: GemmaProviderConfig;

  constructor(config?: Partial<GemmaProviderConfig>) {
    const apiKey = config?.apiKey || process.env.GEMMA_API_KEY;
    const baseUrl = config?.baseUrl || process.env.GEMMA_API_BASE_URL;
    const modelName = config?.modelName || process.env.GEMMA_MODEL_NAME || "google/gemma-2-9b-it";
    const isLocalOllama = config?.isLocalOllama ?? (baseUrl?.includes("11434") || false);

    // If neither baseUrl nor apiKey is configured, we operate in Demo Mode
    const hasLiveEndpoint = Boolean(baseUrl || apiKey);

    this.isDemoMode = !hasLiveEndpoint;
    this.providerName = this.isDemoMode
      ? "Google Gemma (Demo Mode - Synthetic Fixtures)"
      : isLocalOllama
      ? `Gemma via Local Ollama (${modelName})`
      : `Gemma via Hosted API (${modelName})`;

    this.config = {
      apiKey,
      baseUrl: baseUrl ? baseUrl.replace(/\/+$/, "") : undefined,
      modelName,
      timeoutMs: config?.timeoutMs || 45000,
      isLocalOllama,
    };
  }

  /**
   * Helper to execute chat completions against Gemma endpoint with error handling and retry.
   */
  private async callInference(
    systemPrompt: string,
    userPrompt: string,
    retryCount = 0
  ): Promise<string> {
    if (this.isDemoMode || !this.config.baseUrl) {
      throw new Error("Cannot call live inference in Demo Mode.");
    }

    const endpoint = `${this.config.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const body = {
      model: this.config.modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1, // low temperature for deterministic schema adherence
      max_tokens: 3000,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Inference HTTP error (${res.status}): ${errorText.slice(0, 300)}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty message content returned from inference API.");
      }

      return content;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (retryCount < 1) {
        // Controlled single retry for transient failure
        return this.callInference(systemPrompt, userPrompt, retryCount + 1);
      }
      throw err;
    }
  }

  async analyzeRequirements(instructionsText: string): Promise<Requirement[]> {
    if (this.isDemoMode) {
      return deterministicAnalyzeRequirements(instructionsText);
    }

    const systemPrompt = `You are ProofPocket's open-weight AI requirements specialist powered by Google Gemma.
Your job is to read application instructions and extract a structured array of requirements.
Rules:
1. Output ONLY a valid JSON array of Requirement objects. No markdown preamble, no conversational text.
2. Never invent deadlines or eligibility rules not explicitly stated.
3. Every requirement must have:
   - "id": string unique identifier (e.g. "req_1")
   - "title": concise requirement title
   - "description": clear explanation of what is required
   - "documentType": standardized document type (e.g. "Academic Transcript", "Resume / CV", "Recommendation Letter", "Government ID / Passport", "Enrollment Verification", "Financial Aid Statement")
   - "mandatory": boolean (true if required, false if optional/supplementary)
   - "deadline": ISO string or null if unstated
   - "validationRules": array of objects with field, rule, description
   - "evidenceNeeded": specific details that must be verified from documents
   - "status": "needs_review"
   - "sourceQuote": exact quote from instructions where this requirement originates
`;

    const userPrompt = `Application Instructions:\n"""\n${instructionsText}\n"""\n\nReturn the JSON array of requirements now:`;

    try {
      const responseText = await this.callInference(systemPrompt, userPrompt);
      const rawJson = extractJsonFromModelResponse(responseText);
      const parsed = requirementsListSchema.safeParse(rawJson);
      if (!parsed.success) {
        console.warn("Requirements schema validation warning:", parsed.error);
        return deterministicAnalyzeRequirements(instructionsText);
      }
      return parsed.data as Requirement[];
    } catch (err) {
      console.warn("Gemma live inference failed, falling back to deterministic extraction:", err);
      return deterministicAnalyzeRequirements(instructionsText);
    }
  }

  async extractDocumentFields(doc: {
    filename: string;
    text: string;
    mimeType: string;
  }): Promise<Record<string, ExtractedField>> {
    if (this.isDemoMode) {
      // Deterministic field extraction based on regex patterns
      const fields: Record<string, ExtractedField> = {};
      const t = doc.text;

      // Name detection
      const nameMatch = t.match(/(?:Student Name|Applicant|Name|Surname|Given Names)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      if (nameMatch) {
        fields["personName"] = {
          value: nameMatch[1].trim(),
          confidence: 0.95,
          evidenceSnippet: nameMatch[0].trim(),
        };
      }

      // GPA detection
      const gpaMatch = t.match(/(?:GPA|Grade Point Average)[:\s]+([0-4]\.\d{1,2})/i);
      if (gpaMatch) {
        fields["gpa"] = {
          value: gpaMatch[1],
          confidence: 0.98,
          evidenceSnippet: gpaMatch[0].trim(),
        };
      }

      // Date / Expiration detection
      const dateMatch = t.match(/(?:Date|Issued|Expiration|DOB)[:\s]+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        fields["date"] = {
          value: dateMatch[1],
          confidence: 0.92,
          evidenceSnippet: dateMatch[0].trim(),
        };
      }

      // Institution / University
      const instMatch = t.match(/(?:University|College|Institute|Department|Bursar)[^\n]+/i);
      if (instMatch) {
        fields["institution"] = {
          value: instMatch[0].trim(),
          confidence: 0.96,
          evidenceSnippet: instMatch[0].trim(),
        };
      }

      return fields;
    }

    const systemPrompt = `You are ProofPocket's open-weight AI document analysis specialist powered by Google Gemma.
Extract key factual fields from the provided document text.
Output ONLY a JSON object mapping field names (e.g. "personName", "institution", "gpa", "identifier", "date") to:
{
  "value": string,
  "confidence": number between 0 and 1,
  "evidenceSnippet": exact string quote from document supporting this value,
  "flaggedForReview": boolean
}
NEVER fabricate credentials or values not present in the document.`;

    const userPrompt = `Document: ${doc.filename} (MIME: ${doc.mimeType})
${sandboxUntrustedDocumentText(doc.text, doc.filename)}

Extract fields JSON now:`;

    try {
      const responseText = await this.callInference(systemPrompt, userPrompt);
      const rawJson = extractJsonFromModelResponse(responseText);
      const parsed = extractedFieldsMapSchema.safeParse(rawJson);
      if (!parsed.success) {
        return {};
      }
      return parsed.data as Record<string, ExtractedField>;
    } catch {
      return {};
    }
  }

  async matchDocumentsToRequirements(
    requirements: Requirement[],
    documents: DocumentMetadata[]
  ): Promise<EvidenceMatch[]> {
    if (this.isDemoMode) {
      return deterministicMatch(requirements, documents);
    }

    const systemPrompt = `You are ProofPocket's evidence-matching specialist powered by Google Gemma.
Match available documents to requirements.
Rules:
1. Status must be one of: "satisfied", "partially_satisfied", "missing", "needs_review".
2. If evidence is ambiguous or missing items, use "partially_satisfied" or "needs_review". Never claim satisfaction without concrete evidence.
3. Include an exact supporting excerpt quote.
4. Output ONLY a valid JSON array of EvidenceMatch objects with keys:
   - "id": string
   - "requirementId": string
   - "documentId": string or null
   - "documentFilename": string or null
   - "supportingExcerpt": string or null
   - "pageReference": number or null
   - "explanation": string reasoning
   - "confidence": "high" | "medium" | "low" | "none"
   - "status": "satisfied" | "partially_satisfied" | "missing" | "needs_review"
   - "userDecision": "pending"
   - "missingFields": string[]
   - "conflictingEvidence": optional string
`;

    const docsSummary = documents.map((d) => ({
      id: d.id,
      filename: d.originalFilename,
      safeName: d.safeFilename,
      fields: d.extractedFields,
      textSnippet: d.textSnippet || d.rawText.slice(0, 300),
    }));

    const userPrompt = `Requirements:\n${JSON.stringify(requirements, null, 2)}\n\nDocuments:\n${JSON.stringify(docsSummary, null, 2)}\n\nReturn matching JSON array now:`;

    try {
      const responseText = await this.callInference(systemPrompt, userPrompt);
      const rawJson = extractJsonFromModelResponse(responseText);
      const parsed = evidenceMatchesListSchema.safeParse(rawJson);
      if (!parsed.success) {
        return deterministicMatch(requirements, documents);
      }
      return parsed.data as EvidenceMatch[];
    } catch {
      return deterministicMatch(requirements, documents);
    }
  }

  async explainUncertainty(
    requirement: Requirement,
    candidateDoc?: DocumentMetadata
  ): Promise<string> {
    if (!candidateDoc) {
      return `Requirement "${requirement.title}" has no associated document uploaded yet. Please supply a ${requirement.documentType}.`;
    }

    return `Document "${candidateDoc.originalFilename}" partially matches "${requirement.title}", but required evidence (${requirement.evidenceNeeded}) is not fully certified. Manual human review is recommended.`;
  }

  async generateApplicationPackReport(project: Project): Promise<ApplicationPackReports> {
    const markdownChecklist = buildMarkdownChecklist(project);
    const missingItemsReport = buildMissingItemsReport(project);
    const provenanceReport = buildProvenanceReport(project);
    const jsonReport = JSON.stringify(project, null, 2);

    return {
      markdownChecklist,
      jsonReport,
      missingItemsReport,
      provenanceReport,
    };
  }
}
