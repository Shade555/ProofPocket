"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import {
  FolderPlus,
  Sparkles,
  Clock,
  AlertCircle,
  Trash2,
  ArrowRight,
  RefreshCw,
  FileText,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingDemo, setCreatingDemo] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError(data.error || "Failed to load projects.");
      }
    } catch {
      setError("Failed to connect to ProofPocket API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateDemoProject = async () => {
    setCreatingDemo(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createSyntheticDemo: true }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/projects/${data.project.id}`);
      } else {
        setError(data.error || "Failed to generate demo project.");
      }
    } catch {
      setError("Network error while creating demo.");
    } finally {
      setCreatingDemo(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this application pack and all associated documents?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Failed to delete project.");
      }
    } catch {
      alert("Error deleting project.");
    }
  };

  // Cumulative aggregate statistics
  const totalPacks = projects.length;
  const totalSatisfied = projects.reduce((acc, p) => acc + (p.stats?.satisfied || 0), 0);
  const totalNeedsReview = projects.reduce((acc, p) => acc + (p.stats?.needsReview || 0), 0);
  const totalMissing = projects.reduce((acc, p) => acc + (p.stats?.missing || 0), 0);
  const totalEstimatedHours = Math.round(
    projects.reduce((acc, p) => acc + (p.stats?.estimatedTimeSavedMinutes || 0), 0) / 60
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tight">
            Application Pack Dashboard
          </h1>
          <p className="text-sm text-charcoal-600 mt-1">
            Organize evidence, review verification checklists, and export review-ready document packets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCreateDemoProject}
            disabled={creatingDemo}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-sage-300 bg-sage-50 text-sage-900 text-xs font-semibold hover:bg-sage-100 transition-colors shadow-subtle disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-sage-700" />
            <span>{creatingDemo ? "Generating..." : "Spawn Synthetic Demo Pack"}</span>
          </button>

          <Link
            href="/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800 transition-colors shadow-card"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Application Pack</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-charcoal-200 bg-paper shadow-subtle space-y-1">
          <span className="text-xs text-charcoal-500 font-medium">Total Packs</span>
          <p className="text-2xl font-serif font-bold text-charcoal-900">{totalPacks}</p>
        </div>

        <div className="p-4 rounded-xl border border-sage-200 bg-sage-50/40 shadow-subtle space-y-1">
          <span className="text-xs text-sage-800 font-medium">Verified Satisfied</span>
          <p className="text-2xl font-serif font-bold text-sage-900">{totalSatisfied}</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-subtle space-y-1">
          <span className="text-xs text-amber-800 font-medium">Needs Attention / Review</span>
          <p className="text-2xl font-serif font-bold text-amber-900">{totalNeedsReview + totalMissing}</p>
        </div>

        <div className="p-4 rounded-xl border border-charcoal-200 bg-paper shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-500 font-medium">Effort Saved</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-charcoal-100 text-charcoal-600">
              Estimated
            </span>
          </div>
          <p className="text-2xl font-serif font-bold text-charcoal-900">~{totalEstimatedHours}h</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProjects}
            className="text-xs font-semibold underline underline-offset-2 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-charcoal-500 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
          <p className="text-sm">Loading application packs...</p>
        </div>
      )}

      {/* Projects List */}
      {!loading && projects.length === 0 && (
        <div className="border border-dashed border-charcoal-300 rounded-2xl p-12 text-center bg-paper/60 space-y-4">
          <div className="w-12 h-12 rounded-full bg-charcoal-100 text-charcoal-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal-900">No Application Packs Yet</h3>
            <p className="text-sm text-charcoal-500 max-w-md mx-auto mt-1">
              Start by creating a new packet or click below to explore a complete synthetic scholarship pack.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCreateDemoProject}
              className="px-4 py-2 rounded-xl bg-sage-50 text-sage-800 border border-sage-300 text-xs font-semibold hover:bg-sage-100"
            >
              Explore Sample Project
            </button>
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold hover:bg-sage-800"
            >
              Create New Pack
            </Link>
          </div>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 px-1">
            <span>Recent Application Packs ({projects.length})</span>
            <button
              type="button"
              onClick={fetchProjects}
              className="flex items-center space-x-1 text-charcoal-400 hover:text-charcoal-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              const satisfiedCount = proj.stats?.satisfied || 0;
              const missingCount = proj.stats?.missing || 0;
              const reviewCount = proj.stats?.needsReview || 0;
              const totalCount = proj.stats?.totalRequirements || proj.requirements.length;

              return (
                <div
                  key={proj.id}
                  onClick={() => router.push(`/projects/${proj.id}`)}
                  className="group border border-charcoal-200/90 rounded-2xl bg-paper p-5 shadow-card hover:border-sage-400 hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {proj.isSyntheticDemo && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Synthetic Demo
                          </span>
                        )}
                        <h3 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-sage-800 transition-colors line-clamp-1">
                          {proj.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="text-charcoal-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-charcoal-600 line-clamp-2">
                      {proj.notes || proj.instructionsText.slice(0, 120)}
                    </p>

                    {/* Deadline & Meta */}
                    <div className="flex items-center space-x-4 text-[11px] text-charcoal-500 font-mono">
                      {proj.deadline ? (
                        <span className="flex items-center space-x-1 text-amber-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {proj.deadline}</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-charcoal-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>No deadline</span>
                        </span>
                      )}
                      <span>•</span>
                      <span>{proj.documents.length} Files</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                        <span>
                          {satisfiedCount} of {totalCount} satisfied
                        </span>
                        {missingCount > 0 && (
                          <span className="text-red-700 font-medium">{missingCount} missing</span>
                        )}
                        {reviewCount > 0 && (
                          <span className="text-indigo-700 font-medium">{reviewCount} to review</span>
                        )}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-charcoal-100 overflow-hidden flex">
                        <div
                          className="bg-sage-600 h-full"
                          style={{
                            width: `${totalCount ? (satisfiedCount / totalCount) * 100 : 0}%`,
                          }}
                        />
                        <div
                          className="bg-amber-400 h-full"
                          style={{
                            width: `${totalCount ? (reviewCount / totalCount) * 100 : 0}%`,
                          }}
                        />
                        <div
                          className="bg-red-400 h-full"
                          style={{
                            width: `${totalCount ? (missingCount / totalCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal-100 flex items-center justify-between text-xs font-semibold text-sage-800 group-hover:text-sage-900 mt-4">
                    <span>Open Review Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
