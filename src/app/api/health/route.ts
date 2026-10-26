import { NextResponse } from "next/server";
import { isMongoConfigured, isVectorSearchConfigured } from "@/lib/db";
import { GemmaProvider } from "@/lib/gemmaProvider";
import { isTelemetryEnabled } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const gemma = new GemmaProvider();

  return NextResponse.json(
    {
      status: "healthy",
      service: "ProofPocket Open-Weight Paperwork Agent",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      integrations: {
        database: {
          configured: isMongoConfigured(),
          mode: isMongoConfigured() ? "MongoDB Atlas" : "In-Memory Store (Demo Mode)",
          vectorSearch: isVectorSearchConfigured(),
        },
        inference: {
          providerName: gemma.providerName,
          isDemoMode: gemma.isDemoMode,
          modelName: process.env.GEMMA_MODEL_NAME || "google/gemma-2-9b-it",
        },
        observability: {
          sentryEnabled: isTelemetryEnabled(),
        },
      },
    },
    { status: 200 }
  );
}
