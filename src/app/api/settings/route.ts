import { NextResponse } from "next/server";
import { isMongoConfigured, isVectorSearchConfigured } from "@/lib/db";
import { GemmaProvider } from "@/lib/gemmaProvider";
import { isTelemetryEnabled, getRecentTraceRecords } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const gemma = new GemmaProvider();

  return NextResponse.json({
    success: true,
    settings: {
      authMode: "Single-User Development / Demo Mode (Not multi-tenant production auth)",
      gemma: {
        providerName: gemma.providerName,
        isDemoMode: gemma.isDemoMode,
        modelName: process.env.GEMMA_MODEL_NAME || "google/gemma-2-9b-it",
        hasCustomBaseUrl: Boolean(process.env.GEMMA_API_BASE_URL),
        hasApiKey: Boolean(process.env.GEMMA_API_KEY),
      },
      database: {
        isConfigured: isMongoConfigured(),
        type: isMongoConfigured() ? "MongoDB Atlas" : "In-Memory Store (Zero-Config Demo Mode)",
        vectorSearchAvailable: isVectorSearchConfigured(),
      },
      telemetry: {
        sentryEnabled: isTelemetryEnabled(),
        recentTracesCount: getRecentTraceRecords().length,
      },
      limits: {
        maxUploadFileSizeMb: 15,
        maxUploadFilesCount: 10,
        allowedFormats: ["PDF", "TXT", "PNG", "JPEG"],
      },
    },
    recentTraces: getRecentTraceRecords(),
  });
}
