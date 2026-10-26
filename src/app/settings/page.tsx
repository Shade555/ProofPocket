"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Database,
  Eye,
  BarChart2,
  Play,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { BenchmarkMetrics } from "@/fixtures/evalSet";

interface SettingsInfo {
  authMode: string;
  gemma: {
    providerName: string;
    isDemoMode: boolean;
    modelName: string;
    hasCustomBaseUrl: boolean;
    hasApiKey: boolean;
  };
  database: {
    isConfigured: boolean;
    type: string;
    vectorSearchAvailable: boolean;
  };
  telemetry: {
    sentryEnabled: boolean;
    recentTracesCount: number;
  };
  limits: {
    maxUploadFileSizeMb: number;
    maxUploadFilesCount: number;
    allowedFormats: string[];
  };
}

export default function SettingsAndPrivacyPage() {
  const [info, setInfo] = useState<SettingsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Benchmark state
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setInfo(data.settings);
      }
    } catch {
      console.warn("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRunBenchmark = async () => {
    setBenchmarkLoading(true);
    setBenchmarkError(null);
    try {
      const res = await fetch("/api/benchmark", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBenchmarkMetrics(data.metrics);
      } else {
        setBenchmarkError(data.error || "Benchmark run failed.");
      }
    } catch {
      setBenchmarkError("Network error while running benchmark.");
    } finally {
      setBenchmarkLoading(false);
    }
  };

  if (loading || !info) {
    return (
      <div className="py-24 text-center text-charcoal-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
        <p className="text-sm">Loading system settings & privacy audit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Header */}
      <div className="pb-6 border-b border-charcoal-200">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tight">
          Settings, Privacy & Model Benchmarks
        </h1>
        <p className="text-sm text-charcoal-600 mt-1">
          Inspect open-weight inference status, database configuration, telemetry policies, and evaluation metrics.
        </p>
      </div>

      {/* Model & Inference Configuration Card */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sage-50 text-sage-800 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Google Gemma Inference Adapter
              </h2>
              <p className="text-xs text-charcoal-500">
                Configurable OpenAI-compatible hosted endpoint or local Ollama server
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
              info.gemma.isDemoMode
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-sage-50 text-sage-800 border-sage-300"
            }`}
          >
            {info.gemma.isDemoMode ? "DEMO MODE (SYNTHETIC FIXTURES)" : "LIVE ENDPOINT CONNECTED"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200 space-y-1">
            <span className="text-charcoal-500 font-medium">Provider Status</span>
            <p className="font-mono font-semibold text-charcoal-900">{info.gemma.providerName}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200 space-y-1">
            <span className="text-charcoal-500 font-medium">Model Target</span>
            <p className="font-mono font-semibold text-charcoal-900">{info.gemma.modelName}</p>
          </div>
        </div>

        {info.gemma.isDemoMode && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Offline Demo Notice</span>
            </div>
            <p className="leading-relaxed">
              ProofPocket is currently operating in <strong>Deterministic Demo Mode</strong> using synthetic
              fixtures. No live API credentials were provided via environment variables. To enable live inference:
            </p>
            <div className="font-mono bg-paper p-3 rounded-lg border border-amber-200 text-charcoal-800 space-y-1">
              <div>GEMMA_API_BASE_URL=http://localhost:11434/v1  # or your hosted endpoint</div>
              <div>GEMMA_MODEL_NAME=google/gemma-2-9b-it</div>
              <div>GEMMA_API_KEY=your_key_here  # optional for local Ollama</div>
            </div>
          </div>
        )}
      </div>

      {/* Database & Vector Search Status */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-charcoal-100 text-charcoal-800 flex items-center justify-center">
              <Database className="w-5 h-5 text-charcoal-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Persistence & Document Retrieval
              </h2>
              <p className="text-xs text-charcoal-500">
                MongoDB Atlas storage with Atlas Vector Search / keyword fallback
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full border bg-charcoal-100 text-charcoal-700 border-charcoal-200">
            {info.database.type}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200 space-y-1">
            <span className="text-charcoal-500 font-medium">Atlas Vector Search</span>
            <p className="font-mono font-semibold text-charcoal-900">
              {info.database.vectorSearchAvailable
                ? "Configured & Active"
                : "Not Configured (Keyword Fallback Active)"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200 space-y-1">
            <span className="text-charcoal-500 font-medium">Environment Access Mode</span>
            <p className="font-mono font-semibold text-charcoal-900">{info.authMode}</p>
          </div>
        </div>
      </div>

      {/* Observability & Telemetry */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
              <Eye className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Sentry Observability & Tracing
              </h2>
              <p className="text-xs text-charcoal-500">
                Tracks latency, OCR, and validation errors with strict PII scrubbing
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
              info.telemetry.sentryEnabled
                ? "bg-sage-50 text-sage-800 border-sage-300"
                : "bg-charcoal-100 text-charcoal-600 border-charcoal-200"
            }`}
          >
            {info.telemetry.sentryEnabled ? "Sentry Active" : "Telemetry Inactive"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-canvas border border-charcoal-200 text-xs text-charcoal-700 space-y-1">
          <span className="font-semibold text-charcoal-900">Privacy & PII Protection:</span>
          <p>
            ProofPocket strictly sanitizes all operational trace metadata. Raw document text,
            personal names, ID numbers, and API tokens are completely stripped before reaching
            telemetry breadcrumbs.
          </p>
        </div>
      </div>

      {/* Live Benchmark & Evaluation Suite */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sage-50 text-sage-800 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Repeatable Model Evaluation & Benchmarks
              </h2>
              <p className="text-xs text-charcoal-500">
                Tests extraction accuracy, evidence matching correctness, and ambiguity detection against ground truth
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunBenchmark}
            disabled={benchmarkLoading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800 transition-colors shadow-subtle disabled:opacity-50 self-start sm:self-auto"
          >
            {benchmarkLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-sage-400" />
            ) : (
              <Play className="w-4 h-4 text-sage-400" />
            )}
            <span>{benchmarkLoading ? "Running Benchmark..." : "Execute Evaluation Benchmark"}</span>
          </button>
        </div>

        {benchmarkError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {benchmarkError}
          </div>
        )}

        {benchmarkMetrics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">Requirement Extraction</span>
                <span className="text-xl font-serif font-bold text-charcoal-900">
                  {benchmarkMetrics.requirementExtractionAccuracyPct}%
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  {benchmarkMetrics.totalRequirementsExtracted} of {benchmarkMetrics.expectedRequirementsCount} identified
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">Match Correctness</span>
                <span className="text-xl font-serif font-bold text-sage-800">
                  {benchmarkMetrics.matchCorrectnessAccuracyPct}%
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Verified against ground truth
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">False Positive Satisfied</span>
                <span
                  className={`text-xl font-serif font-bold ${
                    benchmarkMetrics.falsePositiveSatisfiedCount === 0
                      ? "text-sage-800"
                      : "text-red-700"
                  }`}
                >
                  {benchmarkMetrics.falsePositiveSatisfiedCount}
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Zero hallucinations permitted
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">Ambiguity Detection</span>
                <span className="text-xl font-serif font-bold text-indigo-800">
                  {benchmarkMetrics.ambiguityDetectionAccuracyPct}%
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Flagged for manual review
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">Processing Latency</span>
                <span className="text-xl font-serif font-bold text-charcoal-900">
                  {benchmarkMetrics.processingDurationMs} ms
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Full extraction & matching cycle
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-charcoal-200">
                <span className="text-[11px] text-charcoal-500 block">User Effort Saved</span>
                <span className="text-xl font-serif font-bold text-charcoal-900">
                  ~{benchmarkMetrics.estimatedUserMinutesSaved} mins
                </span>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Estimated manual triage time
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-charcoal-500 flex items-center justify-between pt-1">
              <span>Evaluated model: {benchmarkMetrics.modelIdentifier}</span>
              <span>Executed: {new Date(benchmarkMetrics.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-charcoal-200 rounded-xl p-8 text-center text-xs text-charcoal-500 space-y-1">
            <p className="font-semibold text-charcoal-700">Benchmark Not Yet Executed In This Session</p>
            <p>Click &ldquo;Execute Evaluation Benchmark&rdquo; to measure accuracy and latency against ground truth fixtures.</p>
          </div>
        )}
      </div>
    </div>
  );
}
