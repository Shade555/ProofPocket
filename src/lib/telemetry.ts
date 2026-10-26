import * as Sentry from "@sentry/nextjs";
import { sanitizeTelemetryContext } from "./security";

export interface StageTraceRecord {
  stage: "file_extraction" | "ocr" | "requirement_analysis" | "document_matching" | "schema_validation" | "pack_generation";
  durationMs: number;
  status: "success" | "error";
  modelIdentifier?: string;
  retryCount?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

// In-memory trace logs for benchmark inspection and local observability
const localTraceLogs: StageTraceRecord[] = [];

export function isTelemetryEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === "false") {
    return false;
  }
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);
}

/**
 * Traces a core processing stage, recording duration, status, and sanitized operational metadata.
 * Strictly redacts all PII, document text, and sensitive credentials.
 */
export async function traceProcessingStage<T>(
  stage: StageTraceRecord["stage"],
  metadata: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const safeMeta = sanitizeTelemetryContext(metadata);

  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;

    const record: StageTraceRecord = {
      stage,
      durationMs,
      status: "success",
      metadata: safeMeta,
      modelIdentifier: typeof safeMeta.modelIdentifier === "string" ? safeMeta.modelIdentifier : undefined,
    };
    localTraceLogs.push(record);

    if (isTelemetryEnabled()) {
      Sentry.addBreadcrumb({
        category: "proofpocket.stage",
        message: `Stage ${stage} completed successfully`,
        level: "info",
        data: {
          durationMs,
          ...safeMeta,
        },
      });
    }

    return result;
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : "Unknown stage error";

    const record: StageTraceRecord = {
      stage,
      durationMs,
      status: "error",
      error: errorMsg,
      metadata: safeMeta,
    };
    localTraceLogs.push(record);

    if (isTelemetryEnabled()) {
      Sentry.captureException(err, {
        extra: {
          stage,
          durationMs,
          ...safeMeta,
        },
        tags: {
          pipeline_stage: stage,
        },
      });
    }

    throw err;
  }
}

export function getRecentTraceRecords(): StageTraceRecord[] {
  return [...localTraceLogs].slice(-50);
}
