"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface PackPreviewData {
  fileManifest: Array<{ path: string; sizeBytes: number; description: string }>;
  reports: {
    markdownChecklist: string;
    jsonReport: string;
    missingItemsReport: string;
    provenanceReport: string;
  };
  stats: {
    totalRequirements: number;
    satisfied: number;
    partiallySatisfied: number;
    missing: number;
    needsReview: number;
    estimatedTimeSavedMinutes: number;
  };
}

export default function PackPreviewAndDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<PackPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<
    "checklist" | "missing" | "provenance" | "json"
  >("checklist");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${id}/pack?preview=true`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || "Failed to load pack preview.");
        }
      })
      .catch(() => {
        setError("Network error fetching pack preview.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-charcoal-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
        <p className="text-sm">Generating pack manifest and preview reports...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Pack Preview Failed</h2>
        <p className="text-sm text-charcoal-600">{error || "Could not generate pack preview."}</p>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-charcoal-900 text-paper text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div className="space-y-1">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center space-x-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Evidence Review</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tight">
            Application Pack Preview & Download
          </h1>
          <p className="text-sm text-charcoal-600">
            Inspect the generated reports and file manifest before exporting your organized ZIP archive.
          </p>
        </div>

        <a
          href={`/api/projects/${id}/pack`}
          download
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-charcoal-900 text-paper font-semibold text-sm hover:bg-sage-800 transition-all shadow-card hover:shadow-elevated shrink-0"
        >
          <Download className="w-4 h-4 text-sage-400" />
          <span>Download Application Pack (ZIP)</span>
        </a>
      </div>

      {/* Safety & Integrity Guarantee Box */}
      <div className="p-4 rounded-xl border border-sage-200 bg-sage-50/50 flex items-start space-x-3 text-xs text-sage-900">
        <ShieldCheck className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">ProofPocket Safety & Verification Guarantee</span>
          <p className="text-sage-800 leading-relaxed">
            All files are copied with safe sanitized names and zip-slip path protection. Original documents
            are NEVER modified or overwritten. No fabricated dates or credentials are inserted.
          </p>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper shadow-card overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
          <div>
            <h2 className="font-serif font-bold text-lg text-charcoal-900">
              ZIP Contents Manifest
            </h2>
            <p className="text-xs text-charcoal-500">
              {data.fileManifest.length} files will be bundled in this archive
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700 font-semibold">
            ZIP-SLIP SANITIZED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-100 text-charcoal-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Archive Path</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 text-charcoal-700">
              {data.fileManifest.map((item, idx) => (
                <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-charcoal-900 flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                    <span>{item.path}</span>
                  </td>
                  <td className="py-2.5 px-3 text-charcoal-600">{item.description}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-charcoal-500">
                    {Math.round(item.sizeBytes / 1024)} KB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="border border-charcoal-200 rounded-2xl bg-paper shadow-card overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
          <h2 className="font-serif font-bold text-lg text-charcoal-900">
            Document Pack Reports Preview
          </h2>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveReportTab("checklist")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReportTab === "checklist"
                  ? "bg-charcoal-900 text-paper"
                  : "text-charcoal-600 hover:bg-charcoal-100"
              }`}
            >
              Checklist (Markdown)
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab("missing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReportTab === "missing"
                  ? "bg-charcoal-900 text-paper"
                  : "text-charcoal-600 hover:bg-charcoal-100"
              }`}
            >
              Action Items Report
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab("provenance")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReportTab === "provenance"
                  ? "bg-charcoal-900 text-paper"
                  : "text-charcoal-600 hover:bg-charcoal-100"
              }`}
            >
              Provenance Audit
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReportTab === "json"
                  ? "bg-charcoal-900 text-paper"
                  : "text-charcoal-600 hover:bg-charcoal-100"
              }`}
            >
              JSON Metadata
            </button>
          </div>
        </div>

        {/* Report Content View */}
        <div className="bg-canvas border border-charcoal-200 rounded-xl p-5 font-mono text-xs text-charcoal-800 overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap selection:bg-sage-200">
          {activeReportTab === "checklist" && data.reports.markdownChecklist}
          {activeReportTab === "missing" && data.reports.missingItemsReport}
          {activeReportTab === "provenance" && data.reports.provenanceReport}
          {activeReportTab === "json" && data.reports.jsonReport}
        </div>
      </div>
    </div>
  );
}
