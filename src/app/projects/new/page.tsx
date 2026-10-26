"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/FileUploader";
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { SYNTHETIC_INSTRUCTIONS } from "@/fixtures/syntheticDemo";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFillSample = () => {
    setName("Apex Global Leaders Fellowship 2026");
    setInstructionsText(SYNTHETIC_INSTRUCTIONS);
    setDeadline("2026-11-15");
    setNotes("Applicant: Alex Mercer. Fall fellowship submission checklist.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide an application or project name.");
      return;
    }
    if (!instructionsText.trim() || instructionsText.trim().length < 10) {
      setError("Please provide the requirements or instructions text (minimum 10 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create Project
      setCurrentStep("Creating application project metadata...");
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          instructionsText: instructionsText.trim(),
          deadline: deadline || null,
          notes: notes.trim() || undefined,
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.error || "Failed to create project.");
      }

      const projectId = createData.project.id;

      // Step 2: Upload Documents (if any files were staged)
      if (files.length > 0) {
        setCurrentStep(`Uploading and extracting text from ${files.length} document(s)...`);
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Document upload and extraction failed.");
        }
      }

      // Step 3: Run Gemma Requirement Analysis & Evidence Matching
      setCurrentStep("Running Gemma open-weight requirement analysis & evidence matching...");
      const processRes = await fetch(`/api/projects/${projectId}/process`, {
        method: "POST",
      });

      const processData = await processRes.json();
      if (!processData.success) {
        throw new Error(processData.error || "Requirement analysis failed.");
      }

      // Done -> redirect to review workspace
      setCurrentStep("Finalizing checklist workspace...");
      router.push(`/projects/${projectId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tight">
              Create New Application Pack
            </h1>
            <p className="text-sm text-charcoal-600 mt-1">
              Provide application instructions and upload your documents for evidence-backed checklist generation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-sage-300 bg-sage-50 text-sage-800 text-xs font-semibold hover:bg-sage-100 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span>Fill Sample Scholarship Data</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl border border-charcoal-200 bg-paper shadow-card space-y-6">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Application / Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Knight-Hennessy Scholarship, Global Leaders Fellowship, Visa Application"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-canvas/30 text-sm text-charcoal-900 focus:bg-paper focus:border-sage-600 transition-colors"
            />
          </div>

          {/* Instructions text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="instructions" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Application Instructions & Requirements <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-charcoal-400">Paste guideline or prompt text</span>
            </div>
            <textarea
              id="instructions"
              required
              rows={7}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="Paste official requirements, instructions, or eligibility criteria..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-canvas/30 text-sm font-mono text-charcoal-900 focus:bg-paper focus:border-sage-600 transition-colors leading-relaxed"
            />
          </div>

          {/* Deadline & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="deadline" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Application Deadline (Optional)
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-canvas/30 text-sm text-charcoal-900 focus:bg-paper focus:border-sage-600 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Internal Notes (Optional)
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Student ID MST-994821, Fall priority deadline"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-canvas/30 text-sm text-charcoal-900 focus:bg-paper focus:border-sage-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="p-6 rounded-2xl border border-charcoal-200 bg-paper shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Upload Application Documents
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Upload candidate PDFs, transcripts, resumes, letters, IDs, or scans for automated matching.
              </p>
            </div>
            <span className="text-xs font-mono text-charcoal-400">PDF, TXT, PNG, JPEG</span>
          </div>

          <FileUploader files={files} onFilesChange={setFiles} />
        </div>

        {/* Submit Button & Progress Indicator */}
        <div className="pt-2">
          {isSubmitting ? (
            <div className="p-5 rounded-2xl border border-sage-200 bg-sage-50/70 shadow-card space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-sage-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm font-semibold text-sage-900">{currentStep}</span>
              </div>
              <p className="text-xs text-sage-700 font-mono">
                Running deterministic schema checks and Gemma open-weight inference...
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-charcoal-900 text-paper font-semibold text-sm hover:bg-sage-800 transition-all shadow-card hover:shadow-elevated"
            >
              <Cpu className="w-4 h-4 text-sage-400" />
              <span>Analyze Requirements & Ingest Documents</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
