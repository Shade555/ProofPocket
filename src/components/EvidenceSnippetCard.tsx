"use client";

import React, { useState } from "react";
import { Requirement, EvidenceMatch, RequirementStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import {
  FileText,
  AlertTriangle,
  Check,
  X,
  HelpCircle,
  Quote,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from "lucide-react";

interface EvidenceSnippetCardProps {
  requirement: Requirement;
  match?: EvidenceMatch;
  onUpdateStatus: (newStatus: RequirementStatus) => void;
  onConfirmMatch: () => void;
  onRejectMatch: () => void;
  onRenameSuggestedDoc?: (docId: string, newName: string) => void;
}

export function EvidenceSnippetCard({
  requirement,
  match,
  onUpdateStatus,
  onConfirmMatch,
  onRejectMatch,
}: EvidenceSnippetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);

  const status = requirement.status;

  return (
    <div className="border border-charcoal-200/90 rounded-xl bg-paper shadow-card overflow-hidden transition-all hover:border-charcoal-300">
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 bg-canvas/30">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-charcoal-400 uppercase font-semibold">
              {requirement.id}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700 font-medium">
              {requirement.documentType}
            </span>
            {requirement.mandatory ? (
              <span className="text-[11px] px-2 py-0.5 rounded bg-charcoal-900 text-paper font-semibold">
                Mandatory
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-600">
                Optional
              </span>
            )}
            {requirement.deadline && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                Due: {requirement.deadline}
              </span>
            )}
          </div>
          <h3 className="text-base font-serif font-bold text-charcoal-900 tracking-tight">
            {requirement.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <StatusBadge status={status} size="md" />
          {match && <ConfidenceBadge confidence={match.confidence} />}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Requirement description */}
        <p className="text-sm text-charcoal-700 leading-relaxed">
          {requirement.description}
        </p>

        {/* Source Instructions Quote */}
        {requirement.sourceQuote && (
          <div className="flex items-start space-x-2 text-xs text-charcoal-600 bg-charcoal-50 p-2.5 rounded-lg border border-charcoal-100 italic">
            <Quote className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
            <span>&ldquo;{requirement.sourceQuote}&rdquo;</span>
          </div>
        )}

        {/* Match Details & Evidence */}
        {match && match.documentFilename ? (
          <div className="border border-charcoal-200 rounded-lg p-3.5 bg-paper space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sage-700" />
                <span className="text-xs font-semibold text-charcoal-900">
                  {match.documentFilename}
                </span>
                {match.pageReference && (
                  <span className="text-[11px] font-mono text-charcoal-500 bg-charcoal-100 px-1.5 py-0.5 rounded">
                    Page {match.pageReference}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-charcoal-500">
                Decision: {match.userDecision.toUpperCase()}
              </span>
            </div>

            {/* Supporting quote snippet */}
            {match.supportingExcerpt && (
              <div className="border-l-2 border-sage-500 pl-3 py-1 bg-sage-50/40 rounded-r text-xs text-charcoal-800 font-mono leading-relaxed">
                <span className="text-[10px] uppercase font-bold text-sage-800 tracking-wider block mb-1">
                  Extracted Evidence Excerpt:
                </span>
                {match.supportingExcerpt}
              </div>
            )}

            {/* Match reasoning */}
            <p className="text-xs text-charcoal-600">
              <span className="font-semibold text-charcoal-800">Reasoning: </span>
              {match.explanation}
            </p>

            {/* Conflicting Evidence Alert */}
            {match.conflictingEvidence && (
              <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Conflicting Evidence Detected: </span>
                  {match.conflictingEvidence}
                </div>
              </div>
            )}

            {/* Missing fields */}
            {match.missingFields && match.missingFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-charcoal-600">
                <span className="font-semibold text-charcoal-700">Missing Elements:</span>
                {match.missingFields.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[11px]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-charcoal-200 rounded-lg p-3.5 bg-canvas text-xs text-charcoal-600 space-y-1">
            <p className="font-semibold text-charcoal-800">No Document Assigned Yet</p>
            <p>
              Evidence required:{" "}
              <span className="font-mono text-charcoal-700">{requirement.evidenceNeeded}</span>
            </p>
          </div>
        )}

        {/* Uncertainty note */}
        {requirement.uncertaintyExplanation && !match?.conflictingEvidence && (
          <div className="flex items-start space-x-2 text-xs text-charcoal-600 bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong className="font-semibold text-indigo-900">Agent Note: </strong>
              {requirement.uncertaintyExplanation}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-canvas/60 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {match && (
            <>
              <button
                type="button"
                onClick={onConfirmMatch}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 text-sage-800 border border-sage-300 hover:bg-sage-100 transition-colors shadow-subtle"
                title="Confirm AI match"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Match</span>
              </button>

              <button
                type="button"
                onClick={onRejectMatch}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors shadow-subtle"
                title="Reject AI match"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* Manual override button */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowOverrideMenu(!showOverrideMenu)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 border border-charcoal-200 bg-paper hover:bg-charcoal-50 transition-colors shadow-subtle"
            >
              <span>Override Status</span>
              <ChevronDown className="w-3 h-3 text-charcoal-400" />
            </button>

            {showOverrideMenu && (
              <div className="absolute left-0 mt-1.5 w-44 rounded-lg bg-paper border border-charcoal-200 shadow-elevated z-30 py-1 text-xs">
                {(
                  [
                    "satisfied",
                    "partially_satisfied",
                    "needs_review",
                    "missing",
                  ] as RequirementStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onUpdateStatus(s);
                      setShowOverrideMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-charcoal-50 capitalize flex items-center justify-between ${
                      status === s ? "font-bold text-sage-800 bg-sage-50/50" : "text-charcoal-700"
                    }`}
                  >
                    <span>{s.replace("_", " ")}</span>
                    {status === s && <Check className="w-3 h-3 text-sage-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-charcoal-500 hover:text-charcoal-800 flex items-center space-x-1 py-1"
        >
          <span>{expanded ? "Hide Details" : "Inspect Validation Rules"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded validation rules section */}
      {expanded && (
        <div className="p-4 bg-charcoal-50 border-t border-charcoal-100 text-xs space-y-2">
          <div className="font-semibold text-charcoal-800 flex items-center space-x-1.5">
            <FileCheck2 className="w-4 h-4 text-charcoal-600" />
            <span>Deterministic Rules & Evidence Expectations:</span>
          </div>
          {requirement.validationRules.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-charcoal-600 pl-1">
              {requirement.validationRules.map((rule, idx) => (
                <li key={idx}>
                  Field <code className="text-charcoal-800 font-semibold">{rule.field}</code>:{" "}
                  {rule.description} ({rule.rule} {rule.expected ? `"${rule.expected}"` : ""})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-charcoal-500 italic">
              No custom deterministic rules configured. Relies on semantic document type classification.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
