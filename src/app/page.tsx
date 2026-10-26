import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 border-b border-charcoal-200/60 bg-gradient-to-b from-sage-50/40 via-canvas to-canvas">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-sage-300 bg-paper text-sage-900 text-xs font-medium shadow-subtle">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span>Built Around Google&apos;s Gemma Open-Weight Model Family</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-charcoal-900 tracking-tight leading-[1.15]">
            Drop the paperwork.
            <br />
            <span className="italic font-normal text-sage-800">Review what matters.</span>
            <br />
            Get your time back.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-charcoal-600 font-sans leading-relaxed">
            ProofPocket transforms chaotic application instructions and messy document folders into an
            evidence-backed checklist and a ready-to-review submission pack.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/projects/proj_synthetic_demo"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-charcoal-900 text-paper font-semibold text-sm hover:bg-sage-800 transition-all shadow-card hover:shadow-elevated"
            >
              <span>Explore Synthetic Demo Pack</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/projects/new"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-paper text-charcoal-900 font-semibold text-sm border border-charcoal-300 hover:border-charcoal-400 hover:bg-charcoal-50/60 transition-all shadow-subtle"
            >
              <span>Create New Application Pack</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-sage-600" />
              <span>Exact Evidence Citations</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Zero Hallucinated Credentials</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-sage-600" />
              <span>Auditable Open-Weight Reasoning</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 Status Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Every requirement has an explicit, auditable status.
          </h2>
          <p className="text-sm text-charcoal-600">
            Never guess whether an uploaded PDF satisfies an application rule. ProofPocket enforces
            four clear states backed by supporting excerpts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Satisfied */}
          <div className="p-5 rounded-xl border border-sage-200 bg-sage-50/50 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-sage-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal-900">Satisfied</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Clear document match with extracted evidence verifying all mandatory criteria (e.g. transcript
              exceeding required GPA).
            </p>
          </div>

          {/* Partially Satisfied */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal-900">Partially Satisfied</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Some evidence exists, but required quantity or elements are incomplete (e.g. only 1 of 2
              required letters provided).
            </p>
          </div>

          {/* Needs Review */}
          <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-indigo-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal-900">Needs Review</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Ambiguous or conflicting document detected requiring human judgment (e.g. bursar tuition receipt
              instead of registrar verification).
            </p>
          </div>

          {/* Missing */}
          <div className="p-5 rounded-xl border border-red-200 bg-red-50/50 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal-900">Missing</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              No matching document identified in the uploaded bundle. Highlighted immediately in the action plan.
            </p>
          </div>
        </div>
      </section>

      {/* Open-Weight Gemma Architecture Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal-200 bg-paper p-8 sm:p-10 shadow-card grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-sage-50 text-sage-800 text-xs font-semibold">
              <Cpu className="w-4 h-4 text-sage-600" />
              <span>Transparent AI Engineering</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Why Open-Weight Gemma?
            </h2>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Paperwork involves sensitive personal credentials, transcripts, and financial statements. Closed
              cloud models lock your critical application data inside third-party silos.
            </p>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Google&apos;s open-weight Gemma family provides state-of-the-art reasoning that you can inspect,
              audit, and deploy on your own infrastructure (or test instantly via our deterministic offline demo).
            </p>
            <div className="pt-2">
              <Link
                href="/settings"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-sage-700 hover:text-sage-900 underline underline-offset-4"
              >
                <span>Inspect provider configuration & benchmark metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-canvas/80 border border-charcoal-200 rounded-xl p-6 font-mono text-xs text-charcoal-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-200 text-charcoal-500 font-sans text-xs">
              <span>ProofPocket AI Execution Pipeline</span>
              <span className="text-sage-700 font-semibold">Validated by Zod</span>
            </div>
            <p className="text-charcoal-500">
              {"// Step 1: Deterministic Extraction"}
              <br />
              extractPdfText(buffer) → cleanText + pageCount
            </p>
            <p className="text-charcoal-500">
              {"// Step 2: Prompt-Sandboxed Gemma Reasoning"}
              <br />
              analyzeRequirements(instructions) → Requirement[]
            </p>
            <p className="text-charcoal-500">
              {"// Step 3: Provenance & Evidence Verification"}
              <br />
              matchDocumentsToRequirements() → EvidenceMatch[]
            </p>
            <p className="text-sage-800 font-semibold">
              {"// Step 4: Safe ZIP Generation"}
              <br />
              generateApplicationPackZip() → Clean Pack + Reports
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
