import React from "react";
import { MatchConfidence } from "@/types";

interface ConfidenceBadgeProps {
  confidence: MatchConfidence;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  let style = "bg-charcoal-100 text-charcoal-600 border-charcoal-200";
  let text = "None";

  switch (confidence) {
    case "high":
      style = "bg-emerald-50 text-emerald-800 border-emerald-200";
      text = "High Confidence";
      break;
    case "medium":
      style = "bg-amber-50 text-amber-800 border-amber-200";
      text = "Medium Confidence";
      break;
    case "low":
      style = "bg-orange-50 text-orange-800 border-orange-200";
      text = "Low Confidence";
      break;
    case "none":
      style = "bg-charcoal-100 text-charcoal-600 border-charcoal-200";
      text = "No Match";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${style}`}
    >
      {text}
    </span>
  );
}
