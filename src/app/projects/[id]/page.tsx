"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  Project,
  RequirementStatus,
  UserMatchDecision,
} from "@/types";
import { EvidenceSnippetCard } from "@/components/EvidenceSnippetCard";
import { FileUploader } from "@/components/FileUploader";
import {
  ArrowLeft,
  Package,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Upload,
  Calendar,
} from "lucide-react";

export default function ProjectReviewWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RequirementStatus | "all">("all");

  // In-project search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ text: string; source: string; score: number }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Additional file upload drawer
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      } else {
        setError(data.error || "Failed to load project.");
      }
    } catch {
      setError("Network error fetching project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Handle Search within Project
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/projects/${id}/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch {
      console.warn("Search error");
    } finally {
      setIsSearching(false);
    }
  };

  // Status updates & user overrides
  const handleUpdateRequirementStatus = async (
    reqId: string,
    newStatus: RequirementStatus
  ) => {
    if (!project) return;

    const updatedReqs = project.requirements.map((r) =>
      r.id === reqId ? { ...r, status: newStatus } : r
    );

    const updatedMatches = project.matches.map((m) =>
      m.requirementId === reqId
        ? {
            ...m,
            status: newStatus,
            userDecision: "manually_overridden" as UserMatchDecision,
          }
        : m
    );

    // Optimistic UI update
    setProject({
      ...project,
      requirements: updatedReqs,
      matches: updatedMatches,
    });

    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: updatedReqs,
          matches: updatedMatches,
        }),
      });
    } catch (err) {
      console.error("Failed to persist status override:", err);
    }
  };

  const handleConfirmMatch = async (matchId: string) => {
    if (!project) return;
    const updatedMatches = project.matches.map((m) =>
      m.id === matchId ? { ...m, userDecision: "confirmed" as UserMatchDecision } : m
    );
    setProject({ ...project, matches: updatedMatches });

    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matches: updatedMatches }),
    });
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!project) return;
    const targetMatch = project.matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatches = project.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            userDecision: "rejected" as UserMatchDecision,
            status: "missing" as RequirementStatus,
            documentId: null,
            documentFilename: null,
            supportingExcerpt: null,
          }
        : m
    );

    const updatedReqs = project.requirements.map((r) =>
      r.id === targetMatch.requirementId ? { ...r, status: "missing" as RequirementStatus } : r
    );

    setProject({ ...project, requirements: updatedReqs, matches: updatedMatches });

    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirements: updatedReqs, matches: updatedMatches }),
    });
  };

  // Upload additional files
  const handleUploadAdditional = async () => {
    if (additionalFiles.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      additionalFiles.forEach((f) => formData.append("files", f));

      const uploadRes = await fetch(`/api/projects/${id}/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Re-run matching
      await fetch(`/api/projects/${id}/process`, { method: "POST" });
      setShowUploadModal(false);
      setAdditionalFiles([]);
      await fetchProject();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-charcoal-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
        <p className="text-sm">Loading review workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Project Not Found</h2>
        <p className="text-sm text-charcoal-600">{error || "Could not retrieve project data."}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Filter requirements by tab
  const filteredRequirements = project.requirements.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const satisfiedCount = project.requirements.filter((r) => r.status === "satisfied").length;
  const partialCount = project.requirements.filter((r) => r.status === "partially_satisfied").length;
  const needsReviewCount = project.requirements.filter((r) => r.status === "needs_review").length;
  const missingCount = project.requirements.filter((r) => r.status === "missing").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1 text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
              {project.name}
            </h1>
            {project.isSyntheticDemo && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Synthetic Fixture Demo
              </span>
            )}
          </div>
          {project.deadline && (
            <p className="text-xs text-amber-800 font-mono flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Submission Deadline: {project.deadline}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-charcoal-300 bg-paper text-charcoal-800 text-xs font-semibold hover:bg-charcoal-50 shadow-subtle transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-charcoal-600" />
            <span>Add Documents</span>
          </button>

          <Link
            href={`/projects/${id}/pack`}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800 shadow-card transition-colors"
          >
            <Package className="w-4 h-4 text-sage-400" />
            <span>Review & Download Pack</span>
          </Link>
        </div>
      </div>

      {/* Progress & Verification Banner */}
      <div className="p-4 rounded-xl border border-charcoal-200 bg-paper shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-charcoal-700">
            <span>Checklist Completion Progress</span>
            <span className="text-[11px] text-charcoal-400">
              ({satisfiedCount} of {project.requirements.length} satisfied)
            </span>
          </div>
          <div className="w-full sm:w-80 h-2 bg-charcoal-100 rounded-full overflow-hidden flex">
            <div
              className="bg-sage-600 h-full"
              style={{
                width: `${(satisfiedCount / project.requirements.length) * 100}%`,
              }}
            />
            <div
              className="bg-amber-400 h-full"
              style={{
                width: `${(needsReviewCount / project.requirements.length) * 100}%`,
              }}
            />
            <div
              className="bg-red-400 h-full"
              style={{
                width: `${(missingCount / project.requirements.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="text-xs text-charcoal-500 max-w-lg italic">
          <strong>Notice:</strong> Checklist completion organizes documents and highlights
          evidence; it does NOT constitute official acceptance by the reviewing institution.
        </div>
      </div>

      {/* In-Project Retrieval Search Bar */}
      <div className="p-4 rounded-xl border border-charcoal-200 bg-canvas/40 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extracted evidence, transcript lines, GPA, or requirement terms in this project..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-charcoal-200 bg-paper text-charcoal-900 focus:border-sage-600 focus:bg-paper"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2 rounded-lg bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800 disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Retrieve Evidence"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="p-3 bg-paper rounded-lg border border-charcoal-200 space-y-2">
            <span className="text-xs font-bold text-charcoal-800">
              Retrieved Project Evidence Matches ({searchResults.length}):
            </span>
            <div className="space-y-1.5">
              {searchResults.map((res, i) => (
                <div key={i} className="text-xs p-2 rounded bg-charcoal-50 border border-charcoal-100">
                  <div className="flex items-center justify-between text-charcoal-500 text-[11px] font-mono">
                    <span>Source: {res.source}</span>
                    <span>Relevance: {res.score}</span>
                  </div>
                  <p className="text-charcoal-800 mt-1">&ldquo;{res.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-charcoal-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "all"
              ? "border-charcoal-900 text-charcoal-900"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800"
          }`}
        >
          <span>All Requirements</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-charcoal-100 text-charcoal-700">
            {project.requirements.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("satisfied")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "satisfied"
              ? "border-sage-600 text-sage-900 font-bold"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
          <span>Satisfied</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sage-100 text-sage-800">
            {satisfiedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("partially_satisfied")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "partially_satisfied"
              ? "border-amber-600 text-amber-900 font-bold"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Partially Satisfied</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
            {partialCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("needs_review")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "needs_review"
              ? "border-indigo-600 text-indigo-900 font-bold"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Needs Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
            {needsReviewCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missing")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "missing"
              ? "border-red-600 text-red-900 font-bold"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Missing</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800">
            {missingCount}
          </span>
        </button>
      </div>

      {/* Requirement Cards List */}
      <div className="space-y-4">
        {filteredRequirements.length === 0 ? (
          <div className="p-8 text-center border border-charcoal-200 rounded-xl bg-paper text-charcoal-500 text-xs">
            No requirements in this status group.
          </div>
        ) : (
          filteredRequirements.map((req) => {
            const match = project.matches.find((m) => m.requirementId === req.id);
            return (
              <EvidenceSnippetCard
                key={req.id}
                requirement={req}
                match={match}
                onUpdateStatus={(newStatus) =>
                  handleUpdateRequirementStatus(req.id, newStatus)
                }
                onConfirmMatch={() => {
                  if (match) handleConfirmMatch(match.id);
                }}
                onRejectMatch={() => {
                  if (match) handleRejectMatch(match.id);
                }}
              />
            );
          })
        )}
      </div>

      {/* Additional Files Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border border-charcoal-200 rounded-2xl max-w-xl w-full p-6 shadow-elevated space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Upload Additional Documents
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            </div>

            <FileUploader files={additionalFiles} onFilesChange={setAdditionalFiles} />

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={additionalFiles.length === 0 || isUploading}
                onClick={handleUploadAdditional}
                className="px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800 disabled:opacity-50"
              >
                {isUploading ? "Uploading & Matching..." : "Upload & Re-evaluate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
