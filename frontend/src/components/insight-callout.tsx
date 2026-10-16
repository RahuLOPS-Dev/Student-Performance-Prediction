"use client";

import * as React from "react";
import { Lightbulb, Quote } from "lucide-react";

interface InsightCalloutProps {
  children: React.ReactNode;
  tone?: "info" | "success" | "warning";
  title?: string;
}

const TONES = {
  info: {
    wrap: "border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/20",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-700 dark:text-sky-300",
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
  },
};

export function InsightCallout({ children, tone = "info", title = "Did you know?" }: InsightCalloutProps) {
  const t = TONES[tone];
  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${t.wrap}`}>
      <Lightbulb className={`mt-0.5 h-4 w-4 shrink-0 ${t.icon}`} />
      <div className="text-sm">
        <div className={`mb-0.5 text-xs font-bold uppercase tracking-wider ${t.title}`}>{title}</div>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

interface InsightStatProps {
  stat: string;
  label: string;
  context: string;
}

export function InsightStat({ stat, label, context }: InsightStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="text-2xl font-bold tabular-nums text-primary">{stat}</div>
      <div className="text-xs">
        <div className="font-semibold">{label}</div>
        <div className="text-muted-foreground">{context}</div>
      </div>
    </div>
  );
}
