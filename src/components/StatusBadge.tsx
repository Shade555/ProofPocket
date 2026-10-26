import React from "react";
import { RequirementStatus } from "@/types";
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: RequirementStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  let bg = "bg-charcoal-100 text-charcoal-700 border-charcoal-200";
  let label = "Unknown";
  let Icon = HelpCircle;

  switch (status) {
    case "satisfied":
      bg = "bg-sage-50 text-sage-800 border-sage-300";
      label = "Satisfied";
      Icon = CheckCircle2;
      break;
    case "partially_satisfied":
      bg = "bg-amber-50 text-amber-800 border-amber-300";
      label = "Partially Satisfied";
      Icon = AlertTriangle;
      break;
    case "needs_review":
      bg = "bg-indigo-50 text-indigo-800 border-indigo-200";
      label = "Needs Review";
      Icon = HelpCircle;
      break;
    case "missing":
      bg = "bg-red-50 text-red-800 border-red-200";
      label = "Missing";
      Icon = XCircle;
      break;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
    lg: "px-3 py-1.5 text-sm gap-2 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
